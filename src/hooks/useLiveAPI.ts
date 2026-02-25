import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { supabase } from '@/integrations/supabase/client';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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

export function useLiveAPI(systemInstruction: string) {
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
            session.sendRealtimeInput({
              media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
            });
          }).catch(() => {});
        }
      };

      sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction,
          tools: [{ googleSearch: {} }, SAVE_LEAD_FUNCTION as any],
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
            
            // Send an initial message to prompt Nyra to start the conversation
            sessionPromise.then(session => {
              session.sendClientContent({
                turns: "Hi Nyra! I just connected. Please greet me warmly, introduce yourself as representing Marhaba DMC, and in your first response ask only for my name—one thing at a time.",
                turnComplete: true
              });
            }).catch(console.error);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle tool calls (e.g. save_lead)
            const toolCall = message.toolCall;
            if (toolCall?.functionCalls?.length && sessionRef.current) {
              const session = await sessionRef.current;
              const responses: { id?: string; name?: string; response?: Record<string, unknown> }[] = [];
              for (const fc of toolCall.functionCalls) {
                if (fc.name === 'save_lead' && fc.args) {
                  const args = fc.args as { name?: string; email?: string; phone?: string; notes?: string };
                  try {
                    const { data, error } = await supabase.functions.invoke('voice-ai-lead', {
                      body: {
                        name: args.name || '',
                        email: args.email || '',
                        phone: args.phone || undefined,
                        notes: args.notes || undefined,
                      },
                    });
                    const saved = !error && data?.saved !== false;
                    responses.push({
                      id: fc.id,
                      name: 'save_lead',
                      response: { success: saved, saved },
                    });
                  } catch (err) {
                    responses.push({
                      id: fc.id,
                      name: 'save_lead',
                      response: { success: false, saved: false, error: 'Failed to save' },
                    });
                  }
                }
              }
              if (responses.length > 0 && session?.sendToolResponse) {
                session.sendToolResponse({ functionResponses: responses });
              }
            }

            if (message.serverContent?.interrupted) {
              sourceNodesRef.current.forEach(node => {
                try { node.stop(); } catch (e) {}
              });
              sourceNodesRef.current = [];
              if (playbackContextRef.current) {
                nextPlayTimeRef.current = playbackContextRef.current.currentTime;
              }
              setIsSpeaking(false);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && playbackContextRef.current) {
              setIsSpeaking(true);
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const int16Data = new Int16Array(bytes.buffer);
              const float32Data = new Float32Array(int16Data.length);
              for (let i = 0; i < int16Data.length; i++) {
                float32Data[i] = int16Data[i] / 32768.0;
              }

              const audioBuffer = playbackContextRef.current.createBuffer(1, float32Data.length, 24000);
              audioBuffer.copyToChannel(float32Data, 0);

              const source = playbackContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(playbackContextRef.current.destination);

              const currentTime = playbackContextRef.current.currentTime;
              if (nextPlayTimeRef.current < currentTime) {
                nextPlayTimeRef.current = currentTime;
              }
              source.start(nextPlayTimeRef.current);
              nextPlayTimeRef.current += audioBuffer.duration;
              sourceNodesRef.current.push(source);
              
              source.onended = () => {
                sourceNodesRef.current = sourceNodesRef.current.filter(n => n !== source);
                if (sourceNodesRef.current.length === 0) {
                  setIsSpeaking(false);
                }
              };
            }
          },
          onclose: () => {
            disconnect();
          },
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
  }, [systemInstruction]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close()).catch(() => {});
      sessionRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (captureContextRef.current) {
      captureContextRef.current.close();
      captureContextRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    sourceNodesRef.current = [];
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    isSpeaking,
    connect,
    disconnect
  };
}
