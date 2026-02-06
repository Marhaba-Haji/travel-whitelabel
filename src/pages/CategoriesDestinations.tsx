import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { 
  MapPin, 
  Plane, 
  Building2, 
  Heart, 
  Briefcase,
  ArrowRight,
  Globe,
  Mosque,
  Camera,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

interface Destination {
  name: string;
  useCases?: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: typeof MapPin;
  destinations: Destination[];
  color: string;
}

const CategoriesDestinations = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: frameworkRef, isVisible: frameworkVisible } = useScrollAnimation();
  const { ref: religiousRef, isVisible: religiousVisible } = useScrollAnimation();
  const { ref: leisureReligiousRef, isVisible: leisureReligiousVisible } = useScrollAnimation();
  const { ref: leisureRef, isVisible: leisureVisible } = useScrollAnimation();
  const { ref: businessRef, isVisible: businessVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  const categories: Category[] = [
    {
      id: "religious",
      name: "Religious Travel",
      description: "Destinations where travel intent is purely faith-centric, focusing on spiritual journeys, religious obligations, and structured pilgrimage experiences.",
      icon: Mosque,
      color: "from-primary to-primary/70",
      destinations: [
        {
          name: "Saudi Arabia",
          useCases: ["Umrah", "Ziyarat"]
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
        { name: "Saudi Arabia" },
        { name: "Iraq" },
        { name: "Iran" },
        { name: "Palestine" },
        { name: "Jordan" },
        { name: "Egypt" },
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
        { name: "Turkey" },
        { name: "Malaysia" },
        { name: "Indonesia" },
        { name: "Morocco" },
        { name: "Maldives" },
        { name: "Singapore" },
        { name: "Mauritius" },
        { name: "India" },
        { name: "Azerbaijan" },
        { name: "Russia" },
        { name: "Spain" },
        { name: "Georgia" },
        { name: "Vietnam" },
        { name: "Thailand" },
        { name: "Oman" },
        { name: "Qatar" },
        { name: "United Arab Emirates" },
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
        { name: "China" },
        { name: "Japan" },
        { name: "Malaysia" },
        { name: "United Arab Emirates" },
        { name: "Saudi Arabia" },
        { name: "Qatar" },
        { name: "Bahrain" },
        { name: "Oman" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero/Intro Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={heroRef}
              className={`text-center max-w-4xl mx-auto opacity-0 ${heroVisible ? "animate-fade-in" : ""}`}
            >
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                Destination Coverage
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-6">
                Halal Tourism Destinations Organized by Travel Intent
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Nomadore's destination coverage is structured by travel purpose, not just geography. 
                This intent-driven approach helps agents understand where and how they can sell using 
                Nomadore's ecosystem, enabling more effective travel planning and sales conversations.
              </p>
            </div>
          </div>
        </section>

        {/* Category Framework Explanation */}
        <section className="py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/30 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={frameworkRef}
              className={`text-center mb-12 opacity-0 ${frameworkVisible ? "animate-fade-in" : ""}`}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Categorization Framework
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Destinations are organized by travel intent to help you match customer needs with the right offerings.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <Tabs defaultValue="religious" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center gap-2"
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className="sm:hidden">{category.name.split(" ")[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-8">
                    <Card className="border-2 border-border hover:border-primary/30 transition-all">
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                            <category.icon className="h-7 w-7 text-primary-foreground" />
                          </div>
                          <CardTitle className="text-2xl">{category.name}</CardTitle>
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

        {/* Religious Travel Section */}
        <section id="religious-travel" className="py-20 bg-gradient-to-b from-background via-accent/20 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={religiousRef}
              className={`opacity-0 ${religiousVisible ? "animate-fade-in" : ""}`}
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Mosque className="h-8 w-8 text-primary" />
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
                    className="group hover:shadow-xl transition-all duration-300 border-border hover:border-primary/30 opacity-0"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      ...(religiousVisible ? { animation: "fade-in 0.6s ease-out forwards" } : {})
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
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

        {/* Leisure + Religious Section */}
        <section id="leisure-religious" className="py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/30 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={leisureReligiousRef}
              className={`opacity-0 ${leisureReligiousVisible ? "animate-fade-in" : ""}`}
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Heart className="h-8 w-8 text-primary" />
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
                    className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 opacity-0"
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      ...(leisureReligiousVisible ? { animation: "fade-in 0.6s ease-out forwards" } : {})
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{destination.name}</CardTitle>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leisure Travel Section */}
        <section id="leisure" className="py-20 bg-gradient-to-b from-background via-accent/20 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={leisureRef}
              className={`opacity-0 ${leisureVisible ? "animate-fade-in" : ""}`}
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Camera className="h-8 w-8 text-primary" />
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
                    className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 opacity-0"
                    style={{ 
                      animationDelay: `${index * 0.03}s`,
                      ...(leisureVisible ? { animation: "fade-in 0.6s ease-out forwards" } : {})
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-base">{destination.name}</CardTitle>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Business Travel Section */}
        <section id="business" className="py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={businessRef}
              className={`opacity-0 ${businessVisible ? "animate-fade-in" : ""}`}
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
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
                    className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 bg-card/50 opacity-0"
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      ...(businessVisible ? { animation: "fade-in 0.6s ease-out forwards" } : {})
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{destination.name}</CardTitle>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">Typical use cases:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Badge variant="secondary" className="bg-muted text-foreground">
                    Corporate Delegations
                  </Badge>
                  <Badge variant="secondary" className="bg-muted text-foreground">
                    Trade Exhibitions
                  </Badge>
                  <Badge variant="secondary" className="bg-muted text-foreground">
                    Business Conferences
                  </Badge>
                  <Badge variant="secondary" className="bg-muted text-foreground">
                    Corporate Travel
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-background via-accent/20 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div
              ref={ctaRef}
              className={`text-center max-w-3xl mx-auto opacity-0 ${ctaVisible ? "animate-fade-in" : ""}`}
            >
              <div className="bg-card border-2 border-border rounded-2xl p-8 md:p-12 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Globe className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Ready to Access These Destinations?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join Nomadore's partner network to access comprehensive destination coverage, 
                  inventory, and tools to serve your halal-conscious travelers effectively.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="shadow-lg group">
                    <Link to="/signup">
                      Explore Partner Access
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="#contact">
                      Request Coverage Details
                    </a>
                  </Button>
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
