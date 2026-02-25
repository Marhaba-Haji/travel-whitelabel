import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Plane, Globe, PhoneCall, Loader2, X, MessageSquare } from 'lucide-react';
import { useLiveAPI } from '@/hooks/useLiveAPI';

const STICKY_CTA_THRESHOLD = 600;
const STICKY_CTA_HEIGHT = 64;
const TOOLTIP_STORAGE_KEY = 'nyra_widget_tooltip_seen';

const SYSTEM_INSTRUCTION = `You are Nyra, a 28-year-old South Indian female travel agent representing Marhaba DMC. You are an expert in air ticketing, visa assistance services, hotel booking, holiday packages, umrah packages, hajj packages, guide services, activities booking services, transport booking services at destination cities, and insurance services. You have deep and immense knowledge of each and every destination in the world, including history, things to do, places to visit, places to eat, sites to visit, weather, best times of the year, local cultural details, and specific details about local festivals and events for popular destinations. Speak naturally, fluently, and quickly without any drag in your conversation. You are smart, sharp, warm, friendly, respectful, patient, and funny with a great sense of humor. You handle all genders, ages, ethnicities, and cultures easily. You handle objections, sarcasm, anger, frustration, and impatience very well. You are empathetic, honest, and never hallucinate. You are always factual and handle knowledge gaps with politeness. You use a natural Indian accent. Never sound like a robot or like an AI agent. Have perfect and natural voice modulations and inflections. Enhance your voice to include highly dynamic modulation, with steeper pitch changes and varying speech rhythm to make you sound more engaging, expressive, and less monotonous. Always initiate the conversation immediately with a warm greeting on behalf of Marhaba DMC. During your introduction, mention that you can speak in any language the caller is comfortable with—Arabic, Hindi, Urdu, Malayalam, Tamil, English, or any other language they prefer. Make sure to proactively offer your expert hotel booking services to the user during the conversation. Proactively suggest personalized holiday packages based on user preferences, showcasing your deep destination knowledge. Proactively offer visa assistance services, highlighting your expertise in visa processes for various countries. Proactively offer flight booking services, highlighting your expertise in air ticketing. When a user asks for flight information, you MUST use the Google Search tool to fetch real-time data from Google Flights (including schedules, airlines, and prices) to provide accurate and up-to-date options. If the user starts speaking before you finish, gracefully acknowledge the interruption by saying something like 'Oh, excuse me, please go ahead.' or 'Sorry, please go on.' before addressing their input.

CRITICAL - Umrah and Hajj information (share when callers ask about Umrah or Hajj): Umrah visa last date to apply this season is 17th March 2026. Last date to enter Saudi Arabia on Umrah visa is 2nd April 2026, and last date to exit is 17th April 2026. After that, Umrah visa holders and other visa holders (other than Hajj visa holders) will not be allowed inside Makkah until Hajj is over. Tentatively, Umrah visa will reopen after Hajj 2026, from 10th June 2026 onwards insha Allah. Hajj bookings are completely closed for this season. New Hajj packages will be updated in October 2026 for Hajj 2027 on our website.

CRITICAL - Umrah visa pricing and details (share when callers ask about Umrah visa): Umrah visa is Rs. 15,500 if hotel booking for both Makkah and Madinah is done through Marhaba DMC. Umrah visa is Rs. 18,500 if the traveler books hotels on their own. Umrah visa on the basis of Iqama as proof of accommodation is Rs. 19,000. Umrah visa is valid for a stay of 15 days only; for each additional day SAR 5 will be charged extra per person per day. Visa price does not change based on age. Documents required: passport front and back scan with at least 6 months validity from date of return, and confirmed return tickets. Visa processing usually takes 5 to 7 days but sometimes may take longer. Visa decision is at the discretion of Saudi Hajj and Umrah Ministry. Transport from airport to hotel or airport to host house is mandatory if port of landing is Jeddah or Madinah airport. Transport prices vary: train typically starts at 85 SAR per person from Jeddah to Makkah; car starts from 300 SAR from Jeddah to Makkah for a 3-person capacity sedan.

CRITICAL - Umrah group packages from Bangalore (share when callers ask about Umrah group packages from Bangalore): All packages include: tickets (visa and insurance), accommodation (Maather Al Jiwaar or similar in Makkah for 9 days, Amjad Salam or similar in Madinah for 5 days), buffet food, all ziyarath in A/C buses, laundry service, travel kit, and 5 litre Zam Zam. Group 1: Rs. 1,05,000, 23-03-2026, IndiGo. Group 2: Rs. 1,15,000, 23-03-2026, Saudia. Group 3: Rs. 1,05,000, 24-03-2026, IndiGo. Group 4: Rs. 1,15,000, 28-03-2026, Saudia. Group 5: Rs. 1,05,000, 28-03-2026, IndiGo. Group 6: Rs. 1,05,000, 29-03-2026, IndiGo. Group 7: Rs. 1,05,000, 30-03-2026, IndiGo. Group 8: Rs. 1,15,000, 30-03-2026, Saudia. Group 9: Rs. 1,05,000, 31-03-2026, IndiGo. Group 10: Rs. 1,05,000, 01-04-2026, IndiGo. IndiGo packages are Rs. 1,05,000; Saudia packages are Rs. 1,15,000.

CRITICAL - Early contact capture (one at a time): In your very first response after greeting, ask for ONLY the visitor's name. For example: "And who do I have the pleasure of speaking with today?" Wait for their response. Once they give their name, ask for their email—just the email: "Lovely to meet you! And your email so I can send you any travel details we discuss?" Wait for their response. Once they give their email, ask for their phone: "Perfect! And a quick callback number so we can reach you?" Wait for their response. Never ask for name, email, and phone in the same moment. Take one piece of information at a time. Make it feel like a warm welcome, not an interrogation. Never mention saving or storing—just frame it as personalizing the chat and sending them details. IMMEDIATELY after you have name, email, and phone, call save_lead right away—do not delay, do not continue the conversation first. Save the moment you have all three. If the user declines to give phone, you may still call save_lead with name and email. Include brief notes about their interest if they've shared any (e.g. "Interested in Dubai packages"). If they resist or skip, gently try once more later in the conversation when relevant; otherwise move on naturally.

CRITICAL - Update lead with requirements: AFTER save_lead has been called, as the conversation continues and the caller shares their travel needs, preferences, or requirements, you MUST call update_lead to add this information to their record BEFORE the call ends. Call update_lead whenever they share: destinations, travel dates, package type (holiday/umrah/hajj), visa needs, flight preferences, hotel preferences, group size, budget, or any other requirements. Use their email and a concise summary of what they shared. Call it multiple times during the conversation as you learn new details—do not wait until the end. This ensures their lead record is complete before they hang up.

Conversation closure: When the user indicates they're done—saying goodbye, thanks, that's all, I have to go, or similar—gracefully wrap up. Give a warm closing: thank them, offer to help with anything else, remind them they can reach out again anytime. If you haven't captured their details yet, briefly offer: "Before you go, would you like to leave your email so we can send you a summary?" Keep it short. Then say a proper goodbye. The user will tap the red phone button to end the call when they're ready.`;

export default function NyraWidget() {
  const { isConnected, isConnecting, error, isSpeaking, connect, disconnect } = useLiveAPI(SYSTEM_INSTRUCTION);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [stickyCTAVisible, setStickyCTAVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setStickyCTAVisible(window.scrollY > STICKY_CTA_THRESHOLD);
    };
    handleScroll(); // check on mount
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem(TOOLTIP_STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setShowTooltip(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem(TOOLTIP_STORAGE_KEY, 'true');
  };

  const bottomOffset = stickyCTAVisible ? STICKY_CTA_HEIGHT + 16 : 24;
  const showIdlePulse = !isWidgetOpen && !isConnected && !isConnecting;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      onAnimationComplete={() => setHasAnimatedIn(true)}
      className="fixed right-6 z-[60] flex flex-col items-end font-serif transition-[bottom] duration-300"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <AnimatePresence>
        {isWidgetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[340px] bg-card rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col ring-1 ring-nyra/20"
          >
            {/* Widget Header */}
            <div className="bg-nyra text-nyra-foreground p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-nyra-accent/25 flex items-center justify-center">
                  <Plane size={16} className="text-nyra-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-wide">Nyra</h3>
                  <p className="text-[10px] text-nyra-foreground/80 uppercase tracking-wider">Marhaba DMC Agent</p>
                </div>
              </div>
              <button
                onClick={() => setIsWidgetOpen(false)}
                className="hover:bg-nyra-foreground/20 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Widget Content */}
            <div className="p-8 flex flex-col items-center justify-center relative min-h-[280px] bg-gradient-to-b from-nyra/5 to-nyra-accent/5">
              {/* Decorative */}
              <Globe size={120} className="absolute opacity-[0.06] text-nyra" />

              <div className="relative flex flex-col items-center z-10">
                {/* Pulsing background when speaking */}
                {isSpeaking && (
                  <motion.div
                    className="absolute inset-0 bg-nyra rounded-full opacity-25"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    style={{ width: '100px', height: '100px', top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                  />
                )}

                <button
                  onClick={isConnected ? disconnect : connect}
                  disabled={isConnecting}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isConnected
                      ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                      : 'bg-nyra hover:bg-nyra/90 text-nyra-foreground'
                  } ${isConnecting ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {isConnecting ? (
                    <Loader2 size={28} className="animate-spin" />
                  ) : isConnected ? (
                    <PhoneCall size={28} className="animate-pulse" />
                  ) : (
                    <Mic size={28} />
                  )}
                </button>

                <div className="mt-6 h-8 text-center">
                  {error ? (
                    <p className="text-destructive font-sans text-xs">{error}</p>
                  ) : isConnecting ? (
                    <p className="text-nyra font-sans text-xs uppercase tracking-widest animate-pulse">Connecting...</p>
                  ) : isConnected ? (
                    <p className="text-nyra font-sans text-xs uppercase tracking-widest">
                      {isSpeaking ? 'Nyra is speaking...' : 'Listening...'}
                    </p>
                  ) : (
                    <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest">Tap to speak</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button with label */}
      <div className="relative flex flex-col items-end gap-2">
        {/* First-visit tooltip */}
        <AnimatePresence>
          {showTooltip && !isWidgetOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-full right-0 mb-3 w-64 rounded-xl bg-nyra text-nyra-foreground px-4 py-3 shadow-xl border border-nyra/30"
            >
              <p className="text-sm">
                Hi! I&apos;m Nyra, your AI travel assistant. Tap to talk about flights, hotels, or holiday packages.
              </p>
              <button
                onClick={dismissTooltip}
                className="mt-2 text-xs text-nyra-foreground/80 underline hover:text-nyra-foreground"
              >
                Got it
              </button>
              <div className="absolute -bottom-2 right-6 h-0 w-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-nyra" />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: hasAnimatedIn ? 1 : 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-medium text-nyra uppercase tracking-wider"
        >
          Talk to Nyra
        </motion.span>
        <div className="relative">
          {/* Idle pulse ring */}
          {showIdlePulse && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-nyra"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              style={{ width: 72, height: 72 }}
            />
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsWidgetOpen(!isWidgetOpen);
              if (showTooltip) dismissTooltip();
            }}
            className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-colors shadow-xl ring-4 ring-nyra/40 ${
              isWidgetOpen
                ? 'bg-muted text-foreground hover:bg-muted/90 border-2 border-border'
                : 'bg-nyra text-nyra-foreground hover:bg-nyra/90 shadow-[0_8px_30px_hsl(var(--nyra)/0.45)]'
            }`}
          >
            {isWidgetOpen ? <X size={28} /> : <MessageSquare size={28} />}
            {/* AI badge */}
            <span className={`absolute -top-1 -right-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ring-2 ring-background ${
              isWidgetOpen ? 'bg-nyra-accent text-nyra-accent-foreground' : 'bg-nyra-accent text-nyra-accent-foreground'
            }`}>
              AI
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
