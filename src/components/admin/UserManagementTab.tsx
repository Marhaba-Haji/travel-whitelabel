import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ShieldCheck, ShieldOff } from "lucide-react";

const MODULES = [
  { id: "overview", label: "Overview" },
  { id: "analytics", label: "Analytics" },
  { id: "enquiries", label: "Contact Enquiries" },
  { id: "voice-ai-leads", label: "Voice AI Leads" },
  { id: "itineraries", label: "Saved Itineraries" },
  { id: "newsletter", label: "Newsletter" },
  { id: "registrations", label: "Registrations" },
  { id: "payments", label: "Payments" },
  { id: "pricing", label: "Pricing & GST" },
  { id: "coupons", label: "Coupons" },
  { id: "blog", label: "Blog" },
  { id: "ai-agent", label: "AI Agent Config" },
  { id: "indexing-logs", label: "Indexing Logs" },
  { id: "settings", label: "Site Settings" },
];

type AccessLevel = "none" | "view" | "edit";

interface AdminUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

interface Permission {
  module: string;
  access_level: AccessLevel;
}

const UserManagementTab = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPermDialog, setShowPermDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<Record<string, AccessLevel>>({});
  const [saving, setSaving] = useState(false);

  // Add user form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPermissions, setNewPermissions] = useState<Record<string, AccessLevel>>(
    () => Object.fromEntries(MODULES.map((m) => [m.id, "none"]))
  );

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setUsers(data as AdminUser[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newName || !newEmail || !newPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      const perms = MODULES.map((m) => ({
        module: m.id,
        access_level: newPermissions[m.id] || "none",
      }));

      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: { email: newEmail, password: newPassword, full_name: newName, permissions: perms },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("User created successfully");
      setShowAddDialog(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewPermissions(Object.fromEntries(MODULES.map((m) => [m.id, "none"])));
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPermissions = async (user: AdminUser) => {
    setSelectedUser(user);
    // Fetch current permissions
    const { data } = await supabase
      .from("admin_user_permissions")
      .select("module, access_level")
      .eq("admin_user_id", user.id);

    const permMap: Record<string, AccessLevel> = Object.fromEntries(
      MODULES.map((m) => [m.id, "none"])
    );
    if (data) {
      data.forEach((p: any) => {
        permMap[p.module] = p.access_level as AccessLevel;
      });
    }
    setPermissions(permMap);
    setShowPermDialog(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      // Delete existing, re-insert
      await supabase
        .from("admin_user_permissions")
        .delete()
        .eq("admin_user_id", selectedUser.id);

      const rows = MODULES.map((m) => ({
        admin_user_id: selectedUser.id,
        module: m.id,
        access_level: permissions[m.id] || "none",
      }));

      const { error } = await supabase.from("admin_user_permissions").insert(rows);
      if (error) throw error;

      toast.success("Permissions updated");
      setShowPermDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    const { error } = await supabase
      .from("admin_users")
      .update({ is_active: !user.is_active })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(user.is_active ? "User deactivated" : "User activated");
      fetchUsers();
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Delete user "${user.full_name}"? This cannot be undone.`)) return;

    try {
      const { data, error } = await supabase.functions.invoke("delete-admin-user", {
        body: { user_id: user.user_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("User deleted");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const PermissionMatrix = ({
    perms,
    onChange,
  }: {
    perms: Record<string, AccessLevel>;
    onChange: (module: string, level: AccessLevel) => void;
  }) => (
    <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
      {MODULES.map((m) => (
        <div key={m.id} className="flex items-center justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
          <span className="text-sm text-foreground font-medium">{m.label}</span>
          <Select
            value={perms[m.id] || "none"}
            onValueChange={(v) => onChange(m.id, v as AccessLevel)}
          >
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Access</SelectItem>
              <SelectItem value="view">View Only</SelectItem>
              <SelectItem value="edit">Full Edit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground">Create and manage admin sub-users with granular permissions.</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Loading…
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No sub-users yet. Click "Add User" to create one.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-foreground">{u.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.is_active ? "default" : "secondary"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit Permissions"
                        onClick={() => handleEditPermissions(u)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={u.is_active ? "Deactivate" : "Activate"}
                        onClick={() => handleToggleActive(u)}
                      >
                        {u.is_active ? (
                          <ShieldOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete User"
                        onClick={() => handleDeleteUser(u)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Admin User</DialogTitle>
            <DialogDescription>
              Create a sub-user with a temporary password. They'll be required to change it on first login.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Initial Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>

            <div className="space-y-2">
              <Label>Module Permissions</Label>
              <PermissionMatrix
                perms={newPermissions}
                onChange={(m, l) => setNewPermissions((p) => ({ ...p, [m]: l }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={saving}>
              {saving ? "Creating…" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={showPermDialog} onOpenChange={setShowPermDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Permissions — {selectedUser?.full_name}</DialogTitle>
            <DialogDescription>
              Set access levels for each admin module.
            </DialogDescription>
          </DialogHeader>

          <PermissionMatrix
            perms={permissions}
            onChange={(m, l) => setPermissions((p) => ({ ...p, [m]: l }))}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions} disabled={saving}>
              {saving ? "Saving…" : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementTab;
