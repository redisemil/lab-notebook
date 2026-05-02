# Notebook

A personal lab notebook for understanding things, with interactive widgets per topic.
Stack: Vite + React + MDX + Tailwind + TypeScript.

**Read [CLAUDE.md](./CLAUDE.md) before extending the project.** It's the philosophy behind the notebook — the format of a page, the discipline rules, what to avoid. The infrastructure choices below only make sense in that context.

For the technical architecture — data flow, component responsibilities, extension recipes — see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Run

```sh
npm install
npm run dev
```

Open http://localhost:5173.

To build:

```sh
npm run build
npm run preview
```

## Project structure

```
src/
  topics/                 one MDX file per topic. drop a new file, it appears.
    linked-lists.mdx
  components/
    Layout.tsx            header + container shared by every page
    TopicPage.tsx         renders an MDX topic with prose styling
    widgets/              interactive react components, imported into MDX
      LinkedListDualView.tsx
  pages/
    Index.tsx             auto-generated index of all topics
  lib/
    topics.ts             auto-discovers topics via import.meta.glob
  App.tsx                 router (/ and /topics/:slug)
  main.tsx                entry point
  index.css               tailwind directives
  mdx.d.ts                type declarations for *.mdx imports
```

## Adding a new topic

1. Create `src/topics/my-topic.mdx`.

2. At the very top of the file, add the metadata export (this is what powers the index, the sidebar tree, and search):

   ```mdx
   export const meta = {
     title: "My topic, but I actually understand it now",
     date: "2026-05-15",
     status: "in progress",                          // "clicked" / "in progress" / "abandoned"
     category: ["Electronics", "Analog"],            // path used by the sidebar tree
     tags: ["passive-components", "filters"],        // free-form tags for search
     excerpt: "One-sentence hook for the index card."
   };

   # My topic title

   ## What I came in confused about
   ...
   ```

3. Save. Vite picks it up automatically — refresh the index. Categories appear in the sidebar as soon as a topic uses them; empty categories don't appear at all (intentional — see CLAUDE.md).

## Adding a widget

1. Create `src/components/widgets/MyWidget.tsx`. It can be anything — an SVG explorer, a slider-driven calculation, an embedded simulator. Keep it self-contained.

2. Import and use it in any MDX file:

   ```mdx
   import { MyWidget } from '../components/widgets/MyWidget';

   ...

   <MyWidget />
   ```

The convention: a widget is a normal React component. State stays inside the component. Tailwind classes work for styling. Wrap your widget root in `not-prose` so it isn't styled by the surrounding `prose` container.

## The page format

Each topic page follows the lab-notebook structure:

- **What I came in confused about** — the friction in your own voice. The honest entry point.
- **The wrong mental model** — what you had before you understood (named explicitly).
- **The right mental model** — usually with the widget that makes it click.
- **Derived consequences** — costs, behaviors, properties that fall out of the right model.
- **When you actually want this** — honest answers, not textbook hedge-everything answers.
- **What I still don't get** — open questions. Each becomes a future page.
- **References** — links to deeper sources, including books, talks, and articles.

The widget is downstream of the writing. Don't generate widgets for pages you haven't written yet.

## Conventions

- One topic = one MDX file. Don't fragment a topic across files.
- One widget = one TSX file. If a widget grows past ~300 lines, split it.
- Use Tailwind classes. Don't add CSS files unless you have a reason you can name.
- Use `prose` styling for topic content (already wired up in `TopicPage`). Use `not-prose` for widgets.
