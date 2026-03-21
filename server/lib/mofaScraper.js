/**
 * MOFA Visa Search Scraper - Playwright automation for visa.mofa.gov.sa
 * Fetches captcha and submits visa lookup form. Session-bound; captcha must be solved by user.
 * Keeps browser page in memory between captcha fetch and form submit.
 */
import { chromium } from "playwright";

const MOFA_VISA_URL = "https://visa.mofa.gov.sa/visaservices/searchvisa";
const PAGE_TIMEOUT_MS = 30000;
const SESSION_TTL_MS = 5 * 60 * 1000;

/** Alpha-3 to Alpha-2 mapping for MOFA nationality dropdown (MOFA may use alpha-2). */
const ALPHA3_TO_ALPHA2 = {
  IND: "IN", PAK: "PK", BGD: "BD", IDN: "ID", EGY: "EG", TUR: "TR", NGA: "NG", MAR: "MA",
  AFG: "AF", IRQ: "IQ", IRN: "IR", YEM: "YE", SYR: "SY", LBN: "LB", JOR: "JO", PSE: "PS",
  LBY: "LY", TUN: "TN", DZA: "DZ", SDN: "SD", SOM: "SO", MLI: "ML", SEN: "SN", NER: "NE",
  BFA: "BF", GHA: "GH", CIV: "CI", CMR: "CM", UZB: "UZ", KAZ: "KZ", TJK: "TJ", KGZ: "KG",
  TKM: "TM", MYS: "MY", THA: "TH", PHL: "PH", VNM: "VN", MMR: "MM", LKA: "LK", NPL: "NP",
  GBR: "GB", USA: "US", CAN: "CA", AUS: "AU", FRA: "FR", DEU: "DE", ITA: "IT", ESP: "ES",
};

/** Third <select> on the print-visa search form = nationality. */
async function applyMofaNationality(page, countryCodeAlpha3) {
  const code = String(countryCodeAlpha3 || "").toUpperCase();
  if (!code) return;
  const nationalityValue = ALPHA3_TO_ALPHA2[code] || code;
  const selects = page.locator("select");
  if ((await selects.nth(2).count()) === 0) return;
  try {
    await selects.nth(2).selectOption({ value: nationalityValue });
  } catch {
    try {
      await selects.nth(2).selectOption({ value: code });
    } catch {
      await selects.nth(2).selectOption({ label: new RegExp(code, "i") });
    }
  }
  await new Promise((r) => setTimeout(r, 400));
}

/**
 * MOFA expects Barcode Reader + First value “Passport number” + Second value “First name” for this flow.
 * If Passport Reader is selected, dropdown/text mapping differs — keep Barcode Reader explicit.
 */
async function ensureBarcodeReaderMode(page) {
  try {
    await page.getByRole("radio", { name: /Barcode Reader|باركود|barcode/i }).click({ timeout: 10000 });
  } catch {
    try {
      await page.locator('input[type="radio"][value="1"]').first().click({ timeout: 5000 });
    } catch {
      /* single-page variant */
    }
  }
  await new Promise((r) => setTimeout(r, 500));
}

/**
 * Re-clicking Barcode Reader / re-selecting search types on submit can rotate MOFA’s captcha while the user
 * still has the old image — always treat as invalid. Only fix state when it is wrong.
 */
async function ensureBarcodeReaderModeIfNeeded(page) {
  const checked = await page.locator('input[type="radio"][value="1"]:checked').count().catch(() => 0);
  if (checked > 0) return;
  await ensureBarcodeReaderMode(page);
}

/** Barcode Reader row: “Passport number” then “First name” (MOFA option values PassPortNo, fName). */
async function selectPassportNumberAndFirstNameDropdowns(page) {
  const selects = page.locator("select");
  if ((await selects.nth(0).count()) > 0) {
    await selects.nth(0).selectOption({ value: "PassPortNo" });
    await new Promise((r) => setTimeout(r, 300));
  }
  if ((await selects.nth(1).count()) > 0) {
    await selects.nth(1).selectOption({ value: "fName" });
    await new Promise((r) => setTimeout(r, 300));
  }
}

async function selectPassportNumberAndFirstNameDropdownsIfNeeded(page) {
  const selects = page.locator("select");
  if ((await selects.nth(0).count()) === 0) return;
  const v0 = await selects.nth(0).evaluate((el) => el.value).catch(() => "");
  if (v0 !== "PassPortNo") {
    await selects.nth(0).selectOption({ value: "PassPortNo" });
    await new Promise((r) => setTimeout(r, 350));
  }
  if ((await selects.nth(1).count()) === 0) return;
  const v1 = await selects.nth(1).evaluate((el) => el.value).catch(() => "");
  if (v1 !== "fName") {
    await selects.nth(1).selectOption({ value: "fName" });
    await new Promise((r) => setTimeout(r, 350));
  }
}

/**
 * Barcode Reader shows MRZ field (#tbMRZCode) first — it is visible but must not get the passport number.
 * Real targets: #tbFirstValue / #tbSecondValue (verified on live MOFA, Mar 2025).
 */
async function fillMofaPassportAndFirstName(page, passportNumber, firstName) {
  const first = page.locator("#tbFirstValue");
  const second = page.locator("#tbSecondValue");
  const hasIds =
    (await first.count()) > 0 &&
    (await second.count()) > 0 &&
    (await first.isVisible().catch(() => false)) &&
    (await second.isVisible().catch(() => false));
  if (hasIds) {
    await setInputValueControlled(first, String(passportNumber || ""));
    await setInputValueControlled(second, String(firstName || ""));
    return;
  }
  const textInputs = page.locator('input[type="text"]:visible');
  if ((await textInputs.nth(1).count()) > 0) {
    await setInputValueControlled(textInputs.nth(1), String(passportNumber || ""));
  }
  if ((await textInputs.nth(2).count()) > 0) {
    await setInputValueControlled(textInputs.nth(2), String(firstName || ""));
  }
}

const sessionStore = new Map();

/**
 * Text outside search form + chrome — form labels include "رقم التأشيرة" etc. and cause false positives.
 */
async function getResultRelevantText(page) {
  return page
    .evaluate(() => {
      const clone = document.body.cloneNode(true);
      clone.querySelectorAll("form").forEach((el) => el.remove());
      clone.querySelectorAll("header, footer, nav, [role='navigation']").forEach((el) => el.remove());
      return (clone.textContent || "").replace(/\s+/g, " ").trim();
    })
    .catch(() => "");
}

/** MOFA shows the issued visa on this route; users normally Print → Save as PDF here. */
const PRINT_EVENT_VISA_RE = /printeventvisa/i;

/**
 * Set value on controlled inputs (Angular/React) so MOFA actually posts the captcha.
 * @param {{ pressTab?: boolean }} [opts]
 */
async function setInputValueControlled(loc, value, opts = {}) {
  const pressTab = opts.pressTab === true;
  const el = loc.first();
  const target = String(value ?? "");
  const existing = await el.inputValue().catch(() => "");
  if (existing === target) {
    if (pressTab) await el.press("Tab").catch(() => {});
    return true;
  }
  await el.click({ timeout: 3000 }).catch(() => {});
  await el.fill("");
  await el.evaluate((node, v) => {
    if (!(node instanceof HTMLInputElement)) return;
    try {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      if (desc?.set) desc.set.call(node, v);
      else node.value = v;
    } catch {
      node.value = v;
    }
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  let current = await el.inputValue().catch(() => "");
  if (current !== value) {
    await el.fill("").catch(() => {});
    await el.pressSequentially(value, { delay: 40 });
    current = await el.inputValue().catch(() => "");
  }
  if (pressTab) await el.press("Tab").catch(() => {});
  return current === value;
}

/**
 * Fill captcha for React/Angular controlled inputs (native value setter + sequential typing fallback).
 */
async function fillMofaCaptcha(page, captchaText) {
  const val = String(captchaText ?? "").trim();
  const tryFill = async (locator) => {
    if ((await locator.count()) === 0) return false;
    if (!(await locator.first().isVisible().catch(() => false))) return false;
    return setInputValueControlled(locator, val, { pressTab: true });
  };

  const bySelector = [
    "#Captcha",
    "input#Captcha",
    'input[name*="captcha" i]',
    'input[id*="captcha" i]',
    'input[id*="Captcha" i]',
    'input[name*="Captcha" i]',
    'input[placeholder*="captcha" i]',
    'input[placeholder*="رمز" i]',
    'input[name="CaptchaInput"]',
    "input#CaptchaInput",
  ];
  for (const sel of bySelector) {
    if (await tryFill(page.locator(sel))) return;
  }

  const injected = await page.evaluate((v) => {
    const imgs = Array.from(document.querySelectorAll("img")).filter((img) =>
      /captcha/i.test(String(img.src || "")) || /captcha/i.test(String(img.alt || ""))
    );
    const img = imgs[0];
    if (!img) return false;
    let node = img.parentElement;
    for (let d = 0; d < 12 && node; d++, node = node.parentElement) {
      const inputs = node.querySelectorAll('input[type="text"], input:not([type])');
      for (const inp of inputs) {
        if (inp instanceof HTMLInputElement && inp.offsetParent !== null && !inp.disabled) {
          inp.focus();
          try {
            const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
            if (desc?.set) desc.set.call(inp, v);
            else inp.value = v;
          } catch {
            inp.value = v;
          }
          inp.dispatchEvent(new Event("input", { bubbles: true }));
          inp.dispatchEvent(new Event("change", { bubbles: true }));
          inp.dispatchEvent(new Event("blur", { bubbles: true }));
          return true;
        }
      }
    }
    return false;
  }, val);
  if (injected) return;

  const textInputs = page.locator('input[type="text"]:visible');
  const c = await textInputs.count();
  if (c >= 1) await tryFill(textInputs.nth(c - 1));
}

/**
 * Classify visible overlays after submit — broad "خطأ|invalid" matched benign alerts → false captcha failures.
 * @returns {Promise<{ kind: "captcha_or_request" | "no_visa" | "none"; snippet: string }>}
 */
async function classifyPostSubmitOverlay(page) {
  const roots = [
    '[role="dialog"]:visible',
    ".swal2-popup:visible",
    ".modal.show:visible",
    ".modal.fade.show:visible",
    '[role="alert"]:visible',
  ];
  const chunks = [];
  for (const sel of roots) {
    const loc = page.locator(sel);
    const n = await loc.count();
    for (let i = 0; i < Math.min(n, 8); i++) {
      const t = (await loc.nth(i).innerText().catch(() => "")) || "";
      if (t.trim().length > 8) chunks.push(t.trim());
    }
  }
  const blob = chunks.join("\n");
  const b = blob.toLowerCase();

  if (
    /there is no any information|no information for the selected values|no any information for the selected/i.test(
      blob
    )
  ) {
    return { kind: "no_visa", snippet: blob.slice(0, 500) };
  }

  const captchaLike =
    /خطأ في رمز|رمز الصورة غير|رمز التحقق غير|incorrect\s+captcha|invalid\s+captcha|wrong\s+captcha|captcha\s+is\s+(wrong|invalid)|verification\s+code\s+(is\s+)?(wrong|invalid|incorrect)/i.test(
      blob
    );
  // Visible MOFA generic error (usually wrong captcha / session) — only after no_visa ruled out above
  if (captchaLike || /عفوا حدث خطأ/.test(blob)) {
    return { kind: "captcha_or_request", snippet: blob.slice(0, 500) };
  }

  return { kind: "none", snippet: blob.slice(0, 300) };
}

/** After a successful search, MOFA may redirect or expose a link to /Home/PrintEventVisa. */
async function resolvePrintEventVisaPage(page, context) {
  const onPrintUrl = (p) => PRINT_EVENT_VISA_RE.test(p.url());

  if (onPrintUrl(page)) {
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    return page;
  }

  try {
    await page.waitForURL((u) => PRINT_EVENT_VISA_RE.test(u.href), { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    return page;
  } catch {
    /* still on search / intermediate */
  }

  const printLink = page
    .locator(
      'a[href*="PrintEventVisa"], a[href*="printeventvisa"], a[href*="/Home/PrintEventVisa"], a[href*="/home/printeventvisa"]'
    )
    .first();

  if ((await printLink.count()) === 0) return page;

  const opensNewTab = (await printLink.getAttribute("target")) === "_blank";
  if (opensNewTab) {
    try {
      const popupPromise = context.waitForEvent("page", { timeout: 15000 });
      await printLink.click();
      const newPage = await popupPromise;
      await newPage.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 1500));
      await page.close().catch(() => {});
      return newPage;
    } catch {
      return page;
    }
  }

  try {
    await Promise.all([
      page.waitForURL((u) => PRINT_EVENT_VISA_RE.test(u.href), { timeout: 20000 }),
      printLink.click(),
    ]);
  } catch {
    await printLink.click().catch(() => {});
    await page.waitForURL((u) => PRINT_EVENT_VISA_RE.test(u.href), { timeout: 10000 }).catch(() => {});
  }
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1200));
  return page;
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [id, data] of sessionStore.entries()) {
    if (data.expiresAt < now) {
      sessionStore.delete(id);
      data.browser?.close().catch(() => {});
    }
  }
}

setInterval(cleanupExpiredSessions, 60000);

/** MOFA sometimes loads captcha late or omits it until reload — broad selectors + screenshot fallbacks. */
const CAPTCHA_IMG_LOCATOR =
  'img[src*="captcha" i], img[src*="Captcha" i], img[src*="verify" i], img[alt*="captcha" i], img[alt*="verification" i], .captcha img, #captcha img, [id*="captcha" i] img, [class*="captcha" i] img';

/**
 * Try to read captcha pixels from current page state.
 * @returns {Promise<string|null>} base64 without data URL prefix
 */
async function tryExtractCaptchaBase64(page) {
  const captchaImg = page.locator(CAPTCHA_IMG_LOCATOR).first();
  if ((await captchaImg.count()) === 0) return null;

  const visible = await captchaImg.isVisible().catch(() => false);
  if (!visible) {
    await captchaImg.scrollIntoViewIfNeeded().catch(() => {});
    await new Promise((r) => setTimeout(r, 400));
  }

  let captchaBase64 = null;
  const src = await captchaImg.getAttribute("src").catch(() => null);
  if (src && (src.startsWith("data:") || src.startsWith("http"))) {
    if (src.startsWith("data:")) {
      captchaBase64 = src.replace(/^data:image\/\w+;base64,/, "");
    } else {
      try {
        const resp = await page.request.get(src);
        const buf = await resp.body();
        const ct = (resp.headers()["content-type"] || "").toLowerCase();
        if (ct.includes("image") && buf.length > 80) captchaBase64 = Buffer.from(buf).toString("base64");
      } catch {
        /* screenshot below */
      }
    }
  }
  if (!captchaBase64) {
    try {
      const box = await captchaImg.boundingBox();
      if (box && box.width >= 20 && box.height >= 10) {
        const screenshot = await captchaImg.screenshot();
        if (screenshot?.length > 80) captchaBase64 = screenshot.toString("base64");
      }
    } catch {
      /* next */
    }
  }

  if (!captchaBase64) {
    const captchaContainer = page.locator('[id*="captcha" i], [class*="captcha" i], .captcha').first();
    if ((await captchaContainer.count()) > 0) {
      try {
        const shot = await captchaContainer.screenshot();
        if (shot?.length > 80) captchaBase64 = shot.toString("base64");
      } catch {
        /* ignore */
      }
    }
  }

  return captchaBase64 && captchaBase64.length > 40 ? captchaBase64 : null;
}

/**
 * Wait for MOFA to inject captcha; reload if missing (common MOFA glitch).
 */
async function waitAndExtractCaptcha(page) {
  const waitMs = [2000, 3500, 5000];
  for (let round = 0; round < 3; round++) {
    if (round > 0) {
      await page.reload({ waitUntil: "networkidle", timeout: PAGE_TIMEOUT_MS }).catch(() => {});
    }
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await new Promise((r) => setTimeout(r, waitMs[round] || 3000));

    try {
      await page.waitForSelector(
        'img[src*="captcha"], img[src*="Captcha"], img[src*="verify"], [class*="captcha"] img, [id*="captcha"] img',
        { timeout: 15000 }
      );
    } catch {
      /* still try extract — selector may differ */
    }

    await page
      .evaluate(() => {
        document.querySelectorAll('[class*="captcha" i], [id*="captcha" i]').forEach((el) => {
          try {
            el.scrollIntoView({ block: "center", behavior: "instant" });
          } catch {
            /* ignore */
          }
        });
      })
      .catch(() => {});

    await new Promise((r) => setTimeout(r, 800));

    const b64 = await tryExtractCaptchaBase64(page);
    if (b64) return b64;
  }
  return null;
}

/**
 * Get captcha image and create session for later form submit.
 * Keeps browser/page in memory - must call submitVisaLookup with same sessionId within TTL.
 * @param {{ passportNumber?: string; firstName?: string; countryCode?: string }} [formSnapshot] — When set, MOFA is filled to match submit (especially nationality) *before* the captcha is read, so the code stays valid.
 * @returns {Promise<{ sessionId: string; captchaImageBase64: string }>}
 */
export async function fetchCaptcha(formSnapshot = {}) {
  cleanupExpiredSessions();

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
  });

  const page = await context.newPage();
  await page.goto(MOFA_VISA_URL, { waitUntil: "networkidle", timeout: PAGE_TIMEOUT_MS });
  await ensureBarcodeReaderMode(page);
  await selectPassportNumberAndFirstNameDropdowns(page);

  const pn = formSnapshot.passportNumber != null ? String(formSnapshot.passportNumber).trim() : "";
  const fn = formSnapshot.firstName != null ? String(formSnapshot.firstName).trim() : "";
  const cc = formSnapshot.countryCode != null ? String(formSnapshot.countryCode).trim().toUpperCase() : "";
  if (pn || fn) {
    await fillMofaPassportAndFirstName(page, pn, fn);
    await new Promise((r) => setTimeout(r, 250));
  }
  if (cc) {
    await applyMofaNationality(page, cc);
  }

  const captchaBase64 = await waitAndExtractCaptcha(page);

  if (!captchaBase64) {
    await browser.close();
    throw new Error(
      "MOFA did not show a captcha image (yet). This happens sometimes on their site. Wait a moment and use Retry, or open visa.mofa.gov.sa in a normal browser and try again."
    );
  }

  const sessionId = `mofa_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  sessionStore.set(sessionId, {
    browser,
    page,
    context,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  return {
    sessionId,
    captchaImageBase64: captchaBase64,
  };
}

/**
 * Capture issued visa visual (image or screenshot) for display/download.
 * @returns {Promise<{ base64: string; mime: string } | null>}
 */
async function captureVisaCopy(page, context) {
  const skipSrc = (src) =>
    !src ||
    /captcha|logo|icon|avatar|header|footer|banner|social|facebook|twitter/i.test(src);

  // Issued visa print page — Chromium PDF matches browser “Print → Save as PDF”
  if (PRINT_EVENT_VISA_RE.test(page.url())) {
    try {
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 2000));
      const pdfBuf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" },
      });
      if (pdfBuf && pdfBuf.length > 1200) {
        return { base64: pdfBuf.toString("base64"), mime: "application/pdf" };
      }
    } catch {
      /* fall through */
    }
  }

  /** @param {string} src */
  async function imageSrcToBase64(src) {
    if (src.startsWith("data:image/")) {
      const m = src.match(/^data:(image\/[\w+.-]+);base64,(.+)$/i);
      if (m) return { base64: m[2], mime: m[1] };
    }
    let absolute = src;
    if (src.startsWith("/") || src.startsWith("./")) {
      try {
        absolute = new URL(src, page.url()).href;
      } catch {
        return null;
      }
    }
    if (absolute.startsWith("http")) {
      try {
        const resp = await page.request.get(absolute);
        const buf = await resp.body();
        const ct = resp.headers()["content-type"] || "image/png";
        const mime = ct.split(";")[0].trim() || "image/png";
        return { base64: Buffer.from(buf).toString("base64"), mime };
      } catch {
        return null;
      }
    }
    return null;
  }

  // 0) Alert / result banners (MOFA often shows outcome here)
  for (const sel of ['[role="alert"]', '[class*="alert"]:visible', '[class*="Alert"]:visible', ".swal2-popup"]) {
    const el = page.locator(sel).first();
    if ((await el.count()) === 0) continue;
    const vis = await el.isVisible().catch(() => false);
    if (!vis) continue;
    try {
      const shot = await el.screenshot({ type: "png" });
      if (shot?.length > 800) return { base64: shot.toString("base64"), mime: "image/png" };
    } catch {
      /* next */
    }
  }

  // 1) Prefer “Print visa” in new tab (often full visa layout)
  const printTrigger = page
    .locator(
      'a:has-text("طباعة"), button:has-text("طباعة"), a:has-text("Print"), button:has-text("Print"), [href*="print"], [href*="Print"]'
    )
    .first();
  if ((await printTrigger.count()) > 0 && (await printTrigger.isVisible().catch(() => false))) {
    try {
      const popupPromise = context.waitForEvent("page", { timeout: 8000 }).catch(() => null);
      await printTrigger.click({ timeout: 5000 });
      const newPage = await popupPromise;
      if (newPage) {
        await newPage.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
        await new Promise((r) => setTimeout(r, 1500));
        const shot = await newPage.screenshot({ type: "png", fullPage: true }).catch(() => null);
        await newPage.close().catch(() => {});
        if (shot?.length) {
          return { base64: shot.toString("base64"), mime: "image/png" };
        }
      }
    } catch {
      /* continue with same-page capture */
    }
  }

  // 2) Large content images (visa card / QR), excluding chrome
  const imgLoc = page.locator('main img, [role="main"] img, #MainContent img, .container img, article img');
  const n = await imgLoc.count();
  for (let i = 0; i < n; i++) {
    const img = imgLoc.nth(i);
    const src = await img.getAttribute("src").catch(() => null);
    if (skipSrc(src || "")) continue;
    const box = await img.boundingBox().catch(() => null);
    if (!box || box.width < 100 || box.height < 80) continue;
    const out = await imageSrcToBase64(src);
    if (out?.base64?.length > 500) return out;
  }

  // 3) Named visa / QR selectors
  for (const sel of [
    'img[src*="visa"]',
    'img[src*="Visa"]',
    'img[src*="qr"]',
    'img[alt*="visa"]',
    '[class*="visa"] img',
    '[id*="visa"] img',
  ]) {
    const img = page.locator(sel).first();
    if ((await img.count()) === 0) continue;
    const src = await img.getAttribute("src").catch(() => null);
    if (skipSrc(src || "")) continue;
    const out = await imageSrcToBase64(src);
    if (out?.base64?.length > 200) return out;
  }

  // 4) Screenshot likely result panels (issued visa block)
  for (const sel of [
    '[id*="Visa"]',
    '[class*="VisaResult"]',
    '[id*="VisaResult"]',
    '[class*="visa-result"]',
    '[class*="panel"]',
    '[id*="result"]',
    '[class*="result"]',
    "main",
    '[role="main"]',
  ]) {
    const el = page.locator(sel).first();
    if ((await el.count()) === 0) continue;
    const text = (await el.innerText().catch(() => "")) || "";
    if (text.length < 50) continue;
    if (!/visa|تأشيرة|passport|جواز|nationality|الجنسية|issue|إصدار|alert|خطأ|نجاح|تم/i.test(text)) continue;
    try {
      const shot = await el.screenshot({ type: "png" });
      if (shot?.length > 1500) return { base64: shot.toString("base64"), mime: "image/png" };
    } catch {
      /* next */
    }
  }

  // 5) Full-page PNG fallback (user can crop; better than nothing)
  try {
    const shot = await page.screenshot({ type: "png", fullPage: false });
    if (shot?.length > 4000) return { base64: shot.toString("base64"), mime: "image/png" };
  } catch {
    /* ignore */
  }

  return null;
}

/**
 * Submit visa lookup form using stored session (same page as captcha).
 * Barcode Reader + first/second dropdowns PassPortNo / fName + two value inputs + nationality + captcha.
 * @param {object} params
 * @param {string} params.sessionId - From fetchCaptcha
 * @param {string} params.passportNumber
 * @param {string} params.firstName
 * @param {string} params.countryCode - ISO 3166-1 alpha-3 (e.g. IND)
 * @param {string} params.captchaText
 * @returns {Promise<{ success: boolean; visaDetails?: object; error?: string; rawHtml?: string }>}
 */
export async function submitVisaLookup({ sessionId, passportNumber, firstName, countryCode, captchaText }) {
  const data = sessionStore.get(sessionId);
  if (!data) {
    return { success: false, error: "Captcha expired. Please start over and get a new captcha." };
  }

  sessionStore.delete(sessionId);
  const { browser, context } = data;
  let page = data.page;

  try {
    const code = String(countryCode || "").toUpperCase();

    await ensureBarcodeReaderModeIfNeeded(page);
    await selectPassportNumberAndFirstNameDropdownsIfNeeded(page);

    const selects = page.locator("select");

    await fillMofaPassportAndFirstName(page, passportNumber, firstName);

    if (code) {
      const nationalityValue = ALPHA3_TO_ALPHA2[code] || code;
      if ((await selects.nth(2).count()) > 0) {
        const curNat = await selects.nth(2).evaluate((el) => el.value).catch(() => "");
        const already =
          curNat &&
          (curNat === nationalityValue ||
            curNat === code ||
            String(curNat).toUpperCase() === String(nationalityValue).toUpperCase() ||
            String(curNat).toUpperCase() === code);
        if (!already) {
          await applyMofaNationality(page, code);
        }
      }
    }

    await fillMofaCaptcha(page, captchaText);
    await new Promise((r) => setTimeout(r, 450));

    // Submit: "استعلم" (Inquire)
    const submitBtn = page.locator('button:has-text("استعلم"), button[type="submit"], input[type="submit"]').first();
    await submitBtn.click();

    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
    await Promise.race([
      page.waitForSelector(
        '[class*="alert"], [class*="Alert"], [class*="result"], [class*="Result"], table tbody tr, .modal, [role="dialog"]',
        { timeout: 12000 }
      ),
      new Promise((r) => setTimeout(r, 10000)),
    ]);
    await new Promise((r) => setTimeout(r, 2500));

    const overlay = await classifyPostSubmitOverlay(page);

    if (overlay.kind === "captcha_or_request" && !PRINT_EVENT_VISA_RE.test(page.url())) {
      await browser.close();
      const hint = (overlay.snippet || "").replace(/\s+/g, " ").trim().slice(0, 400);
      return {
        success: false,
        error:
          "The captcha or session was rejected by MOFA. Tap \"Try again\" to load a fresh captcha and re-submit.",
        mofaMessage: hint || undefined,
      };
    }

    page = await resolvePrintEventVisaPage(page, context);

    /** Ignore form/nav: labels repeat "رقم التأشيرة", "طباعة تأشيرة" on every page */
    let relevantRaw =
      overlay.kind === "no_visa" && overlay.snippet
        ? `${overlay.snippet}\n${await getResultRelevantText(page)}`
        : await getResultRelevantText(page);
    // MOFA “no visa” is often only inside a visible modal (“Visa platform” / English alert)
    const visibleDialogText = await page
      .locator('[role="dialog"]:visible, [class*="modal"]:visible, .swal2-popup:visible')
      .first()
      .innerText()
      .catch(() => "");
    if (visibleDialogText?.trim()) {
      relevantRaw = `${relevantRaw}\n${visibleDialogText}`.trim();
    }
    const relevantLower = relevantRaw.toLowerCase();

    // No-result phrases (Arabic + English) — includes MOFA’s issued-visa search empty state
    const noResultPhrases = [
      "لم يتم العثور",
      "لا توجد بيانات",
      "no record",
      "no result",
      "not found",
      "no data",
      "لا توجد نتائج",
      "لا يوجد سجل",
      "لم يتم",
      // MOFA English modal: “There is no any information for the selected values”
      "there is no any information",
      "no any information for the selected",
      "no information for the selected values",
      "no information for the selected",
    ];
    const hasNoResult = noResultPhrases.some((p) => relevantLower.includes(p.toLowerCase()));

    // Strong visa-found signals (avoid generic "طباعة" / dropdown "رقم التأشيرة")
    const visaFoundPhrases = [
      "تاريخ الإصدار",
      "تاريخ الانتهاء",
      "تاريخ انتهاء",
      "date of issue",
      "date of expiry",
      "visa expiry",
      "صورة التأشيرة",
      "visa copy",
      "تم إصدار",
      "حالة التأشيرة",
      "نوع التأشيرة",
      "رقم الطلب",
      "application no",
      "border number",
      "الرقم الحدودي",
    ];
    const onPrintEventVisaPage = PRINT_EVENT_VISA_RE.test(page.url());
    const hasVisaFound =
      onPrintEventVisaPage ||
      visaFoundPhrases.some((p) => relevantLower.includes(p.toLowerCase())) ||
      /\b[A-Z]{1,2}\d{6,12}\b/.test(relevantRaw) || // common visa / ref alphanumerics
      (relevantLower.includes("رقم التأشيرة") && relevantRaw.length > 120); // label + real data, not just chrome

    let resultText = null;

    // Try to extract visa result area (prefer panels over whole main)
    const resultSelectors = [
      '[class*="alert"]',
      '[class*="Alert"]',
      '[id*="result"]',
      '[class*="result"]',
      '[class*="inquiry"]',
      '[class*="visa-detail"]',
      '[class*="visa"]',
      ".inquiry-result",
      "table",
      '[role="main"]',
      "main",
      "#MainContent",
    ];

    for (const sel of resultSelectors) {
      const el = page.locator(sel).first();
      if (await el.count() > 0) {
        const text = (await el.innerText()).trim();
        if (text && text.length > 20 && !/^[\s\n]*رقم التأشيرة[\s\n]*$/i.test(text) && !/cookie|privacy|سياسة/i.test(text)) {
          resultText = text;
          break;
        }
      }
    }

    if (!resultText || resultText.length < 30) {
      resultText = relevantRaw || (await page.locator("body").innerText()).trim();
    }

    // Determine outcome: (modal error handled above) > no result > visa found
    if (hasNoResult && !hasVisaFound) {
      await browser.close();
      return {
        success: false,
        error:
          "No visa found for these details. Double-check the passport number, first name, and nationality, or the visa may not have been issued yet.",
        visaDetails: resultText ? { rawText: resultText } : undefined,
      };
    }

    /** Issued-visa visual for display + download (skip on clear failures above) */
    const visaCopy = await captureVisaCopy(page, context);
    await browser.close();

    const textLower = `${relevantRaw}\n${resultText || ""}`.toLowerCase();
    const textIsPlaceholder =
      !String(resultText || "").trim() ||
      textLower.length < 40 ||
      /check completed|please verify the result on the official mofa/i.test(textLower);
    const isPlaceholderOnly = textIsPlaceholder && !visaCopy?.base64;

    const textHasVisaSignals =
      /تاريخ الإصدار|تاريخ الانتهاء|date of issue|date of expiry|حالة التأشيرة|نوع التأشيرة|جواز|passport no|nationality|الجنسية|border number|الرقم الحدودي/.test(
        textLower
      ) ||
      (relevantRaw.length > 80 && /[\u0600-\u06FF]{25,}/.test(relevantRaw));
    const textIsOnlyCookieBanner =
      /ملفات الارتباط|cookie|إستخدامك لموقعنا/i.test(textLower) &&
      !textHasVisaSignals;
    const looksLikeVisaContent =
      hasVisaFound ||
      (!!visaCopy?.base64 && !textIsOnlyCookieBanner) ||
      textHasVisaSignals;

    if (!isPlaceholderOnly && looksLikeVisaContent) {
      return {
        success: true,
        visaDetails: {
          rawText: resultText,
          visaCopyBase64: visaCopy?.base64,
          visaCopyMime: visaCopy?.mime || "image/png",
          // legacy field for older clients
          visaImageBase64: visaCopy?.base64,
        },
      };
    }

    return {
      success: false,
      error:
        "We could not read visa details from MOFA’s response. Try again with a new captcha, or check directly at visa.mofa.gov.sa.",
      visaDetails: resultText && !isPlaceholderOnly ? { rawText: resultText } : undefined,
    };
  } catch (err) {
    await browser.close();
    return {
      success: false,
      error: err?.message || "Failed to complete visa lookup",
    };
  }
}
