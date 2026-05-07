import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HomeFaq } from '@/types/faqs';

export const useAdminHomeFaqs = () => {
  const [faqs, setFaqs] = useState<HomeFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('home_faqs')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (err) throw err;
      setFaqs(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch FAQs';
      setError(errorMessage);
      console.error('Error fetching admin FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();

    const channel = supabase
      .channel('admin-home-faqs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'home_faqs',
        },
        () => {
          fetchFaqs();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { faqs, loading, error, refetch: fetchFaqs };
};
