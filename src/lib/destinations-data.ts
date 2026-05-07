/**
 * Destination categories data - extracted to separate file for better code splitting
 * This allows the page to load without all data embedded in the component
 */

export interface Destination {
  name: string;
  useCases?: string[];
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  destinations: Destination[];
  color: string;
}

// Country name to ISO 3166-1 alpha-2 code mapping
export const countryCodes: Record<string, string> = {
  "Saudi Arabia": "SA",
  "Iraq": "IQ",
  "Iran": "IR",
  "Palestine": "PS",
  "Jordan": "JO",
  "Egypt": "EG",
  "Uzbekistan": "UZ",
  "Afghanistan": "AF",
  "Turkey": "TR",
  "Malaysia": "MY",
  "Indonesia": "ID",
  "Morocco": "MA",
  "Maldives": "MV",
  "Singapore": "SG",
  "Mauritius": "MU",
  "India": "IN",
  "Azerbaijan": "AZ",
  "Russia": "RU",
  "Spain": "ES",
  "Georgia": "GE",
  "Vietnam": "VN",
  "Thailand": "TH",
  "Oman": "OM",
  "Qatar": "QA",
  "United Arab Emirates": "AE",
  "Bahrain": "BH",
  "China": "CN",
  "Japan": "JP"
};

export const getCountryCode = (countryName: string): string => {
  return countryCodes[countryName] || "UN";
};

// Categories data - extracted to separate file for code splitting
// Contains all destination categories, countries, and metadata
export const categoriesData: Category[] = [
  {
    id: "religious",
    name: "Religious Travel",
    description: "Destinations where travel intent is purely faith-centric, focusing on spiritual journeys, religious obligations, and structured pilgrimage experiences.",
    destinations: [
      {
        name: "Saudi Arabia",
        useCases: ["Umrah", "Hajj", "Ziyarat"],
        featured: true
      }
    ],
    color: "from-primary to-primary/70",
  },
  {
    id: "leisure-religious",
    name: "Leisure + Religious Travel",
    description: "Destinations that blend spiritual significance with cultural heritage and leisure experiences, offering balanced itineraries for faith-conscious travelers.",
    destinations: [
      { name: "Saudi Arabia", featured: true },
      { name: "Iraq" },
      { name: "Iran" },
      { name: "Palestine" },
      { name: "Jordan" },
      { name: "Egypt", featured: true },
      { name: "Uzbekistan" },
      { name: "Afghanistan" }
    ],
    color: "from-primary/90 to-primary/60",
  },
  {
    id: "leisure",
    name: "Leisure Travel",
    description: "Global destinations curated with halal-friendly considerations, offering experience-led travel aligned with halal expectations and cultural sensitivity.",
    destinations: [
      { name: "Turkey", featured: true },
      { name: "Malaysia", featured: true },
      { name: "Indonesia", featured: true },
      { name: "Morocco" },
      { name: "Maldives", featured: true },
      { name: "Singapore", featured: true },
      { name: "Mauritius" },
      { name: "India", featured: true },
      { name: "Azerbaijan" },
      { name: "Russia" },
      { name: "Spain" },
      { name: "Georgia" },
      { name: "Vietnam" },
      { name: "Thailand" },
      { name: "Oman" },
      { name: "Qatar" },
      { name: "United Arab Emirates", featured: true },
      { name: "Bahrain" }
    ],
    color: "from-primary/80 to-primary/50",
  },
  {
    id: "business",
    name: "Business Travel",
    description: "Professional and commercial travel destinations with halal-aligned accommodations and services, supporting corporate delegations, exhibitions, and business meetings.",
    destinations: [
      { name: "China", featured: true },
      { name: "Japan", featured: true },
      { name: "Malaysia" },
      { name: "United Arab Emirates", featured: true },
      { name: "Saudi Arabia", featured: true },
      { name: "Qatar", featured: true },
      { name: "Bahrain" },
      { name: "Oman" }
    ],
    color: "from-primary/70 to-primary/40",
  }
];
