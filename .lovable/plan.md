

# ChatGPT-Style Instruction Manager for AI Agent Config

## Overview
Redesign the AI Agent Configuration tab to have a modern, ChatGPT-like interface where admins can type instructions OR upload files (images, PDFs, Excel, Word docs). Uploaded files are processed by AI to extract text content, which is then saved as instruction entries in the appropriate category.

## Architecture

### New Edge Function: `process-agent-document`
- Accepts a file (base64-encoded) along with its MIME type and target category
- Uses the Lovable AI Gateway (`google/gemini-2.5-flash`) to extract/summarize content from the file
- Returns extracted text that gets saved as instruction entries
- Supports: images (JPEG, PNG, WebP), PDFs, Excel (.xlsx), Word (.docx)
- For images: sends the image directly to Gemini's vision capability for text extraction
- For PDFs/docs: converts base64 to text extraction prompt

### UI Redesign: `AIAgentConfigTab.tsx`
Rebuild with a ChatGPT-style interface per category card:

```text
+---------------------------------------------+
| Knowledge Base                          [v]  |
|---------------------------------------------|
| [Saved entry 1]                        [x]  |
| [Saved entry 2]                        [x]  |
| [Saved entry 3 - from uploaded PDF]    [x]  |
|---------------------------------------------|
| [  Type instruction or upload a file...   ] |
| [Paperclip icon]  [Send button]             |
+---------------------------------------------+
```

Each category section will have:
- A scrollable log of saved entries (existing behavior, kept)
- A bottom input bar with a textarea, a file attachment button (paperclip icon), and a send/add button
- File upload triggers processing via the edge function, then saves extracted text as a new entry
- While processing, show a loading state with "Extracting content from [filename]..."
- After extraction, the text is auto-added as an instruction entry (same save flow as today)

### Supported File Types
- Images: `image/jpeg`, `image/png`, `image/webp` -- processed via Gemini vision
- PDF: `application/pdf` -- base64 sent to Gemini for extraction
- Word: `.docx` (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- Excel: `.xlsx` (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

## Technical Details

### 1. Create `supabase/functions/process-agent-document/index.ts`
- Accept POST with `{ fileBase64, mimeType, fileName, category }`
- Use `LOVABLE_API_KEY` (already configured) to call the Lovable AI Gateway
- For images: send as base64 image content part with a prompt like "Extract all text, data, and instructions from this image. Return them as clear, structured text."
- For documents (PDF/DOCX/XLSX): send file content with extraction prompt
- Return `{ extractedText: string }` 
- Register in `supabase/config.toml`

### 2. Redesign `AIAgentConfigTab.tsx`
- Replace the current `InstructionLog` component with a new `InstructionChat` component
- Bottom input area styled like a chat input bar:
  - Textarea (auto-grows, placeholder: "Type an instruction or upload a file...")
  - Paperclip/attachment button (opens file picker)
  - Send button (arrow icon)
- When a file is selected:
  - Show a file preview chip above the input (filename + remove button)
  - On send, read as base64 and call `process-agent-document` edge function
  - Show processing indicator
  - On success, add extracted text as an instruction entry
- Keep the existing entries list with delete buttons above the input
- Entries from files get a small file icon badge to indicate source

### 3. Update `supabase/config.toml`
- Add `[functions.process-agent-document]` with `verify_jwt = false`

### No database changes needed
All data continues to be stored in `site_settings` as JSONB arrays -- extracted text from files becomes regular string entries in the arrays.

## Files to Create
1. `supabase/functions/process-agent-document/index.ts`

## Files to Modify
1. `src/components/admin/AIAgentConfigTab.tsx` -- full UI redesign with chat-style input
2. `supabase/config.toml` -- register new function

