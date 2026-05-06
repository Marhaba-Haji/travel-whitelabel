import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUploadHeroImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, imageId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!file) {
        throw new Error('No file selected');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5242880) {
        throw new Error('File size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${imageId}-${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('hero-images')
        .getPublicUrl(data.path);

      return { imageUrl: urlData.publicUrl, storagePath: data.path };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload hero image';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (storagePath: string) => {
    try {
      setLoading(true);
      const { error: deleteError } = await supabase.storage
        .from('hero-images')
        .remove([storagePath]);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete hero image';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, deleteImage, loading, error };
};
