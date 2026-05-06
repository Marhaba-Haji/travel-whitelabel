import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUploadPartnerLogo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadLogo = async (file: File, partnerId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate file
      if (!file) {
        throw new Error('No file selected');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5242880) {
        throw new Error('File size must be less than 5MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${partnerId}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data, error: uploadError } = await supabase.storage
        .from('partner-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('partner-logos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLogo = async (logoPath: string) => {
    try {
      setLoading(true);
      
      // Extract filename from URL
      const fileName = logoPath.split('/').pop();
      if (!fileName) {
        throw new Error('Invalid logo path');
      }

      const { error: deleteError } = await supabase.storage
        .from('partner-logos')
        .remove([fileName]);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete logo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadLogo, deleteLogo, loading, error };
};
