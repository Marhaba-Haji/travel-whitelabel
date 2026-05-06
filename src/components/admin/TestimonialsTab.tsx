import { useState } from 'react';
import { useAdminTestimonials } from '@/hooks/useAdminTestimonials';
import { useManageTestimonials } from '@/hooks/useManageTestimonials';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff, Edit2 } from 'lucide-react';
import { Testimonial, TestimonialFormData } from '@/types/testimonials';

const TestimonialsTab = () => {
  const { testimonials, loading: testimonialLoading, refetch } = useAdminTestimonials();
  const { addTestimonial, updateTestimonial, deleteTestimonial, toggleTestimonialActive, loading: actionLoading } = useManageTestimonials();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: '',
    review: '',
    rating: 5,
    active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      review: '',
      rating: 5,
      active: true,
      display_order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      review: testimonial.review,
      rating: testimonial.rating,
      active: testimonial.active,
      display_order: testimonial.display_order,
    });
    setEditingId(testimonial.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTestimonial(editingId, formData);
      } else {
        await addTestimonial(formData);
      }
      refetch();
      resetForm();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteTestimonial(id);
        refetch();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      await toggleTestimonialActive(testimonial.id, testimonial.active);
      refetch();
    } catch (error) {
      console.error('Error toggling testimonial status:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (testimonialLoading) {
    return <div className="flex items-center justify-center h-64">Loading testimonials...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Testimonials</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          disabled={actionLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reviewer Name*</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                placeholder="e.g., Sara Mohamed"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Review Text*</label>
              <textarea
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-[120px] resize-none"
                placeholder="Enter the testimonial review text..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Star Rating*</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                required
              >
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
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
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : editingId ? 'Update Testimonial' : 'Add Testimonial'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={actionLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Testimonials List */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Name (Initials)</th>
                <th className="text-left px-4 py-2 font-medium">Review</th>
                <th className="text-center px-4 py-2 font-medium">Rating</th>
                <th className="text-center px-4 py-2 font-medium">Order</th>
                <th className="text-center px-4 py-2 font-medium">Status</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">
                    No testimonials yet. Add your first one!
                  </td>
                </tr>
              ) : (
                testimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="border-b hover:bg-muted/50 transition">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {getInitials(testimonial.name)}
                        </div>
                        <span className="font-medium">{testimonial.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-muted-foreground max-w-xs truncate">{testimonial.review}</p>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-0.5 justify-center">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">{testimonial.display_order}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          testimonial.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {testimonial.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(testimonial)}
                        disabled={actionLoading}
                        title={testimonial.active ? 'Hide testimonial' : 'Show testimonial'}
                      >
                        {testimonial.active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(testimonial)}
                        disabled={actionLoading}
                        title="Edit testimonial"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(testimonial.id)}
                        disabled={actionLoading}
                        title="Delete testimonial"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

export default TestimonialsTab;
