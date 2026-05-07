import { useState } from 'react';
import { useAdminPartners } from '@/hooks/useAdminPartners';
import { useManagePartners } from '@/hooks/useManagePartners';
import { useUploadPartnerLogo } from '@/hooks/useUploadPartnerLogo';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff, Upload } from 'lucide-react';

const PartnersTab = () => {
  const { partners, loading: partnersLoading, refetch } = useAdminPartners();
  const { addPartner, updatePartner, deletePartner, loading: actionLoading } = useManagePartners();
  const { uploadLogo, deleteLogo, loading: uploadLoading } = useUploadPartnerLogo();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingLogoId, setUploadingLogoId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    color_badge: 'bg-gray-600',
    display_order: 0,
    active: true,
  });

  const colorOptions = [
    'bg-gray-600', 'bg-blue-700', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
    'bg-amber-600', 'bg-red-700', 'bg-indigo-600', 'bg-pink-600', 'bg-cyan-600'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      color_badge: 'bg-gray-600',
      display_order: 0,
      active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (partner: any) => {
    setFormData(partner);
    setEditingId(partner.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePartner(editingId, formData);
      } else {
        await addPartner(formData);
      }
      refetch();
      resetForm();
    } catch (error) {
      console.error('Error saving partner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      try {
        await deletePartner(id);
        refetch();
      } catch (error) {
        console.error('Error deleting partner:', error);
      }
    }
  };

  const handleToggleActive = async (partner: any) => {
    try {
      await updatePartner(partner.id, { ...partner, active: !partner.active });
      refetch();
    } catch (error) {
      console.error('Error toggling partner status:', error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, partnerId: string) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingLogoId(partnerId);
      setUploadError(null);

      const logoUrl = await uploadLogo(file, partnerId);
      
      // Update partner with new logo URL
      const partner = partners.find(p => p.id === partnerId);
      if (partner) {
        await updatePartner(partnerId, { ...partner, logo_url: logoUrl });
        refetch();
      }
      
      setUploadingLogoId(null);
      e.target.value = ''; // Reset file input
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
      setUploadError(errorMessage);
      setUploadingLogoId(null);
      console.error('Error uploading logo:', error);
    }
  };

  if (partnersLoading) {
    return <div className="flex items-center justify-center h-64">Loading partners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Partners</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          disabled={actionLoading || uploadLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Partner' : 'Add New Partner'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Partner Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground"
                placeholder="e.g., MakeMyTrip"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Logo URL (optional)</label>
              <input
                type="url"
                value={formData.logo_url || ''}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value || null })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground mt-1">Or upload an image below</p>
            </div>

            {editingId && (
              <div>
                <label className="block text-sm font-medium mb-2">Upload Logo Image</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, editingId)}
                    disabled={uploadLoading || actionLoading}
                    className="text-sm flex-1"
                  />
                  {uploadingLogoId === editingId && <span className="text-xs text-muted-foreground">Uploading...</span>}
                </div>
                {uploadError && <p className="text-xs text-destructive mt-1">{uploadError}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Color Badge</label>
              <select
                value={formData.color_badge}
                onChange={(e) => setFormData({ ...formData, color_badge: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
              >
                {colorOptions.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground"
                min="0"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
                id="active"
              />
              <label htmlFor="active" className="text-sm font-medium cursor-pointer">
                Active (Display on homepage)
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={actionLoading || uploadLoading}>
                {actionLoading ? 'Saving...' : editingId ? 'Update Partner' : 'Add Partner'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={actionLoading || uploadLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Partners List */}
      <div className="bg-card text-card-foreground rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Logo URL</th>
                <th className="text-left px-4 py-2 font-medium">Color</th>
                <th className="text-left px-4 py-2 font-medium">Order</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} className="border-b hover:bg-muted/50 transition">
                  <td className="px-4 py-2">{partner.name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground truncate">
                    {partner.logo_url ? (
                      <a href={partner.logo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View
                      </a>
                    ) : (
                      'No logo'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className={`w-6 h-6 ${partner.color_badge} rounded`}></div>
                  </td>
                  <td className="px-4 py-2">{partner.display_order}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      partner.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {partner.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById(`logo-upload-${partner.id}`)?.click()}
                      disabled={uploadLoading || actionLoading}
                      title="Upload logo"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <input
                      id={`logo-upload-${partner.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, partner.id)}
                      disabled={uploadLoading || actionLoading}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(partner)}
                      disabled={actionLoading}
                      title={partner.active ? 'Hide' : 'Show'}
                    >
                      {partner.active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(partner)}
                      disabled={actionLoading}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(partner.id)}
                      disabled={actionLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {partners.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No partners yet. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnersTab;
