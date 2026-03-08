import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ItineraryToolHandler, SessionContext, CommunicationConfig, ItineraryStateGetter, ToolCallTracker } from '@/hooks/useLiveAPI';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function useNyraChat(
  systemInstruction: string,
  onItineraryTool?: ItineraryToolHandler,
  sessionContext?: SessionContext,
  communicationConfig?: CommunicationConfig,
  getItineraryState?: ItineraryStateGetter,
  onToolCall?: ToolCallTracker,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onItineraryToolRef = useRef(onItineraryTool);
  onItineraryToolRef.current = onItineraryTool;
  const getItineraryStateRef = useRef(getItineraryState);
  getItineraryStateRef.current = getItineraryState;

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history for API
      const apiMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userText.trim() },
      ];

      const { data, error: fnError } = await supabase.functions.invoke('nyra-chat', {
        body: {
          messages: apiMessages,
          systemInstruction,
          sessionId: sessionContext?.sessionId,
          enabledTools: {
            whatsapp: communicationConfig?.whatsapp ?? false,
            email: communicationConfig?.email ?? false,
          },
        },
      });

      if (fnError) {
        // Try to extract error message
        let errorMsg = 'Something went wrong. Please try again.';
        try {
          const parsed = typeof fnError === 'object' && fnError?.message ? JSON.parse(fnError.message) : null;
          if (parsed?.error) errorMsg = parsed.error;
        } catch {}
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Handle client-side actions (itinerary updates)
      if (data?.clientActions?.length) {
        for (const action of data.clientActions) {
          if (action._client_action && action.args) {
            onItineraryToolRef.current?.(action.action as string, action.args as Record<string, any>);
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.reply || "I'm sorry, I couldn't process that. Could you try again?",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, systemInstruction, sessionContext, communicationConfig]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}
