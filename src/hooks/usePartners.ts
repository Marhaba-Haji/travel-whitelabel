import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  color_badge: string;
  display_order: number;
  active?: boolean;
}

let partnersCache: Partner[] | null = null;
let partnersInflight: Promise<Partner[]> | null = null;

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>(partnersCache ?? []);
  const [loading, setLoading] = useState(partnersCache === null);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    try {
      if (!partnersInflight) {
        partnersInflight = (async () => {
          const { data, error: fetchError } = await supabase
            .from('partners')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true });
          if (fetchError) throw fetchError;
          partnersCache = (data as Partner[]) || [];
          return partnersCache;
        })();
      }
      const result = await partnersInflight;
      setPartners(result);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch partners';
      setError(errorMessage);
      console.error('Error fetching partners:', err);
      partnersInflight = null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partnersCache) return; // already loaded once
    fetchPartners();
  }, []);

  return { partners, loading, error, refetch: () => { partnersInflight = null; partnersCache = null; return fetchPartners(); } };
};
