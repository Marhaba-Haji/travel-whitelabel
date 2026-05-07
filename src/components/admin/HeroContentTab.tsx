import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HeroContent } from '@/hooks/useHeroContent';
import { useManageHeroContent } from '@/hooks/useManageHeroContent';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const defaultFormData: Partial<HeroContent> = {
  title: '',
  subtitle: '',
  subtitle_color: '#B968C7',
  description: '',
  cta_text: 'Get Started',
  cta_url: '/signup',
  display_order: 0,
  active: true,
};

const HeroContentTab = () => {
  const { loading: authLoading, user } = useAuth();
  const { addHeroContent, updateHeroContent, deleteHeroContent, loading: actionLoading } = useManageHeroContent();
  const [heroVariants, setHeroVariants] = useState<HeroContent[]>([]);
  const [formData, setFormData] = useState<Partial<HeroContent>>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchAllHeroContent = async () => {
    try {
      setContentLoading(true);
      setError(null);

      if (!user) {
        setError('Please sign in to load hero content.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('hero_content')
        .select('*')
        .eq('section_key', 'main_hero')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      console.log('[HeroContentTab] Fetch result - Data:', data, 'Error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        const message = fetchError.message || JSON.stringify(fetchError);
        throw new Error(message);
      }

      setHeroVariants((data || []) as HeroContent[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err) || 'Failed to load hero content';
      setError(message);
      console.error('[HeroContentTab] Error fetching hero content:', err);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchAllHeroContent();
  }, [authLoading, user?.id]);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setError(null);
    setSuccess(false);
    setFormData({
      ...defaultFormData,
      display_order: heroVariants.length,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (variant: HeroContent) => {
    setError(null);
    setSuccess(false);
    setFormData(variant);
    setEditingId(variant.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hero variant?')) return;

    try {
      await deleteHeroContent(id);
      setSuccess(true);
      await fetchAllHeroContent();
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete hero content';
      setError(message);
      console.error('Error deleting hero content:', err);
    }
  };

  const handleToggleActive = async (variant: HeroContent) => {
    try {
      await updateHeroContent(variant.id, {
        section_key: variant.section_key,
        display_order: variant.display_order,
        title: variant.title,
        subtitle: variant.subtitle,
        subtitle_color: variant.subtitle_color,
        description: variant.description,
        cta_text: variant.cta_text,
        cta_url: variant.cta_url,
        active: !variant.active,
      });
      await fetchAllHeroContent();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update hero content';
      setError(message);
      console.error('Error toggling hero content status:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        section_key: 'main_hero',
        display_order: Number(formData.display_order ?? 0),
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        subtitle_color: formData.subtitle_color || '#B968C7',
        description: formData.description || null,
        cta_text: formData.cta_text || 'Get Started',
        cta_url: formData.cta_url || '/signup',
        active: formData.active !== undefined ? formData.active : true,
      };

      if (editingId) {
        await updateHeroContent(editingId, payload);
      } else {
        await addHeroContent(payload);
      }

      setSuccess(true);
      await fetchAllHeroContent();
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save hero content';
      setError(message);
      console.error('Error saving hero content:', err);
    }
  };

  if (contentLoading) {
    return <div className="flex items-center justify-center h-64">Loading hero content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Hero Section Content</h2>
          <p className="text-muted-foreground mt-1">
            Add multiple title and subtitle combinations. The homepage will rotate through active variants every few seconds.
          </p>
        </div>
        <Button onClick={handleAddNew} disabled={actionLoading}>
          Add Variant
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100/10 border border-green-500/20 rounded-lg p-4 text-green-700 text-sm">
          Hero content updated successfully!
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card text-foreground rounded-lg p-6 border space-y-6 [&_input]:text-foreground [&_textarea]:text-foreground [&_input]:bg-background [&_textarea]:bg-background [&_label]:text-foreground">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Hero Variant' : 'Add Hero Variant'}
            </h3>
            <Button type="button" variant="outline" onClick={resetForm} disabled={actionLoading}>
              Cancel
            </Button>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg border">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Preview</h4>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 font-poppins leading-[1.1] tracking-tight">
                {(formData.title || '').split(formData.subtitle || '').map((part, i) => (
                  <span key={i}>
                    {part}
                    {i === 0 && formData.subtitle && (
                      <span style={{ color: formData.subtitle_color || '#B968C7' }} className="font-bold ml-2">
                        {formData.subtitle}
                      </span>
                    )}
                  </span>
                ))}
              </h1>
              {formData.description && (
                <p className="text-lg text-gray-500 font-medium">{formData.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Title</label>
              <textarea
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-20"
                placeholder="e.g., Travel top destination of the world"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Highlighted Subtitle Text</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                placeholder="e.g., top destination"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">This text will appear in the highlighted color</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.subtitle_color || '#B968C7'}
                  onChange={(e) => setFormData({ ...formData, subtitle_color: e.target.value })}
                  className="w-20 h-10 border border-border rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.subtitle_color || '#B968C7'}
                  onChange={(e) => setFormData({ ...formData, subtitle_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-border rounded-md text-sm font-mono"
                  placeholder="#B968C7"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order ?? 0}
                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Lower numbers display first.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-16"
              placeholder="Where adventure meets comfort. We create unforgettable travel experiences"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">CTA Button Text</label>
              <input
                type="text"
                value={formData.cta_text || ''}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                placeholder="Get Started"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CTA Button URL</label>
              <input
                type="text"
                value={formData.cta_url || ''}
                onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                placeholder="/signup"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={formData.active !== undefined ? formData.active : true}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4"
              id="active"
            />
            <label htmlFor="active" className="text-sm font-medium cursor-pointer">
              Active (Display on homepage)
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : editingId ? 'Update Variant' : 'Add Variant'}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-foreground">
            <thead className="bg-muted border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Subtitle</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {heroVariants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No hero variants found. Add one to start rotating titles.
                  </td>
                </tr>
              ) : (
                heroVariants.map((variant) => (
                  <tr key={variant.id} className="border-b hover:bg-muted/50 transition text-foreground">
                    <td className="px-4 py-3 font-medium">{variant.display_order}</td>
                    <td className="px-4 py-3 font-medium">{variant.title}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: variant.subtitle_color }}>
                      {variant.subtitle}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-1 rounded ${variant.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {variant.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(variant)}>
                          Edit
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleToggleActive(variant)}>
                          {variant.active ? 'Hide' : 'Show'}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleDelete(variant.id)}>
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

export default HeroContentTab;
