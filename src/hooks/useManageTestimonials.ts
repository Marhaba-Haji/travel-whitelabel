import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CreateTestimonialInput, UpdateTestimonialInput } from '@/types/testimonials';

export const useManageTestimonials = () => {
  const [loading, setLoading] = useState(false);

  const addTestimonial = async (data: CreateTestimonialInput) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('testimonials').insert([
        {
          name: data.name,
          review: data.review,
          rating: data.rating,
          active: data.active !== false,
          display_order: data.display_order || 0,
        },
      ]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error adding testimonial:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTestimonial = async (id: string, data: UpdateTestimonialInput) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('testimonials')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating testimonial:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleTestimonialActive = async (id: string, active: boolean) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('testimonials')
        .update({ active: !active })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error toggling testimonial status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialActive,
    loading,
  };
};
