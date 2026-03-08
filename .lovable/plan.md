

## Plan: Sober Down Color Loudness by 15%

The aurora color palette currently uses high saturation values that make the design feel flashy. The fix is to reduce saturation across all accent/aurora colors by ~15% in `src/index.css`.

### Changes to `src/index.css`

**Aurora accent colors** — reduce saturation by 15%:
- `--aurora-purple`: `270 70% 58%` → `270 60% 58%`
- `--aurora-blue`: `210 100% 50%` → `210 85% 50%`
- `--aurora-pink`: `320 90% 60%` → `320 76% 60%`
- `--aurora-teal`: `175 70% 45%` → `175 60% 45%`

**Primary/accent/ring in :root** — reduce saturation:
- `--primary`: `270 70% 58%` → `270 60% 58%`
- `--accent`: `210 100% 50%` → `210 85% 50%`
- `--ring`: `270 70% 58%` → `270 60% 58%`
- `--gold`: `320 90% 60%` → `320 76% 60%`
- `--sidebar-primary/ring`: same reduction

**Same treatment for `.light` and `.dark` theme overrides** — reduce primary/accent/ring saturation by the same 15% ratio.

**Gradient utilities** — reduce opacity values in `aurora-gradient` and `aurora-glow`:
- `aurora-gradient` opacities: `0.22 → 0.18`, `0.15 → 0.12`
- `aurora-glow` shadow: `0.2 → 0.15`

Single file edit: `src/index.css`. No structural or layout changes.

