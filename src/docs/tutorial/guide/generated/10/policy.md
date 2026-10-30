# Product policy

What the lint holds, in three layers. Each layer may only narrow the one before it.

| Layer                 | Where                                                                | Who changes it                                                                                       | Example                                                                                            |
| --------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| crease's strict rules | `@creaseui/lint`, configured in `eslint.config.js` with `creaseui()` | Nobody in this repository. Turning a rule off is a design-system change that `npm run scope` reports | Raw elements, appearance classes and implementation imports are rejected in feature code           |
| Allowed values        | `crease.lock.json`, the `variants` of each export                    | A design-system change, recorded in `design-system/changes/`                                         | `button` takes `intent: primary, secondary`; `text` takes sizes `xsm, sm`; `badge` takes `outline` |
| Product rules         | `policy/product-policy.js`, imported by `eslint.config.js`           | A design-system change; each rule names its decision                                                 | Feature code may not import `item`, `dropdown-menu`, `dialog` or `command` (D3, D7, D8, D9)        |

## Narrowing and replacing

- **Narrowing** removes choices without touching a component. `text` keeps its eleven sizes in `src/ui/text.ts`; the receipt allows two. A later need for a third is a one-line receipt change, reviewed like any other.
- **Replacing** changes what a choice looks like, in the component source. `badge`'s `outline` look is the product's label look (decision D2), with a comment at the variant.

## Limits

- The receipt narrows string values only. A number (`heading`'s `level`, `stack`'s `gap`) is not checked, so those stay open.
- `npm run scope` also follows the modules `eslint.config.js` imports: removing a rule from `policy/product-policy.js` is reported as an enforcement change, like an edit to the configuration itself.
