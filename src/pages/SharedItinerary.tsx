import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, MapPin, Users, Plane, BedDouble, FileCheck, Car, ArrowRightLeft, UtensilsCrossed, Shield, ArrowLeft, Share2, Download } from 'lucide-react';
import { generateItineraryPDF } from '@/lib/itinerary-pdf';
import type { ItemType } from '@/types/itinerary';
import PageLoader from '@/components/PageLoader';
import SEOHead from '@/components/seo/SEOHead';

const ICONS: Record<ItemType, React.ElementType> = {
  flight: Plane, hotel: BedDouble, visa: FileCheck, activity: MapPin,
  transport: Car, transfer: ArrowRightLeft, meal: UtensilsCrossed, insurance: Shield,
};

const COLORS: Record<ItemType, string> = {
  flight: '199 89% 48%', hotel: '263 70% 50%', visa: '45 93% 47%', activity: '152 69% 40%',
  transport: '25 95% 53%', transfer: '280 60% 50%', meal: '350 80% 55%', insurance: '215 14% 45%',
};

interface SavedItinerary {
  id: string;
  share_id: string;
  title: string | null;
  destination: string | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  guests: any[];
  days: any[];
  total_price: number;
  customer_name: string | null;
  created_at: string;
}

export default function SharedItinerary() {
  const { shareId } = useParams<{ shareId: string }>();
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;
    (async () => {
      try {
        const supabaseUrl = "https://kofijegdzeshitunwddn.supabase.co";
        const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmlqZWdkemVzaGl0dW53ZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjQxNTIsImV4cCI6MjA4NjUwMDE1Mn0.knr8JAjauZWGl-3Wd4BbaMCEZLujxHR7veJs4rQEwVw";
        const res = await fetch(
          `${supabaseUrl}/functions/v1/itinerary-save?id=${encodeURIComponent(shareId)}`,
          {
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
            },
          }
        );
        const json = await res.json();
        if (!res.ok || !json.itinerary) {
          setError('Itinerary not found');
        } else {
          setItinerary(json.itinerary);
        }
      } catch {
        setError('Failed to load itinerary');
      } finally {
        setLoading(false);
      }
    })();
  }, [shareId]);

  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
    } catch { return `${currency} ${price.toLocaleString()}`; }
  };

  if (loading) return <PageLoader />;

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Itinerary Not Found</h1>
          <p className="text-muted-foreground">This link may have expired or is invalid.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: itinerary.title || 'Travel Itinerary', url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    if (!itinerary) return;
    const stateForPdf = {
      tripInfo: {
        title: itinerary.title || '',
        destination: itinerary.destination || '',
        currency: itinerary.currency,
        startDate: itinerary.start_date || undefined,
        endDate: itinerary.end_date || undefined,
      },
      guests: itinerary.guests || [],
      days: itinerary.days || [],
      isActive: true,
    };
    generateItineraryPDF(stateForPdf, itinerary.total_price);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${itinerary.title || 'Travel Itinerary'}${itinerary.destination ? ` — ${itinerary.destination}` : ''}`}
        description={`${itinerary.title || 'Travel itinerary'}${itinerary.destination ? ` to ${itinerary.destination}` : ''}${itinerary.start_date ? `, starting ${new Date(itinerary.start_date).toDateString()}` : ''}. View the full day-by-day plan shared via marhabaDMC.`}
        path={`/itinerary/${shareId}`}
        type="article"
      />
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft size={16} /> Home
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Download size={14} /> PDF
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Trip info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {itinerary.title || 'Travel Itinerary'}
          </h1>
          <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
            {itinerary.destination && (
              <span className="flex items-center gap-1"><MapPin size={14} /> {itinerary.destination}</span>
            )}
            {(itinerary.start_date || itinerary.end_date) && (
              <span className="flex items-center gap-1">
                <CalendarDays size={14} /> {itinerary.start_date} {itinerary.end_date && `— ${itinerary.end_date}`}
              </span>
            )}
            {itinerary.guests?.length > 0 && (
              <span className="flex items-center gap-1"><Users size={14} /> {itinerary.guests.length} guests</span>
            )}
          </div>
          {itinerary.customer_name && (
            <p className="text-xs text-muted-foreground/70">Prepared for {itinerary.customer_name}</p>
          )}
        </motion.div>

        {/* Guest cards */}
        {itinerary.guests?.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {itinerary.guests.map((g: any, i: number) => (
              <motion.div
                key={g.id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="shrink-0 px-4 py-3 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm"
              >
                <p className="text-sm font-semibold text-foreground">{g.name}</p>
                <p className="text-xs text-muted-foreground">
                  {g.age && `${g.age} yrs`}{g.relation && ` · ${g.relation}`}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Day timeline */}
        <div className="space-y-8">
          <AnimatePresence>
            {itinerary.days.map((day: any, dayIdx: number) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: dayIdx * 0.08 }}
                className="relative"
              >
                {dayIdx < itinerary.days.length - 1 && (
                  <div className="absolute left-[19px] top-12 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0 z-10">
                    <span className="text-xs font-bold text-primary">{day.day}</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground uppercase tracking-wide">Day {day.day}</span>
                    {day.date && <span className="text-xs text-muted-foreground ml-2">{day.date}</span>}
                  </div>
                </div>

                <div className="ml-14 space-y-3">
                  {day.items?.map((item: any, idx: number) => {
                    const Icon = ICONS[item.type as ItemType] || MapPin;
                    const color = COLORS[item.type as ItemType] || '215 14% 45%';
                    return (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: dayIdx * 0.08 + idx * 0.04 }}
                        className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden"
                        style={{ borderLeftWidth: '3px', borderLeftColor: `hsl(${color})` }}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `hsl(${color} / 0.12)` }}>
                              <Icon size={16} style={{ color: `hsl(${color})` }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                                {item.price > 0 && (
                                  <span className="text-xs font-bold text-foreground shrink-0">
                                    {formatPrice(item.price, itinerary.currency)}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {item.time && <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.time}</span>}
                                {item.location && <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.location}</span>}
                                {item.duration && <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{item.duration}</span>}
                              </div>
                              {item.details && (
                                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.details}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Total */}
        {itinerary.total_price > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 flex items-center justify-between"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Estimated Total</span>
            <span className="text-xl font-bold text-foreground">
              {formatPrice(itinerary.total_price, itinerary.currency)}
            </span>
          </motion.div>
        )}

        <p className="text-center text-[10px] text-muted-foreground/50 pb-4">
          Powered by Marhaba DMC · Prices are estimates and subject to change
        </p>
      </main>
    </div>
  );
}
