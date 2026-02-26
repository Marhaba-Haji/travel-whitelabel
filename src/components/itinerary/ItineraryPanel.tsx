import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { useItinerary } from '@/contexts/ItineraryContext';
import TripHeader from './TripHeader';
import GuestCards from './GuestCards';
import DayTimeline from './DayTimeline';
import { Save, Share2, Check, Loader2, Link as LinkIcon, Download } from 'lucide-react';
import { generateItineraryPDF } from '@/lib/itinerary-pdf';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ItineraryPanel() {
  const { state, totalPrice } = useItinerary();
  const [saving, setSaving] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = useCallback(async () => {
    if (state.days.length === 0) {
      toast.error('Nothing to save yet');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('itinerary-save', {
        method: 'POST',
        body: {
          title: state.tripInfo?.title || null,
          destination: state.tripInfo?.destination || null,
          currency: state.tripInfo?.currency || 'INR',
          startDate: state.tripInfo?.startDate || null,
          endDate: state.tripInfo?.endDate || null,
          guests: state.guests,
          days: state.days,
          totalPrice,
          shareId: shareId || undefined,
        },
      });

      if (error || !data?.shareId) {
        toast.error('Failed to save itinerary');
        return;
      }

      setShareId(data.shareId);
      setJustSaved(true);
      toast.success(shareId ? 'Itinerary updated!' : 'Itinerary saved!');
      setTimeout(() => setJustSaved(false), 2000);
    } catch {
      toast.error('Failed to save itinerary');
    } finally {
      setSaving(false);
    }
  }, [state, totalPrice, shareId]);

  const handleShare = useCallback(async () => {
    if (!shareId) {
      // Save first, then share
      await handleSave();
      return;
    }
    const url = `${window.location.origin}/itinerary/${shareId}`;
    if (navigator.share) {
      await navigator.share({ title: state.tripInfo?.title || 'Travel Itinerary', url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  }, [shareId, state.tripInfo?.title, handleSave]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-background/95 backdrop-blur-md"
    >
      <TripHeader />
      <GuestCards />
      <DayTimeline />

      {/* Footer with total + save/share */}
      {state.days.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 py-3 border-t border-border/50 bg-muted/30 backdrop-blur-sm space-y-2"
        >
          {totalPrice > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Total</span>
              <motion.span
                key={totalPrice}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-base font-bold text-foreground"
              >
                {(() => {
                  const cur = state.tripInfo?.currency || 'INR';
                  try { return new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(totalPrice); }
                  catch { return `${cur} ${totalPrice.toLocaleString()}`; }
                })()}
              </motion.span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : justSaved ? <Check size={12} /> : <Save size={12} />}
              {saving ? 'Saving...' : justSaved ? 'Saved!' : shareId ? 'Update' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {shareId ? <LinkIcon size={12} /> : <Share2 size={12} />}
              {shareId ? 'Copy Link' : 'Save & Share'}
            </button>
            <button
              onClick={() => generateItineraryPDF(state, totalPrice)}
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Download PDF"
            >
              <Download size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
