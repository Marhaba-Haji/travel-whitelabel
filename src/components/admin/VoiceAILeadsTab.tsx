import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Eye, Mic, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type VoiceAILead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at: string | null;
};

type EditState = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const VoiceAILeadsTab = () => {
  const queryClient = useQueryClient();
  const [viewLead, setViewLead] = useState<VoiceAILead | null>(null);
  const [editLead, setEditLead] = useState<VoiceAILead | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ name: "", email: "", phone: "", notes: "" });
  const [deleteLead, setDeleteLead] = useState<VoiceAILead | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-voice-ai-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_ai_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as VoiceAILead[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: EditState }) => {
      const { error } = await supabase
        .from("voice_ai_leads")
        .update({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || null,
          notes: values.notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead updated");
      queryClient.invalidateQueries({ queryKey: ["admin-voice-ai-leads"] });
      setEditLead(null);
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update lead"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("voice_ai_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lead deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-voice-ai-leads"] });
      setDeleteLead(null);
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete lead"),
  });

  const openEdit = (lead: VoiceAILead) => {
    setEditForm({
      name: lead.name ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      notes: lead.notes ?? "",
    });
    setEditLead(lead);
  };

  const handleSave = () => {
    if (!editLead) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    updateMutation.mutate({ id: editLead.id, values: editForm });
  };

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone ?? "—"}</TableCell>
                <TableCell className="max-w-[240px]">
                  {row.notes ? (
                    <button
                      className="text-left truncate block w-full hover:text-primary"
                      onClick={() => setViewLead(row)}
                    >
                      {row.notes}
                    </button>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1">
                    <Mic className="h-3 w-3" />
                    {row.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(row.created_at), "dd MMM yyyy, HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewLead(row)}
                      aria-label="View lead"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(row)}
                      aria-label="Edit lead"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteLead(row)}
                      aria-label="Delete lead"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!data?.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No voice AI leads yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View dialog */}
      <Dialog open={!!viewLead} onOpenChange={(open) => !open && setViewLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewLead?.name}</DialogTitle>
            <DialogDescription>{viewLead?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Phone: </span>
              {viewLead?.phone ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Source: </span>
              {viewLead?.source}
            </div>
            <div>
              <span className="text-muted-foreground">Captured: </span>
              {viewLead && format(new Date(viewLead.created_at), "dd MMM yyyy, HH:mm")}
            </div>
            <div className="pt-2 border-t">
              <p className="text-muted-foreground mb-1">Notes</p>
              <p className="whitespace-pre-wrap">{viewLead?.notes ?? "—"}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editLead} onOpenChange={(open) => !open && setEditLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit lead</DialogTitle>
            <DialogDescription>Update lead details. Changes are saved to the database.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="va-name">Name</Label>
              <Input
                id="va-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="va-email">Email</Label>
              <Input
                id="va-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="va-phone">Phone</Label>
              <Input
                id="va-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="va-notes">Notes</Label>
              <Textarea
                id="va-notes"
                rows={5}
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLead(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteLead} onOpenChange={(open) => !open && setDeleteLead(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteLead?.name} ({deleteLead?.email}) from the database.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLead && deleteMutation.mutate(deleteLead.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VoiceAILeadsTab;
