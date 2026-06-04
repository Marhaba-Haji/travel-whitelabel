## Goal
Add an admin-managed "Scripts & Tracking" section so superadmins can inject third-party scripts/pixels/tags (Google Analytics, GTM, Meta Pixel, LinkedIn, Hotjar, custom HTML) into the site's `<head>` or `<body>` without code changes.

## Database
New table `public.tracking_scripts`:
- `id` uuid PK
- `name` text (e.g. "Google Analytics 4")
- `provider` text (free-text label: google, facebook, linkedin, hotjar, custom, etc.)
- `placement` text — enum-like: `head` | `body_start` | `body_end`
- `code` text — raw HTML snippet (full `<script>...</script>` or `<noscript><img/></noscript>`)
- `is_enabled` boolean default true
- `load_strategy` text — `all_pages` | `exclude_admin` (default `exclude_admin`, so tracking never fires inside /admin)
- `notes` text nullable
- `sort_order` int default 0
- `created_at`, `updated_at` timestamps

GRANTs: `SELECT` to `anon` + `authenticated` (needed so the public site can read enabled scripts); full CRUD to `authenticated` gated by RLS; `ALL` to `service_role`.

RLS:
- Public SELECT: only rows where `is_enabled = true` (used by site loader).
- INSERT/UPDATE/DELETE: only superadmin OR users with `has_admin_edit(auth.uid(), 'scripts')`.

## Admin UI
New tab `Scripts & Tracking` in `AdminLayout.tsx` (icon: `Code2`), wired into `Admin.tsx` `tabComponents`.

New `src/components/admin/ScriptsTab.tsx`:
- List of scripts grouped by placement (Head / Body start / Body end).
- Add/Edit dialog with fields: name, provider (select with presets + "Custom"), placement, load strategy, code (Textarea, monospace), enabled toggle, notes.
- Per-row: enable/disable switch, edit, delete, drag-to-reorder (or sort_order arrows).
- Helper hints per provider (e.g. "Paste the full GA4 snippet from Google Tag Manager").
- Warning banner: scripts run on the live site — only paste trusted code.

Permissions: visible to superadmin and sub-admins with `scripts` module access (added to the 14-module RBAC list in `AdminLayout.tsx` filter).

## Site-side injection
New hook `src/hooks/useTrackingScripts.ts` — fetches enabled scripts once, cached via react-query.

New `src/components/TrackingScriptsInjector.tsx`:
- Mounted once in `App.tsx` (outside `<Routes>`).
- Reads current pathname; skips rendering if `load_strategy = exclude_admin` and path starts with `/admin`.
- Uses `react-helmet-async` for `head` placement (injects raw `<script>`/`<noscript>` via Helmet children parsing).
- For `body_start` / `body_end`: imperatively appends DOM nodes (parsed from the HTML string) to `document.body` on mount, removes on unmount/change. This is required because React can't render arbitrary `<script>` tags reliably; we parse the snippet into real DOM nodes so inline scripts execute.

Edge case handled: re-execution on script content change → remove previous nodes (tracked by data attribute `data-tracking-id={row.id}`) before re-injecting.

## Files touched
- New migration: `tracking_scripts` table + GRANTs + RLS + trigger for `updated_at`.
- New: `src/components/admin/ScriptsTab.tsx`, `src/hooks/useTrackingScripts.ts`, `src/components/TrackingScriptsInjector.tsx`.
- Edit: `src/components/admin/AdminLayout.tsx` (add tab), `src/pages/Admin.tsx` (register component), `src/App.tsx` (mount injector).
- Optional: extend sub-user RBAC module list to include `scripts`.

## Security notes
- Raw HTML injection is intentional (that's the feature) but write access is strictly RLS-gated to superadmin/edit-permission users.
- `/admin` is excluded by default so tracking pixels don't pollute admin sessions.
- Saved memory: superadmin restricted to `harab.business@gmail.com` — respected via existing `has_role`/`has_admin_edit`.
