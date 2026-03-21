/**
 * Passport OCR - Extract passport number and name from passport image or PDF using Tesseract + MRZ parsing.
 * PII: Process in memory only; do not log or persist.
 */
import Tesseract from "tesseract.js";
import { parse } from "mrz";
import { pdf } from "pdf-to-img";
import sharp from "sharp";

const MRZ_LINE_REGEX = /^[A-Z0-9<]{30,44}$/;
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

/**
 * Extract MRZ-like lines from Tesseract text output.
 * MRZ lines are typically 30 or 44 characters, alphanumeric + '<'.
 */
function extractMrzLines(text) {
  if (!text || typeof text !== "string") return [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s/g, "").toUpperCase())
    .filter((l) => MRZ_LINE_REGEX.test(l));
  return lines;
}

/**
 * Convert PDF buffer to image buffer (first page).
 * @param {Buffer} pdfBuffer
 * @returns {Promise<Buffer>}
 */
async function pdfToImage(pdfBuffer) {
  const document = await pdf(pdfBuffer, { scale: 2 });
  if (document.length < 1) {
    throw new Error("PDF has no pages");
  }
  for await (const pageBuffer of document) {
    if (pageBuffer?.length > 0) {
      return pageBuffer;
    }
  }
  throw new Error("Could not rasterize PDF (no page image produced)");
}

/**
 * Extract passport number and first name from passport image or PDF buffer.
 * @param {Buffer} fileBuffer - JPEG/PNG/WebP image or PDF buffer
 * @param {string} mimetype - e.g. image/jpeg, application/pdf
 * @returns {Promise<{ passportNumber?: string; firstName?: string; lastName?: string; rawMrz?: string[]; error?: string }>}
 */
function toDataUrl(buffer, mimetype) {
  const base64 = buffer.toString("base64");
  const mime = mimetype === "image/png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${base64}`;
}

export async function extractPassportData(fileBuffer, mimetype = "image/jpeg") {
  let imageBuffer = fileBuffer;
  let imageMime = mimetype;

  if (mimetype === "application/pdf" || (fileBuffer.length >= 4 && fileBuffer.subarray(0, 4).equals(PDF_MAGIC))) {
    try {
      imageBuffer = await pdfToImage(fileBuffer);
      imageMime = "image/png";
    } catch (pdfErr) {
      const msg = pdfErr?.message || String(pdfErr);
      console.error("[passport-extract] PDF conversion failed:", msg);
      if (pdfErr?.stack) {
        console.error(pdfErr.stack);
      }
      const hint =
        /password|encrypted/i.test(msg)
          ? " The PDF may be password-protected."
          : /Invalid|corrupt|Malformed/i.test(msg)
            ? " The PDF may be corrupted or invalid."
            : /@napi-rs\/canvas|canvas|Cannot find module/i.test(msg)
              ? " PDF rendering libraries may be missing — reinstall server dependencies or use a JPEG/PNG photo."
              : /font|standard_fonts/i.test(msg)
                ? " The PDF uses fonts that could not be loaded; try exporting the passport page as an image."
                : "";
      const showDebug =
        process.env.NODE_ENV !== "production" || process.env.PASSPORT_EXTRACT_DEBUG === "1";
      return {
        error: `Could not convert PDF to image.${hint} Please upload a clear JPEG or PNG photo of your passport instead.`,
        ...(showDebug ? { debug: msg } : {}),
      };
    }
  }

  try {
    let cleanBuffer = imageBuffer;
    try {
      cleanBuffer = await sharp(imageBuffer)
        .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer();
    } catch (sharpErr) {
      return {
        error: "Invalid or corrupted image. Please upload a clear JPEG or PNG photo.",
      };
    }

    const imageInput = toDataUrl(cleanBuffer, "image/png");
    const { data } = await Tesseract.recognize(imageInput, "eng", {
      logger: () => {},
      errorHandler: () => {},
    });

    const mrzLines = extractMrzLines(data?.text);
    if (mrzLines.length < 2) {
      return {
        error: "Could not detect passport MRZ. Please enter details manually.",
        rawMrz: mrzLines,
      };
    }

    let result;
    try {
      result = parse(mrzLines, { autocorrect: true });
    } catch (parseErr) {
      return {
        error: "Could not parse passport data. Please enter details manually.",
        rawMrz: mrzLines,
      };
    }

    const documentNumber = result?.documentNumber?.replace(/</g, "").trim() || null;
    const fields = result?.fields || {};
    const lastName = (fields.lastName || fields.primaryIdentifier || fields.surname || "").replace(/</g, " ").trim() || null;
    const givenNames = (fields.firstName || fields.secondaryIdentifier || fields.givenNames || "").replace(/</g, " ").trim() || null;

    const firstName = givenNames ? givenNames.split(/\s+/)[0] : (lastName || null);
    const lastNameVal = lastName || (givenNames ? givenNames.split(/\s+/).slice(1).join(" ") : null);

    return {
      passportNumber: documentNumber || undefined,
      firstName: (firstName || givenNames || "").trim() || undefined,
      lastName: (lastNameVal || "").trim() || undefined,
      rawMrz: mrzLines,
    };
  } catch (err) {
    return {
      error: err?.message || "Failed to process passport. Please enter details manually.",
    };
  }
}
