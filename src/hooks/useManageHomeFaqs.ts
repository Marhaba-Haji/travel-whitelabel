import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CreateHomeFaqInput, UpdateHomeFaqInput } from '@/types/faqs';

export const useManageHomeFaqs = () => {
  const [loading, setLoading] = useState(false);

  const addFaq = async (data: CreateHomeFaqInput) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('home_faqs').insert([
        {
          question: data.question,
          answer: data.answer,
          active: data.active !== false,
          display_order: data.display_order || 0,
        },
      ]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error adding FAQ:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFaq = async (id: string, data: UpdateHomeFaqInput) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('home_faqs')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating FAQ:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFaq = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('home_faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleFaqActive = async (id: string, active: boolean) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('home_faqs')
        .update({ active: !active })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error toggling FAQ active status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addFaq,
    updateFaq,
    deleteFaq,
    toggleFaqActive,
    loading,
  };
};
