

# Session Persistence + Admin AI Agent Configuration

## Problem 1: Lost Context on Reconnect

When the Gemini Live API WebSocket drops or the page refreshes, all conversation context is lost. The AI starts from scratch with no memory of the previous interaction.

**Solution**: Generate a persistent session ID per visitor, periodically save a conversation summary to the database, and on reconnect, inject the previous context as initial turns so the AI remembers everything.

## Problem 2: No Way to Update Agent Knowledge or Behavior

All of Nyra's knowledge (visa prices, packages, behavior rules) is hardcoded in the source code. To update anything, you'd need a code change. You also can't instruct Nyra to send emails, WhatsApp messages, or SMS.

**Solution**: A new "AI Agent Config" tab in the admin panel with rich text areas for knowledge, behavior, and communication tool configuration. These get fetched at runtime and injected into the system prompt.

---

## Architecture

```text
Admin Panel                    site_settings (DB)
 [AI Agent Config Tab]  --->  key: "nyra_config"
                               { knowledge, behavior, comms }
                                        |
                                        v
NyraWidget (on load)  <--- fetches nyra_config
                        |
                        +---> Builds dynamic system instruction
                        |     (hardcoded base + admin overrides)
                        |
                        +---> Session ID (sessionStorage)
                        |
                        +---> On connect: load previous context
                              from voice_ai_sessions table
                              and send as initial turns
```

---

## Part 1: Session Persistence

### Database

New table: `voice_ai_sessions`
- `id` (uuid, PK)
- `session_id` (text, unique) -- random ID stored in browser sessionStorage
- `visitor_name` (text, nullable)
- `visitor_email` (text, nullable)
- `conversation_summary` (text) -- rolling summary of what was discussed
- `itinerary_state` (jsonb) -- snapshot of the itinerary so far
- `last_active_at` (timestamptz)
- `created_at` (timestamptz)

RLS: public insert/update (anonymous visitors need to write), superadmin select.

### Edge Function: `voice-ai-session`

Handles POST (upsert session data) and GET (retrieve by session_id). Called:
- On connect: GET to load previous context
- Periodically during the call: POST to save summary (via a new Gemini tool)

### New Gemini Tool: `save_session_context`

A tool the AI calls periodically (every few exchanges) to summarize the conversation so far. This summary gets stored in the DB. On reconnect, it's sent back as context.

### Client-Side Flow

1. On page load, check `sessionStorage` for `nyra_session_id`. If none, generate one.
2. On `connect()`, fetch any existing session data for that ID.
3. If found, send previous summary + itinerary state as initial context turns (before the greeting).
4. The greeting message changes: instead of "Hi Nyra, greet me warmly", it becomes "Hi Nyra, we were speaking earlier. Here's what we discussed: [summary]. Continue from where we left off."
5. Add the `save_session_context` tool so the AI can persist summaries during the call.

### useLiveAPI Changes

- Accept a `sessionContext` parameter (previous summary text, if any)
- Modify the `onopen` callback to inject session context as initial turns when reconnecting
- Add `save_session_context` tool declaration and handler

---

## Part 2: Admin AI Agent Configuration

### Database

New `site_settings` key: `nyra_config` with value structure:
```text
{
  knowledge_base: "Visa prices: ...\nPackages: ...\nDocuments: ...",
  behavior_instructions: "Handle pauses gracefully...\nWhen caller is frustrated...",
  communication_enabled: { email: true, whatsapp: true, sms: false },
  additional_notes: "Any extra context..."
}
```

No new table needed -- uses existing `site_settings` with upsert on key `nyra_config`.

### Admin Tab: AI Agent Config

New tab in the admin panel with:
- **Knowledge Base** (large textarea): Visa prices, package details, document requirements, destination info, seasonal offers, etc.
- **Behavior Instructions** (large textarea): How to handle pauses, interruptions, frustration, aggression, call flow preferences, tone adjustments
- **Communication Tools** (toggles): Enable/disable email, WhatsApp, SMS capabilities
- **Additional Notes** (textarea): Any other context or overrides
- Save button that upserts to `site_settings` with key `nyra_config`

### Dynamic System Instruction

The NyraWidget will:
1. Fetch `nyra_config` from `site_settings` on mount
2. Append the admin-provided knowledge and behavior text to the base system instruction
3. Conditionally include communication tool declarations based on toggles

### New Gemini Tools (Communication)

- `send_whatsapp`: Sends a WhatsApp message to the caller via the WhatsApp Business API link (opens wa.me link or calls an edge function)
- `send_email`: Calls an edge function that sends an email (using a future email integration)
- `send_sms`: Placeholder for SMS integration

For now, `send_whatsapp` will generate a pre-filled WhatsApp link, and `send_email`/`send_sms` will be marked as "coming soon" in the tool response (the AI will tell the caller it will arrange for a follow-up).

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/...voice_ai_sessions.sql` | Create | New sessions table |
| `supabase/functions/voice-ai-session/index.ts` | Create | Session CRUD edge function |
| `src/components/admin/AIAgentConfigTab.tsx` | Create | Admin config UI |
| `src/components/admin/AdminLayout.tsx` | Modify | Add AI Agent Config tab |
| `src/pages/Admin.tsx` | Modify | Register new tab component |
| `src/hooks/useNyraConfig.ts` | Create | Fetch nyra_config from site_settings |
| `src/hooks/useLiveAPI.ts` | Modify | Add session context + save_session_context + communication tools |
| `src/components/NyraWidget.tsx` | Modify | Fetch config, manage session ID, build dynamic prompt |
| `supabase/config.toml` | Modify | Add voice-ai-session function config |

---

## Implementation Sequence

1. Create `voice_ai_sessions` table via migration
2. Create `voice-ai-session` edge function
3. Create `useNyraConfig` hook to fetch admin config
4. Create `AIAgentConfigTab` admin component
5. Wire up admin tab in AdminLayout and Admin page
6. Update `useLiveAPI` with session persistence logic and new tools
7. Update `NyraWidget` to use dynamic system instruction and session management
8. Test end-to-end: configure agent in admin, start call, disconnect, reconnect and verify context is preserved

