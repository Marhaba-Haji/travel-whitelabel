

## Plan: Clean Visa PDF via Browser Print Dialog

### Problem
The current implementation captures screenshots and strips HTML, producing distorted output. The MOFA `PrintEventVisa` page already has print-optimized CSS. When you use the browser's "Print > Save as PDF" with no margins on that page, you get the exact visa document (as in the uploaded PDF).

### Approach
Stop capturing screenshots entirely. Fetch the full raw HTML from MOFA's PrintEventVisa page via Firecrawl, preserve it as-is (including MOFA's own print CSS), and use the browser's native print dialog for PDF generation.

### Changes

**1. Edge Function (`supabase/functions/visa-lookup/index.ts`)**
- Request only `rawHtml` format from Firecrawl (not `screenshot`, not processed `html`)
- Set `onlyMainContent: false` to keep the full page including MOFA's print stylesheets
- Remove `toPrintableVisaHtml` stripping function -- we want the original HTML
- Stop sending `visaCopyBase64`, `visaCopyUrl`, `visaCopyMime` -- only send `visaCopyHtml` containing the raw PrintEventVisa HTML
- Remove the screenshot/image fallback logic entirely (lines 730-773)

**2. Frontend (`src/components/visa/VisaResultsStep.tsx`)**
- Remove all image/screenshot/base64/URL download logic (`downloadBase64`, `downloadFromUrl`, `openPrintWindowFromImage`, `getVisaImageSrc`)
- Simplify `hasVisaContent` to check only for `visaCopyHtml`
- Preview: render `visaCopyHtml` in a sandboxed iframe (`srcDoc`) for safe, isolated display
- "Save as PDF" button: open a new window, write the raw HTML into it, inject a small `<style>` block (`@page { margin: 0; size: auto; }`) to match zero-margin print, then call `window.print()`
- Remove the "Download visa file" button entirely -- only keep "Save as PDF"
- Keep error/retry/reset flows unchanged

**3. Interface cleanup**
- Remove `visaCopyBase64`, `visaCopyUrl`, `visaCopyMime` from `VisaResult` type (keep only `visaCopyHtml`)
- Remove unused imports (`Download` icon, image helpers)

### Technical Detail

```text
Flow:
  MOFA POST → redirect to PrintEventVisa
  → Firecrawl scrape (rawHtml, onlyMainContent: false)
  → Return full HTML to frontend
  → iframe preview (srcDoc)
  → "Save as PDF" → window.open() → inject @page{margin:0} → window.print()
```

The key insight: MOFA's page already contains `@media print` CSS that produces the clean visa layout. By preserving the raw HTML and using the browser's native print, we get the exact same PDF as manually printing from the MOFA site.

