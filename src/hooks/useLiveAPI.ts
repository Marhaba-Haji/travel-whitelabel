import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ── Tool declarations ──────────────────────────────────────────────────────────

const SAVE_LEAD_FUNCTION = {
  functionDeclarations: [{
    name: 'save_lead',
    description: 'Save the visitor\'s contact details to the database. Call this IMMEDIATELY as soon as you have name, email, AND phone—do not delay. If the user declines to give phone, you may still call with name and email (phone can be empty).',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The visitor\'s full name' },
        email: { type: 'string', description: 'The visitor\'s email address' },
        phone: { type: 'string', description: 'The visitor\'s phone number, if provided' },
        notes: { type: 'string', description: 'Brief notes about their interest or inquiry, if relevant' },
      },
      required: ['name', 'email'],
    },
  }],
};

const UPDATE_LEAD_FUNCTION = {
  functionDeclarations: [{
    name: 'update_lead',
    description: 'Update the lead record with the caller\'s requirements. Call this AFTER save_lead has been called, whenever the caller shares their travel needs, preferences, or requirements.',
    parameters: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'The caller\'s email address (used to find their lead record)' },
        requirements: { type: 'string', description: 'Summary of the caller\'s requirements, preferences, or interests shared during the conversation' },
      },
      required: ['email', 'requirements'],
    },
  }],
};

const UPDATE_ITINERARY_FUNCTION = {
  functionDeclarations: [{
    name: 'update_itinerary',
    description: `Manage the live travel itinerary being built during the conversation. Call this tool EVERY TIME you discuss a travel component with the customer. Actions:
- "set_trip_info": Set/update trip title, destination, dates, currency. Call early when you learn the destination.
- "set_guests": Provide the full guest list with names, ages, relations.
- "add_item": Add a new itinerary item (flight, hotel, visa, activity, transport, transfer, meal, insurance).
- "update_item": Update an existing item by its id.
- "remove_item": Remove an item by its id.
Call this tool proactively and frequently as you discuss the trip. Do NOT wait until the end of the conversation.`,
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'One of: set_trip_info, set_guests, add_item, update_item, remove_item' },
        title: { type: 'string', description: 'Trip title, e.g. "Family Dubai Adventure"' },
        destination: { type: 'string', description: 'Main destination' },
        start_date: { type: 'string', description: 'Trip start date, e.g. "15 Mar 2026"' },
        end_date: { type: 'string', description: 'Trip end date, e.g. "22 Mar 2026"' },
        currency: { type: 'string', description: 'Currency code, default INR' },
        guests: {
          type: 'array',
          description: 'Full guest list',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
              relation: { type: 'string', description: 'e.g. self, spouse, child, parent' },
            },
            required: ['name'],
          },
        },
        item_id: { type: 'string', description: 'Item ID (for update/remove)' },
        item_type: { type: 'string', description: 'One of: flight, hotel, visa, activity, transport, transfer, meal, insurance' },
        day: { type: 'number', description: 'Day number (1-based)' },
        date: { type: 'string', description: 'Date for this day/item' },
        item_title: { type: 'string', description: 'Title of the item' },
        subtitle: { type: 'string', description: 'Subtitle or brief description' },
        price: { type: 'number', description: 'Estimated price' },
        details: { type: 'string', description: 'Detailed description' },
        time: { type: 'string', description: 'Time, e.g. "10:30 AM"' },
        location: { type: 'string', description: 'Location name' },
        duration: { type: 'string', description: 'Duration, e.g. "3 hours"' },
      },
      required: ['action'],
    },
  }],
};

const SAVE_SESSION_CONTEXT_FUNCTION = {
  functionDeclarations: [{
    name: 'save_session_context',
    description: 'Save a structured summary of the conversation so far. Call this periodically (every 3-4 exchanges) so context is preserved if the connection drops.',
    parameters: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Concise summary of the entire conversation so far' },
        visitor_name: { type: 'string', description: 'The caller\'s name if known' },
        visitor_email: { type: 'string', description: 'The caller\'s email if known' },
        destinations_discussed: { type: 'string', description: 'Comma-separated list of destinations discussed' },
        budget_range: { type: 'string', description: 'Budget range mentioned, e.g. "1-2 lakh per person"' },
        travel_dates: { type: 'string', description: 'Travel dates discussed, e.g. "23 Mar - 5 Apr 2026"' },
        decisions_made: { type: 'string', description: 'Key decisions already made during the call' },
        pending_questions: { type: 'string', description: 'Questions still to be answered or topics to follow up on' },
      },
      required: ['summary'],
    },
  }],
};

const SEND_WHATSAPP_FUNCTION = {
  functionDeclarations: [{
    name: 'send_whatsapp',
    description: 'Generate a WhatsApp message link to send information to the caller. Use when the caller asks you to send details via WhatsApp.',
    parameters: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Caller phone number with country code, e.g. +919008447887' },
        message: { type: 'string', description: 'The message to pre-fill in WhatsApp' },
      },
      required: ['phone', 'message'],
    },
  }],
};

const SEND_EMAIL_FUNCTION = {
  functionDeclarations: [{
    name: 'send_email',
    description: 'Send an email to the caller with travel details, itinerary summary, quotes, or any information they request. Use when the caller asks you to email them details. Format the body as clean HTML.',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'The recipient email address' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email body in HTML format. Use proper HTML tags like <h2>, <p>, <ul>, <li>, <table>, <strong> etc. for a professional layout.' },
      },
      required: ['to', 'subject', 'body'],
    },
  }],
};

// ── Audio worklet (with RNNoise integration) ──────────────────────────────────

const workletCode = `
class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 1024;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bufferIndex++] = channelData[i];
        if (this.bufferIndex >= this.bufferSize) {
          this.port.postMessage(new Float32Array(this.buffer));
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('audio-capture-processor', AudioCaptureProcessor);
`;

// ── Tool call handler type ─────────────────────────────────────────────────────

export type ItineraryToolHandler = (action: string, args: Record<string, any>) => string | undefined;

export type ToolCallTracker = (toolName: string) => void;

export interface SessionContext {
  sessionId: string;
  previousSummary?: string;
}

export interface CommunicationConfig {
  whatsapp?: boolean;
  email?: boolean;
  sms?: boolean;
}

// ── Itinerary state snapshot helper ────────────────────────────────────────────

export type ItineraryStateGetter = () => {
  itemCount: number;
  items: { id: string; day: number; type: string; title: string }[];
  tripInfo: { title?: string; destination?: string; startDate?: string; endDate?: string } | null;
};

// ── Audio playback buffer ──────────────────────────────────────────────────────

const AUDIO_BUFFER_INTERVAL_MS = 80; // Accumulate audio chunks for smoother playback

// ── Cached API key ─────────────────────────────────────────────────────────────

let cachedApiKey: string | null = null;
let cachedApiKeyTimestamp = 0;
const API_KEY_TTL_MS = 4 * 60 * 1000; // Cache for 4 minutes (rate limit is 1 min)

async function getApiKey(): Promise<string> {
  const now = Date.now();
  if (cachedApiKey && (now - cachedApiKeyTimestamp) < API_KEY_TTL_MS) {
    return cachedApiKey;
  }

  const { data: tokenData, error: tokenError } = await supabase.functions.invoke('gemini-token');
  if (tokenError) {
    let errorBody: any = null;
    try {
      if (tokenError instanceof Response) errorBody = await tokenError.json();
      else if (typeof tokenError === 'object' && tokenError?.context) errorBody = JSON.parse(tokenError.context);
      else if (typeof tokenError === 'object' && tokenError?.message) { try { errorBody = JSON.parse(tokenError.message); } catch {} }
    } catch {}
    if (errorBody?.retryAfter || errorBody?.error?.includes('Rate limited')) {
      const secs = errorBody?.retryAfter || 60;
      throw new Error(`RATE_LIMITED:Please wait ${secs} seconds before starting another call.`);
    }
    throw new Error(errorBody?.error || tokenError?.message || 'Failed to get API key');
  }
  if (!tokenData?.apiKey) {
    if (tokenData?.retryAfter || tokenData?.error?.includes('Rate limited')) {
      const secs = tokenData?.retryAfter || 60;
      throw new Error(`RATE_LIMITED:Please wait ${secs} seconds before starting another call.`);
    }
    throw new Error(tokenData?.error || 'Failed to get API key');
  }

  cachedApiKey = tokenData.apiKey;
  cachedApiKeyTimestamp = now;
  return cachedApiKey;
}

// Pre-fetch on module load (non-blocking)
getApiKey().catch(() => {});

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useLiveAPI(
  systemInstruction: string,
  onItineraryTool?: ItineraryToolHandler,
  sessionContext?: SessionContext,
  communicationConfig?: CommunicationConfig,
  getItineraryState?: ItineraryStateGetter,
  onToolCall?: ToolCallTracker,
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sessionRef = useRef<any>(null);
  const captureContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const noiseSuppressorRef = useRef<AudioWorkletNode | null>(null);
  const onItineraryToolRef = useRef(onItineraryTool);
  onItineraryToolRef.current = onItineraryTool;
  const sessionContextRef = useRef(sessionContext);
  sessionContextRef.current = sessionContext;
  const communicationConfigRef = useRef(communicationConfig);
  communicationConfigRef.current = communicationConfig;
  const getItineraryStateRef = useRef(getItineraryState);
  getItineraryStateRef.current = getItineraryState;
  const onToolCallRef = useRef(onToolCall);
  onToolCallRef.current = onToolCall;

  // Audio playback buffer for smoother playback
  const audioChunkBufferRef = useRef<Float32Array[]>([]);
  const audioBufferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushAudioBuffer = useCallback(() => {
    if (!playbackContextRef.current || audioChunkBufferRef.current.length === 0) return;
    
    const chunks = audioChunkBufferRef.current;
    audioChunkBufferRef.current = [];
    
    // Merge all chunks into one buffer
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const ctx = playbackContextRef.current;
    const audioBuffer = ctx.createBuffer(1, merged.length, 24000);
    audioBuffer.copyToChannel(merged, 0);
    const src = ctx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(ctx.destination);
    const currentTime = ctx.currentTime;
    if (nextPlayTimeRef.current < currentTime) nextPlayTimeRef.current = currentTime;
    src.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += audioBuffer.duration;
    sourceNodesRef.current.push(src);
    src.onended = () => {
      sourceNodesRef.current = sourceNodesRef.current.filter(n => n !== src);
      if (sourceNodesRef.current.length === 0) setIsSpeaking(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close()).catch(() => {});
      sessionRef.current = null;
    }
    if (audioBufferTimerRef.current) { clearTimeout(audioBufferTimerRef.current); audioBufferTimerRef.current = null; }
    audioChunkBufferRef.current = [];
    if (noiseSuppressorRef.current) { noiseSuppressorRef.current.disconnect(); noiseSuppressorRef.current = null; }
    if (workletNodeRef.current) { workletNodeRef.current.disconnect(); workletNodeRef.current = null; }
    if (captureContextRef.current) { captureContextRef.current.close(); captureContextRef.current = null; }
    if (playbackContextRef.current) { playbackContextRef.current.close(); playbackContextRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    sourceNodesRef.current = [];
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      captureContextRef.current = new AudioContext({ sampleRate: 16000 });
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Try to load RNNoise for noise suppression
      let useNoiseSuppression = false;
      try {
        await captureContextRef.current.audioWorklet.addModule('/rnnoise/NoiseSuppressorWorklet.js');
        useNoiseSuppression = true;
      } catch (e) {
        console.warn('RNNoise worklet not available, using raw audio:', e);
      }

      await captureContextRef.current.audioWorklet.addModule(
        URL.createObjectURL(new Blob([workletCode], { type: 'application/javascript' }))
      );

      const source = captureContextRef.current.createMediaStreamSource(stream);

      // Chain: mic → [noise suppressor →] capture worklet
      if (useNoiseSuppression) {
        try {
          const noiseSuppressor = new AudioWorkletNode(captureContextRef.current, 'NoiseSuppressorWorklet');
          noiseSuppressorRef.current = noiseSuppressor;
          const workletNode = new AudioWorkletNode(captureContextRef.current, 'audio-capture-processor');
          workletNodeRef.current = workletNode;
          source.connect(noiseSuppressor);
          noiseSuppressor.connect(workletNode);
          workletNode.connect(captureContextRef.current.destination);
        } catch (e) {
          console.warn('Failed to instantiate RNNoise, falling back to raw audio:', e);
          useNoiseSuppression = false;
        }
      }
      
      if (!useNoiseSuppression) {
        const workletNode = new AudioWorkletNode(captureContextRef.current, 'audio-capture-processor');
        workletNodeRef.current = workletNode;
        source.connect(workletNode);
        workletNode.connect(captureContextRef.current.destination);
      }

      let sessionPromise: Promise<any>;

      workletNodeRef.current!.port.onmessage = (e) => {
        const float32Data = e.data;
        const int16Data = new Int16Array(float32Data.length);
        for (let i = 0; i < float32Data.length; i++) {
          const s = Math.max(-1, Math.min(1, float32Data[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)));
        if (sessionPromise) {
          sessionPromise.then(session => {
            session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } });
          }).catch(() => {});
        }
      };

      // Fetch API key (uses cache)
      const apiKey = await getApiKey();

      // Dynamic import of Gemini SDK - only loaded when user actually connects
      const { GoogleGenAI, Modality } = await import('@google/genai');

      const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });

      // Build tools list
      const tools: any[] = [
        { googleSearch: {} },
        SAVE_LEAD_FUNCTION,
        UPDATE_LEAD_FUNCTION,
        UPDATE_ITINERARY_FUNCTION,
        SAVE_SESSION_CONTEXT_FUNCTION,
      ];
      if (communicationConfigRef.current?.whatsapp) {
        tools.push(SEND_WHATSAPP_FUNCTION);
      }
      if (communicationConfigRef.current?.email) {
        tools.push(SEND_EMAIL_FUNCTION);
      }

      sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
          systemInstruction,
          tools,
          realtimeInputConfig: {
            automaticActivityDetection: {
              startOfSpeechSensitivity: "START_SENSITIVITY_HIGH" as any,
              endOfSpeechSensitivity: "END_SENSITIVITY_HIGH" as any,
              silenceDurationMs: 300,
              prefixPaddingMs: 100,
            }
          }
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            sessionRef.current = sessionPromise;

            const ctx = sessionContextRef.current;
            const hasPreviousContext = ctx?.previousSummary && ctx.previousSummary.trim().length > 0;

            sessionPromise.then(session => {
              if (hasPreviousContext) {
                session.sendClientContent({
                  turns: `Hi Nyra, we were speaking earlier. Here's what we discussed: ${ctx!.previousSummary}. Continue from where we left off naturally. Don't repeat the greeting—just acknowledge we're reconnecting and pick up the conversation.`,
                  turnComplete: true
                });
              } else {
                session.sendClientContent({
                  turns: "Hi Nyra! I just connected. Please greet me warmly, introduce yourself as representing Marhaba DMC, mention that you can speak in any language I'm comfortable with, and in your first response ask only for my name—one thing at a time.",
                  turnComplete: true
                });
              }
            }).catch(console.error);
          },
          onmessage: async (message: any) => {
            // Handle tool calls
            const toolCall = message.toolCall;
            if (toolCall?.functionCalls?.length && sessionRef.current) {
              const session = await sessionRef.current;
              const responses: { id?: string; name?: string; response?: Record<string, unknown> }[] = [];

              for (const fc of toolCall.functionCalls) {
                if (fc.name === 'save_lead' && fc.args) {
                  const args = fc.args as any;
                  const leadName = (args.name || '').trim();
                  const leadEmail = (args.email || '').trim();
                  if (!leadName || !leadEmail || !leadEmail.includes('@')) {
                    responses.push({ id: fc.id, name: 'save_lead', response: { success: false, error: 'Name and a valid email are required. Please ask the customer again.' } });
                  } else {
                    try {
                      const { data, error } = await supabase.functions.invoke('voice-ai-lead', {
                        body: { name: leadName, email: leadEmail, phone: args.phone || undefined, notes: args.notes || undefined },
                      });
                      responses.push({ id: fc.id, name: 'save_lead', response: { 
                        success: !error && data?.saved !== false,
                        saved_name: leadName,
                        saved_email: leadEmail,
                        saved_phone: args.phone || null,
                      } });
                    } catch { responses.push({ id: fc.id, name: 'save_lead', response: { success: false } }); }
                  }

                } else if (fc.name === 'update_lead' && fc.args) {
                  const args = fc.args as any;
                  const updateEmail = (args.email || '').trim();
                  const requirements = (args.requirements || '').trim();
                  if (!updateEmail || !updateEmail.includes('@') || !requirements) {
                    responses.push({ id: fc.id, name: 'update_lead', response: { success: false, error: 'A valid email and requirements text are needed.' } });
                  } else {
                    try {
                      const { data, error } = await supabase.functions.invoke('voice-ai-lead-update', {
                        body: { email: updateEmail, requirements },
                      });
                      responses.push({ id: fc.id, name: 'update_lead', response: { 
                        success: !error && data?.updated !== false,
                        updated_requirements: requirements,
                      } });
                    } catch { responses.push({ id: fc.id, name: 'update_lead', response: { success: false } }); }
                  }

                } else if (fc.name === 'update_itinerary' && fc.args) {
                  const args = fc.args as Record<string, any>;
                  try {
                    const resultId = onItineraryToolRef.current?.(args.action, args);
                    
                    // Build rich response with current state
                    const stateSnapshot = getItineraryStateRef.current?.();
                    const response: Record<string, unknown> = { 
                      success: true,
                      action_performed: args.action,
                    };
                    
                    // Return the generated item_id for add_item so AI can reference it
                    if (resultId) {
                      response.item_id = resultId;
                    }
                    
                    // Include current itinerary state summary
                    if (stateSnapshot) {
                      response.current_itinerary = {
                        item_count: stateSnapshot.itemCount,
                        items: stateSnapshot.items.map(i => ({ id: i.id, day: i.day, type: i.type, title: i.title })),
                        trip: stateSnapshot.tripInfo,
                      };
                    }
                    
                    responses.push({ id: fc.id, name: 'update_itinerary', response });
                  } catch {
                    responses.push({ id: fc.id, name: 'update_itinerary', response: { success: false } });
                  }

                } else if (fc.name === 'save_session_context' && fc.args) {
                  const args = fc.args as any;
                  const sid = sessionContextRef.current?.sessionId;
                  if (sid) {
                    // Build structured summary
                    const structuredParts: string[] = [args.summary || ''];
                    if (args.destinations_discussed) structuredParts.push(`Destinations: ${args.destinations_discussed}`);
                    if (args.budget_range) structuredParts.push(`Budget: ${args.budget_range}`);
                    if (args.travel_dates) structuredParts.push(`Dates: ${args.travel_dates}`);
                    if (args.decisions_made) structuredParts.push(`Decisions: ${args.decisions_made}`);
                    if (args.pending_questions) structuredParts.push(`Pending: ${args.pending_questions}`);
                    
                    const fullSummary = structuredParts.filter(Boolean).join(' | ');
                    
                    try {
                      await supabase.functions.invoke('voice-ai-session', {
                        body: {
                          session_id: sid,
                          conversation_summary: fullSummary,
                          visitor_name: args.visitor_name || undefined,
                          visitor_email: args.visitor_email || undefined,
                        },
                      });
                      responses.push({ id: fc.id, name: 'save_session_context', response: { success: true } });
                    } catch {
                      responses.push({ id: fc.id, name: 'save_session_context', response: { success: false } });
                    }
                  } else {
                    responses.push({ id: fc.id, name: 'save_session_context', response: { success: false, error: 'No session ID' } });
                  }

                } else if (fc.name === 'send_whatsapp' && fc.args) {
                  const args = fc.args as any;
                  const phone = (args.phone || '').replace(/[^+\d]/g, '');
                  const message = args.message || '';
                  if (phone && message) {
                    try {
                      const { error: waErr } = await supabase.functions.invoke('send-whatsapp', {
                        body: { to: phone, message },
                      });
                      if (waErr) {
                        responses.push({ id: fc.id, name: 'send_whatsapp', response: { success: false, error: 'Failed to send WhatsApp message. Tell the caller you will arrange to send it manually.' } });
                      } else {
                        responses.push({ id: fc.id, name: 'send_whatsapp', response: { success: true, message: `WhatsApp message sent successfully to ${phone}.` } });
                      }
                    } catch {
                      responses.push({ id: fc.id, name: 'send_whatsapp', response: { success: false, error: 'WhatsApp service error.' } });
                    }
                  } else {
                    responses.push({ id: fc.id, name: 'send_whatsapp', response: { success: false, error: 'Phone and message are required.' } });
                  }

                } else if (fc.name === 'send_email' && fc.args) {
                  const args = fc.args as any;
                  const to = (args.to || '').trim();
                  const subject = (args.subject || '').trim();
                  const emailBody = (args.body || '').trim();
                  if (to && subject && emailBody) {
                    try {
                      const { error: emailErr } = await supabase.functions.invoke('send-email', {
                        body: { to, subject, body: emailBody },
                      });
                      if (emailErr) {
                        responses.push({ id: fc.id, name: 'send_email', response: { success: false, error: 'Failed to send email. Tell the caller you will arrange to send it manually.' } });
                      } else {
                        responses.push({ id: fc.id, name: 'send_email', response: { success: true, message: `Email sent successfully to ${to}.` } });
                      }
                    } catch {
                      responses.push({ id: fc.id, name: 'send_email', response: { success: false, error: 'Email service error.' } });
                    }
                  } else {
                    responses.push({ id: fc.id, name: 'send_email', response: { success: false, error: 'Email address, subject, and body are required.' } });
                  }
                }
              }

              if (responses.length > 0 && session?.sendToolResponse) {
                session.sendToolResponse({ functionResponses: responses });
              }
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
              sourceNodesRef.current.forEach(node => { try { node.stop(); } catch {} });
              sourceNodesRef.current = [];
              if (audioBufferTimerRef.current) { clearTimeout(audioBufferTimerRef.current); audioBufferTimerRef.current = null; }
              audioChunkBufferRef.current = [];
              if (playbackContextRef.current) nextPlayTimeRef.current = playbackContextRef.current.currentTime;
              setIsSpeaking(false);
            }

            // Handle audio playback with buffering
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && playbackContextRef.current) {
              setIsSpeaking(true);
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
              const int16Data = new Int16Array(bytes.buffer);
              const float32Data = new Float32Array(int16Data.length);
              for (let i = 0; i < int16Data.length; i++) float32Data[i] = int16Data[i] / 32768.0;

              // Buffer chunks and flush periodically for smoother playback
              audioChunkBufferRef.current.push(float32Data);
              if (!audioBufferTimerRef.current) {
                audioBufferTimerRef.current = setTimeout(() => {
                  audioBufferTimerRef.current = null;
                  flushAudioBuffer();
                }, AUDIO_BUFFER_INTERVAL_MS);
              }
            }
          },
          onclose: () => disconnect(),
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            setError(err.message || "An error occurred");
            disconnect();
          }
        }
      });

    } catch (err: any) {
      console.error("Connection Error:", err);
      setError(err.message || "Failed to connect");
      setIsConnecting(false);
      disconnect();
    }
  }, [systemInstruction, disconnect, flushAudioBuffer]);

  return { isConnected, isConnecting, error, isSpeaking, connect, disconnect };
}
