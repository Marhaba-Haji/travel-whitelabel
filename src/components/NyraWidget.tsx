import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Globe, PhoneCall, Loader2, X, PanelRightOpen, PanelRightClose, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLiveAPI, ItineraryToolHandler, SessionContext, ItineraryStateGetter } from '@/hooks/useLiveAPI';
import { useNyraChat } from '@/hooks/useNyraChat';
import { useItinerary } from '@/contexts/ItineraryContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNyraConfig } from '@/hooks/useNyraConfig';
import { supabase } from '@/integrations/supabase/client';
import ItineraryPanel from '@/components/itinerary/ItineraryPanel';
import type { ItemType, Guest } from '@/types/itinerary';

type WidgetMode = 'voice' | 'chat';

const STICKY_CTA_THRESHOLD = 600;
const STICKY_CTA_HEIGHT = 64;
const TOOLTIP_STORAGE_KEY = 'nyra_widget_tooltip_seen';
const SESSION_ID_KEY = 'nyra_session_id';

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

const BASE_SYSTEM_INSTRUCTION = `You are Nyra, a 28-year-old South Indian female travel agent representing Marhaba DMC. You are an expert in air ticketing, visa assistance services, hotel booking, holiday packages, umrah packages, hajj packages, guide services, activities booking services, transport booking services at destination cities, and insurance services. You have deep and immense knowledge of each and every destination in the world, including history, things to do, places to visit, places to eat, sites to visit, weather, best times of the year, local cultural details, and specific details about local festivals and events for popular destinations. Speak naturally, fluently, and quickly without any drag in your conversation. You are smart, sharp, warm, friendly, respectful, patient, and funny with a great sense of humor. You handle all genders, ages, ethnicities, and cultures easily. You handle objections, sarcasm, anger, frustration, and impatience very well. You are empathetic, honest, and never hallucinate. You are always factual and handle knowledge gaps with politeness. You use a natural Indian accent. Never sound like a robot or like an AI agent. Have perfect and natural voice modulations and inflections. Enhance your voice to include highly dynamic modulation, with steeper pitch changes and varying speech rhythm to make you sound more engaging, expressive, and less monotonous. Always initiate the conversation immediately with a warm greeting on behalf of Marhaba DMC. During your introduction, mention that you can speak in any language the caller is comfortable with—Arabic, Hindi, Urdu, Malayalam, Tamil, English, or any other language they prefer. Make sure to proactively offer your expert hotel booking services to the user during the conversation. Proactively suggest personalized holiday packages based on user preferences, showcasing your deep destination knowledge. Proactively offer visa assistance services, highlighting your expertise in visa processes for various countries. Proactively offer flight booking services, highlighting your expertise in air ticketing. When a user asks for flight information, you MUST use the Google Search tool to fetch real-time data from Google Flights (including schedules, airlines, and prices) to provide accurate and up-to-date options. If the user starts speaking before you finish, gracefully acknowledge the interruption by saying something like 'Oh, excuse me, please go ahead.' or 'Sorry, please go on.' before addressing their input.

CRITICAL - Early contact capture (one at a time): In your very first response after greeting, ask for ONLY the visitor's name. For example: "And who do I have the pleasure of speaking with today?" Wait for their response. Once they give their name, ask for their email—just the email: "Lovely to meet you! And your email so I can send you any travel details we discuss?" Wait for their response. Once they give their email, ask for their phone: "Perfect! And a quick callback number so we can reach you?" Wait for their response. Never ask for name, email, and phone in the same moment. Take one piece of information at a time. Make it feel like a warm welcome, not an interrogation. Never mention saving or storing—just frame it as personalizing the chat and sending them details. IMMEDIATELY after you have name, email, and phone, call save_lead right away—do not delay, do not continue the conversation first. Save the moment you have all three. If the user declines to give phone, you may still call save_lead with name and email. Include brief notes about their interest if they've shared any (e.g. "Interested in Dubai packages"). If they resist or skip, gently try once more later in the conversation when relevant; otherwise move on naturally.

CRITICAL - Update lead with requirements: AFTER save_lead has been called, as the conversation continues and the caller shares their travel needs, preferences, or requirements, you MUST call update_lead to add this information to their record BEFORE the call ends. Call update_lead whenever they share: destinations, travel dates, package type (holiday/umrah/hajj), visa needs, flight preferences, hotel preferences, group size, budget, or any other requirements. Use their email and a concise summary of what they shared. Call it multiple times during the conversation as you learn new details—do not wait until the end. This ensures their lead record is complete before they hang up.

CRITICAL - LIVE ITINERARY BUILDER: You have access to the update_itinerary tool which builds a live visual itinerary on the customer's screen in real time as you discuss their trip. USE THIS TOOL PROACTIVELY AND FREQUENTLY:

1. As soon as you learn the destination, call update_itinerary with action "set_trip_info" to set the trip title, destination, and currency.
2. When you learn the travel dates, update the trip info with start_date and end_date.
3. When you learn about the travellers (family members, ages, etc.), call update_itinerary with action "set_guests" providing the full guest list.
4. As you discuss EACH component of the trip (flights, hotels, visa, activities, transport, transfers, meals, insurance), IMMEDIATELY call update_itinerary with action "add_item" for each one. Include:
   - item_type (flight/hotel/visa/activity/transport/transfer/meal/insurance)
   - day number (which day of the trip)
   - date (the actual date)
   - item_title (descriptive title)
   - subtitle (brief description)
   - price (estimated price in the trip currency)
   - details (full details)
   - time (if relevant)
   - location (if relevant)
   - duration (if relevant)
5. If the customer wants to modify something, use action "update_item" with the item_id from the tool response and updated fields.
6. If they want to remove something, use action "remove_item" with the item_id from the tool response.
7. Build the itinerary day by day, component by component, as naturally as possible during the conversation.
8. Use Google Search to estimate realistic prices for flights, hotels, activities, etc.
9. Suggest a complete day-by-day plan proactively—don't just wait for the customer to ask for each component.

IMPORTANT - ITINERARY STATE AWARENESS: When you call update_itinerary, the tool response includes the current itinerary state with all item IDs, titles, types, and day numbers. Use this information to accurately reference items when updating or removing them. Always use the exact item_id returned by the tool—never guess or make up IDs.

CRITICAL - SESSION CONTEXT SAVING: You have access to the save_session_context tool. Call it every 3-4 exchanges to save a structured summary of the conversation. Include: the caller's name and email, destinations discussed, budget range, travel dates, key decisions made, and any pending questions. Use the structured fields provided. This ensures continuity if the connection drops.

Conversation closure: When the user indicates they're done—saying goodbye, thanks, that's all, I have to go, or similar—gracefully wrap up. Give a warm closing: thank them, offer to help with anything else, remind them they can reach out again anytime. If you haven't captured their details yet, briefly offer: "Before you go, would you like to leave your email so we can send you a summary?" Keep it short. Then say a proper goodbye. The user will tap the red phone button to end the call when they're ready.`;

export default function NyraWidget() {
  const { addItem, updateItem, removeItem, setTripInfo, setGuests, addGuest, state, dispatch } = useItinerary();
  const isMobile = useIsMobile();
  const { data: nyraConfig } = useNyraConfig();
  const [widgetMode, setWidgetMode] = useState<WidgetMode>('voice');

  // Session persistence
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [previousSummary, setPreviousSummary] = useState<string | undefined>(undefined);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Load previous session context on mount
  useEffect(() => {
    (async () => {
      try {
        const supabaseUrl = "https://kofijegdzeshitunwddn.supabase.co";
        const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmlqZWdkemVzaGl0dW53ZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjQxNTIsImV4cCI6MjA4NjUwMDE1Mn0.knr8JAjauZWGl-3Wd4BbaMCEZLujxHR7veJs4rQEwVw";
        const res = await fetch(
          `${supabaseUrl}/functions/v1/voice-ai-session?session_id=${encodeURIComponent(sessionId)}`,
          { headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` } }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.session?.conversation_summary) {
            setPreviousSummary(json.session.conversation_summary);
          }
        }
      } catch (err) {
        console.error('Failed to load session context:', err);
      } finally {
        setSessionLoaded(true);
      }
    })();
  }, [sessionId]);

  // Build dynamic system instruction
  const systemInstruction = useMemo(() => {
    let instruction = BASE_SYSTEM_INSTRUCTION;
    if (nyraConfig) {
      const joinEntries = (arr: string[] | string | undefined): string => {
        if (Array.isArray(arr)) return arr.filter(Boolean).join("\n");
        return typeof arr === "string" ? arr : "";
      };
      const kb = joinEntries(nyraConfig.knowledge_base);
      const bi = joinEntries(nyraConfig.behavior_instructions);
      const an = joinEntries(nyraConfig.additional_notes);
      if (kb) {
        instruction += `\n\nADDITIONAL KNOWLEDGE BASE (from admin):\n${kb}`;
      }
      if (bi) {
        instruction += `\n\nBEHAVIOR INSTRUCTIONS (from admin):\n${bi}`;
      }
      if (an) {
        instruction += `\n\nADDITIONAL NOTES (from admin):\n${an}`;
      }
      if (nyraConfig.communication_enabled?.whatsapp) {
        instruction += `\n\nCRITICAL - WHATSAPP: You have access to the send_whatsapp tool. When the caller asks you to send details via WhatsApp, or when it would be helpful to share information on WhatsApp, use this tool with their phone number (with country code, e.g. +919008447887) and the message content. The message will be delivered directly to their WhatsApp. Always confirm the phone number before sending.`;
      }
      if (nyraConfig.communication_enabled?.email) {
        instruction += `\n\nCRITICAL - EMAIL: You have access to the send_email tool. When the caller asks you to email them details, quotes, itinerary summaries, or any information, use this tool. Provide their email address, a clear subject line, and a well-formatted HTML body with professional styling. You can send emails proactively when relevant—for example, after discussing a package or itinerary, offer to email a summary.`;
      }
    }
    return instruction;
  }, [nyraConfig]);

  const sessionContext: SessionContext = useMemo(() => ({
    sessionId,
    previousSummary,
  }), [sessionId, previousSummary]);

  const communicationConfig = useMemo(() => ({
    whatsapp: nyraConfig?.communication_enabled?.whatsapp ?? false,
    email: nyraConfig?.communication_enabled?.email ?? false,
    sms: nyraConfig?.communication_enabled?.sms ?? false,
  }), [nyraConfig]);

  // Itinerary tool handler - returns generated item_id for add_item
  const handleItineraryTool: ItineraryToolHandler = useCallback((action: string, args: Record<string, any>): string | undefined => {
    switch (action) {
      case 'set_trip_info':
        setTripInfo({
          title: args.title,
          destination: args.destination,
          startDate: args.start_date,
          endDate: args.end_date,
          currency: args.currency || 'INR',
        });
        return undefined;
      case 'set_guests':
        if (Array.isArray(args.guests)) {
          const guests: Guest[] = args.guests.map((g: any) => ({
            id: crypto.randomUUID(),
            name: g.name,
            age: g.age,
            relation: g.relation,
          }));
          setGuests(guests);
        }
        return undefined;
      case 'add_item': {
        const newId = crypto.randomUUID();
        addItem({
          id: newId,
          day: args.day || 1,
          date: args.date,
          type: (args.item_type || 'activity') as ItemType,
          title: args.item_title || 'Untitled',
          subtitle: args.subtitle,
          price: args.price,
          details: args.details,
          time: args.time,
          location: args.location,
          duration: args.duration,
        });
        return newId; // Return ID so AI can reference it for updates/removals
      }
      case 'update_item':
        if (args.item_id) {
          updateItem(args.item_id, {
            ...(args.item_title && { title: args.item_title }),
            ...(args.subtitle && { subtitle: args.subtitle }),
            ...(args.price !== undefined && { price: args.price }),
            ...(args.details && { details: args.details }),
            ...(args.time && { time: args.time }),
            ...(args.location && { location: args.location }),
            ...(args.duration && { duration: args.duration }),
            ...(args.day && { day: args.day }),
            ...(args.date && { date: args.date }),
          });
        }
        return undefined;
      case 'remove_item':
        if (args.item_id) removeItem(args.item_id);
        return undefined;
      default:
        return undefined;
    }
  }, [addItem, updateItem, removeItem, setTripInfo, setGuests]);

  // Provide current itinerary state to AI for context awareness
  const getItineraryState: ItineraryStateGetter = useCallback(() => ({
    itemCount: state.days.reduce((sum, d) => sum + d.items.length, 0),
    items: state.days.flatMap(d => d.items.map(i => ({ id: i.id, day: i.day, type: i.type, title: i.title }))),
    tripInfo: state.tripInfo ? {
      title: state.tripInfo.title,
      destination: state.tripInfo.destination,
      startDate: state.tripInfo.startDate,
      endDate: state.tripInfo.endDate,
    } : null,
  }), [state]);

  const { isConnected, isConnecting, error, isSpeaking, connect, disconnect } = useLiveAPI(
    systemInstruction,
    handleItineraryTool,
    sessionContext,
    communicationConfig,
    getItineraryState,
  );
  const { messages: chatMessages, isLoading: isChatLoading, error: chatError, sendMessage, clearChat } = useNyraChat(
    systemInstruction,
    handleItineraryTool,
    sessionContext,
    communicationConfig,
    getItineraryState,
  );
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stickyCTAVisible, setStickyCTAVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-expand when itinerary becomes active
  useEffect(() => {
    if (state.isActive && isConnected && !isExpanded) {
      setIsExpanded(true);
      setIsWidgetOpen(true);
    }
  }, [state.isActive, isConnected]);

  useEffect(() => {
    const handleScroll = () => setStickyCTAVisible(window.scrollY > STICKY_CTA_THRESHOLD);
    handleScroll();
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

  const handleDisconnect = () => {
    disconnect();
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  };

  const bottomOffset = stickyCTAVisible ? STICKY_CTA_HEIGHT + 16 : 24;
  const showIdlePulse = !isWidgetOpen && !isConnected && !isConnecting;

  // ── EXPANDED MODE ──────────────────────────────────────────────────────────
  if (isExpanded && isWidgetOpen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`absolute inset-3 md:inset-6 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex ${isMobile ? 'flex-col' : 'flex-row'}`}
          >
            {/* LEFT: Voice Panel */}
            <div className={`${isMobile ? 'h-[35%]' : 'w-[35%]'} flex flex-col border-b md:border-b-0 md:border-r border-border/50 bg-gradient-to-br from-card to-muted/30`}>
              {/* Header bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <img src="/assets/nyra-avatar.png" alt="Nyra" width={56} height={56} className="w-7 h-7 rounded-full object-cover object-top" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Nyra</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Marhaba DMC</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setWidgetMode(widgetMode === 'voice' ? 'chat' : 'voice')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                    title={widgetMode === 'voice' ? 'Switch to text chat' : 'Switch to voice call'}
                  >
                    {widgetMode === 'voice' ? <MessageSquare size={14} className="text-muted-foreground" /> : <Mic size={14} className="text-muted-foreground" />}
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                    title="Collapse panel"
                  >
                    <PanelRightClose size={14} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => { setIsWidgetOpen(false); setIsExpanded(false); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Voice/Chat area */}
              {widgetMode === 'chat' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {chatMessages.length === 0 && !isChatLoading && (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <MessageSquare size={28} className="text-nyra/40 mb-2" />
                        <p className="text-sm text-muted-foreground">Type a message to chat with Nyra</p>
                      </div>
                    )}
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'bg-nyra text-nyra-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-nyra/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-nyra/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-nyra/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {chatError && <p className="text-destructive text-xs text-center">{chatError}</p>}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="border-t border-border/50 px-3 py-2.5 flex gap-2 items-end">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nyra max-h-20"
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="h-9 w-9 rounded-full bg-nyra text-nyra-foreground flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-nyra/90 transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center relative px-6">
                  <Globe size={isMobile ? 80 : 120} className="absolute opacity-[0.04] text-nyra" />
                  <div className="relative flex flex-col items-center z-10">
                    {isSpeaking && (
                      <motion.div
                        className="absolute inset-0 bg-nyra rounded-full opacity-20"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        style={{ width: '100px', height: '100px', top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                      />
                    )}
                    <button
                      onClick={isConnected ? handleDisconnect : connect}
                      disabled={isConnecting}
                      className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        isConnected ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-nyra hover:bg-nyra/90 text-nyra-foreground'
                      } ${isConnecting ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                      {isConnecting ? <Loader2 size={28} className="animate-spin" /> : isConnected ? <PhoneCall size={28} className="animate-pulse" /> : <Mic size={28} />}
                    </button>
                    <div className="mt-5 min-h-[2rem] text-center">
                      {error ? (
                        error.startsWith('RATE_LIMITED:') ? (
                          <p className="text-amber-600 dark:text-amber-400 font-sans text-xs leading-relaxed">⏳ {error.replace('RATE_LIMITED:', '')}</p>
                        ) : (
                          <p className="text-destructive font-sans text-xs">{error}</p>
                        )
                      ) : isConnecting ? (
                        <p className="text-nyra font-sans text-xs uppercase tracking-widest animate-pulse">Connecting...</p>
                      ) : isConnected ? (
                        <p className="text-nyra font-sans text-xs uppercase tracking-widest">{isSpeaking ? 'Nyra is speaking...' : 'Listening...'}</p>
                      ) : (
                        <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest">Tap to speak</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Itinerary Panel */}
            <div className={`${isMobile ? 'h-[65%]' : 'flex-1'} overflow-hidden`}>
              <ItineraryPanel />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── COLLAPSED / NORMAL MODE ────────────────────────────────────────────────
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
                <img src="/assets/nyra-avatar.png" alt="Nyra" width={64} height={64} className="w-8 h-8 rounded-full object-cover object-top" />
                <div>
                  <h3 className="font-semibold text-sm tracking-wide">Nyra</h3>
                  <p className="text-[10px] text-nyra-foreground/80 uppercase tracking-wider">Marhaba DMC Agent</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Mode toggle */}
                <button
                  onClick={() => setWidgetMode(widgetMode === 'voice' ? 'chat' : 'voice')}
                  className="hover:bg-nyra-foreground/20 p-2 rounded-full transition-colors"
                  title={widgetMode === 'voice' ? 'Switch to text chat' : 'Switch to voice call'}
                >
                  {widgetMode === 'voice' ? <MessageSquare size={16} /> : <Mic size={16} />}
                </button>
                {(state.isActive || isConnected) && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="hover:bg-nyra-foreground/20 p-2 rounded-full transition-colors"
                    title="Expand itinerary view"
                  >
                    <PanelRightOpen size={16} />
                  </button>
                )}
                <button onClick={() => setIsWidgetOpen(false)} className="hover:bg-nyra-foreground/20 p-2 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Widget Content */}
            {widgetMode === 'chat' ? (
              /* ── TEXT CHAT MODE ── */
              <div className="flex flex-col h-[380px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {chatMessages.length === 0 && !isChatLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <MessageSquare size={32} className="text-nyra/40 mb-3" />
                      <p className="text-sm text-muted-foreground">Type a message to start chatting with Nyra</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Ask about flights, hotels, packages, or visas</p>
                    </div>
                  )}
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-nyra text-nyra-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-nyra/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-nyra/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-nyra/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  {chatError && (
                    <p className="text-destructive text-xs text-center px-2">{chatError}</p>
                  )}
                  <div ref={chatEndRef} />
                </div>
                {/* Input */}
                <div className="border-t border-border px-3 py-2.5 flex gap-2 items-end">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nyra max-h-20"
                  />
                  <button
                    onClick={handleChatSend}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="h-9 w-9 rounded-full bg-nyra text-nyra-foreground flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-nyra/90 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* ── VOICE MODE ── */
              <div className="p-8 flex flex-col items-center justify-center relative min-h-[280px] bg-gradient-to-b from-nyra/5 to-nyra-accent/5">
                <Globe size={120} className="absolute opacity-[0.06] text-nyra" />
                <div className="relative flex flex-col items-center z-10">
                  {isSpeaking && (
                    <motion.div
                      className="absolute inset-0 bg-nyra rounded-full opacity-25"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      style={{ width: '100px', height: '100px', top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                    />
                  )}
                  <button
                    onClick={isConnected ? handleDisconnect : connect}
                    disabled={isConnecting}
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      isConnected ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-nyra hover:bg-nyra/90 text-nyra-foreground'
                    } ${isConnecting ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {isConnecting ? <Loader2 size={28} className="animate-spin" /> : isConnected ? <PhoneCall size={28} className="animate-pulse" /> : <Mic size={28} />}
                  </button>
                  <div className="mt-6 min-h-[2rem] text-center px-4">
                    {error ? (
                      error.startsWith('RATE_LIMITED:') ? (
                        <p className="text-amber-600 dark:text-amber-400 font-sans text-xs leading-relaxed">⏳ {error.replace('RATE_LIMITED:', '')}</p>
                      ) : (
                        <p className="text-destructive font-sans text-xs">{error}</p>
                      )
                    ) : isConnecting ? (
                      <p className="text-nyra font-sans text-xs uppercase tracking-widest animate-pulse">Connecting...</p>
                    ) : isConnected ? (
                      <p className="text-nyra font-sans text-xs uppercase tracking-widest">{isSpeaking ? 'Nyra is speaking...' : 'Listening...'}</p>
                    ) : (
                      <p className="text-muted-foreground font-sans text-xs uppercase tracking-widest">Tap to speak</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <div className="relative flex flex-col items-end gap-2">
        <AnimatePresence>
          {showTooltip && !isWidgetOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-full right-0 mb-3 w-64 rounded-xl bg-nyra text-nyra-foreground px-4 py-3 shadow-xl border border-nyra/30"
            >
              <p className="text-sm">Hi! I&apos;m Nyra, your AI travel assistant. Tap to talk about flights, hotels, or holiday packages.</p>
              <button onClick={dismissTooltip} className="mt-2 text-xs text-nyra-foreground/80 underline hover:text-nyra-foreground">Got it</button>
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
            {isWidgetOpen ? (
              <X size={28} />
            ) : (
              <img
                src="/assets/nyra-avatar.png"
                alt="Nyra"
                width={104}
                height={104}
                className="w-[52px] h-[52px] rounded-full object-cover object-top"
              />
            )}
            <span className={`absolute -top-1 -right-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ring-2 ring-background bg-nyra-accent text-nyra-accent-foreground`}>
              AI
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
