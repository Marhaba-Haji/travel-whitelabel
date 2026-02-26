import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
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
        // set_trip_info fields
        title: { type: 'string', description: 'Trip title, e.g. "Family Dubai Adventure"' },
        destination: { type: 'string', description: 'Main destination' },
        start_date: { type: 'string', description: 'Trip start date, e.g. "15 Mar 2026"' },
        end_date: { type: 'string', description: 'Trip end date, e.g. "22 Mar 2026"' },
        currency: { type: 'string', description: 'Currency code, default INR' },
        // set_guests fields
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
        // add_item / update_item fields
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

// ── Audio worklet ──────────────────────────────────────────────────────────────

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

export type ItineraryToolHandler = (action: string, args: Record<string, any>) => void;

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useLiveAPI(systemInstruction: string, onItineraryTool?: ItineraryToolHandler) {
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
  const onItineraryToolRef = useRef(onItineraryTool);
  onItineraryToolRef.current = onItineraryTool;

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close()).catch(() => {});
      sessionRef.current = null;
    }
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

      await captureContextRef.current.audioWorklet.addModule(
        URL.createObjectURL(new Blob([workletCode], { type: 'application/javascript' }))
      );

      const source = captureContextRef.current.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(captureContextRef.current, 'audio-capture-processor');
      workletNodeRef.current = workletNode;
      source.connect(workletNode);
      workletNode.connect(captureContextRef.current.destination);

      let sessionPromise: Promise<any>;

      workletNode.port.onmessage = (e) => {
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

      // Fetch API key
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('gemini-token');
      if (tokenError) {
        console.error("gemini-token error:", tokenError);
        let errorBody: any = null;
        try {
          if (tokenError instanceof Response) errorBody = await tokenError.json();
          else if (typeof tokenError === 'object' && tokenError?.context) errorBody = JSON.parse(tokenError.context);
          else if (typeof tokenError === 'object' && tokenError?.message) { try { errorBody = JSON.parse(tokenError.message); } catch {} }
        } catch {}
        if (errorBody?.retryAfter || errorBody?.error?.includes('Rate limited')) {
          const mins = Math.ceil((errorBody?.retryAfter || 300) / 60);
          throw new Error(`RATE_LIMITED:Please wait ${mins} minute${mins > 1 ? 's' : ''} before starting another call.`);
        }
        throw new Error(errorBody?.error || tokenError?.message || 'Failed to get API key');
      }
      if (!tokenData?.apiKey) {
        console.error("gemini-token returned no apiKey:", tokenData);
        if (tokenData?.retryAfter || tokenData?.error?.includes('Rate limited')) {
          const mins = Math.ceil((tokenData?.retryAfter || 300) / 60);
          throw new Error(`RATE_LIMITED:Please wait ${mins} minute${mins > 1 ? 's' : ''} before starting another call.`);
        }
        throw new Error(tokenData?.error || 'Failed to get API key');
      }

      const ai = new GoogleGenAI({ apiKey: tokenData.apiKey, httpOptions: { apiVersion: 'v1alpha' } });

      sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
          systemInstruction,
          tools: [
            { googleSearch: {} },
            SAVE_LEAD_FUNCTION as any,
            UPDATE_LEAD_FUNCTION as any,
            UPDATE_ITINERARY_FUNCTION as any,
          ],
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
            sessionPromise.then(session => {
              session.sendClientContent({
                turns: "Hi Nyra! I just connected. Please greet me warmly, introduce yourself as representing Marhaba DMC, mention that you can speak in any language I'm comfortable with, and in your first response ask only for my name—one thing at a time.",
                turnComplete: true
              });
            }).catch(console.error);
          },
          onmessage: async (message: LiveServerMessage) => {
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
                      responses.push({ id: fc.id, name: 'save_lead', response: { success: !error && data?.saved !== false } });
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
                      responses.push({ id: fc.id, name: 'update_lead', response: { success: !error && data?.updated !== false } });
                    } catch { responses.push({ id: fc.id, name: 'update_lead', response: { success: false } }); }
                  }

                } else if (fc.name === 'update_itinerary' && fc.args) {
                  const args = fc.args as Record<string, any>;
                  try {
                    onItineraryToolRef.current?.(args.action, args);
                    responses.push({ id: fc.id, name: 'update_itinerary', response: { success: true } });
                  } catch {
                    responses.push({ id: fc.id, name: 'update_itinerary', response: { success: false } });
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
              if (playbackContextRef.current) nextPlayTimeRef.current = playbackContextRef.current.currentTime;
              setIsSpeaking(false);
            }

            // Handle audio playback
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && playbackContextRef.current) {
              setIsSpeaking(true);
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
              const int16Data = new Int16Array(bytes.buffer);
              const float32Data = new Float32Array(int16Data.length);
              for (let i = 0; i < int16Data.length; i++) float32Data[i] = int16Data[i] / 32768.0;

              const audioBuffer = playbackContextRef.current.createBuffer(1, float32Data.length, 24000);
              audioBuffer.copyToChannel(float32Data, 0);
              const src = playbackContextRef.current.createBufferSource();
              src.buffer = audioBuffer;
              src.connect(playbackContextRef.current.destination);
              const currentTime = playbackContextRef.current.currentTime;
              if (nextPlayTimeRef.current < currentTime) nextPlayTimeRef.current = currentTime;
              src.start(nextPlayTimeRef.current);
              nextPlayTimeRef.current += audioBuffer.duration;
              sourceNodesRef.current.push(src);
              src.onended = () => {
                sourceNodesRef.current = sourceNodesRef.current.filter(n => n !== src);
                if (sourceNodesRef.current.length === 0) setIsSpeaking(false);
              };
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
  }, [systemInstruction, disconnect]);

  return { isConnected, isConnecting, error, isSpeaking, connect, disconnect };
}
