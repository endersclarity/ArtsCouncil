/**
 * Vercel Serverless Function: POST /api/chat
 *
 * Proxies user queries to Google Gemini 3.0 Flash with:
 * - Tourism-only system prompt built from chat-knowledge-pack.json
 * - Input sanitization (HTML strip, length cap)
 * - Supabase query logging (fire-and-forget)
 * - Simple session-based rate limiting
 *
 * Environment variables:
 *   GEMINI_API_KEY   — required
 *   SUPABASE_URL     — optional (logging + rate limiting)
 *   SUPABASE_ANON_KEY — optional (logging + rate limiting)
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const knowledgePack = require("../chat-knowledge-pack.json");

// Lazy-init Supabase only when env vars are present
let _supabase = null;
function getSupabase() {
  if (_supabase !== undefined && _supabase !== null) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    _supabase = null;
    return null;
  }
  try {
    const { createClient } = require("@supabase/supabase-js");
    _supabase = createClient(url, key);
    return _supabase;
  } catch {
    _supabase = null;
    return null;
  }
}

// ---------------------------------------------------------------
// System prompt construction
// ---------------------------------------------------------------
function buildSystemPrompt() {
  const parts = [];

  // Voice: functional register — knowledgeable local giving quick recs.
  // NOT editorial register. No narrative arcs, no em-dash color.
  parts.push(
    `You are a knowledgeable local concierge for Nevada County, California — ` +
    `Grass Valley, Nevada City, and the surrounding Sierra foothills. ` +
    `You give direct, specific recommendations. Lead with the place name, ` +
    `add one characterizing detail, and stop. Use "you" (second person). ` +
    `Say "places" not "assets." Keep answers concise — you are a helpful tool, ` +
    `not a magazine article.`
  );

  parts.push(
    `Example of your tone: "California Organics on Broad Street — farm-to-table, ` +
    `reservations recommended for weekends." NOT: "You'll discover that the creative ` +
    `life extends to the table at California Organics, where gallery walls change ` +
    `as often as the seasons..."`
  );

  parts.push(
    `You ONLY answer questions about Nevada County tourism, dining, arts, events, ` +
    `history, and travel. Refuse any request unrelated to this scope with: ` +
    `"I can help you find restaurants, galleries, events, and things to do in ` +
    `Nevada County. What are you looking for?"`
  );

  parts.push(
    `When mentioning a specific place from the directory, format as [[Place Name|place-name-slug]]. ` +
    `When citing MUSE magazine content, format as {{MUSE|article-id|brief quote}}.`
  );

  parts.push(
    `Here is the full directory of ${knowledgePack.stats.asset_count} places ` +
    `in Nevada County (name, category, city, description snippet, hours):\n` +
    JSON.stringify(knowledgePack.assets)
  );

  parts.push(
    `MUSE magazine editorial content:\n` +
    JSON.stringify(knowledgePack.muse_editorials)
  );

  parts.push(
    `Curated itineraries (${knowledgePack.stats.itinerary_count} trip plans):\n` +
    JSON.stringify(knowledgePack.itineraries)
  );

  parts.push(
    `Upcoming events (${knowledgePack.stats.event_count} events). ` +
    `Event data last updated: ${knowledgePack.generated}. ` +
    `Recommend visitors verify event details.\n` +
    JSON.stringify(knowledgePack.events)
  );

  parts.push(
    `Business hours and availability may have changed. Suggest visitors verify with the venue.`
  );

  // Trip Planning Mode instructions
  parts.push(
    `## Trip Planning Mode\n\n` +
    `When a user asks you to plan a trip, create an itinerary, or organize their saved places, respond with a structured {{ITINERARY}} block.\n\n` +
    `Format:\n` +
    `{{ITINERARY|Trip Title|N-day\n` +
    `DAY|Day Label\n` +
    `STOP|Exact Place Name|HH:MM|duration_minutes|Brief narrative about this stop.\n` +
    `DAY|Day Label\n` +
    `STOP|Exact Place Name|HH:MM|duration_minutes|Brief narrative.\n` +
    `}}\n\n` +
    `Rules:\n` +
    `- Place names MUST match the directory exactly (case-insensitive). Use the names from the asset list above, not official/full names.\n` +
    `- Time format: 24-hour (e.g., 09:00, 14:30)\n` +
    `- Duration: integer minutes (e.g., 60, 90, 120)\n` +
    `- Narrative: 1-2 sentences, conversational tone, mention what makes the stop special\n` +
    `- Day labels: descriptive (e.g., "Day 1 — Downtown Nevada City", "Day 2 — Grass Valley Heritage")\n` +
    `- Typical pacing: 3-5 stops per day, 30-90 min between stops for travel\n` +
    `- If the user has saved places, incorporate them. If they ask for a 1-day plan, pick the best 4-5 from their list.\n` +
    `- If they ask to "just organize my list," create a logical day-by-day plan using ALL their saved places.\n` +
    `- Include a brief conversational intro before the {{ITINERARY}} block and a short closing after it.\n` +
    `- Do NOT wrap the {{ITINERARY}} block in markdown code fences.`
  );

  return parts.join('\n\n');
}

const SYSTEM_PROMPT = buildSystemPrompt();

// ---------------------------------------------------------------
// Input sanitization
// ---------------------------------------------------------------
const MAX_MSG_LENGTH = 500;
const MAX_MESSAGES = 20;

function sanitize(text) {
  if (typeof text !== 'string') return '';
  // Strip HTML tags
  let clean = text.replace(/<[^>]*>/g, '');
  // Strip javascript: protocol
  clean = clean.replace(/javascript\s*:/gi, '');
  // Strip on-event handlers
  clean = clean.replace(/on\w+\s*=/gi, '');
  // Enforce length limit
  return clean.slice(0, MAX_MSG_LENGTH);
}

// ---------------------------------------------------------------
// Rate limiting (Supabase-backed, session-based)
// ---------------------------------------------------------------
async function isRateLimited(sessionHash) {
  const sb = getSupabase();
  if (!sb || !sessionHash) return false;
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count, error } = await sb
      .from('chat_logs')
      .select('id', { count: 'exact', head: true })
      .eq('session_hash', sessionHash)
      .gte('created_at', fiveMinAgo);
    if (error) return false;
    return (count || 0) > 20;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------
// Supabase logging (fire-and-forget)
// ---------------------------------------------------------------
function logQuery({ sessionHash, queryText, responseText, durationMs }) {
  const sb = getSupabase();
  if (!sb) return;
  sb.from('chat_logs')
    .insert({
      session_hash: sessionHash || 'anonymous',
      query_text: queryText,
      response_text: (responseText || '').slice(0, 2000),
      duration_ms: durationMs,
      model: 'gemini-3-flash-preview'
    })
    .then(() => {})
    .catch(() => {});
}

// ---------------------------------------------------------------
// Handler
// ---------------------------------------------------------------
module.exports = async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Parse body
    const { messages, sessionHash } = req.body || {};

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array.' });
    }
    if (messages.length > MAX_MESSAGES) {
      return res.status(400).json({ error: `Maximum ${MAX_MESSAGES} messages allowed.` });
    }
    for (const msg of messages) {
      if (!msg || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
        return res.status(400).json({ error: 'Each message must have string role and content.' });
      }
    }

    // Rate limiting
    if (await isRateLimited(sessionHash)) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment.'
      });
    }

    // Sanitize messages
    const sanitized = messages.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      content: sanitize(m.content)
    }));

    // Dream board context injection (appended to last user message, not system prompt)
    const dreamBoard = req.body.dreamBoard;
    if (Array.isArray(dreamBoard) && dreamBoard.length > 0) {
      const safeNames = dreamBoard.slice(0, 50).map(n => sanitize(String(n)));
      const contextNote = '\n\nThe user has saved these places to their trip dream board:\n' +
        safeNames.map(n => '- ' + n).join('\n') +
        '\n\nIncorporate these places when planning an itinerary. If they say "plan my trip" or click a planning card, use these as the starting set.';
      const lastMsg = sanitized[sanitized.length - 1];
      sanitized[sanitized.length - 1] = {
        role: lastMsg.role,
        content: lastMsg.content + contextNote
      };
    }

    // Check Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chat service not configured.' });
    }

    // Build Gemini chat
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: SYSTEM_PROMPT
    });

    // History = all messages except the last (convert to Gemini format)
    const history = sanitized.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const lastMessage = sanitized[sanitized.length - 1].content;

    const startMs = Date.now();

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    const durationMs = Date.now() - startMs;

    // Log (fire-and-forget)
    logQuery({
      sessionHash: sessionHash || 'anonymous',
      queryText: lastMessage,
      responseText,
      durationMs
    });

    return res.status(200).json({
      reply: responseText,
      model: 'gemini-3-flash-preview',
      duration_ms: durationMs
    });

  } catch (err) {
    // Gemini API errors
    if (err.message && (err.message.includes('GoogleGenerativeAI') || err.status)) {
      console.error('Gemini API error:', err.message);
      return res.status(502).json({
        error: "Sorry, I'm having trouble thinking right now. Please try again."
      });
    }

    // Unexpected errors
    console.error('Unexpected error:', err);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.'
    });
  }
};
