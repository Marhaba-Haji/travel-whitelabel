import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import AnimatedCounter from "@/components/AnimatedCounter";
import { 
  MapPin, 
  Plane, 
  Heart, 
  Briefcase,
  ArrowRight,
  Globe,
  Landmark,
  Camera,
  Users,
  CheckCircle,
  Star,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Flag from "react-world-flags";
import SEOHead from "@/components/seo/SEOHead";
import { breadcrumbSchema, SITE_URL } from "@/lib/seo-schemas";

interface Destination {
  name: string;
  useCases?: string[];
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: typeof MapPin;
  destinations: Destination[];
  color: string;
}

// Country name to ISO 3166-1 alpha-2 code mapping
const countryCodes: Record<string, string> = {
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

// Helper function to get country ISO code
const getCountryCode = (countryName: string): string => {
  return countryCodes[countryName] || "UN";
};

const CategoriesDestinations = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: frameworkRef, isVisible: frameworkVisible } = useScrollAnimation();
  const { ref: religiousRef, isVisible: religiousVisible } = useScrollAnimation();
  const { ref: leisureReligiousRef, isVisible: leisureReligiousVisible } = useScrollAnimation();
  const { ref: leisureRef, isVisible: leisureVisible } = useScrollAnimation();
  const { ref: businessRef, isVisible: businessVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  const [activeCategoryTab, setActiveCategoryTab] = useState("religious");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const categories: Category[] = [
    {
      id: "religious",
      name: "Religious Travel",
      description: "Destinations where travel intent is purely faith-centric, focusing on spiritual journeys, religious obligations, and structured pilgrimage experiences.",
      icon: Landmark,
      color: "from-primary to-primary/70",
      destinations: [
        {
          name: "Saudi Arabia",
          useCases: ["Umrah", "Hajj", "Ziyarat"],
          featured: true
        }
      ]
    },
    {
      id: "leisure-religious",
      name: "Leisure + Religious Travel",
      description: "Destinations that blend spiritual significance with cultural heritage and leisure experiences, offering balanced itineraries for faith-conscious travelers.",
      icon: Heart,
      color: "from-primary/90 to-primary/60",
      destinations: [
        { name: "Saudi Arabia", featured: true },
        { name: "Iraq" },
        { name: "Iran" },
        { name: "Palestine" },
        { name: "Jordan" },
        { name: "Egypt", featured: true },
        { name: "Uzbekistan" },
        { name: "Afghanistan" }
      ]
    },
    {
      id: "leisure",
      name: "Leisure Travel",
      description: "Global destinations curated with halal-friendly considerations, offering experience-led travel aligned with halal expectations and cultural sensitivity.",
      icon: Camera,
      color: "from-primary/80 to-primary/50",
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
      ]
    },
    {
      id: "business",
      name: "Business Travel",
      description: "Professional and commercial travel destinations with halal-aligned accommodations and services, supporting corporate delegations, exhibitions, and business meetings.",
      icon: Briefcase,
      color: "from-primary/70 to-primary/40",
      destinations: [
        { name: "China", featured: true },
        { name: "Japan", featured: true },
        { name: "Malaysia" },
        { name: "United Arab Emirates", featured: true },
        { name: "Saudi Arabia", featured: true },
        { name: "Qatar", featured: true },
        { name: "Bahrain" },
        { name: "Oman" }
      ]
    }
  ];

  // Calculate total destinations (removing duplicates)
  const allDestinations = new Set<string>();
  categories.forEach(cat => {
    cat.destinations.forEach(dest => allDestinations.add(dest.name));
  });
  const totalDestinations = allDestinations.size;
  const totalCountries = allDestinations.size;

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Travel Categories & Destinations — Halal-Friendly Worldwide"
        description="Explore curated halal-friendly destinations and travel categories — leisure, religious, adventure, and luxury — across 60+ countries with marhabaDMC."
        path="/categories-destinations"
        keywords={["halal travel destinations", "travel categories", "halal tourism", "religious travel", "leisure destinations"]}
      />
      <Header />
      <main>
        {/* Enhanced Hero/Intro Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden bg-white">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#2D9BFC]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-0 w-96 h-96 bg-[#412A86]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={heroRef}
              className={`text-center max-w-4xl mx-auto opacity-0 ${heroVisible ? "animate-fade-in" : ""}`}
            >
              <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-600 font-bold tracking-wide text-xs px-4 py-1.5 rounded-full mb-4 uppercase">
                <Sparkles className="h-3 w-3" />
                Destination Coverage
              </span>
              
              <h1 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 mb-6 leading-tight">
                <span className="text-[#B968C7]">Halal Tourism</span> Destinations Organized by <span className="text-[#B968C7]">Travel Intent</span>
              </h1>
              
              <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
                marhabaDMC's destination coverage is structured by travel purpose, not just geography. 
                This intent-driven approach helps agents understand where and how they can sell using 
                marhabaDMC's ecosystem, enabling more effective travel planning and sales conversations.
              </p>

              {/* Quick Stats Row */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                  <Globe className="w-4 h-4 text-[#412A86]" />
                  <span className="text-sm font-medium text-gray-700">
                    <AnimatedCounter end={200} suffix="+" className="text-[#412A86] font-bold" /> Destinations
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                  <MapPin className="w-4 h-4 text-[#412A86]" />
                  <span className="text-sm font-medium text-gray-700">
                    <AnimatedCounter end={30} suffix="+" className="text-[#412A86] font-bold" /> Countries
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                  <Star className="w-4 h-4 text-[#B968C7] fill-[#B968C7]" />
                  <span className="text-sm font-medium text-gray-700">
                    <span className="text-[#B968C7] font-bold">4</span> Categories
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                  <CheckCircle className="w-4 h-4 text-[#412A86]" />
                  <span className="text-sm font-medium text-gray-700">Global Coverage</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Category Framework Explanation */}
        <section className="py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/30 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={frameworkRef}
              className={`text-center mb-12 opacity-0 ${frameworkVisible ? "animate-fade-in" : ""}`}
            >
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                Our Framework
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Categorization by Travel Intent
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Destinations are organized by travel intent to help you match customer needs with the right offerings.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <Tabs value={activeCategoryTab} onValueChange={setActiveCategoryTab} className="w-full">
                <TabsList className="h-auto min-h-12 grid w-full grid-cols-2 lg:grid-cols-4 mb-8 bg-muted/50 p-1.5 rounded-lg">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center justify-center gap-2 min-h-10 min-w-0 py-2.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all group"
                    >
                      <category.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className="sm:hidden">{category.name.split(" ")[0]}</span>
                      <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary border-primary/20 text-xs">
                        {category.destinations.length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-8">
                    <Card className="border-2 border-border hover:border-primary/30 transition-all group overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <category.icon className="h-8 w-8 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-2xl mb-1">{category.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                {category.destinations.length} {category.destinations.length === 1 ? "Destination" : "Destinations"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-base text-muted-foreground leading-relaxed">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </section>

        {/* Enhanced Religious Travel Section */}
        <section id="religious-travel" className="py-20 bg-gradient-to-b from-background via-accent/20 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-pink/5 via-transparent to-transparent" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={religiousRef}
              className={`opacity-0 ${religiousVisible ? "animate-fade-in" : ""}`}
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                    <Landmark className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Religious Travel Destinations
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Faith-centric journeys focusing on spiritual fulfillment, religious obligations, 
                  and structured pilgrimage experiences with emphasis on compliance and discipline.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {categories[0].destinations.map((destination, index) => (
                  <Card
                    key={destination.name}
                    className="group hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 border-border hover:border-primary/50 opacity-0 relative overflow-hidden"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      ...(religiousVisible ? { animation: "fade-in 0.6s ease-out forwards" } : {})
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {destination.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-aurora-pink/10 text-aurora-pink border-aurora-pink/20">
                          <Star className="h-3 w-3 mr-1 fill-aurora-pink" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Flag
                          code={getCountryCode(destination.name)}
                          className="w-7 h-5 rounded-sm shadow-sm group-hover:scale-110 transition-transform duration-300 border border-border/20"
                          style={{ objectFit: "cover" }}
                          aria-label={`${destination.name} flag`}
                        />
                        <CardTitle className="text-xl">{destination.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {destination.useCases && destination.useCases.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Use Cases:</p>
                          <div className="flex flex-wrap gap-2">
                            {destination.useCases.map((useCase) => (
                              <Badge key={useCase} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                {useCase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Leisure + Religious Section */}
        <section id="leisure-religious" className="py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/30 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={leisureReligiousRef}
              className={`opacity-0 ${leisureReligiousVisible ? "animate-fade-in" : ""}`}
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/90 to-primary/60 flex items-center justify-center shadow-lg">
                    <Heart className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Leisure + Religious Destinations
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Destinations offering balanced itineraries that combine spiritual significance 
                  with cultural heritage and leisure experiences, perfect for travelers seeking 
                  both faith and cultural enrichment.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories[1].destinations.map((destination, index) => (
                  <Card
                    key={destination.name}
                    className="group hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 border-border hover:border-primary/50 opacity-0 relative overflow-hidden"
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      ...(leisureReligiousVisible ? { animation: "fade-in 0.6s ease-out forwards" } : {})
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {destination.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-aurora-pink/10 text-aurora-pink border-aurora-pink/20">
                          <Star className="h-3 w-3 mr-1 fill-aurora-pink" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Flag
                          code={getCountryCode(destination.name)}
                          className="w-6 h-4 rounded-sm shadow-sm group-hover:scale-110 transition-transform duration-300 border border-border/20"
                          style={{ objectFit: "cover" }}
                          aria-label={`${destination.name} flag`}
                        />
                        <CardTitle className="text-lg">{destination.name}</CardTitle>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Leisure Travel Section */}
        <section id="leisure" className="py-20 bg-gradient-to-b from-background via-accent/20 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={leisureRef}
              className={`opacity-0 ${leisureVisible ? "animate-fade-in" : ""}`}
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary/50 flex items-center justify-center shadow-lg">
                    <Camera className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Leisure Travel Destinations
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Global destinations curated with halal-friendly considerations, offering 
                  experience-led travel aligned with halal expectations for families, groups, 
                  and premium travelers.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories[2].destinations.map((destination, index) => (
                  <Card
                    key={destination.name}
                    className="group hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 border-border hover:border-primary/50 opacity-0 relative overflow-hidden"
                    style={{ 
                      animationDelay: `${index * 0.03}s`,
                      ...(leisureVisible ? { animation: "fade-in 0.6s ease-out forwards" } : {})
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {destination.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-aurora-pink/10 text-aurora-pink border-aurora-pink/20">
                          <Star className="h-3 w-3 mr-1 fill-aurora-pink" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <Flag
                          code={getCountryCode(destination.name)}
                          className="w-6 h-4 rounded-sm shadow-sm group-hover:scale-110 transition-transform duration-300 border border-border/20"
                          style={{ objectFit: "cover" }}
                          aria-label={`${destination.name} flag`}
                        />
                        <CardTitle className="text-base">{destination.name}</CardTitle>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Business Travel Section */}
        <section id="business" className="py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={businessRef}
              className={`opacity-0 ${businessVisible ? "animate-fade-in" : ""}`}
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/70 to-primary/40 flex items-center justify-center shadow-lg">
                    <Briefcase className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Business Travel Destinations
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Professional and commercial travel destinations with halal-aligned accommodations 
                  and services, supporting corporate delegations, exhibitions, conferences, and 
                  business meetings.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {categories[3].destinations.map((destination, index) => (
                  <Card
                    key={destination.name}
                    className="group hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 border-border hover:border-primary/50 bg-card/50 opacity-0 relative overflow-hidden"
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      ...(businessVisible ? { animation: "fade-in 0.6s ease-out forwards" } : {})
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {destination.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-aurora-pink/10 text-aurora-pink border-aurora-pink/20">
                          <Star className="h-3 w-3 mr-1 fill-aurora-pink" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Flag
                          code={getCountryCode(destination.name)}
                          className="w-6 h-4 rounded-sm shadow-sm group-hover:scale-110 transition-transform duration-300 border border-border/20"
                          style={{ objectFit: "cover" }}
                          aria-label={`${destination.name} flag`}
                        />
                        <CardTitle className="text-lg">{destination.name}</CardTitle>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4 font-medium">Typical use cases:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["Corporate Delegations", "Trade Exhibitions", "Business Conferences", "Corporate Travel"].map((useCase) => (
                    <Badge key={useCase} variant="secondary" className="bg-muted text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 bg-gradient-to-b from-background via-accent/20 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={ctaRef}
              className={`text-center max-w-3xl mx-auto opacity-0 ${ctaVisible ? "animate-fade-in" : ""}`}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-aurora-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-10 w-10 text-primary-foreground" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Ready to Access These{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-aurora-pink">
                      Destinations?
                    </span>
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Join marhabaDMC's partner network to access comprehensive destination coverage, 
                    inventory, and tools to serve your halal-conscious travelers effectively.
                  </p>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Join <span className="font-semibold text-foreground">500+</span> Agents</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Trusted Platform</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-aurora-pink fill-aurora-pink" />
                      <span>6 Days Support</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild className="shadow-lg group/btn hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                      <Link to="/signup">
                        Explore Partner Access
                        <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="hover:bg-primary/10 hover:border-primary/50 transition-all">
                      <Link to="/contact">
                        Request Coverage Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesDestinations;
