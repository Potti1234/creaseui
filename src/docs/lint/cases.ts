export type LintDocsRenderer = 'tailwind' | 'stylex' | 'pleat'

export type LintCaseSetup =
  | 'strict'
  | 'tailwind'
  | 'stylex'
  | 'pleat'
  | 'constrained'
  | 'css'
  | 'theme'
  | 'doctor'
  | 'scope'

export type LintCase = Readonly<{
  rule: string
  id: string
  title: string
  description: string
  renderers: ReadonlyArray<LintDocsRenderer>
  setup: LintCaseSetup
  file: string
  bad: string
  good: string
  expect: string
}>

const HEADER = "import type { Html, HtmlBuilder } from 'foldkit/html'\n"

export const ALL_RENDERERS: ReadonlyArray<LintDocsRenderer> = [
  'tailwind',
  'stylex',
  'pleat',
]

const strict = (
  rule: string,
  id: string,
  title: string,
  description: string,
  bad: string,
  good: string,
  expect: string,
  renderers: ReadonlyArray<LintDocsRenderer> = ALL_RENDERERS,
): LintCase => ({
  rule,
  id,
  title,
  description,
  renderers,
  setup: 'strict',
  file: 'src/feature.ts',
  bad: `${HEADER}${bad}`,
  good: `${HEADER}${good}`,
  expect,
})

const authoring = (
  rule: string,
  id: string,
  setup: LintCaseSetup,
  renderer: LintDocsRenderer,
  file: string,
  title: string,
  description: string,
  bad: string,
  good: string,
  expect: string,
): LintCase => ({
  rule,
  id,
  title,
  description,
  renderers: [renderer],
  setup,
  file,
  bad: `${HEADER}${bad}`,
  good: `${HEADER}${good}`,
  expect,
})

export const LINT_CASES: ReadonlyArray<LintCase> = [
  strict(
    'no-raw-controls',
    'raw-button',
    'A hand-built save button',
    'A raw h.button has no focus ring, no variants and no disabled styling, so it drifts from every other button in the app.',
    `import { stack } from '@design/stack'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  stack({ children: [h.button([], ['Save changes'])] }, h)
`,
    `import { button } from '@design/button'
import { stack } from '@design/stack'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  stack({ children: [button({ children: ['Save changes'] }, h)] }, h)
`,
    'button',
  ),
  strict(
    'no-raw-composition',
    'raw-layout',
    'Raw layout and headings',
    'h.div, h.h1 and h.p carry no spacing, type scale or color tokens; every screen ends up with its own margins and font sizes.',
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([], [h.h1([], ['Billing']), h.p([], ['Manage your plan.'])])
`,
    `import { copy, stack } from '@design/index'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  stack({ children: [copy({ children: ['Manage your plan.'] }, h)] }, h)
`,
    'div',
  ),
  strict(
    'no-unapproved-renderer',
    'implementation-export',
    'Calling the implementation behind a component',
    'renderButton is the unstyled behavior layer the installed Button is built on. Calling it directly renders a button with none of the variant styling.',
    `import { renderButton } from '@design/behavior/button'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  renderButton({ children: ['Delete'] }, h)
`,
    `import { button } from '@design/button'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ variant: 'outline', children: ['Delete'] }, h)
`,
    'renderButton',
  ),
  strict(
    'no-application-styles',
    'inline-style',
    'Styling a component from app code',
    'Inline styles and classes set by the app override the theme: the color no longer follows dark mode and the spacing no longer matches the scale.',
    `import { stack } from '@design/stack'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  stack(
    { children: [], attributes: [h.Style({ color: 'red', padding: '13px' })] },
    h,
  )
`,
    `import { stack } from '@design/stack'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  stack({ children: [] }, h)
`,
    'Style',
  ),
  strict(
    'component-contract',
    'unknown-variant',
    'A variant the component does not have',
    'variant: "shiny" is not one of the installed variants, so the button silently falls back to its default look.',
    `import { button } from '@design/button'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ variant: 'shiny', children: ['Upgrade'] }, h)
`,
    `import { button } from '@design/button'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ variant: 'outline', children: ['Upgrade'] }, h)
`,
    'shiny',
  ),
  strict(
    'component-contract',
    'layout-padding',
    'Padding passed as placement',
    'layoutStyle may only place a component in its parent. Padding changes the inside of the component and breaks its sizing.',
    `import { button } from '@design/button'
import { layoutStyle } from '@design/contracts'

const place = layoutStyle({ padding: '24px' })

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ layoutStyle: place, children: ['Continue'] }, h)
`,
    `import { button } from '@design/button'
import { layoutStyle } from '@design/contracts'

const place = layoutStyle({ marginInlineStart: 'auto' })

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ layoutStyle: place, children: ['Continue'] }, h)
`,
    'padding',
  ),
  strict(
    'no-unverifiable-ui',
    'opaque-spread',
    'Props the lint cannot see',
    'Spreading an untyped object hides which variant and layout a component gets, so none of the other rules can check it.',
    `import { button } from '@design/button'

export const view = <Msg>(h: HtmlBuilder<Msg>, props: any): Html =>
  button({ ...props, children: ['Save'] }, h)
`,
    `import { button } from '@design/button'

export const view = <Msg>(h: HtmlBuilder<Msg>, isPrimary: boolean): Html =>
  button({ variant: isPrimary ? 'default' : 'outline', children: ['Save'] }, h)
`,
    '',
  ),
  ...ALL_RENDERERS.map(renderer => {
    const mod = renderer === 'tailwind' ? 'ui' : renderer
    return authoring(
      'form-association',
      `unknown-form-${renderer}`,
      renderer,
      renderer,
      'src/app/invite.ts',
      'A footer submit that names the wrong form',
      "The dialog footer renders outside the form, so Send invite names it with form:. A typo there leaves the button submitting nothing: Enter still works, the button silently doesn't, and the input's required/type=email checks never run for it.",
      `import * as Button from '@/${mod}/button'
import * as Form from '@/${mod}/form'

export const invite = <Msg>(h: HtmlBuilder<Msg>, submitted: Msg, email: Html): Html =>
  h.div([], [
    Form.form({ id: 'invite-member-form', onSubmit: submitted, children: [email] }, h),
    Button.button({ type: 'submit', form: 'invite-form', children: ['Send invite'] }, h),
  ])
`,
      `import * as Button from '@/${mod}/button'
import * as Form from '@/${mod}/form'

export const invite = <Msg>(h: HtmlBuilder<Msg>, submitted: Msg, email: Html): Html =>
  h.div([], [
    Form.form({ id: 'invite-member-form', onSubmit: submitted, children: [email] }, h),
    Button.button({ type: 'submit', form: 'invite-member-form', children: ['Send invite'] }, h),
  ])
`,
      "submits form 'invite-form'",
    )
  }),
  ...ALL_RENDERERS.map(renderer =>
    authoring(
      'no-native-glyphs',
      `arrow-glyph-${renderer}`,
      renderer,
      renderer,
      'src/app/next-page.ts',
      'A native arrow instead of an icon',
      "A '→' character renders from the platform emoji/symbol font — different weight, size and color than the icon system, inconsistent across platforms, and invisible to the component rules. The Icon component keeps arrows in the icon set.",
      `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.a([h.Href('/docs/installation')], ['Continue to installation →'])
`,
      `import * as Icon from '@/lib/icon'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.a([h.Href('/docs/installation')], [
    'Continue to installation',
    Icon.arrowRight({ class: 'size-4' }, h),
  ])
`,
      'U+2192',
    ),
  ),
  ...ALL_RENDERERS.map(renderer =>
    authoring(
      'no-native-glyphs',
      `emoji-label-${renderer}`,
      renderer,
      renderer,
      'src/app/deploy.ts',
      'An emoji inside a button label',
      'Emoji in control labels vary by platform (color emoji vs monochrome), ignore currentColor, and drift from the icon set. Keyboard modifiers (⌘ ⌥ ⇧ ⌃ ⌫ ⎋) and box-drawing diagrams stay legal as text.',
      `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([], [h.span([], ['🚀 Deploy now'])])
`,
      `import * as Icon from '@/lib/icon'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([], [h.span([], ['Deploy now']), Icon.rocket({ class: 'size-4' }, h)])
`,
      'U+1F680',
    ),
  ),
  authoring(
    'no-component-restyle',
    'color-class',
    'tailwind',
    'tailwind',
    'src/app/billing.ts',
    'Recoloring a button with classes',
    'bg-red-500 and text-white bypass the destructive variant: no hover, focus or dark-mode colors.',
    `import { button } from '@/ui/button'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ class: 'bg-red-500 text-white', children: ['Cancel plan'] }, h)
`,
    `import { button } from '@/ui/button'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ variant: 'destructive', class: 'mt-4', children: ['Cancel plan'] }, h)
`,
    'bg-red-500',
  ),
  authoring(
    'require-static-class',
    'runtime-class',
    'tailwind',
    'tailwind',
    'src/app/billing.ts',
    'Building a class at runtime',
    'A class built by a function can contain anything, so the restyle and color rules cannot inspect it.',
    `import { button } from '@/ui/button'

const spacing = (isCompact: boolean): string => (isCompact ? 'mt-2' : 'mt-6')

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ class: spacing(true), children: ['Cancel plan'] }, h)
`,
    `import { button } from '@/ui/button'

export const view = <Msg>(h: HtmlBuilder<Msg>, isDanger: boolean): Html =>
  button({ variant: isDanger ? 'destructive' : 'default', children: ['Cancel plan'] }, h)
`,
    '',
  ),
  ...ALL_RENDERERS.map(renderer =>
    authoring(
      'no-foldkit-inline-style',
      `inline-style-${renderer}`,
      renderer,
      renderer,
      `src/${renderer === 'tailwind' ? 'ui' : renderer}/notice.ts`,
      'Inline styles in component source',
      'h.Style writes a style attribute that ignores the theme and cannot be checked by the styling rules.',
      `export const notice = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Style({ color: '#b91c1c', padding: '12px' })], ['Payment failed'])
`,
      `export const notice = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.DataAttribute('slot', 'notice')], ['Payment failed'])
`,
      '',
    ),
  ),
  authoring(
    'stylex-component-contract',
    'class-on-stylex',
    'stylex',
    'stylex',
    'src/app/billing.ts',
    'Tailwind classes on a StyleX component',
    'StyleX components ignore class strings; placement goes through a static layoutStyle.',
    `import { button } from '@/stylex/button'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ class: 'w-full', children: ['Continue'] }, h)
`,
    `import * as stylex from '@stylexjs/stylex'
import { button } from '@/stylex/button'

const styles = stylex.create({ fullWidth: { width: '100%' } })

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ layoutStyle: styles.fullWidth, children: ['Continue'] }, h)
`,
    '',
  ),
  authoring(
    'stylex-component-contract',
    'class-on-pleat',
    'pleat',
    'pleat',
    'src/app/billing.ts',
    'Tailwind classes on a Pleat component',
    'Pleat components ignore class strings; placement goes through layoutStyle().',
    `import { button } from '@/pleat/button'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ class: 'w-full', children: ['Continue'] }, h)
`,
    `import { button } from '@/pleat/button'
import { layoutStyle } from '@/pleat/contracts'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  button({ layoutStyle: layoutStyle({ width: '100%' }), children: ['Continue'] }, h)
`,
    '',
  ),
  authoring(
    'no-stylex-escape',
    'raw-stylex',
    'constrained',
    'stylex',
    'src/demo/board-constrained.ts',
    'Raw StyleX in a constrained page',
    'stylex.create and stylex.props let a page invent its own colors and spacing instead of using the composition primitives.',
    `import * as stylex from '@stylexjs/stylex'
import { stack } from '@/stylex/composition'

const styles = stylex.create({ title: { color: 'red' } })

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  stack({ attributes: [...Object.values(stylex.props(styles.title))], children: [] }, h)
`,
    `import { stack } from '@/stylex/composition'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  stack({ gap: 'md', children: [] }, h)
`,
    '',
  ),
  authoring(
    'prefer-composition-primitives',
    'raw-div',
    'constrained',
    'stylex',
    'src/demo/board-constrained.ts',
    'Raw layout in a constrained page',
    'h.div and h.ul layouts skip the shared gap and surface scale.',
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([], ['Revenue'])
`,
    `import { stack } from '@/stylex/composition'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  stack({ gap: 'md', children: ['Revenue'] }, h)
`,
    'div',
  ),
  authoring(
    'pleat-prop-limits',
    'raw-color',
    'pleat',
    'pleat',
    'src/pleat/notice.ts',
    'A raw color in a Pleat style',
    'A hex color does not change with the theme: in dark mode it stays dark red on a dark surface. Pleat components read colors from tokens.',
    `import { Style } from '@pleat/core'

export const styles = { root: Style.make({ color: '#b91c1c' }) }
`,
    `import { Style } from '@pleat/core'
import { tokens } from './tokens'

export const styles = { root: Style.make({ color: tokens.destructive }) }
`,
    'color',
  ),
  authoring(
    'no-raw-colors',
    'palette-class',
    'tailwind',
    'tailwind',
    'src/ui/notice.ts',
    'A palette color in a component',
    'text-red-700 is a fixed palette color: it ignores the theme, so in dark mode it stays dark red on a dark surface.',
    `export const notice = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('text-red-700')], ['Payment failed'])
`,
    `export const notice = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('text-destructive')], ['Payment failed'])
`,
    '',
  ),
  authoring(
    'no-arbitrary-values',
    'arbitrary-width',
    'tailwind',
    'tailwind',
    'src/ui/notice.ts',
    'An arbitrary size in a component',
    'w-[45px] sits off the spacing scale, so it is wider than the size-9 controls next to it.',
    `export const notice = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('w-[45px]')], ['!'])
`,
    `export const notice = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('size-9')], ['!'])
`,
    '',
  ),
  authoring(
    'defensive-prefer-overflow-auto',
    'forced-scrollbar',
    'tailwind',
    'tailwind',
    'src/app/sidebar.ts',
    'A scrollbar that never disappears',
    'overflow-y-scroll renders a disabled scrollbar track even when the content fits, which reads as a broken panel on Windows.',
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('overflow-y-scroll max-h-60')], ['Nav items'])
`,
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('overflow-y-auto max-h-60')], ['Nav items'])
`,
    'forces scrollbars even when nothing overflows',
  ),
  authoring(
    'defensive-no-space-between-wrap',
    'wrapped-rows-drift',
    'tailwind',
    'tailwind',
    'src/app/toolbar.ts',
    'justify-between on a wrapping row',
    'Once the row wraps, justify-between pushes the wrapped items apart with no spacing control — the second line drifts to the edges.',
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('flex flex-wrap justify-between')], [
    h.span([], ['Status']),
    h.span([], ['Actions']),
  ])
`,
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('flex flex-wrap gap-4')], [
    h.span([], ['Status']),
    h.span([], ['Actions']),
  ])
`,
    'leaves wrapped rows without spacing control',
  ),
  authoring(
    'defensive-auto-fill-not-fit',
    'stretching-empty-tracks',
    'pleat',
    'pleat',
    'src/pleat/gallery.ts',
    'auto-fit stretching the last row',
    'With fewer items than tracks, auto-fit collapses the empty tracks so the real items stretch to full width instead of keeping their size.',
    `import { Style } from '@pleat/core'

const gallery = Style.make({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
})

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => h.div([], [])
`,
    `import { Style } from '@pleat/core'

const gallery = Style.make({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
})

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => h.div([], [])
`,
    'collapses empty tracks',
  ),
  authoring(
    'defensive-hover-media',
    'stuck-hover',
    'stylex',
    'stylex',
    'src/stylex/link.ts',
    'A hover state that sticks on touch',
    'On touch devices a tapped element keeps :hover until something else is tapped. @media (hover: hover) only applies the style where hover exists.',
    `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  link: { color: { default: 'currentColor', ':hover': 'transparent' } },
})

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.a([...stylex.props(styles.link)], ['Docs'])
`,
    `import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  link: {
    color: {
      default: 'currentColor',
      '@media (hover: hover)': { ':hover': 'transparent' },
    },
  },
})

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.a([...stylex.props(styles.link)], ['Docs'])
`,
    'sticks after taps on touch devices',
  ),
  authoring(
    'defensive-bg-image-fallback',
    'missing-fallback-color',
    'pleat',
    'pleat',
    'src/pleat/hero.ts',
    'A hero with no fallback color',
    'While hero.png loads — or if the request fails — the section shows whatever is behind it, usually the page background with unreadable text.',
    `import { Style } from '@pleat/core'

const hero = Style.make({
  backgroundImage: 'url(/hero.png)',
  padding: '2rem',
})

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => h.div([], [])
`,
    `import { Style } from '@pleat/core'

const hero = Style.make({
  backgroundColor: 'transparent',
  backgroundImage: 'url(/hero.png)',
  backgroundRepeat: 'no-repeat',
  padding: '2rem',
})

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => h.div([], [])
`,
    'background-color fallback',
  ),
  authoring(
    'defensive-background-repeat',
    'tiling-texture',
    'pleat',
    'pleat',
    'src/pleat/hero.ts',
    'A texture that tiles by accident',
    'background-repeat defaults to repeat: a single logo or illustration tiles across the element unless the repeat is stated.',
    `import { Style } from '@pleat/core'

const hero = Style.make({
  backgroundColor: 'transparent',
  backgroundImage: 'url(/logo.png)',
})

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => h.div([], [])
`,
    `import { Style } from '@pleat/core'

const hero = Style.make({
  backgroundColor: 'transparent',
  backgroundImage: 'url(/logo.png)',
  backgroundRepeat: 'no-repeat',
})

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => h.div([], [])
`,
    'explicit repeat',
  ),
  authoring(
    'defensive-css-var-fallback',
    'undefined-variable',
    'pleat',
    'pleat',
    'src/pleat/banner.ts',
    'A variable nobody defines',
    '--banner-top is not a declared token, so var(--banner-top) resolves to nothing and the offset silently disappears.',
    `import { Style } from '@pleat/core'

const banner = Style.make({ top: 'var(--banner-top)' })

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => h.div([], [])
`,
    `import { Style } from '@pleat/core'

const banner = Style.make({ top: 'var(--banner-top, 0px)' })

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => h.div([], [])
`,
    'has no fallback',
  ),
  authoring(
    'defensive-flex-min-size',
    'unshrinkable-truncate',
    'tailwind',
    'tailwind',
    'src/app/list-row.ts',
    'Truncation that cannot shrink',
    'A flex child defaults to min-width: auto, so the long title refuses to shrink and pushes the row wider than the screen instead of truncating.',
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('flex gap-2')], [
    h.div([h.Class('truncate')], ['A very long section title']),
  ])
`,
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('flex gap-2')], [
    h.div([h.Class('min-w-0 truncate')], ['A very long section title']),
  ])
`,
    'cannot shrink below its content size',
  ),
  authoring(
    'defensive-image-object-fit',
    'distorted-avatar',
    'tailwind',
    'tailwind',
    'src/app/profile.ts',
    'A stretched avatar',
    'The avatar forces the image into 64×64 without saying how to crop, so a landscape photo squashes to a square.',
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.img([h.Class('h-16 w-16 rounded-full')])
`,
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.img([h.Class('h-16 w-16 rounded-full object-cover')])
`,
    'object-fit',
  ),
  authoring(
    'defensive-input-font-size',
    'ios-zoom',
    'tailwind',
    'tailwind',
    'src/app/search.ts',
    'A search field that zooms the page',
    'iOS Safari auto-zooms when an input under 16px gets focus; the page stays zoomed after the user leaves the field.',
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.input([h.Class('w-full rounded-md border px-3 py-2 text-sm')])
`,
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.input([h.Class('w-full rounded-md border px-3 py-2 text-base')])
`,
    'iOS Safari auto-zoom',
  ),
  authoring(
    'defensive-sticky-grid-align',
    'unsticky-sidebar',
    'tailwind',
    'tailwind',
    'src/app/layout.ts',
    'A sticky sidebar that never sticks',
    'Grid children stretch to the row height, so the sidebar is always as tall as the grid and position: sticky has no room to move.',
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('grid grid-cols-4 gap-6')], [
    h.div([h.Class('sticky top-0')], ['Nav']),
    h.div([], ['Content']),
  ])
`,
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('grid grid-cols-4 gap-6')], [
    h.div([h.Class('sticky top-0 self-start')], ['Nav']),
    h.div([], ['Content']),
  ])
`,
    'grid stretch prevents it from sticking',
  ),
  authoring(
    'defensive-overscroll-contain',
    'leaky-scroll',
    'tailwind',
    'tailwind',
    'src/app/menu.ts',
    'A drawer that scrolls the page',
    'Reaching the end of the drawer list keeps scrolling the page behind it; overscroll-contain stops the leak.',
    `import { drawer } from '@/ui/drawer'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  drawer({ class: 'fixed inset-y-0 right-0 w-80' }, [
    h.div([h.Class('h-full overflow-y-auto p-4')], ['Links']),
  ])
`,
    `import { drawer } from '@/ui/drawer'

export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  drawer({ class: 'fixed inset-y-0 right-0 w-80' }, [
    h.div([h.Class('h-full overflow-y-auto overscroll-contain p-4')], ['Links']),
  ])
`,
    'scroll leaks to the page behind',
  ),
  authoring(
    'defensive-prefer-min-size',
    'clipped-content',
    'tailwind',
    'tailwind',
    'src/app/sidebar.ts',
    'A fixed width that clips',
    'w-[20rem] hard-codes the sidebar: longer translated labels or larger user font settings clip instead of growing the panel.',
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('w-[20rem] shrink-0')], ['Sidebar'])
`,
    `export const view = <Msg>(h: HtmlBuilder<Msg>): Html =>
  h.div([h.Class('min-w-80 shrink-0')], ['Sidebar'])
`,
    'clips overflowing content',
  ),
]
