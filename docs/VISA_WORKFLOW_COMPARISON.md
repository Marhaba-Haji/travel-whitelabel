# Visa Check Workflow: MOFA vs Marhaba DMC Site

## MOFA (Official Saudi Visa Platform)

**URL:** https://visa.mofa.gov.sa/visaservices/searchvisa

### MOFA Workflow Steps

| Step | MOFA Screen | Fields / Actions |
|------|-------------|------------------|
| **1** | **Print Visa** form (single page) | • **Device Type:** Barcode Reader (default) or Passport Reader<br>• **First Value:** Dropdown (Visa No, Passport No, App No, Moh No, First Name) + text input<br>• **Second Value:** Dropdown (same options) + text input<br>• **Nationality:** Country dropdown<br>• **Captcha:** Image + text input<br>• **Buttons:** Inquire, Clean Data |
| **2** | **Result** | Success: Redirect to PrintEventVisa page with visa document<br>Failure: Modal/alert with error message |

### MOFA Form Structure

- **Search type pair:** User picks two search criteria (e.g. Passport No + First Name)
- **No separate passport upload:** All data entered manually
- **Single-page flow:** One form with captcha, submit directly
- **API mapping (our integration):** `ddlFirstValue=PassPortNo`, `tbFirstValue=passport`, `ddlSecondValue=fName`, `tbSecondValue=firstName`, `NationalityId=IND`

---

## Marhaba DMC Site

**URL:** http://localhost:8080/umrah-visa-check

### Marhaba Workflow Steps

| Step | Our Screen | Fields / Actions |
|------|------------|------------------|
| **1** | **Upload Passport** | • Upload passport image or PDF (OCR extracts passport no, first name)<br>• Skip link → go to manual entry |
| **2** | **Confirm Details** | • Passport Number (text)<br>• First Name (text)<br>• Nationality (dropdown)<br>• Continue to captcha |
| **3** | **Captcha** | • Captcha image (from MOFA via visa-captcha edge function)<br>• Text input for captcha<br>• "Check Visa Status" button |
| **4** | **Results** | • Success: Visa preview iframe + Save as PDF<br>• Partial: "Could not capture visa preview"<br>• Failure: Error message + Try again |

---

## Comparison Summary

| Aspect | MOFA | Marhaba DMC |
|--------|------|-------------|
| **Steps** | 1 step (single form) | 4 steps (wizard) |
| **Passport upload** | No | Yes (optional, with OCR) |
| **Search criteria** | Configurable pair (e.g. Passport+Name, Visa+App No) | Fixed: Passport + First Name + Nationality |
| **Captcha** | On same page as form | Separate step after details |
| **Result display** | Redirect to PrintEventVisa page | In-page iframe with visa HTML |
| **Print/PDF** | Browser print on result page | "Save as PDF" opens print dialog |
| **Session** | Cookies from MOFA | Session from visa-captcha (cookies + captcha URL) |

### Data Mapping (MOFA ↔ Our Site)

| Our Field | MOFA Equivalent |
|-----------|-----------------|
| passportNumber | ddlFirstValue=PassPortNo, tbFirstValue |
| firstName | ddlSecondValue=fName, tbSecondValue |
| countryCode | NationalityId (ISO alpha-3, e.g. IND) |

### Gaps / Differences

1. **Passport OCR:** We offer auto-fill from passport image; MOFA does not.
2. **Search flexibility:** MOFA allows multiple search pairs (Visa No, App No, Moh No); we only support Passport + First Name.
3. **UI flow:** We use a 4-step wizard; MOFA uses a single form.
4. **Visa preview:** We render MOFA's PrintEventVisa HTML in an iframe; MOFA shows it on a separate page after redirect.

---

# Exact Comparison: Last Step — Downloading the Issued Visa PDF

## MOFA (Official Site) — PDF Download Flow

### How it works on MOFA

| Aspect | MOFA behaviour |
|--------|----------------|
| **Trigger** | User presses **Ctrl+P** or clicks the **Print** icon/link (طباعة) on the PrintEventVisa page |
| **Context** | User is on the actual MOFA URL, e.g. `visa.mofa.gov.sa/.../PrintEventVisa` |
| **Document source** | Live MOFA page with full HTML, CSS, images, and `@media print` styles |
| **Print dialog** | Native browser print dialog opens; user selects "Save as PDF" (or a printer) |
| **@page** | MOFA page defines its own `@page` and `@media print` rules |
| **Images** | All images (visa graphic, logo, etc.) loaded from MOFA origin |
| **Page break** | Handled by MOFA’s CSS (typically one page or explicit breaks) |
| **Header/footer** | Browser adds URL/date by default; MOFA may hide via print CSS |

### MOFA PDF output

- Uses the browser’s print engine on the real page
- All assets are from MOFA’s servers
- MOFA’s `@media print` styles define layout and visibility
- No third-party scraping or HTML injection

---

## Marhaba DMC Site — PDF Download Flow

### How it works on our site

| Aspect | Our behaviour |
|--------|----------------|
| **Trigger** | User clicks **"Save as PDF"** button |
| **Context** | HTML is injected into a **new blank window** (`window.open("", "_blank")`) |
| **Document source** | `visaCopyHtml` — Firecrawl-scraped HTML from MOFA’s PrintEventVisa URL |
| **Injected styles** | We add `@page { size: A4; margin: 0; }` and `@media print { html, body { transform: none !important; zoom: 100% !important; } }` |
| **Images** | Relative URLs in scraped HTML may break (base URL not set) |
| **Print timing** | `window.print()` after ~1.2 s delay |
| **Popup blockers** | Can block `window.open`; user must allow popups |

### Our PDF output

- Uses the browser’s print engine on an injected document
- HTML comes from Firecrawl, not the live MOFA page
- We override some print styles (`@page`, transform/zoom)

---

## Gap Analysis: Last Step (PDF Download)

### Gaps and differences

| # | Gap | Impact | Details |
|---|-----|--------|---------|
| **1** | **Image base URL** | **High** | Scraped HTML may use relative image paths (`/Content/images/visa.png`). In a `about:blank` window, these resolve to the wrong origin and fail. **MOFA:** Images load from MOFA. **Us:** Images may be broken or missing in the PDF. |
| **2** | **CSS and asset URLs** | **High** | External stylesheets and fonts may use relative URLs. Same failure as images. **MOFA:** All assets load correctly. **Us:** Layout/fonts may differ or break. |
| **3** | **Page size** | **Medium** | We use `@page { size: A4; margin: 0; }`. MOFA uses its own `@page`. Slight layout differences possible. |
| **4** | **Content fidelity** | **Medium** | Firecrawl captures HTML at a point in time. Client-side JS, late-loaded content, or dynamic elements may not be present. **MOFA:** Full page as rendered. **Us:** May miss some content. |
| **5** | **Popup blocking** | **Medium** | `window.open` can be blocked. **MOFA:** No popup; user prints from the current tab. **Us:** User must allow popups for "Save as PDF". |
| **6** | **Two-page layout** | **Medium** | User reported content fitting on one page when it should be two. We added A4 + anti-scale rules, but behaviour can still differ from MOFA. |
| **7** | **Interactive elements in preview** | **Low** | We strip `onclick`, `href`, and set `pointer-events: none` for the iframe preview. Print window uses raw HTML; MOFA’s print CSS may hide these anyway. |
| **8** | **No direct PDF file** | **Low** | Both rely on browser "Save as PDF". Neither offers a one-click server-generated PDF download. |

### What matches MOFA

| Aspect | Match |
|--------|-------|
| **Mechanism** | Both use the browser’s native print dialog and "Save as PDF" |
| **Print layout** | We preserve MOFA’s `@media print` styles (with `@media all` for preview) |
| **Raw HTML** | We store and print the raw MOFA HTML, not screenshots |
| **No server-side PDF** | Neither MOFA nor we generate PDFs server-side |

### Recommendations to reduce gaps

1. **Rewrite asset URLs**  
   When injecting HTML, convert relative URLs to absolute MOFA URLs (e.g. `src="/Content/..."` → `src="https://visa.mofa.gov.sa/Content/..."`).

2. **Set document base**  
   Add `<base href="https://visa.mofa.gov.sa/">` in the injected `<head>` so relative paths resolve correctly.

3. **Handle popup blocking**  
   If `window.open` returns `null`, show a clear message: “Allow popups for this site to save as PDF,” or provide fallback instructions (e.g. right‑click → Print).

4. **Verify page breaks**  
   Manually compare multi-page MOFA output with ours (e.g. A4, margins) and adjust `@page` or CSS if needed.
