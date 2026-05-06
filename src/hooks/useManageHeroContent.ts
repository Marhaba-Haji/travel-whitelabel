import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type HeroContentPayload = {
  section_key?: string;
  display_order: number;
  title: string;
  subtitle: string;
  subtitle_color: string;
  description: string | null;
  cta_text: string;
  cta_url: string;
  active: boolean;
};

export const useManageHeroContent = () => {
  const [loading, setLoading] = useState(false);

  const addHeroContent = async (data: HeroContentPayload) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hero_content')
        .insert([{ ...data, section_key: data.section_key || 'main_hero' }]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error creating hero content:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHeroContent = async (id: string, data: HeroContentPayload) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hero_content')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating hero content:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHeroContent = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hero_content')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting hero content:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addHeroContent, updateHeroContent, deleteHeroContent, loading };
};
