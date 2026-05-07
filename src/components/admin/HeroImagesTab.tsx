import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { HeroImage } from '@/hooks/useHeroImages';
import { useManageHeroImages } from '@/hooks/useManageHeroImages';
import { useUploadHeroImage } from '@/hooks/useUploadHeroImage';

const defaultFormData: Partial<HeroImage> = {
  alt_text: '',
  display_order: 0,
  active: true,
};

const HeroImagesTab = () => {
  const { loading: authLoading, user } = useAuth();
  const { addHeroImage, updateHeroImage, deleteHeroImage, loading: actionLoading } = useManageHeroImages();
  const { uploadImage, deleteImage, loading: uploadLoading } = useUploadHeroImage();
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [formData, setFormData] = useState<Partial<HeroImage>>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStoragePath, setSelectedStoragePath] = useState<string | null>(null);

  const fetchHeroImages = async () => {
    try {
      setContentLoading(true);
      setError(null);

      if (!user) {
        setError('Please sign in to load hero images.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('hero_images')
        .select('*')
        .eq('section_key', 'main_hero')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      console.log('[HeroImagesTab] Fetch result - Data:', data, 'Error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        const message = fetchError.message || JSON.stringify(fetchError);
        throw new Error(message);
      }

      setHeroImages((data || []) as HeroImage[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err) || 'Failed to load hero images';
      setError(message);
      console.error('[HeroImagesTab] Error fetching hero images:', err);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchHeroImages();
  }, [authLoading, user?.id]);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setShowForm(false);
    setSelectedFile(null);
    setSelectedStoragePath(null);
  };

  const handleAddNew = () => {
    setError(null);
    setSuccess(false);
    setFormData({
      ...defaultFormData,
      display_order: heroImages.length,
    });
    setEditingId(null);
    setShowForm(true);
    setSelectedFile(null);
    setSelectedStoragePath(null);
  };

  const handleEdit = (heroImage: HeroImage) => {
    setError(null);
    setSuccess(false);
    setFormData(heroImage);
    setEditingId(heroImage.id);
    setShowForm(true);
    setSelectedFile(null);
    setSelectedStoragePath(heroImage.storage_path);
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm('Delete this hero image?')) return;

    try {
      await deleteHeroImage(id);
      await deleteImage(storagePath);
      setSuccess(true);
      await fetchHeroImages();
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete hero image';
      setError(message);
      console.error('Error deleting hero image:', err);
    }
  };

  const handleToggleActive = async (heroImage: HeroImage) => {
    try {
      await updateHeroImage(heroImage.id, {
        section_key: heroImage.section_key,
        display_order: heroImage.display_order,
        image_url: heroImage.image_url,
        storage_path: heroImage.storage_path,
        alt_text: heroImage.alt_text,
        active: !heroImage.active,
      });
      await fetchHeroImages();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update hero image';
      setError(message);
      console.error('Error toggling hero image status:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      let imageUrl = formData.image_url || '';
      let storagePath = formData.storage_path || '';

      if (selectedFile) {
        const uploadResult = await uploadImage(selectedFile, editingId || `hero-image-${Date.now()}`);
        imageUrl = uploadResult.imageUrl;
        storagePath = uploadResult.storagePath;
      }

      if (!imageUrl || !storagePath) {
        throw new Error('Please upload an image before saving');
      }

      const payload = {
        section_key: 'main_hero',
        display_order: Number(formData.display_order ?? 0),
        image_url: imageUrl,
        storage_path: storagePath,
        alt_text: formData.alt_text || '',
        active: formData.active !== undefined ? formData.active : true,
      };

      if (editingId) {
        await updateHeroImage(editingId, payload);
      } else {
        await addHeroImage(payload);
      }

      if (editingId && selectedStoragePath && selectedStoragePath !== storagePath) {
        await deleteImage(selectedStoragePath);
      }

      setSuccess(true);
      await fetchHeroImages();
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save hero image';
      setError(message);
      console.error('Error saving hero image:', err);
    }
  };

  if (contentLoading) {
    return <div className="flex items-center justify-center h-64">Loading hero images...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hero Section Images</h2>
          <p className="text-muted-foreground mt-1">
            Upload local images for the homepage hero illustration. Active images will rotate on the homepage.
          </p>
        </div>
        <Button onClick={handleAddNew} disabled={actionLoading || uploadLoading}>
          Add Image
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100/10 border border-green-500/20 rounded-lg p-4 text-green-700 text-sm">
          Hero image updated successfully!
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 border space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-foreground">
              {editingId ? 'Edit Hero Image' : 'Add Hero Image'}
            </h3>
            <Button type="button" variant="outline" onClick={resetForm} disabled={actionLoading || uploadLoading}>
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Alt Text</label>
              <input
                type="text"
                value={formData.alt_text || ''}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
                placeholder="Family on a holiday trip"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Display Order</label>
              <input
                type="number"
                value={formData.display_order ?? 0}
                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP or SVG. Max size: 5MB.</p>
          </div>

          {(selectedFile || formData.image_url) && (
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Preview</h4>
              <img
                src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image_url || ''}
                alt={formData.alt_text || 'Hero image preview'}
                className="max-h-72 mx-auto object-contain rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={formData.active !== undefined ? formData.active : true}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4"
              id="hero-image-active"
            />
            <label htmlFor="hero-image-active" className="text-sm font-medium cursor-pointer text-foreground">
              Active (Display on homepage)
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={actionLoading || uploadLoading}>
              {actionLoading || uploadLoading ? 'Saving...' : editingId ? 'Update Image' : 'Add Image'}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-foreground">
            <thead className="bg-muted border-b">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-foreground">Preview</th>
                <th className="text-left px-4 py-2 font-semibold text-foreground">Alt Text</th>
                <th className="text-left px-4 py-2 font-semibold text-foreground">Order</th>
                <th className="text-left px-4 py-2 font-semibold text-foreground">Status</th>
                <th className="text-right px-4 py-2 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {heroImages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No hero images found. Add one to start managing homepage illustrations.
                  </td>
                </tr>
              ) : (
                heroImages.map((heroImage) => (
                  <tr key={heroImage.id} className="border-b hover:bg-muted/50 transition">
                    <td className="px-4 py-2">
                      <img
                        src={heroImage.image_url}
                        alt={heroImage.alt_text}
                        className="h-16 w-24 object-contain rounded-md bg-muted"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium text-foreground">{heroImage.alt_text}</td>
                    <td className="px-4 py-2 font-medium text-foreground">{heroImage.display_order}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-1 rounded ${heroImage.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {heroImage.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(heroImage)}>
                          Edit
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleToggleActive(heroImage)}>
                          {heroImage.active ? 'Hide' : 'Show'}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleDelete(heroImage.id, heroImage.storage_path)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HeroImagesTab;
