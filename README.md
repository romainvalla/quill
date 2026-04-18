# Quill

Local-first Markdown editor in the browser: split, edit-only, or preview-only layouts, a live preview, and exports—built with [Next.js](https://nextjs.org).

[Next.js](https://nextjs.org) · [React](https://react.dev) · [TypeScript](https://www.typescriptlang.org)

## Features

- **Layouts** — Resizable split view, full-width editor, or full-width preview ([react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)).
- **Preview** — GitHub-flavored Markdown via [marked](https://marked.js.org/), HTML sanitized with [DOMPurify](https://github.com/cure53/DOMPurify).
- **Toolbar** — Formatting actions and keyboard shortcuts (e.g. bold / italic / link) while the textarea is focused.
- **Export** — Download `.md`, standalone `.html`, or `.txt`; copy rendered HTML to the clipboard.
- **Persistence** — Debounced save to `localStorage` (`quill.markdown.v1`); view mode stored as `quill.view.v1`.
- **Theme** — Light / dark toggle with [next-themes](https://github.com/pacocoursey/next-themes); toasts via [Sonner](https://sonner.emilkowal.ski/).
- **Analytics** — [Vercel Web Analytics](https://vercel.com/docs/analytics) loads in production only (`NODE_ENV === "production"`).

## Stack

- **Framework** — Next.js 16 (App Router), React 19
- **Styling** — Tailwind CSS v4, CSS variables, [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css)
- **UI** — [shadcn/ui](https://ui.shadcn.com) registry, **base-maia** style, [Base UI](https://base-ui.com/) primitives (`@base-ui/react`), [Hugeicons](https://hugeicons.com/) in generated components; [Lucide](https://lucide.dev/) icons in the editor toolbar

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The editor is the home page.

Other useful scripts:

```bash
npm run build   # production build
npm run start   # run production server
npm run lint    # ESLint
```

You can use pnpm or yarn instead of npm if you prefer; this repo ships with a `package-lock.json` for npm.

## Project layout


| Path                                       | Role                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `[app/](app/)`                             | App Router routes, `[layout.tsx](app/layout.tsx)`, `[globals.css](app/globals.css)` |
| `[components/editor/](components/editor/)` | Editor shell, panes, toolbar, status bar                                            |
| `[components/ui/](components/ui/)`         | shadcn-generated primitives (button, tooltip, menus, etc.)                          |
| `[lib/markdown/](lib/markdown/)`           | Default content, formatting helpers, export, `marked` + DOMPurify pipeline          |


## Deploy

Deploy anywhere that supports Next.js. [Vercel](https://vercel.com) is a natural fit and matches the built-in Analytics wiring. See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.