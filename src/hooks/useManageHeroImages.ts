import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type HeroImagePayload = {
  section_key?: string;
  display_order: number;
  image_url: string;
  storage_path: string;
  alt_text: string;
  active: boolean;
};

export const useManageHeroImages = () => {
  const [loading, setLoading] = useState(false);

  const addHeroImage = async (data: HeroImagePayload) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hero_images')
        .insert([{ ...data, section_key: data.section_key || 'main_hero' }]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error creating hero image:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHeroImage = async (id: string, data: HeroImagePayload) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hero_images')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating hero image:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHeroImage = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting hero image:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addHeroImage, updateHeroImage, deleteHeroImage, loading };
};
