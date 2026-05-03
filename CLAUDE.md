# CLAUDE.md

For the technical architecture — data flow, component responsibilities, extension recipes — see [ARCHITECTURE.md](./ARCHITECTURE.md). For practical setup (running the project, adding files), see [README.md](./README.md).

## What this is

A personal notebook for understanding engineering subjects — computer science, electronics, embedded systems, math, physics. Each page exists to make a topic click and stay clicked. Whatever form achieves that is the right form.

## Stack notes for AI assistants

- Topics live in `src/topics/*.mdx`. Each exports `meta` with `title`, `date`, `status`, `category` (path array), `tags`, `excerpt`.
- Widgets are React components in `src/components/widgets/`. Imported as named imports at the top of MDX files, used as JSX inline. Wrap widget roots in `not-prose`.
- Avoid textbook voice — AI defaults to it and it adds nothing. Match the voice of existing pages.
- For technical layout (where data flows, what each component is for, how to extend), consult `ARCHITECTURE.md` rather than re-deriving from the source.
