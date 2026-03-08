

# Application Analysis: Updates & Upgrades Roadmap

After a thorough review of the entire codebase — the Nyra voice AI widget, the Gemini Live API integration, the itinerary builder, admin configuration, edge functions, and the landing page — here is a comprehensive breakdown of improvements organized by priority.

---

## 1. AI Speed & Responsiveness

### 1a. Upgrade to Latest Gemini Model
- **Current**: Using `gemini-2.5-flash-native-audio-preview-09-2025` — a preview model from September 2025.
- **Upgrade**: Switch to the latest stable native audio model for lower latency, better accuracy, and improved tool-calling reliability.

### 1b. Add Noise Suppression
- **Current**: Raw microphone input is sent directly to the API. The `rnnoise` library files exist in `/public/rnnoise/` but are **never used**.
- **Upgrade**: Integrate the RNNoise worklet into the audio capture pipeline to suppress background noise before sending to Gemini. This significantly improves speech recognition accuracy.

### 1c. Reduce Connection Time
- **Current**: Sequential steps: fetch API key → create AI client → connect → wait for greeting. The 5-minute rate limit on `gemini-token` is aggressive.
- **Upgrade**: Pre-fetch the API key when the widget first mounts (not on button tap), cache it in memory, and reduce rate limit to 1 minute. This makes the "tap to call" feel instant.

### 1d. Optimize Audio Playback
- **Current**: Each audio chunk creates a new `AudioBufferSourceNode`. With many small chunks, this creates scheduling gaps.
- **Upgrade**: Buffer small chunks together and schedule them with tighter timing to eliminate audio glitches and pauses between Nyra's sentences.

---

## 2. AI Accuracy & Intelligence

### 2a. Smarter System Prompt Architecture
- **Current**: One massive 4,000+ word system prompt string with everything crammed in. Hardcoded Umrah prices, dates, and group packages that go stale quickly.
- **Upgrade**: Move all product/pricing data into the admin Knowledge Base (already built!). Reduce the base system prompt to personality + behavior only. This keeps Nyra's responses accurate and lets admins update info without code changes.

### 2b. Better Tool Call Reliability
- **Current**: Tool responses only return `{ success: true/false }`. The AI has no feedback on what happened.
- **Upgrade**: Return richer responses — e.g., for `add_item`, return the generated `item_id` so the AI can reference it for updates/removals. For `save_lead`, confirm the saved data back. This prevents the AI from hallucinating item IDs.

### 2c. Itinerary State Awareness
- **Current**: The AI has no visibility into the current itinerary state. It can't see what items exist, so it can't accurately update or remove them.
- **Upgrade**: After each tool call, send the current itinerary summary (item count, IDs, titles) back as context. Or periodically inject the current state as a client content message.

### 2d. Conversation Summary Quality
- **Current**: The AI saves summaries every 3-4 exchanges but with no structure — it's a free-text blob.
- **Upgrade**: Use structured tool output for session saves with fields like `destinations_discussed`, `budget_range`, `travel_dates`, `decisions_made`, `pending_questions`. This makes session restoration far more accurate.

---

## 3. Admin & Configuration Improvements

### 3a. Knowledge Base Categorization
- **Current**: All knowledge entries are flat — a single list of text blobs. Admins can't organize or search.
- **Upgrade**: Add categories/tags to entries (e.g., "Pricing", "Visa", "Packages", "Destinations"). Add search/filter to the admin UI.

### 3b. AI Agent Testing Interface
- **Current**: No way to test Nyra's behavior without making a live voice call.
- **Upgrade**: Add a text-based chat test mode in the admin dashboard that uses the same system prompt and tools but via text instead of voice. This lets admins quickly verify changes.

### 3c. Conversation Analytics
- **Current**: The VoiceAILeadsTab only shows basic lead info. No conversation metrics.
- **Upgrade**: Track and display: average call duration, lead conversion rate, most-asked topics, tool usage frequency, session dropout rate.

---

## 4. Security Improvements

### 4a. API Key Exposure
- **Current**: The `gemini-token` edge function returns the raw Gemini API key to the client. If someone inspects network traffic, they get the key.
- **Upgrade**: While necessary for the Gemini Live SDK, add additional protections: shorter-lived keys, domain restriction on the Gemini API key, or rotate keys more frequently.

### 4b. Rate Limiting Improvements
- **Current**: IP-based rate limiting with in-memory `Map` — resets on function cold start, easily bypassed with VPNs.
- **Upgrade**: Move rate limiting to a Supabase table or use a more robust approach. Add per-session rate limits too.

---

## 5. UX & Feature Enhancements

### 5a. Text Chat Fallback
- **Current**: Voice-only interaction. Users in noisy environments or who prefer typing cannot use Nyra.
- **Upgrade**: Add a text input mode alongside voice. Use the same Gemini model via the Lovable AI gateway for text, keeping the same tools and system prompt.

### 5b. Multilingual UI
- **Current**: Nyra speaks multiple languages but the UI is English-only.
- **Upgrade**: Detect the conversation language and optionally translate UI labels in the itinerary panel.

### 5c. Itinerary Comparison
- **Current**: One itinerary at a time, no way to compare options.
- **Upgrade**: Allow saving multiple itinerary versions and comparing them side by side.

### 5d. Real-Time Pricing Integration
- **Current**: Prices are AI-estimated guesses using Google Search.
- **Upgrade**: Integrate with actual flight/hotel APIs (Amadeus, Booking.com) via edge functions to provide real pricing.

### 5e. Post-Call Summary Email
- **Current**: Emails can be sent during the call via the `send_email` tool, but there's no automatic post-call summary.
- **Upgrade**: When the call disconnects, automatically generate and send a summary email with the itinerary PDF attached if the caller's email was captured.

---

## 6. Performance

### 6a. Bundle Size
- **Current**: The `@google/genai` SDK is loaded even when no one clicks the Nyra widget (it's in the lazy-loaded NyraWidget, which is good, but it's still loaded on mount because `NyraWidget` renders on every page).
- **Upgrade**: Only import `@google/genai` inside the `connect()` function using dynamic `import()`, so it's truly loaded only when someone initiates a call.

### 6b. Itinerary Panel Rendering
- **Current**: Every tool call triggers a full re-render of the entire itinerary.
- **Upgrade**: Memoize individual day and item components to prevent unnecessary re-renders during rapid AI tool calls.

---

## Recommended Priority Order

1. **Noise suppression** (rnnoise integration) — highest impact on accuracy, already bundled
2. **Pre-fetch API key** — makes connection feel instant
3. **Move hardcoded data to admin Knowledge Base** — keeps info fresh
4. **Return item IDs in tool responses** — fixes update/remove reliability
5. **Inject itinerary state into AI context** — makes AI aware of what it built
6. **Text chat fallback** — expands accessibility
7. **Post-call summary email** — improves conversion
8. **Admin testing interface** — faster iteration
9. **Dynamic import of Gemini SDK** — performance win
10. **Conversation analytics** — data-driven improvements

