# v1.2.2 cleanup manifest

Scope: recoverable removal of proven unreferenced scaffold only.

## Evidence boundary

Repository-wide import and text-reference searches found no active import from `components/ui/`, `hooks/use-mobile.jsx`, `hooks/use-toast.js`, `lib/utils.js`, or `components.json`. Every reference among those paths was internal to the scaffold. The active storefront uses purpose-built `cp-*` components and classes. Full deterministic tests, lint, dependency audit, build, route checks, and screenshot checks remain mandatory after deletion.

## Deleted paths

- `components/ui/`: 48 generic shadcn/Radix scaffold components;
- `hooks/use-mobile.jsx` and `hooks/use-toast.js`: scaffold-only hooks;
- `lib/utils.js`: scaffold-only `cn` helper;
- `components.json`: unused shadcn generator configuration;
- `tailwind.config.js`: dormant utility/scaffold theme after all active customer classes moved to canonical `cp-*` CSS.

No files under `public/`, `fixtures/release-records/`, `reports/`, `test_reports/`, or the product/release architecture were deleted.

## Removed direct dependencies

The dependency cleanup removes the unused Radix UI family plus `@hookform/resolvers`, `@tanstack/react-table`, `class-variance-authority`, `clsx`, `cmdk`, `date-fns`, `embla-carousel-react`, `framer-motion`, `input-otp`, `next-themes`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `recharts`, `sonner`, `tailwind-merge`, `tailwindcss`, `tailwindcss-animate`, `vaul`, and `zod`.

Runtime dependencies retained are `next`, `react`, `react-dom`, `lucide-react`, and `server-only`. PostCSS and Autoprefixer remain as build-time CSS transforms; neither is a design-value authority.

## Recovery

All deletions are recoverable from Git. Before this candidate is merged, restore the original scaffold and dependency boundary with:

```sh
git restore --source=e3dc7c2 -- components.json components/ui hooks/use-mobile.jsx hooks/use-toast.js lib/utils.js tailwind.config.js package.json yarn.lock postcss.config.js
```

After the v1.2.2 commit, use that commit's first parent instead of `e3dc7c2` if restoring relative to history. Re-run frozen install, lint, tests, audit, build, and visual checks after any partial restoration.
