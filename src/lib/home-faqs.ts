export interface HomeFaqContent {
  question: string;
  answer: string;
}

export const DEFAULT_HOME_FAQS: HomeFaqContent[] = [
  {
    question: "How long does it take to set up my portal?",
    answer:
      "Most clients have their branded portal live within 2-3 business days. This includes domain setup, branding customization, and API integration. Our team provides full support throughout the process.",
  },
  {
    question: "Can I use my own domain name?",
    answer:
      "Absolutely! You can use your own custom domain (e.g., book.youragency.com). We'll help you set up the DNS and SSL certificate at no extra cost. Your customers will never see the marhabaDMC brand.",
  },
  {
    question: "What are contracted rates and how do they help me?",
    answer:
      "Contracted rates are special prices we've pre-negotiated with hotels and airlines. You get access to inventory at 5-10% lower than market rates, which means better prices for your customers and higher profit margins for you. This is a major competitive advantage that helps you win more deals.",
  },
  {
    question: "How does the AI Sales Assistant work?",
    answer:
      "The AI Sales Assistant is a multilingual chatbot and voicebot that handles customer inquiries 24/7. It speaks Hindi, English and more, answering questions and helping convert visitors into buyers even when you're asleep. It's billed on consumption basis (per conversation), so you only pay when it's actually helping customers - much cheaper than hiring a sales executive.",
  },
  {
    question: "What APIs are included in the platform?",
    answer:
      "The platform includes Flight API (Aggregators integration), Hotel API (1M+ properties), Visa Processing API (30+ countries), and Activities API (tours & experiences). All APIs are included in the annual subscription with no extra charges.",
  },
];
