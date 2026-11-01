# Working on Crease Tasks

Crease Tasks is a Foldkit app built on crease/ui components (Tailwind). Before writing UI, read `design-system/principles.md` (the product decisions) and `design-system/boundaries.md` (who may use what).

## Two kinds of change

**A feature change** adds or changes behaviour in `src/features`, `src/view.ts`, `src/model.ts` or `src/domain.ts`. It composes the public exports of `src/ui` and passes them placement only (margin, width, alignment). It does not touch `src/ui`, `src/lib`, `src/theme`, `crease.lock.json`, `eslint.config.js` or the scripts in `package.json`.

**A design-system change** edits components, the theme, the receipt or the lint configuration. It names the decision it implements, updates `crease.lock.json` in the same commit when a component's variants change, and adds a record in `design-system/changes/`.

If a feature seems to need a class the lint rejects, it is a design-system question: stop and describe the need instead of working around the rule.

## Checks

```sh
npm run check   # typecheck, lint (ratchet), doctor, CSS policy
npm run scope   # enforcement inputs changed in the working tree; must be empty for a feature change
```
