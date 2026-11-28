# Effect UI component docs migration guide

Each component owns one `effect-ui/src/docs/pages/<slug>.ts` file and, when it
needs example-specific layout, one `effect-ui/src/docs/pages/<slug>.css` file.
Do not edit shared docs shell files while porting an assigned component batch.

Use the Foldkit reference in `src/docs/components/pages/<slug>/shared.ts` and
`src/docs/components/pages/<slug>/tailwind.ts`. The generated reference metadata
is in `effect-ui/src/docs/page-metadata.ts`. `effect-ui/src/docs/pages/accordion.ts`
is the pilot migration and shows the expected module shape.

Requirements for every assigned `<slug>`:

- Export `componentDocs = defineComponentDocs({ examples: [...] })`.
- Implement every example from `pageMetadata[slug].examples`, in the same order
  and with the exact same `title` strings. The shell pairs implementations by
  index and rejects mismatched titles.
- Preserve the reference example content, fixtures, copy, variants, states and
  interactions one-to-one. Do not substitute a simplified demo.
- Render every stateful or id-bearing component instance with a key/id derived
  from `context.idPrefix`; the first example renders once as the hero and once
  as its named section.
- Import styled components from `#components`. Those imports compile for
  Tailwind, StyleX and Pleat.
- Do not use Tailwind utility classes for layout in example-owned markup: they
  only exist in the Tailwind build. Use the shared `.ex-*` utilities, inline
  styles, or page-local classes in `<slug>.css`.
- `source` must show Effect UI code, never Foldkit code. It should be a
  complete or clearly runnable application/example using `@effect/ui` imports.
- Supply `usage` when the component's normal usage is not already obvious from
  the examples.
- Run `npm --prefix effect-ui ci` once if dependencies are missing, then
  `cd effect-ui && npx tsc --noEmit`. Fix every error in your files.
- If the Effect UI component lacks behavior needed for exact parity, implement
  the closest possible docs example and report the gap clearly; do not edit the
  component library unless the docs migration explicitly owns that fix.

Only files under `effect-ui/src/docs/pages/` belonging to your assigned slugs
may be added or changed. This keeps parallel migration branches merge-clean.
