import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Partner } from './usePartners';

export const useAdminPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setPartners(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch partners';
      setError(errorMessage);
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return { partners, loading, error, refetch: fetchPartners };
};
