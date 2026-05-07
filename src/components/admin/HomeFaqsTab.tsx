import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminHomeFaqs } from '@/hooks/useAdminHomeFaqs';
import { useManageHomeFaqs } from '@/hooks/useManageHomeFaqs';
import { HomeFaq, HomeFaqFormData } from '@/types/faqs';

const HomeFaqsTab = () => {
  const { faqs, loading: faqsLoading, refetch } = useAdminHomeFaqs();
  const { addFaq, updateFaq, deleteFaq, toggleFaqActive, loading: actionLoading } = useManageHomeFaqs();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<HomeFaqFormData>({
    question: '',
    answer: '',
    active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      active: true,
      display_order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (faq: HomeFaq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      active: faq.active,
      display_order: faq.display_order,
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateFaq(editingId, formData);
      } else {
        await addFaq(formData);
      }
      refetch();
      resetForm();
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteFaq(id);
        refetch();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
      }
    }
  };

  const handleToggleActive = async (faq: HomeFaq) => {
    try {
      await toggleFaqActive(faq.id, faq.active);
      refetch();
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
    }
  };

  if (faqsLoading) {
    return <div className="flex items-center justify-center h-64">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Home FAQs</h2>
        <Button onClick={() => setShowForm(!showForm)} disabled={actionLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit FAQ' : 'Add New FAQ'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question*</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                placeholder="Enter the FAQ question"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Answer*</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-[140px] resize-none"
                placeholder="Enter the FAQ answer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
                id="faq-active"
              />
              <label htmlFor="faq-active" className="text-sm font-medium cursor-pointer">
                Active (Display on homepage)
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : editingId ? 'Update FAQ' : 'Add FAQ'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} disabled={actionLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Question</th>
                <th className="text-left px-4 py-2 font-medium">Answer</th>
                <th className="text-center px-4 py-2 font-medium">Order</th>
                <th className="text-center px-4 py-2 font-medium">Status</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                    No FAQs found. Add your first FAQ entry.
                  </td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq.id} className="border-b hover:bg-muted/50 transition">
                    <td className="px-4 py-2 font-medium max-w-xs truncate">{faq.question}</td>
                    <td className="px-4 py-2 text-muted-foreground max-w-md truncate">{faq.answer}</td>
                    <td className="px-4 py-2 text-center">{faq.display_order}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          faq.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {faq.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(faq)}
                        disabled={actionLoading}
                        title={faq.active ? 'Hide FAQ' : 'Show FAQ'}
                      >
                        {faq.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(faq)}
                        disabled={actionLoading}
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(faq.id)}
                        disabled={actionLoading}
                        title="Delete FAQ"
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

export default HomeFaqsTab;
