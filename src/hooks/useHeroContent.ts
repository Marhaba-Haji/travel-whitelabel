import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeroContent {
  id: string;
  section_key: string;
  display_order: number;
  title: string;
  subtitle: string;
  subtitle_color: string;
  description: string | null;
  cta_text: string;
  cta_url: string;
  active: boolean;
}

export const useHeroContent = () => {
  const [heroContents, setHeroContents] = useState<HeroContent[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroContent = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('hero_content')
        .select('*')
        .eq('section_key', 'main_hero')
        .eq('active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      console.log('[useHeroContent] Query result - Data:', data, 'Error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        const message = fetchError.message || JSON.stringify(fetchError);
        throw new Error(message);
      }

      const variants = (data || []) as HeroContent[];
      setHeroContents(variants);
      setCurrentIndex(0);
      setHeroContent(variants[0] || null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err) || 'Failed to fetch hero content';
      setError(errorMessage);
      console.error('Error fetching hero content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroContent();
  }, []);

  useEffect(() => {
    if (heroContents.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((currentValue) => {
        const nextIndex = (currentValue + 1) % heroContents.length;
        setHeroContent(heroContents[nextIndex] || null);
        return nextIndex;
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [heroContents]);

  return { heroContent, heroContents, loading, error, refetch: fetchHeroContent };
};
