import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useManagePartners = () => {
  const [loading, setLoading] = useState(false);

  const addPartner = async (data: {
    name: string;
    logo_url: string | null;
    color_badge: string;
    display_order: number;
    active: boolean;
  }) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('partners').insert([data]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error adding partner:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePartner = async (id: string, data: Partial<{
    name: string;
    logo_url: string | null;
    color_badge: string;
    display_order: number;
    active: boolean;
  }>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('partners')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating partner:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePartner = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting partner:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addPartner, updatePartner, deletePartner, loading };
};
