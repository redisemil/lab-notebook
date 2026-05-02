# CLAUDE.md

What this notebook is, how pages are formatted, and the discipline rules. Read this first.

For the technical architecture — data flow, component responsibilities, extension recipes — see [ARCHITECTURE.md](./ARCHITECTURE.md). For practical setup (running the project, adding files), see [README.md](./README.md).

## What this is

A personal knowledge reference. The author is studying a wide set of engineering subjects — computer science, electronics, embedded systems, math, physics — and writing down each concept *once it has clicked* in the form most useful to themselves later.

It is **not**:

- A blog. There is no audience.
- A learning journal. Pages are not "writing in public" or first-person narrative. There is no confessional voice and no "what I came in confused about" section.
- A textbook. Pages don't try to cover topics; they capture the minimum that lets future-self re-derive everything else about a topic.
- A curriculum. Pages get written in the order topics happen to click, not in any planned sequence.

The closest references in spirit: Andy Matuschak's evergreen notes, working engineers' personal wikis, dense reference cards. The notebook exists so future-self can reach for the right mental model in seconds.

## The page format

Each topic captures the smallest set of things that, once held in mind, let everything else about the topic be re-derived.

1. **Mental model** — the picture or principle the rest of the page hangs off. The most important section. A paragraph or two, sometimes accompanied by a widget that makes it visceral. If a topic's mental model can't be articulated in three to five sentences, the topic isn't ready to be written yet.

2. **Properties / consequences** — costs, behaviors, edge cases. Each one *derived* from the mental model rather than listed as facts to memorize.

3. **When to use it** — applications, scope, when *not* to use it. Honest, narrower than textbook hedging.

4. **Open questions** *(optional)* — things to investigate. This is the section that surfaces the next page to write.

5. **References** — books, talks, papers, articles. A curated reading list, not a literature review.

A common wrong picture is occasionally worth naming briefly inside the mental model section if the right picture is specifically defined against it. Don't make it its own section, and don't include it for completeness.

## Discipline rules

These keep the notebook from drifting into a blog or a textbook.

**Derive, don't list.** Properties of a topic should fall out of the mental model. If a page has facts that can only be memorized, either the mental model is incomplete or the topic was written before it was understood.

**The widget is downstream of the model.** A widget can only exist on a page where the mental model is already articulated in prose. The widget illustrates or tests the model — it does not substitute for it. AI-generated widgets make this rule more important, not less, because they're cheap to spawn.

**One click-moment per widget.** A widget makes one specific insight visceral. Multiple insights mean multiple widgets. A widget that "covers" a topic is a textbook chapter pretending to be interactive.

**Predict before you act.** A widget that just shows numbers changing as you slide a slider builds no intuition. A widget that asks for a prediction before revealing builds a lot. The shape of the interaction matters more than the content.

**Pages get written when the topic clicks, not when it gets encountered.** No pages on topics that are still confusing. The page captures understanding; if there's no understanding to capture, there's no page yet.

**No filler.** No "introduction" paragraphs that restate the title. No "conclusion" paragraphs that summarize what just got said. The reader is future-self, who doesn't need warm-up or recap.

**Voice: tight and declarative.** *"Nodes scattered at unrelated memory addresses, connected by pointers."* Not *"A linked list is a fundamental data structure consisting of a sequence of elements..."* — that's textbook voice, which AI defaults to and which adds nothing. No first-person narration. No "let's explore." No "as we will see."

## What to avoid

**The meta-tool trap.** Don't spend hours on infrastructure when there's a topic to write. New abstractions should be earned by repeated pain, not anticipated.

**Slop widgets.** AI will happily produce a slider that changes a number. That's a calculator, not a widget. If a generated widget doesn't force prediction or make a structural property visible, throw it away and re-prompt.

**Generation outpacing understanding.** It's possible to crank out widgets faster than the underlying concepts get understood. The rule "the widget is downstream of the model" exists for this.

**Empty buckets.** The sidebar shows categories. Categories appear when there are topics in them. Don't pre-create empty categories or stub pages to make the tree look full.

**Comprehensive coverage as a goal.** This notebook will never cover any subject "comprehensively." Coverage is the wrong metric. The right metric is whether each individual page lets future-self reconstruct the topic from scratch.

**Drift toward textbook prose.** This is the most common failure mode when generating or editing content. Symptoms: definitional opening sentences, hedging language ("typically," "in general"), three-syllable Latin words where one would do, "as we have seen" callbacks. Cut all of it.

## Stack notes for AI assistants

If you're an AI working in this project, the most important things:

- Topics live in `src/topics/*.mdx`. Each exports `meta` with `title`, `date`, `status`, `category` (path array), `tags`, `excerpt`. Use existing topics as the canonical voice and structure template.
- Widgets are React components in `src/components/widgets/`. Imported as named imports at the top of MDX files, used as JSX inline. Wrap widget roots in `not-prose`.
- When asked to write a page, ask the author what the mental model actually is in their own words. If they can't articulate it in a few sentences, the page isn't ready. Do not fill in plausible-sounding mental models from training data.
- When generating a widget, default to interactions where the user predicts before revealing. If asked generically for "an interactive widget for X," push back and ask which specific insight the widget should make visceral. Generic widgets are slop widgets.
- Match the voice of existing pages. Tight, declarative, no first-person narration, no filler, no textbook framing. If an edit pulls a page toward textbook voice, revert.
- For technical layout (where data flows, what each component is for, how to extend), consult `ARCHITECTURE.md` rather than re-deriving from the source.
