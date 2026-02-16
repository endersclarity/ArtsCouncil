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

  parts.push(
    `You are a friendly local concierge for Nevada County, California. ` +
    `You help visitors discover restaurants, galleries, performances, trails, ` +
    `museums, and cultural experiences.`
  );

  parts.push(
    `You ONLY answer questions about Nevada County tourism, dining, arts, events, ` +
    `history, and travel. Refuse any request unrelated to this scope with: ` +
    `"I'm your Nevada County concierge! I can help you find restaurants, galleries, ` +
    `events, and things to do around here. What are you looking for?"`
  );

  parts.push(
    `When mentioning a specific place from the asset list, format as [[Place Name|place-name-slug]]. ` +
    `When citing MUSE magazine content, format as {{MUSE|article-id|brief quote}}.`
  );

  parts.push(
    `Here is the full directory of ${knowledgePack.stats.asset_count} cultural assets ` +
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
