import type { ItineraryState } from '@/types/itinerary';

const COLORS: Record<string, string> = {
  flight: '#0ea5e9', hotel: '#8b5cf6', visa: '#eab308', activity: '#22c55e',
  transport: '#f97316', transfer: '#a855f7', meal: '#f43f5e', insurance: '#64748b',
};

const LABELS: Record<string, string> = {
  flight: '✈ Flight', hotel: '🏨 Hotel', visa: '📋 Visa', activity: '📍 Activity',
  transport: '🚗 Transport', transfer: '🔄 Transfer', meal: '🍽 Meal', insurance: '🛡 Insurance',
};

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
  } catch { return `${currency} ${price.toLocaleString()}`; }
}

export function generateItineraryPDF(state: ItineraryState, totalPrice: number) {
  const currency = state.tripInfo?.currency || 'INR';

  const guestsHtml = state.guests.length > 0 ? `
    <div style="margin-bottom:24px;">
      <h3 style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Guests</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${state.guests.map(g => `
          <div style="padding:8px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:12px;">
            <strong>${g.name}</strong>${g.age ? ` · ${g.age} yrs` : ''}${g.relation ? ` · ${g.relation}` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const daysHtml = state.days.map(day => `
    <div style="margin-bottom:24px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#eff6ff;border:2px solid #93c5fd;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#3b82f6;">
          ${day.day}
        </div>
        <div>
          <span style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Day ${day.day}</span>
          ${day.date ? `<span style="font-size:11px;color:#9ca3af;margin-left:8px;">${day.date}</span>` : ''}
        </div>
      </div>
      <div style="margin-left:42px;">
        ${day.items.map(item => `
          <div style="border:1px solid #e5e7eb;border-left:3px solid ${COLORS[item.type] || '#64748b'};border-radius:8px;padding:10px 14px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <span style="font-size:10px;color:${COLORS[item.type] || '#64748b'};margin-right:6px;">${LABELS[item.type] || item.type}</span>
                <strong style="font-size:13px;">${item.title}</strong>
              </div>
              ${item.price ? `<span style="font-size:12px;font-weight:700;">${formatPrice(item.price, currency)}</span>` : ''}
            </div>
            ${item.subtitle ? `<div style="font-size:11px;color:#6b7280;margin-top:2px;">${item.subtitle}</div>` : ''}
            <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;">
              ${item.time ? `<span style="font-size:10px;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${item.time}</span>` : ''}
              ${item.location ? `<span style="font-size:10px;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${item.location}</span>` : ''}
              ${item.duration ? `<span style="font-size:10px;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${item.duration}</span>` : ''}
            </div>
            ${item.details ? `<div style="font-size:11px;color:#6b7280;margin-top:6px;line-height:1.5;">${item.details}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${state.tripInfo?.title || 'Travel Itinerary'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
  @media print { body { padding: 20px; } }
</style>
</head><body>
  <div style="margin-bottom:32px;border-bottom:2px solid #e5e7eb;padding-bottom:20px;">
    <h1 style="font-size:24px;font-weight:800;margin-bottom:4px;">${state.tripInfo?.title || 'Travel Itinerary'}</h1>
    <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:#6b7280;margin-top:8px;">
      ${state.tripInfo?.destination ? `<span>📍 ${state.tripInfo.destination}</span>` : ''}
      ${state.tripInfo?.startDate ? `<span>📅 ${state.tripInfo.startDate}${state.tripInfo?.endDate ? ` — ${state.tripInfo.endDate}` : ''}</span>` : ''}
      ${state.guests.length > 0 ? `<span>👥 ${state.guests.length} guests</span>` : ''}
    </div>
  </div>

  ${guestsHtml}
  ${daysHtml}

  ${totalPrice > 0 ? `
    <div style="border-top:2px solid #e5e7eb;padding-top:16px;margin-top:24px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Estimated Total</span>
      <span style="font-size:20px;font-weight:800;">${formatPrice(totalPrice, currency)}</span>
    </div>
  ` : ''}

  <div style="text-align:center;margin-top:40px;font-size:10px;color:#d1d5db;">
    Powered by Marhaba DMC · Prices are estimates and subject to change
  </div>
</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
