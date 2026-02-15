---
phase: 05-ai-concierge
plan: 01
subsystem: api
tags: [gemini, vercel-serverless, supabase, knowledge-pack, chat]

# Dependency graph
requires:
  - phase: 02.1-kvmr-gvda-event-source-ingestion
    provides: events-merged-flat.json (176 events)
  - phase: 03-itineraries
    provides: itineraries.json (3 curated trip plans)
provides:
  - POST /api/chat serverless endpoint proxying to Gemini 2.0 Flash
  - chat-knowledge-pack.json compressed corpus (~191KB)
  - build-chat-knowledge-pack.js build script
  - package.json with @google/generative-ai and @supabase/supabase-js
affects: [05-02 (chat UI widget)]

# Tech tracking
tech-stack:
  added: ["@google/generative-ai ^0.24.0", "@supabase/supabase-js ^2.49.0"]
  patterns: [vercel-serverless-function, knowledge-pack-compression, fire-and-forget-logging]

key-files:
  created:
    - scripts/build-chat-knowledge-pack.js
    - website/cultural-map-redesign/chat-knowledge-pack.json
    - website/cultural-map-redesign/api/chat.js
    - website/cultural-map-redesign/package.json
  modified:
    - website/cultural-map-redesign/vercel.json

key-decisions:
  - "Gemini 2.0 Flash (not 3.0) — model name matches current SDK availability"
  - "Asset descriptions truncated to 40 chars (not 80) to keep knowledge pack under 200KB"
  - "MUSE editorials compressed (id/title/dek/lead_quote/author only) — full body dropped for token budget"
  - "Websites (w field) dropped from asset compression for size budget"

patterns-established:
  - "Knowledge pack build script: idempotent Node.js, reads source JSONs, writes compressed output"
  - "Vercel serverless: CommonJS, lazy Supabase init, fire-and-forget logging"
  - "Input sanitization: HTML strip, javascript: removal, on-event handler removal, 500-char cap"

# Metrics
duration: 4min
completed: 2026-02-15
---

# Phase 05 Plan 01: AI Concierge Server Infrastructure Summary

**Vercel serverless /api/chat endpoint proxying to Gemini 2.0 Flash with 191KB compressed knowledge pack, input sanitization, Supabase logging, and session-based rate limiting**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-15T22:50:19Z
- **Completed:** 2026-02-15T22:54:22Z
- **Tasks:** 2
- **Files created:** 5 (+ 1 modified)

## Accomplishments
- Knowledge pack build script compresses 685 assets, 6 MUSE editorials, 3 itineraries, 176 events into 191KB JSON
- Serverless function with full input sanitization (HTML/script stripping, length caps, message count limits)
- Tourism-only system prompt with format instructions for [[Place Name|slug]] and {{MUSE|id|quote}} citations
- Supabase fire-and-forget query logging with session-based rate limiting (20 queries per 5 min)
- CORS headers configured in vercel.json for /api/* routes

## Task Commits

Each task was committed atomically:

1. **Task 1: Build knowledge pack script and generate compressed JSON** - `7a1afb0` (feat)
2. **Task 2: Create Vercel Serverless Function, package.json, and update vercel.json** - `a531e26` (feat)

## Files Created/Modified
- `scripts/build-chat-knowledge-pack.js` - Node.js build script, reads 4 source files, outputs compressed JSON
- `website/cultural-map-redesign/chat-knowledge-pack.json` - 191KB compressed corpus for Gemini system prompt
- `website/cultural-map-redesign/api/chat.js` - Vercel Serverless Function (POST /api/chat)
- `website/cultural-map-redesign/package.json` - Node dependencies for serverless function
- `website/cultural-map-redesign/package-lock.json` - Lock file
- `website/cultural-map-redesign/vercel.json` - Added CORS headers for /api/* routes (existing redirects preserved)

## Decisions Made
- **Gemini 2.0 Flash over 3.0:** Plan specified gemini-3.0-flash but SDK model names use gemini-2.0-flash. Used the real model name.
- **40-char description truncation:** Plan said 80 chars but that pushed the pack to 244KB. Reduced to 40 chars to stay under 200KB budget.
- **Dropped website URLs from assets:** The `w` field added 14KB; Gemini can still reference places by name.
- **Compressed MUSE editorials:** Plan said "include full" but full body text added 15KB. Kept id, title, dek, lead_quote, author, deep_links.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed model name from gemini-3.0-flash to gemini-2.0-flash**
- **Found during:** Task 2
- **Issue:** Plan specified "gemini-3.0-flash" which is not a valid model ID in the @google/generative-ai SDK
- **Fix:** Used "gemini-2.0-flash" which is the current Flash model
- **Files modified:** website/cultural-map-redesign/api/chat.js
- **Committed in:** a531e26

**2. [Rule 3 - Blocking] Reduced knowledge pack size from 244KB to 191KB**
- **Found during:** Task 1
- **Issue:** Including 80-char descriptions + full editorials + website URLs exceeded 200KB target
- **Fix:** Truncated descriptions to 40 chars, dropped website URLs, compressed editorials (kept summary fields only)
- **Files modified:** scripts/build-chat-knowledge-pack.js
- **Committed in:** 7a1afb0

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correctness. Gemini still has enough context for grounded answers.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required

Environment variables must be set in Vercel project settings:
- `GEMINI_API_KEY` - Google Gemini API key
- `SUPABASE_URL` - Supabase project URL (optional, for logging)
- `SUPABASE_ANON_KEY` - Supabase publishable key (optional, for logging)

Supabase `chat_logs` table must exist (per user_setup in plan frontmatter — marked COMPLETE).

## Next Phase Readiness
- /api/chat endpoint ready for 05-02 (chat UI widget) to consume
- Knowledge pack can be rebuilt anytime with `node scripts/build-chat-knowledge-pack.js`
- Deployment requires `vercel --prod` from website/cultural-map-redesign/ (or git push)
- npm dependencies will be installed automatically by Vercel during deployment

## Self-Check: PASSED

All 5 created files verified on disk. Both task commits (7a1afb0, a531e26) verified in git log.

---
*Phase: 05-ai-concierge*
*Completed: 2026-02-15*
