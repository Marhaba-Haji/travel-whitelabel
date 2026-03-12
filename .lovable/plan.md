

## Plan: Admin User Management System with Granular Module Permissions

### Overview

Build a complete sub-user management system where the superadmin can create users, assign per-module access levels (none / view / edit), and manage (edit, revoke, delete) those users. Sub-users log in via the same `/admin/login` page and see only the modules they have access to.

### Database Changes (2 new tables, 1 edge function)

**1. `admin_users` table** — stores sub-user metadata:
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users, unique) — the Supabase auth user
- `full_name` (text)
- `email` (text)
- `is_active` (boolean, default true) — for revoking access
- `must_change_password` (boolean, default true) — force password change on first login
- `created_at`, `updated_at`

RLS: superadmin full access; authenticated users can SELECT their own row.

**2. `admin_user_permissions` table** — per-module access:
- `id` (uuid, PK)
- `admin_user_id` (uuid, FK → admin_users)
- `module` (text) — matches tab IDs: overview, analytics, enquiries, etc.
- `access_level` (text) — `none`, `view`, `edit`
- Unique constraint on (admin_user_id, module)

RLS: superadmin full access; authenticated users can SELECT their own permissions.

**3. `create-admin-user` edge function** — securely creates the Supabase auth user (using service role key) with the provided email + password, inserts into `admin_users`, adds `admin` role to `user_roles`, and inserts default permissions.

### Auth Changes

**`AuthContext.tsx`**:
- Add `isAdmin` state (check for `admin` role in `user_roles`)
- Add `permissions` map (module → access_level) fetched from `admin_user_permissions`
- Add `mustChangePassword` flag from `admin_users`
- Expose a helper `hasAccess(module, level)` function

**`ProtectedRoute.tsx`**:
- Allow access if `isSuperadmin` OR `isAdmin` (with active status)
- If `mustChangePassword`, redirect to a password change screen

### New Components

**1. `UserManagementTab.tsx`** — new admin tab (superadmin-only):
- Table listing all sub-users with name, email, status, created date
- Actions: Edit permissions, toggle active/inactive, delete user
- "Add User" dialog with name, email, initial password fields
- Per-module permission matrix (checkboxes/selects for each of the 14 modules with none/view/edit)

**2. `ChangePasswordPage.tsx`** — shown on first login:
- Simple form: new password + confirm
- Calls `supabase.auth.updateUser({ password })` then sets `must_change_password = false`

### AdminLayout Changes

- Add "User Management" tab (visible only to superadmin)
- Filter sidebar tabs based on user's permissions — hide modules with `none` access
- Pass `accessLevel` to tab components so they can disable editing for `view`-only users

### Admin.tsx Changes

- Add `UserManagementTab` to tab components map
- Import permissions from AuthContext to conditionally render tabs

### Security

- User creation happens server-side via edge function with service role key — client never sees admin credentials
- Module access enforced both in UI (sidebar filtering) and at data level (RLS policies check role)
- Password change uses Supabase's built-in `updateUser` — secure and standard
- Superadmin remains the only role that can manage users and permissions

### Files to Create/Modify

| File | Action |
|------|--------|
| Migration SQL | Create `admin_users` + `admin_user_permissions` tables |
| `supabase/functions/create-admin-user/index.ts` | New edge function |
| `supabase/config.toml` | Add function config |
| `src/contexts/AuthContext.tsx` | Add admin role, permissions, mustChangePassword |
| `src/components/admin/ProtectedRoute.tsx` | Allow admin role access |
| `src/components/admin/UserManagementTab.tsx` | New component |
| `src/components/admin/ChangePasswordPrompt.tsx` | New component |
| `src/components/admin/AdminLayout.tsx` | Add tab, filter by permissions |
| `src/pages/Admin.tsx` | Register new tab |

