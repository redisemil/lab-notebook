# Architecture

How the pieces of this notebook fit together. Read `CLAUDE.md` first for *why* the system is shaped this way; this file is *how*.

## Overview

The notebook is a Vite + React + MDX SPA with a single source of truth: the `src/topics/*.mdx` directory. Everything else — the index page, the sidebar tree, search, breadcrumbs — is *derived* from those files at build time. Adding a topic is dropping a file. There is no registry, no config, no database.

```
src/topics/*.mdx          (the only thing the author edits)
       │
       ▼
import.meta.glob          (Vite build-time discovery)
       │
       ▼
src/lib/topics.ts         (single source of truth: topics array + helpers)
       │
       ├─ findTopic(slug)         → TopicPage
       ├─ buildCategoryTree(...)  → Sidebar tree, Index "by category"
       └─ searchTopics(...)       → Sidebar search results
```

Every UI surface that lists topics consumes one of these helpers. None of them re-implement topic discovery.

## The topic metadata contract

Everything hinges on this shape. It's declared in `src/lib/topics.ts` and mirrored in `src/mdx.d.ts` so MDX files type-check.

```ts
type TopicMeta = {
  title: string;        // required
  date: string;         // required, "YYYY-MM-DD" — used for sorting
  status?: string;      // free-form: "in progress" / "clicked" / "abandoned" / etc.
  category?: string[];  // path: ["Computer Science", "Data Structures"]
                        //   defaults to ["Uncategorized"] if omitted
  tags?: string[];      // free-form, used by search
  excerpt?: string;     // optional one-liner shown on index cards
};
```

Where each field is consumed:

| Field | Sidebar | Index | TopicPage | Search |
|-------|---------|-------|-----------|--------|
| `title` | yes | yes | yes (h1) | yes (haystack) |
| `date` | — | yes | yes | — |
| `status` | — | yes | yes | — |
| `category` | yes (tree path) | yes (grouping) | yes (breadcrumb) | yes (haystack) |
| `tags` | — | yes | yes | yes (haystack) |
| `excerpt` | — | yes (recent) | — | yes (haystack) |

If you change `TopicMeta`, update both `src/lib/topics.ts` and `src/mdx.d.ts` together — they're separately authoritative.

## Component responsibilities

What each significant file does, and what it deliberately doesn't.

`src/lib/topics.ts` — single source of truth for topic discovery and indexing. Owns the `topics` array, the tree builder, the search function, and all topic-shaped types. Does **not** render anything, does **not** know about routing, does **not** know about React beyond the `ComponentType` type.

`src/components/Sidebar.tsx` — navigation. Owns search query state and per-category collapse state (persisted to `localStorage` under `notebook.collapsed-categories`). Consumes `topics`, `buildCategoryTree`, `searchTopics`. Does **not** know how topics are loaded or sorted.

`src/components/TopicPage.tsx` — renders one topic. Uses `useParams` to get the slug, calls `findTopic`, renders the MDX component inside a `prose`-styled article. Does **not** manage prose styling beyond applying the Tailwind class — `@tailwindcss/typography` does the actual work.

`src/components/Layout.tsx` — top-level layout shell. Composes Sidebar + main content area. Does **not** do anything else; it's the glue.

`src/components/Breadcrumb.tsx` — pure rendering of the category path. Stateless, takes a string array.

`src/pages/Index.tsx` — landing page. Shows the most recent topics, then a category-grouped list. Reuses `buildCategoryTree` so it can never disagree with the sidebar.

`src/components/widgets/*.tsx` — interactive components. Each is fully self-contained: owns its state, has no required props (or sensible defaults for all props), wraps its root in `not-prose` so the surrounding article styling doesn't bleed in.

`src/topics/*.mdx` — content. Each file has a `meta` export and the page body. Widgets are imported as named imports at the top and used as JSX inline.

`src/App.tsx` — router. Two routes: `/` and `/topics/:slug`. Trivial.

`src/main.tsx` — entry. Wraps in `BrowserRouter` and `StrictMode`.

## Extension recipes

Concrete steps for the most likely changes. Each lists exactly which files you'd touch.

### Adding a new metadata field

Example: a `difficulty` field with values like `"beginner" | "intermediate" | "advanced"`.

1. `src/lib/topics.ts` — add `difficulty?: string` to `TopicMeta`.
2. `src/mdx.d.ts` — add the same to the declared `meta` type.
3. Wherever you want to surface it (Sidebar, Index, TopicPage), read `topic.meta.difficulty`.
4. If you want it searchable, append it to the haystack inside `searchTopics`.

### Adding a new widget

1. Create `src/components/widgets/MyWidget.tsx`.
2. Build it as a self-contained React component with no required props. Manage all state internally with `useState`.
3. Wrap the root in `<div className="not-prose">…</div>`.
4. Style with Tailwind classes. Avoid CSS files.
5. In any MDX file: `import { MyWidget } from '../components/widgets/MyWidget';` then use `<MyWidget />` inline.

There is no widget registry. Widgets are imported per-MDX-file. A widget you don't import isn't bundled into pages that don't use it.

### Swapping the search implementation

All search lives inside `searchTopics(all: Topic[], query: string): Topic[]` in `src/lib/topics.ts`.

To swap to a real search engine (e.g., MiniSearch):

1. `npm install minisearch`
2. Replace the body of `searchTopics`. Build the index once at module load (or memoize in the function); query it on each call.
3. Keep the signature: input is `(topics, query)`, output is `Topic[]` ordered by relevance.

The Sidebar consumes the result and doesn't care how it was computed. No callers change.

### Adding a top-level category

Don't pre-create empty categories — write a topic that lives in it. Setting `category: ["Electronics", "Capacitors"]` on a new MDX file is the entire act of "creating" the Electronics → Capacitors branch. The sidebar updates automatically.

### Adding dark mode

1. `tailwind.config.js` — add `darkMode: 'class'` (or `'media'` for system-driven).
2. Add `dark:` variants throughout `Layout`, `Sidebar`, `TopicPage`, `Index`.
3. The widget SVGs use literal hex colors (`#0f172a`, `#7F77DD`, etc.). Replace those with Tailwind classes via wrapper `<g>` elements, or extract to CSS custom properties.
4. Add a toggle component if you want manual switching.

This is a real piece of work — the widget colors are the bulk of it. Defer until you have several widgets and the migration is worth doing once.

### Deploying

`npm run build` produces `dist/`. Deploy to any static host.

`BrowserRouter` requires the host to serve `index.html` for unknown routes (so `/topics/foo` works on a hard refresh). Vercel and Netlify do this automatically. GitHub Pages needs the `404.html` trick or switching to `HashRouter` in `src/main.tsx`.

### Adding a path alias

If `import { LinkedListDualView } from '../components/widgets/LinkedListDualView'` becomes painful (deep MDX directories, frequent widget moves):

1. `vite.config.ts` — add `resolve: { alias: { '@': path.resolve(__dirname, 'src') } }`.
2. `tsconfig.json` — add matching `paths` entry.
3. Replace relative imports with `import { LinkedListDualView } from '@/components/widgets/LinkedListDualView'`.

## Conventions

These are written in code but not narrated anywhere else.

- One topic = one MDX file. Don't fragment.
- One widget = one TSX file. Split when a widget grows past ~300 lines.
- All styling via Tailwind. No CSS modules, no styled-components, no global stylesheet beyond `index.css`.
- `prose` for topic content (applied by `TopicPage`). `not-prose` for widget roots.
- Topic slugs are derived from filenames (`linked-lists.mdx` → `/topics/linked-lists`). Use kebab-case filenames.
- Date format: `YYYY-MM-DD`. Strict — sorting compares as strings.
- Status vocabulary is free-form but in practice: `"in progress"`, `"clicked"`, `"abandoned"`, `"draft"`. Pick one and be consistent.
- Category arrays go from broadest to most specific: `["Computer Science", "Data Structures"]`, not the other way.
- Widget keys (`marker id`, etc.) need to be unique across the app — prefix with the widget name. `LinkedListDualView` uses `ll-arr-*` for its arrowheads.

## Surprises and gotchas

- `import.meta.glob` is build-time, not runtime. Adding a topic during `npm run dev` hot-reloads. In production, you must rebuild.
- Topics with no `category` fall under `"Uncategorized"`. This is intentional but invisible — it appears as a real branch only if there's a topic without a category.
- The `localStorage` collapse-state key is `notebook.collapsed-categories`. Renaming a category leaves an orphan entry behind (harmless, just noise).
- Default topic sort is descending by date string. Missing or malformed dates sort silently to weird places. If you start running into this, validate dates at load time.
- `prose` styles tables, code blocks, lists, blockquotes, etc. inside topics. Widgets use `not-prose` to opt out — but if a widget contains a stray `<p>` or `<table>` outside a `not-prose` boundary, it'll get prose styling. Rule: every widget's root has `not-prose`.
- React StrictMode double-invokes `useState` initializers in dev. Widgets that pick random initial state (like the linked-list widget) will produce two random initial states on mount in dev; the first is discarded. Production behaves normally.
- MDX files can import any React component, not just widgets. If you want shared inline components (callouts, asides, etc.), put them in `src/components/mdx/` and import them per file.

## Things deliberately not built

These are tempting but absent on purpose. Add them when you've felt the pain, not before.

- **Tag pages.** Listing all topics with a given tag would be a 30-line route. Not built because the sidebar tree + search already covers the navigation use cases.
- **Full-text search.** Substring matching across title/tags/category/excerpt is enough until you have many dozens of topics. Swap to MiniSearch via the recipe above when it stops being enough.
- **A widget framework.** Each widget is a hand-written component. There's no `<Slider>` primitive, no `<DualView>` template. Premature abstraction across 1–2 widgets produces the wrong abstraction.
- **A CMS or admin UI.** Authoring is "edit the MDX file." This is the right abstraction for a personal notebook with one author.
- **Static site generation.** Vite's SPA build is enough. SSG (with the `vite-plugin-ssg` family or a switch to Astro/Next) buys per-page HTML and SEO; defer until you actually have an SEO use case.
- **Mobile sidebar.** The sidebar is hidden below 768px. A hamburger toggle is cheap to add (one component, one piece of state) but not built yet.
- **Dark mode.** See recipe above. Defer until you have the widgets that need to be made theme-aware.
