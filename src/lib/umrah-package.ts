/**
 * Single source of truth for the Bangalore Group Umrah campaign
 * (Marhaba Haji — a B2C brand of Marhaba Ventures Private Limited).
 */

export const UMRAH = {
  slug: "bangalore-umrah-sep-2026",
  route: "/bangalore-umrah-package",
  brand: "Marhaba Haji",
  legalEntity: "Marhaba Ventures Private Limited",

  title: "14-Day Group Umrah from Bangalore",
  departISO: "2026-09-02",
  returnISO: "2026-09-16",
  departLabel: "2 September 2026",
  returnLabel: "16 September 2026",
  nights: 14,
  makkahDays: 9,
  madinahDays: 5,

  airline: "Saudia (Saudi Airlines)",
  flightNote: "Direct flight",
  baggage: "40 kg check-in + 7 kg cabin",

  makkahHotel: "Rehab Al Taqwa",
  makkahDistance: "approx. 500 m from Masjid al-Haram",
  madinahHotel: "Hayah Salam Silver or similar",
  madinahDistance: "Markaziya area, approx. 200 m from Masjid an-Nabawi",

  listPrice: 107000,
  offerPrice: 99000,
  gstPercent: 5,
  tcsPercent: 2,
  advanceAmount: 25000,

  /** Bookings close — countdown target (IST 23:59) */
  deadlineISO: "2026-08-25T18:29:00Z",
  deadlineLabel: "25 August 2026",

  seatsTotal: 40,
  seatsLeft: 15,
  groupDiscountMin: 10,

  umrahOpportunities: "At least 3 Umrah opportunities",

  ziyarats: [
    { city: "Makkah", detail: "Historic sites around the Haram with an expert guide" },
    { city: "Madinah", detail: "Masjid Quba, Uhud, Qiblatain and more" },
    { city: "Taif", detail: "Full-day mountain ziyarat" },
    { city: "Badr", detail: "The battlefield of Badr" },
    { city: "Jorana", detail: "Miqat for an additional Umrah" },
  ],

  inclusions: [
    "Return air tickets — Saudia direct flight",
    "Umrah visa — multiple entry, 1 year validity",
    "Travel insurance",
    "Hotel accommodation in Makkah & Madinah",
    "Airport transfers (both sides)",
    "Makkah–Madinah intercity transfer",
    "Buffet meals — 3 times a day",
    "Makkah ziyarat",
    "Madinah ziyarat",
    "Taif ziyarat",
    "Badr ziyarat",
    "Jorana ziyarat (extra Umrah)",
    "Zamzam water",
    "Laundry",
    "Guided ziyarats by expert scholars",
    "At least 3 Umrah opportunities",
  ],

  exclusions: [
    "GST 5% and TCS 2% (charged extra on the package price)",
    "Passport fees and documentation charges",
    "Qurbani / Dam and any religious penalty charges",
    "Personal expenses, shopping and telephone bills",
    "Meals outside the scheduled buffet",
    "Room service, mini-bar and paid hotel extras",
    "Wheelchair, porter and any special assistance",
    "Medical expenses beyond the insurance cover",
    "Any cost due to flight delay, visa rejection or force majeure",
    "Anything not specifically listed under inclusions",
  ],

  rooms: [
    { type: "Quint sharing", occupancy: "5 beds in a room", price: 99000, tag: "Best value" },
    { type: "Quad sharing", occupancy: "4 beds in a room", price: 99000, tag: "Most popular" },
    { type: "Triple — private room", occupancy: "Private room for 3", price: null, tag: "Family / private" },
    { type: "Double — private room", occupancy: "Private room for 2", price: null, tag: "Family / private" },
  ],

  faqs: [
    {
      q: "Is the ₹99,000 price per person?",
      a: "Yes. ₹99,000 per person on quad or quint sharing, against the list price of ₹1,07,000. GST 5% and TCS 2% are applicable extra.",
    },
    {
      q: "Are triple and double rooms shared with strangers?",
      a: "No. Triple and double bed rooms are private rooms allotted to your own family or group. Only quad and quint rooms are sharing rooms.",
    },
    {
      q: "How far are the hotels from the Haramain?",
      a: "Rehab Al Taqwa in Makkah is roughly 500 m from Masjid al-Haram. In Madinah you stay in the Markaziya area, roughly 200 m from Masjid an-Nabawi.",
    },
    {
      q: "What is the visa validity?",
      a: "You receive a multiple-entry Umrah visa valid for one year, so you can travel again within the validity period on your own.",
    },
    {
      q: "How many Umrahs will we perform?",
      a: "The programme is arranged so that every pilgrim gets at least three Umrah opportunities, including one from Jorana miqat.",
    },
    {
      q: "What is the payment schedule?",
      a: "A booking amount of ₹25,000 per person confirms your seat. The balance is payable before ticketing and visa processing.",
    },
    {
      q: "Do you have a group discount?",
      a: "Yes — groups of 10 or more travelling together get a further special discount. Send us an enquiry and our team will share the group rate.",
    },
    {
      q: "Can ladies travel without a mahram?",
      a: "Ladies above 45 may travel in an organised group as per current Saudi rules. Our team will confirm eligibility for your case before booking.",
    },
  ],
} as const;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const totalWithTaxes = (base: number) =>
  Math.round(base * (1 + UMRAH.gstPercent / 100 + UMRAH.tcsPercent / 100));

export const savings = UMRAH.listPrice - UMRAH.offerPrice;
