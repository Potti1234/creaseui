export type LintRuleGroupId =
  | 'application'
  | 'component-authoring'
  | 'defensive'
  | 'cli'

export type LintRuleSummary = Readonly<{
  id: string
  title: string
  summary: string
}>

export type LintRuleGroup = Readonly<{
  id: LintRuleGroupId
  label: string
  description: string
  rules: ReadonlyArray<LintRuleSummary>
}>

export const LINT_RULE_GROUPS: ReadonlyArray<LintRuleGroup> = [
  {
    id: 'application',
    label: 'Application rules',
    description:
      'Strict rules for app views (crease-default-v1): build UI only from installed Crease components.',
    rules: [
      {
        id: 'no-raw-controls',
        title: 'No raw controls',
        summary:
          'Native buttons, inputs and selects built with h.* instead of the installed control.',
      },
      {
        id: 'no-raw-composition',
        title: 'No raw composition',
        summary:
          'Raw layout, headings, text, links, lists and tables in application views.',
      },
      {
        id: 'no-unapproved-renderer',
        title: 'No unapproved renderer',
        summary:
          'Headless @foldkit/ui views, implementation-only exports and other render libraries.',
      },
      {
        id: 'no-application-styles',
        title: 'No application styles',
        summary:
          'h.Class, h.Style, class helpers, renderer authoring APIs and DOM style mutation in app code.',
      },
      {
        id: 'component-contract',
        title: 'Component contract',
        summary:
          'Visual class overrides, height/size overrides, unknown variants and non-placement layoutStyle.',
      },
      {
        id: 'no-unverifiable-ui',
        title: 'No unverifiable UI',
        summary:
          'UI the type checker cannot verify: computed builders, casts, untyped linting.',
      },
      {
        id: 'form-association',
        title: 'Form association',
        summary:
          "A Button's form: reference names a Form id its own view never renders.",
      },
      {
        id: 'no-native-glyphs',
        title: 'No native glyphs',
        summary:
          'Native arrow, symbol and emoji characters in UI text — use the Icon component instead.',
      },
    ],
  },
  {
    id: 'component-authoring',
    label: 'Component-author rules',
    description:
      'Rules for the design-system source itself: keep component styling static, tokenized and inside named variants.',
    rules: [
      {
        id: 'no-component-restyle',
        title: 'No component restyle',
        summary:
          'Appearance passed into a component instead of a named variant.',
      },
      {
        id: 'require-static-class',
        title: 'Require static class',
        summary: 'Class values that lint cannot fully inspect.',
      },
      {
        id: 'no-foldkit-inline-style',
        title: 'No Foldkit inline style',
        summary: 'h.Style inline styles that bypass static styling.',
      },
      {
        id: 'stylex-component-contract',
        title: 'StyleX component contract',
        summary:
          'StyleX components called with styles outside their layout contract.',
      },
      {
        id: 'no-stylex-escape',
        title: 'No StyleX escape',
        summary: 'Raw StyleX APIs outside reviewed adapters.',
      },
      {
        id: 'pleat-prop-limits',
        title: 'Pleat prop limits',
        summary: 'Raw Pleat property values instead of semantic tokens.',
      },
      {
        id: 'prefer-composition-primitives',
        title: 'Prefer composition primitives',
        summary:
          'Hand-written layout instead of the closed Crease composition vocabulary.',
      },
      {
        id: 'no-raw-colors',
        title: 'No raw colors',
        summary:
          'Hard-coded colors instead of theme tokens (shadcn/no-raw-colors).',
      },
      {
        id: 'no-arbitrary-values',
        title: 'No arbitrary values',
        summary:
          'Arbitrary Tailwind values instead of the scale (shadcn/no-arbitrary-values).',
      },
    ],
  },
  {
    id: 'defensive',
    label: 'Defensive CSS',
    description:
      'Styles that break on touch devices, overflow, slow networks or missing content — the defensivecss.dev tips, as lint rules.',
    rules: [
      {
        id: 'defensive-prefer-overflow-auto',
        title: 'Prefer overflow: auto',
        summary:
          'overflow: scroll forces disabled scrollbars when nothing overflows.',
      },
      {
        id: 'defensive-no-space-between-wrap',
        title: 'No justify-between + flex-wrap',
        summary:
          'Wrapped rows lose spacing control with justify-between; use gap.',
      },
      {
        id: 'defensive-auto-fill-not-fit',
        title: 'auto-fill, not auto-fit',
        summary:
          'repeat(auto-fit, minmax(…)) collapses empty tracks and stretches items.',
      },
      {
        id: 'defensive-hover-media',
        title: 'Guard :hover with media query',
        summary:
          'Raw :hover sticks after taps on touch devices; wrap it in @media (hover: hover).',
      },
      {
        id: 'defensive-bg-image-fallback',
        title: 'Background-image fallback color',
        summary:
          'A url() background without a fallback color leaves content unstyled while it loads.',
      },
      {
        id: 'defensive-background-repeat',
        title: 'Explicit background-repeat',
        summary:
          'url() backgrounds tile by default unless background-repeat says otherwise.',
      },
      {
        id: 'defensive-css-var-fallback',
        title: 'Fallback for custom properties',
        summary:
          'var(--x) without a fallback resolves to nothing when --x is undefined.',
      },
      {
        id: 'defensive-scrollbar-gutter',
        title: 'Stable scrollbar gutter',
        summary:
          'Page roots that scroll without scrollbar-gutter shift the layout when the bar appears.',
      },
      {
        id: 'defensive-flex-min-size',
        title: 'Flex children need min-size 0',
        summary:
          'Truncating children cannot shrink below content size without min-w-0/min-h-0.',
      },
      {
        id: 'defensive-image-object-fit',
        title: 'Sized images need object-fit',
        summary:
          'An image with fixed width/height distorts or crops badly without object-fit.',
      },
      {
        id: 'defensive-input-font-size',
        title: 'Input font-size ≥ 16px',
        summary:
          'Smaller text on form controls triggers iOS Safari auto-zoom on focus.',
      },
      {
        id: 'defensive-sticky-grid-align',
        title: 'Sticky needs alignment in grids',
        summary:
          'Grid stretch keeps a sticky child at full height so it never sticks.',
      },
      {
        id: 'defensive-overscroll-contain',
        title: 'Overscroll containment in overlays',
        summary:
          'Scrollable overlay regions leak wheel/touch scroll to the page behind.',
      },
      {
        id: 'defensive-prefer-min-size',
        title: 'Prefer min-size over fixed size',
        summary:
          'Fixed h-[Npx]/w-[Npx] clips overflowing content; min-* lets it grow.',
      },
    ],
  },
  {
    id: 'cli',
    label: 'CLI checks',
    description:
      'Project checks run by creaseui-lint: global CSS, theme grammar, coverage and lint scope.',
    rules: [
      {
        id: 'css',
        title: 'Global CSS policy',
        summary:
          'Component styling in global stylesheets, including @layer, @media and nesting.',
      },
      {
        id: 'theme',
        title: 'Theme grammar',
        summary:
          'Invalid theme values and component variables no stylesheet defines.',
      },
      {
        id: 'doctor',
        title: 'Doctor coverage',
        summary:
          'Ignored files, unregistered components and undeclared foundations.',
      },
      {
        id: 'scope',
        title: 'Lint scope baseline',
        summary:
          'Feature changes that loosen ownership records, ignores or lint scripts.',
      },
    ],
  },
]

export const findLintRule = (
  id: string,
): (LintRuleSummary & Readonly<{ group: LintRuleGroup }>) | undefined => {
  for (const group of LINT_RULE_GROUPS) {
    const rule = group.rules.find(candidate => candidate.id === id)
    if (rule !== undefined) return { ...rule, group }
  }
  return undefined
}
