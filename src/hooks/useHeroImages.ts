import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeroImage {
  id: string;
  section_key: string;
  display_order: number;
  image_url: string;
  storage_path: string;
  alt_text: string;
  active: boolean;
}

export const useHeroImages = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('hero_images')
        .select('*')
        .eq('section_key', 'main_hero')
        .eq('active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      console.log('[useHeroImages] Query result - Data:', data, 'Error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        const message = fetchError.message || JSON.stringify(fetchError);
        throw new Error(message);
      }

      const variants = (data || []) as HeroImage[];
      setHeroImages(variants);
      setCurrentIndex(0);
      setHeroImage(variants[0] || null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err) || 'Failed to fetch hero images';
      setError(errorMessage);
      console.error('Error fetching hero images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((currentValue) => {
        const nextIndex = (currentValue + 1) % heroImages.length;
        setHeroImage(heroImages[nextIndex] || null);
        return nextIndex;
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [heroImages]);

  return { heroImage, heroImages, loading, error, refetch: fetchHeroImages };
};
