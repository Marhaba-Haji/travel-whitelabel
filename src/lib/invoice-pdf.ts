import { supabase } from "@/integrations/supabase/client";

export interface InvoiceData {
  type: "signup" | "webinar";
  order_id: string;
  amount: number;
  currency: string;
  product: string;
  plan_name: string | null;
  payment_mode: string;
  payu_mihpayid: string | null;
  bank_ref_num: string | null;
  date: string;
  customer: { name: string; email: string; phone: string; city: string };
}

const COMPANY = {
  name: "marhabaDMC",
  address:
    "Paramount Avenue, 63/1, 3rd floor, Mosque road cross, Frazer town, Bangalore 560005",
  email: "hello@marhabadmc.com",
  phone: "+91 90084 47887",
  website: "marhabadmc.com",
};

const GST_PERCENT = 18;

function fmtMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function fetchInvoice(orderId: string): Promise<InvoiceData> {
  const { data, error } = await supabase.functions.invoke("get-invoice", {
    body: { order_id: orderId },
  });
  if (error) throw new Error(error.message);
  if (!data || (data as any).error) throw new Error((data as any)?.error || "Failed");
  return data as InvoiceData;
}

export function renderInvoiceHTML(inv: InvoiceData): string {
  const gross = inv.amount;
  // GST-inclusive split (Indian convention for ₹)
  const isIndian = (inv.currency || "INR") === "INR" && gross > 0;
  const base = isIndian ? +(gross / (1 + GST_PERCENT / 100)).toFixed(2) : gross;
  const gst = isIndian ? +(gross - base).toFixed(2) : 0;

  const lineRows = `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
        <div style="font-weight:600;color:#111827;">${esc(inv.product)}</div>
        ${inv.plan_name ? `<div style="font-size:11px;color:#6b7280;margin-top:2px;">Plan: ${esc(inv.plan_name)}</div>` : ""}
      </td>
      <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">
        ${fmtMoney(base, inv.currency)}
      </td>
    </tr>
    ${
      isIndian
        ? `<tr>
            <td style="padding:8px 12px;color:#6b7280;font-size:12px;">GST @ ${GST_PERCENT}%</td>
            <td style="padding:8px 12px;text-align:right;color:#6b7280;font-size:12px;">${fmtMoney(gst, inv.currency)}</td>
          </tr>`
        : ""
    }`;

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Invoice ${esc(inv.order_id)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#111827; margin:0; padding:40px; max-width:820px; margin:0 auto; background:#fff; }
  h1 { margin:0; font-size:28px; letter-spacing:-0.5px; }
  .muted { color:#6b7280; font-size:12px; }
  .row { display:flex; justify-content:space-between; gap:24px; }
  .card { border:1px solid #e5e7eb; border-radius:10px; padding:16px; }
  table { width:100%; border-collapse:collapse; }
  .label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#6b7280; margin-bottom:4px; }
  .val { font-size:13px; color:#111827; font-weight:600; }
  @media print { body { padding:20px; } .no-print { display:none; } }
</style>
</head><body>

<div class="row" style="align-items:flex-start;border-bottom:2px solid #111827;padding-bottom:20px;margin-bottom:24px;">
  <div>
    <h1>${esc(COMPANY.name)}</h1>
    <div class="muted" style="margin-top:6px;max-width:320px;line-height:1.5;">${esc(COMPANY.address)}</div>
    <div class="muted" style="margin-top:4px;">${esc(COMPANY.email)} · ${esc(COMPANY.phone)}</div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:22px;font-weight:800;letter-spacing:2px;color:#111827;">INVOICE</div>
    <div class="muted" style="margin-top:6px;">Invoice #: <strong style="color:#111827;">${esc(inv.order_id)}</strong></div>
    <div class="muted">Date: <strong style="color:#111827;">${esc(fmtDate(inv.date))}</strong></div>
    <div class="muted">Status: <strong style="color:#059669;">PAID</strong></div>
  </div>
</div>

<div class="row" style="margin-bottom:24px;">
  <div class="card" style="flex:1;">
    <div class="label">Billed To</div>
    <div class="val">${esc(inv.customer.name || "—")}</div>
    <div class="muted" style="margin-top:4px;">${esc(inv.customer.email || "")}</div>
    <div class="muted">${esc(inv.customer.phone || "")}</div>
    ${inv.customer.city ? `<div class="muted">${esc(inv.customer.city)}</div>` : ""}
  </div>
  <div class="card" style="flex:1;">
    <div class="label">Payment Details</div>
    <div class="muted">Mode: <strong style="color:#111827;">${esc(inv.payment_mode)}</strong></div>
    ${inv.payu_mihpayid ? `<div class="muted">Gateway Ref: <strong style="color:#111827;">${esc(inv.payu_mihpayid)}</strong></div>` : ""}
    ${inv.bank_ref_num ? `<div class="muted">Bank Ref: <strong style="color:#111827;">${esc(inv.bank_ref_num)}</strong></div>` : ""}
  </div>
</div>

<table style="margin-bottom:24px;">
  <thead>
    <tr style="background:#f9fafb;">
      <th style="text-align:left;padding:12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Description</th>
      <th style="text-align:right;padding:12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${lineRows}
    <tr>
      <td style="padding:16px 12px;font-size:14px;font-weight:700;color:#111827;border-top:2px solid #111827;">Total ${isIndian ? "(incl. GST)" : ""}</td>
      <td style="padding:16px 12px;font-size:18px;font-weight:800;color:#111827;text-align:right;border-top:2px solid #111827;">${fmtMoney(gross, inv.currency)}</td>
    </tr>
  </tbody>
</table>

<div class="muted" style="border-top:1px solid #e5e7eb;padding-top:16px;line-height:1.6;">
  This is a system-generated invoice and does not require a signature.
  For support, contact ${esc(COMPANY.email)} quoting Invoice #${esc(inv.order_id)}.
</div>

<div style="text-align:center;margin-top:32px;font-size:10px;color:#9ca3af;">
  ${esc(COMPANY.website)} · Thank you for your business
</div>

<div class="no-print" style="text-align:center;margin-top:24px;">
  <button onclick="window.print()" style="padding:10px 20px;background:#111827;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Download / Print Invoice</button>
</div>

</body></html>`;
}

export async function downloadInvoice(orderId: string) {
  const inv = await fetchInvoice(orderId);
  const html = renderInvoiceHTML(inv);
  const w = window.open("", "_blank");
  if (!w) throw new Error("Popup blocked. Please allow popups to download the invoice.");
  w.document.write(html);
  w.document.close();
  w.onload = () => {
    setTimeout(() => w.print(), 300);
  };
}