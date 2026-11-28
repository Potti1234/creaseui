import { UiSchema } from '@effect/ui'

import {
  areaGradient,
  categoryAxis,
  registerChart,
  shadcnTooltip,
  updateAnimation,
  valueAxis,
} from '../../behaviors/chart'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import {
  AreaChart,
  Badge,
  Button,
  ButtonLink,
  EChart,
  Icon,
  InteractiveAreaChart,
  Kbd,
} from '#components'

const Message = UiSchema.TaggedEnum({
  DraggedCompare: { value: Schema.Number },
  SelectedShowcase: { value: Schema.String },
  SelectedAccent: { value: Schema.String },
  SelectedRadius: { value: Schema.String },
  SelectedFont: { value: Schema.String },
  SelectedPeriod: { value: Schema.String },
  SelectedSeries: { value: Schema.String },
  ChartEvent: {},
})
type Message = typeof Message.Type

const accents = [
  ['neutral', '#171717'],
  ['blue', '#2563eb'],
  ['green', '#16a34a'],
  ['orange', '#ea580c'],
  ['red', '#dc2626'],
  ['violet', '#7c3aed'],
] as const
const apps = [
  ['dashboard', 'Dashboard', 'The whole picture, in one place.'],
  ['inbox', 'Inbox', 'A calmer place for the next conversation.'],
  ['kanban', 'Kanban', 'Give your next project a little structure.'],
  ['checkout', 'Checkout', 'Every detail, from the cart to confirmation.'],
] as const
const trend = Array.from({ length: 24 }, (_, index) => ({
  label: `Day ${index + 1}`,
  desktop: 110 + Math.round(Math.sin(index / 2.2) * 46 + index * 4),
  mobile: 76 + Math.round(Math.cos(index / 2.7) * 32 + index * 3),
}))
const heroTrend = [186, 305, 237, 173, 209, 274]

const sectionHeader = (h: Html.H<Message>, title: string, copy: string) =>
  h.div
    .class('mb-8 flex max-w-2xl flex-col gap-3 md:mb-10')
    .children(
      h.h2
        .class(
          'text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl',
        )
        .children(title),
      h.p
        .class(
          'max-w-xl text-base leading-relaxed text-pretty text-muted-foreground',
        )
        .children(copy),
    )

const pill = (
  h: Html.H<Message>,
  label: string,
  selected: boolean,
  message: Message,
) =>
  h.button
    .class(
      `h-10 rounded-full px-4 text-sm transition-[background-color,color,box-shadow,scale] duration-200 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        selected
          ? 'bg-foreground text-background'
          : 'bg-muted/70 text-foreground/75 hover:bg-muted hover:text-foreground'
      }`,
    )
    .attrs({ type: 'button', 'aria-pressed': String(selected) })
    .on('click', () => message)
    .children(label)

const subtleLink = (h: Html.H<Message>, href: string, ...children: unknown[]) =>
  h.a
    .class(
      'inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
    )
    .attr('href', href)
    .children(...(children as never[]))

const logoMark = (h: Html.H<Message>) =>
  h.img
    .class('size-10 rounded-[9px]')
    .attrs({ src: '/favicon.svg', alt: 'Crease' })

const cardShell = (
  h: Html.H<Message>,
  className: string,
  ...children: unknown[]
) =>
  h.div
    .class(
      `rounded-xl border bg-card text-card-foreground shadow-sm ${className}`,
    )
    .children(...(children as never[]))

const sparkline = (h: Html.H<Message>, id: string) =>
  AreaChart(h, {
    id,
    data: heroTrend,
    ariaLabel: 'Revenue trend for the last 6 months',
    className: 'h-24 w-full',
    color: 'var(--chart-1)',
    height: '6rem',
  })

const hero = (h: Html.H<Message>) =>
  h.section
    .class(
      'mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24',
    )
    .children(
      h.div.class('flex flex-col items-start gap-6').children(
        h.div
          .class('flex items-center gap-3')
          .children(
            logoMark(h),
            h.span
              .class('text-lg font-semibold tracking-tight')
              .children(
                'crease',
                h.span.class('text-[oklch(0.62_0.15_145)]').children('/'),
                'ui',
              ),
          ),
        h.h1
          .class(
            'text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl',
          )
          .children('Beautiful components for Effect UI.'),
        h.p
          .class('max-w-md text-lg text-balance text-muted-foreground')
          .children(
            'The shadcn/ui design language, rebuilt on Effect UI. Copy the code, own the code, ship.',
          ),
        h.div.class('flex flex-wrap items-center gap-3').children(
          ButtonLink(h, { href: '/create' }).children('Get Started') as never,
          ButtonLink(h, {
            href: '/docs/components/accordion',
            variant: 'outline',
          }).children('Browse Components') as never,
        ),
        h.p
          .class('text-xs text-muted-foreground')
          .children(
            'MIT licensed · Built on Effect UI · Works with any shadcn theme',
          ),
      ),
      h.div.class('grid w-full max-w-xl gap-4 justify-self-end').children(
        cardShell(
          h,
          'min-h-[250px] p-6',
          h.h3.class('text-base font-medium').children('Revenue'),
          h.p
            .class('mt-1 text-sm text-muted-foreground')
            .children('+18.2% from last quarter'),
          h.div
            .class('mt-5')
            .children(sparkline(h, 'landing-hero-revenue') as never),
        ),
        h.div.class('grid grid-cols-[1fr_auto] items-start gap-4').children(
          cardShell(
            h,
            'p-6',
            h.h3.class('text-base font-medium').children('Create account'),
            h.p
              .class('mt-1 text-sm text-muted-foreground')
              .children('Same card. Different framework.'),
            h.label
              .class('mt-5 grid gap-2 text-sm font-medium')
              .children(
                'Email',
                h.input
                  .class(
                    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground',
                  )
                  .attrs({ type: 'email', placeholder: 'm@example.com' }),
              ),
            h.div
              .class('mt-5 flex gap-2')
              .children(
                Button(h, { variant: 'outline' }).children('Cancel') as never,
                Button(h, {}).children('Continue') as never,
              ),
          ),
          h.div.class('flex flex-col items-start gap-2').children(
            Badge(h, { children: ['New'] }) as never,
            Badge(h, {
              variant: 'secondary',
              children: ['Beta'],
            }) as never,
            Badge(h, { variant: 'outline', children: ['MIT'] }) as never,
            Badge(h, {
              variant: 'destructive',
              children: ['Deprecated'],
            }) as never,
            h.div
              .class(
                'mt-2 flex items-center gap-1 text-xs text-muted-foreground',
              )
              .children(
                Kbd(h, { children: ['⌘'] }) as never,
                Kbd(h, { children: ['B'] }) as never,
              ),
          ),
        ),
      ),
    )

const comparison = (h: Html.H<Message>, percent: number) =>
  h.section
    .class(
      'mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-16 md:px-8',
    )
    .children(
      h.div
        .class('flex max-w-2xl flex-col gap-3')
        .children(
          h.h2
            .class(
              'text-2xl font-semibold tracking-tight text-balance sm:text-3xl',
            )
            .children('Spot the difference.'),
          h.p
            .class('text-muted-foreground text-balance')
            .children(
              'We rebuilt the ui.shadcn.com/create preview board — all 33 cards — on Effect UI. Drag to compare the two implementations.',
            ),
        ),
      h.div
        .class(
          'relative w-full cursor-ew-resize touch-none overflow-hidden rounded-xl border shadow-sm select-none',
        )
        .children(
          h.img.class('block w-full').attrs({
            src: '/comparison/shadcn-board.png',
            alt: 'The original shadcn/ui create board',
          }),
          h.div
            .class('absolute inset-0')
            .style({ clipPath: `inset(0 ${100 - percent}% 0 0)` })
            .children(
              h.img.class('block w-full').attrs({
                src: '/comparison/foldkit-board.png',
                alt: 'The same board rebuilt with CreaseUI on Effect UI',
              }),
            ),
          h.div
            .class(
              'pointer-events-none absolute inset-y-0 w-px bg-foreground/60',
            )
            .style({ left: `${percent}%` }),
          h.span
            .class(
              'pointer-events-none absolute top-3 left-3 rounded-md border bg-background/90 px-2 py-1 text-xs font-medium text-foreground',
            )
            .children('crease/ui (Effect UI)'),
          h.span
            .class(
              'pointer-events-none absolute top-3 right-3 rounded-md border bg-background/90 px-2 py-1 text-xs font-medium text-foreground',
            )
            .children('shadcn/ui (React)'),
          h.input
            .class('absolute inset-0 h-full w-full cursor-ew-resize opacity-0')
            .attrs({
              type: 'range',
              min: '0',
              max: '100',
              'aria-label': 'Comparison slider between CreaseUI and shadcn/ui',
            })
            .value(String(percent))
            .on('input', ({ value }: { value: string }) =>
              Message.DraggedCompare({ value: Number(value) || 0 }),
            ),
        ),
    )

const miniDashboard = (h: Html.H<Message>, app: string) =>
  h.div.class(`landing-app landing-app-${app}`).children(
    h.div
      .class('landing-app-sidebar')
      .children(
        h.div.class('landing-app-logo'),
        ...Array.from({ length: 7 }, (_, index) => h.span.key(String(index))),
      ),
    h.div.class('landing-app-main').children(
      h.div.class('landing-app-topbar'),
      h.div.class('landing-app-cards').children(
        ...Array.from({ length: app === 'kanban' ? 3 : 4 }, (_, index) =>
          h.div
            .key(String(index))
            .class('landing-app-card')
            .children(
              h.strong.children(
                app === 'inbox'
                  ? ['Inbox zero', 'Unread', 'Archived', 'Snoozed'][index]
                  : app === 'kanban'
                    ? ['Todo', 'Doing', 'Done'][index]
                    : ['Revenue', 'Orders', 'Conversion', 'Visitors'][index],
              ),
              h.span.children(
                app === 'kanban'
                  ? ['8', '4', '16'][index]
                  : ['$24.8k', '1,284', '3.4%', '42.1k'][index],
              ),
            ),
        ),
      ),
      h.div
        .class('landing-app-panel')
        .children(
          ...Array.from({ length: 7 }, (_, index) => h.span.key(String(index))),
        ),
    ),
  )

const showcase = (h: Html.H<Message>, selected: string) => {
  const app = apps.find(([value]) => value === selected) ?? apps[0]
  return h.section
    .class('mx-auto w-full max-w-[1200px] px-4 py-14 md:px-8 md:py-20')
    .attrs({ id: 'showcase' })
    .children(
      sectionHeader(
        h,
        'See what you can build.',
        'Complete interfaces made from the same components you can copy into your app. Pick one. Make yourself at home.',
      ),
      h.div
        .class('relative flex min-w-0 flex-col gap-4')
        .children(
          h.div
            .class('flex flex-wrap gap-2')
            .children(
              apps.map(([value, label]) =>
                pill(
                  h,
                  label,
                  value === selected,
                  Message.SelectedShowcase({ value }),
                ),
              ),
            ),
          h.div
            .class(
              'overflow-hidden rounded-3xl bg-muted/50 p-2 shadow-[0_0_0_1px_var(--border),0_12px_40px_-24px_rgba(0,0,0,0.18)] sm:p-3',
            )
            .children(
              h.div
                .class('flex h-10 items-center gap-3 px-2 pb-2 sm:px-3')
                .children(
                  h.div
                    .class('flex shrink-0 gap-1.5')
                    .children(
                      h.span.class('size-2.5 rounded-full bg-foreground/20'),
                      h.span.class('size-2.5 rounded-full bg-foreground/20'),
                      h.span.class('size-2.5 rounded-full bg-foreground/20'),
                    ),
                  h.span
                    .class('text-xs font-medium text-foreground/80')
                    .children(app[1]),
                  h.span
                    .class(
                      'ml-auto inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground',
                    )
                    .children(
                      h.span.class('size-1.5 rounded-full bg-emerald-500'),
                      'Live preview',
                    ),
                ),
              h.div
                .class(
                  'h-[620px] overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--border)] sm:h-[680px]',
                )
                .children(miniDashboard(h, selected)),
            ),
          h.div
            .class(
              'flex flex-wrap items-center justify-between gap-x-6 gap-y-2',
            )
            .children(
              h.p.class('text-sm text-muted-foreground').children(app[2]),
              h.div
                .class('flex items-center gap-5')
                .children(
                  subtleLink(
                    h,
                    '/blocks',
                    Icon(h, { name: 'code-xml', size: 'sm' }) as never,
                    'View code',
                  ),
                  subtleLink(
                    h,
                    '/blocks',
                    'Open example',
                    Icon(h, { name: 'arrow-up-right', size: 'sm' }) as never,
                  ),
                ),
            ),
        ),
    )
}

const studio = (
  h: Html.H<Message>,
  accent: string,
  radius: string,
  font: string,
) =>
  h.section
    .class('mx-auto w-full max-w-[1200px] px-4 py-14 md:px-8 md:py-20')
    .attrs({ id: 'theme-studio' })
    .children(
      sectionHeader(
        h,
        'Make it yours.',
        'A different color, a softer corner, a new typeface. Same components. A completely different feeling.',
      ),
      h.div
        .class('grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14')
        .children(
          h.div.class('flex flex-col gap-7').children(
            h.div.class('grid gap-2').children(
              h.p.class('text-sm font-medium').children('Accent color'),
              h.div
                .class('flex items-center gap-1')
                .attrs({
                  role: 'group',
                  'aria-label': 'Theme studio accent color',
                })
                .children(
                  accents.map(([value, paint]) =>
                    h.button
                      .key(value)
                      .class(
                        'group flex size-10 shrink-0 items-center justify-center rounded-full outline-none transition-transform active:scale-[0.96]',
                      )
                      .attrs({
                        type: 'button',
                        'aria-label': `Studio ${value}`,
                        'aria-pressed': String(value === accent),
                      })
                      .on('click', () => Message.SelectedAccent({ value }))
                      .children(
                        h.span
                          .class(
                            `flex size-6 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110 ${value === accent ? 'ring-2 ring-foreground/20 ring-offset-2 ring-offset-background' : ''}`,
                          )
                          .style({ backgroundColor: paint })
                          .children(
                            value === accent
                              ? (Icon(h, {
                                  name: 'check',
                                  size: 'xs',
                                }) as never)
                              : undefined,
                          ),
                      ),
                  ),
                ),
            ),
            h.div
              .class('grid gap-3')
              .children(
                h.p.class('text-sm font-medium').children('Corner radius'),
                h.div
                  .class('flex flex-wrap gap-2')
                  .children(
                    ['none', 'medium', 'large'].map(value =>
                      pill(
                        h,
                        { none: 'Square', medium: 'Soft', large: 'Round' }[
                          value
                        ]!,
                        value === radius,
                        Message.SelectedRadius({ value }),
                      ),
                    ),
                  ),
              ),
            h.div
              .class('grid gap-3')
              .children(
                h.p.class('text-sm font-medium').children('Typeface'),
                h.div
                  .class('flex flex-wrap gap-2')
                  .children(
                    ['inter', 'geist', 'mono'].map(value =>
                      pill(
                        h,
                        { inter: 'Inter', geist: 'Geist', mono: 'Mono' }[
                          value
                        ]!,
                        value === font,
                        Message.SelectedFont({ value }),
                      ),
                    ),
                  ),
              ),
            subtleLink(
              h,
              '/create',
              'Open the theme builder',
              Icon(h, { name: 'arrow-up-right', size: 'sm' }) as never,
            ),
          ),
          h.div.class('landing-studio min-w-0').children(
            h.div
              .class(
                'grid min-h-[454px] place-items-center rounded-2xl bg-muted/40 p-5 sm:p-10',
              )
              .children(
                h.div
                  .class(
                    'w-full max-w-md overflow-hidden bg-card text-card-foreground shadow-[0_0_0_1px_var(--border),0_16px_40px_-20px_rgba(0,0,0,0.15)]',
                  )
                  .style({
                    borderRadius:
                      radius === 'none'
                        ? '0px'
                        : radius === 'medium'
                          ? '12px'
                          : '22px',
                    fontFamily:
                      font === 'mono'
                        ? 'var(--font-mono, monospace)'
                        : 'var(--font-sans, sans-serif)',
                  })
                  .children(
                    h.div
                      .class('flex items-center gap-3 border-b p-6')
                      .children(
                        h.span
                          .class(
                            'flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground',
                          )
                          .style({ backgroundColor: paint(accent) })
                          .children(
                            Icon(h, { name: 'blocks', size: 'sm' }) as never,
                          ),
                        h.div.children(
                          h.h3
                            .class('text-base font-semibold')
                            .children('Studio workspace'),
                          h.p
                            .class('mt-1 text-xs text-muted-foreground')
                            .children('A space for your best ideas.'),
                        ),
                        h.span.class('ml-auto').children(
                          Badge(h, {
                            variant: 'secondary',
                            children: ['Pro'],
                          }) as never,
                        ),
                      ),
                    h.div.class('grid gap-5 p-6').children(
                      ...[
                        ['AL', 'Alex Lee', 'Designer'],
                        ['JM', 'Jamie Morgan', 'Developer'],
                      ].map(([initial, name, role]) =>
                        h.div
                          .key(initial ?? '')
                          .class('flex items-center gap-3')
                          .children(
                            h.span
                              .class(
                                'flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-foreground',
                              )
                              .children(initial),
                            h.div.children(
                              h.p.class('text-sm font-medium').children(name),
                              h.p
                                .class('text-xs text-muted-foreground')
                                .children(role),
                            ),
                            h.span
                              .class('ml-auto text-xs text-muted-foreground')
                              .children('Member'),
                          ),
                      ),
                      h.div
                        .class('border-t pt-5')
                        .children(
                          h.label
                            .class(
                              'flex items-center justify-between gap-3 text-sm font-medium',
                            )
                            .children(
                              'Workspace notifications',
                              h.input
                                .attrs({ type: 'checkbox', checked: '' })
                                .class('size-4 accent-primary'),
                            ),
                        ),
                    ),
                  ),
              ),
            h.p
              .class(
                'mt-3 text-center font-mono text-[11px] text-muted-foreground',
              )
              .children('--primary · --radius · --font-sans'),
          ),
        ),
    )
const paint = (accent: string) =>
  accents.find(([value]) => value === accent)?.[1] ?? accents[0][1]

const stateSection = (h: Html.H<Message>) =>
  h.section
    .class('mx-auto w-full max-w-[1200px] px-4 py-14 md:px-8 md:py-20')
    .children(
      sectionHeader(
        h,
        'See every state change.',
        'Type, toggle, open a dialog. The interface on the left and the model on the right tell the same story.',
      ),
      h.div
        .class(
          'grid overflow-hidden rounded-2xl bg-muted/30 shadow-[0_0_0_1px_var(--border)] md:grid-cols-2',
        )
        .children(
          h.div
            .class('flex min-w-0 flex-col justify-center gap-6 p-6 sm:p-10')
            .children(
              h.div
                .class('flex items-center justify-between')
                .children(
                  h.div.children(
                    h.h3
                      .class('text-sm font-semibold')
                      .children('Project settings'),
                    h.p
                      .class('mt-1 text-xs text-muted-foreground')
                      .children('The controls write to one model.'),
                  ),
                  Badge(h, { children: ['Ready'] }) as never,
                ),
              h.label
                .class('grid gap-2 text-sm font-medium')
                .children(
                  'Project name',
                  h.input
                    .class(
                      'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs',
                    )
                    .attrs({ value: 'Acme dashboard' }),
                ),
              h.label
                .class('flex items-center justify-between text-sm font-medium')
                .children(
                  'Email notifications',
                  h.input
                    .attrs({ type: 'checkbox', checked: '' })
                    .class('size-4 accent-primary'),
                ),
              Button(h, { variant: 'outline', className: 'w-fit' }).children(
                'Open dialog',
              ) as never,
            ),
          h.div
            .class('flex min-w-0 flex-col bg-zinc-950 text-zinc-100')
            .children(
              h.div
                .class(
                  'flex items-center justify-between border-b border-white/10 px-6 py-4',
                )
                .children(
                  h.span
                    .class('font-mono text-xs text-zinc-400')
                    .children('model'),
                  h.span
                    .class(
                      'inline-flex items-center gap-1.5 text-[11px] text-emerald-300',
                    )
                    .children(
                      h.span.class('size-1.5 rounded-full bg-emerald-400'),
                      'live',
                    ),
                ),
              h.pre
                .class(
                  'min-h-44 overflow-auto px-6 py-6 font-mono text-xs leading-7 sm:text-sm',
                )
                .children(
                  `{\n  projectName: "Acme dashboard",\n  notifications: true,\n  dialogOpen: false,\n  events: 3\n}`,
                ),
              h.div
                .class('mt-auto border-t border-white/10 px-6 py-5')
                .children(
                  h.p
                    .class(
                      'mb-3 text-[10px] tracking-widest text-zinc-400 uppercase',
                    )
                    .children('Recent events'),
                  h.div
                    .class('grid gap-2')
                    .children(
                      h.div
                        .class(
                          'flex items-center gap-3 font-mono text-[11px] text-zinc-200',
                        )
                        .children(
                          h.span.class('size-1 rounded-full bg-emerald-400'),
                          'ChangedProjectName',
                        ),
                      h.div
                        .class(
                          'flex items-center gap-3 font-mono text-[11px] text-zinc-400',
                        )
                        .children(
                          h.span.class('size-1 rounded-full bg-zinc-600'),
                          'ToggledNotifications',
                        ),
                    ),
                ),
            ),
        ),
    )

const detailCard = (
  h: Html.H<Message>,
  title: string,
  caption: string,
  body: unknown,
) =>
  h.div
    .class(
      `detail-card detail-${title.toLowerCase().replace(/[^a-z]+/g, '-')} flex min-w-0 flex-col rounded-2xl bg-background shadow-[0_0_0_1px_var(--border)]`,
    )
    .children(
      h.div
        .class('flex min-h-40 flex-1 flex-col justify-center gap-4 p-6')
        .children(body as never),
      h.div
        .class('flex items-start justify-between gap-3 border-t px-6 py-5')
        .children(
          h.div.children(
            h.h3.class('text-sm font-semibold').children(title),
            h.p
              .class('mt-1 text-xs leading-relaxed text-muted-foreground')
              .children(caption),
          ),
          h.span
            .class(
              'flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground',
            )
            .children(Icon(h, { name: 'arrow-up-right', size: 'sm' }) as never),
        ),
    )

const playground = (h: Html.H<Message>) =>
  h.section
    .class('mx-auto w-full max-w-[1200px] px-4 py-14 md:px-8 md:py-20')
    .children(
      h.div
        .class('flex flex-wrap items-end justify-between gap-5')
        .children(
          sectionHeader(
            h,
            'Try the details.',
            'Search, select, sort. A few of the little interactions that make an interface feel right.',
          ),
          subtleLink(
            h,
            '/docs/components/combobox',
            'Browse 125 components',
            Icon(h, { name: 'arrow-up-right', size: 'sm' }) as never,
          ),
        ),
      h.div
        .class('grid gap-5 sm:grid-cols-2 lg:grid-cols-3')
        .children(
          detailCard(
            h,
            'Command palette',
            'Keyboard-first navigation.',
            h.div
              .class('rounded-lg border')
              .children(
                h.div
                  .class('border-b px-3 py-2 text-sm text-muted-foreground')
                  .children('Search commands…'),
                h.div.class('px-3 py-2 text-sm').children('Create project'),
                h.div
                  .class('px-3 py-2 text-sm text-muted-foreground')
                  .children('Open settings'),
              ),
          ),
          detailCard(
            h,
            'Combobox',
            'Type to narrow the choices.',
            h.div
              .class(
                'flex h-9 items-center justify-between rounded-md border px-3 text-sm',
              )
              .children(
                'Select framework',
                Icon(h, { name: 'chevron-down', size: 'sm' }) as never,
              ),
          ),
          detailCard(
            h,
            'Data table',
            'Sortable columns and row selection.',
            h.div
              .class('grid gap-2 text-xs')
              .children(
                h.div
                  .class('grid grid-cols-3 border-b pb-2 font-medium')
                  .children('Name', 'Status', '↑'),
                h.div
                  .class('grid grid-cols-3 text-muted-foreground')
                  .children('Alpha', 'Live', '24'),
                h.div
                  .class('grid grid-cols-3 text-muted-foreground')
                  .children('Beta', 'Draft', '18'),
              ),
          ),
          detailCard(
            h,
            'Date range',
            'Pick a start and an end.',
            h.div
              .class('rounded-lg border p-3 text-center text-sm')
              .children('Dec 18 — Dec 27'),
          ),
          detailCard(
            h,
            'Dialog',
            'Focus moves in, and returns.',
            h.div
              .class('rounded-lg border p-4 text-sm shadow-sm')
              .children(
                h.strong.children('A little room to focus.'),
                h.p
                  .class('mt-2 text-muted-foreground')
                  .children('Dialog content'),
              ),
          ),
          detailCard(
            h,
            'Form validation',
            'Feedback stays next to the field.',
            h.label
              .class('grid gap-2 text-sm')
              .children(
                'Email',
                h.input
                  .class('h-9 rounded-md border border-destructive px-3')
                  .attrs({ value: 'not-an-email' }),
                h.span
                  .class('text-xs text-destructive')
                  .children('Enter a valid email address'),
              ),
          ),
        ),
    )

const LANDING_CHART_DATA = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    visitors: [184, 230, 195, 286, 312, 249, 340],
    signups: [62, 84, 71, 104, 117, 96, 128],
  },
  month: {
    labels: [
      'Jun 1',
      'Jun 5',
      'Jun 10',
      'Jun 15',
      'Jun 20',
      'Jun 25',
      'Jun 30',
    ],
    visitors: [820, 1140, 960, 1530, 1210, 1780, 2040],
    signups: [250, 390, 320, 570, 430, 680, 820],
  },
  quarter: {
    labels: ['Apr 1', 'Apr 15', 'May 1', 'May 15', 'Jun 1', 'Jun 15', 'Jun 30'],
    visitors: [2300, 2840, 2520, 3710, 3280, 4250, 4860],
    signups: [780, 940, 830, 1320, 1140, 1670, 1960],
  },
} as const
const landingChartSlots = Array.from(
  { length: 7 },
  (_, index) => `slot-${String(index)}`,
)
registerChart('landing-chart', (theme, variant) => {
  const [period = 'month', series = 'both'] = variant.split(':')
  const data =
    LANDING_CHART_DATA[period as keyof typeof LANDING_CHART_DATA] ??
    LANDING_CHART_DATA.month
  return {
    ...updateAnimation(),
    grid: { left: 8, right: 8, top: 18, bottom: 34, containLabel: true },
    xAxis: categoryAxis(theme, landingChartSlots, {
      axisLabel: { formatter: (_name, index) => data.labels[index] ?? '' },
    }),
    yAxis: valueAxis(theme, { showLabels: true }),
    tooltip: shadcnTooltip(theme, {
      formatHeading: (_name, index) => data.labels[index] ?? '',
    }),
    series: [
      {
        id: 'visitors',
        name: 'Visitors',
        type: 'line' as const,
        smooth: 0.35,
        showSymbol: false,
        lineStyle: { width: 2, color: theme.chart1 },
        itemStyle: { color: theme.chart1 },
        areaStyle: { color: areaGradient(theme.chart1) },
        data: series === 'signups' ? [] : [...data.visitors],
      },
      {
        id: 'signups',
        name: 'Signups',
        type: 'line' as const,
        smooth: 0.35,
        showSymbol: false,
        lineStyle: { width: 2, color: theme.chart2 },
        itemStyle: { color: theme.chart2 },
        areaStyle: { color: areaGradient(theme.chart2) },
        data: series === 'visitors' ? [] : [...data.signups],
      },
    ],
  }
})

const chartSection = (h: Html.H<Message>, period: string, series: string) =>
  h.section
    .class('mx-auto w-full max-w-[1200px] px-4 py-14 md:px-8 md:py-20')
    .children(
      sectionHeader(
        h,
        'Explore the data.',
        'Charts with the same attention to the axes, the tooltips, and everything in between. Move your cursor. Change the view.',
      ),
      h.div
        .class(
          'rounded-2xl bg-background p-5 shadow-[0_0_0_1px_var(--border)] sm:p-8',
        )
        .children(
          h.div
            .class('flex flex-wrap items-start justify-between gap-5')
            .children(
              h.div.children(
                h.p
                  .class('text-sm text-muted-foreground')
                  .children('Total visitors'),
                h.p
                  .class(
                    'mt-2 text-3xl font-semibold tracking-tight tabular-nums',
                  )
                  .children(
                    (series === 'signups'
                      ? LANDING_CHART_DATA[
                          period as keyof typeof LANDING_CHART_DATA
                        ].signups
                      : LANDING_CHART_DATA[
                          period as keyof typeof LANDING_CHART_DATA
                        ].visitors
                    )
                      .reduce((sum, value) => sum + value, 0)
                      .toLocaleString('en-US'),
                  ),
              ),
              h.div
                .class('flex rounded-full bg-muted/70 p-1')
                .children(
                  ['week', 'month', 'quarter'].map(value =>
                    pill(
                      h,
                      { week: '7 days', month: '30 days', quarter: '90 days' }[
                        value
                      ]!,
                      value === period,
                      Message.SelectedPeriod({ value }),
                    ),
                  ),
                ),
            ),
          h.div.class('mt-8 flex flex-wrap gap-2').children(
            ['both', 'visitors', 'signups'].map(value =>
              pill(
                h,
                {
                  both: 'Both series',
                  visitors: 'Visitors',
                  signups: 'Signups',
                }[value]!,
                value === series,
                Message.SelectedSeries({ value }),
              ),
            ),
          ),
          h.div.class('mt-4').children(
            EChart(h, {
              hostId: 'landing-chart',
              ariaLabel: 'Visitors and signups over time',
              accessibleAlternative: h.p.children(
                'Chart data is available in the interactive chart controls.',
              ),
              toMessage: () => Message.ChartEvent(),
              variant: `${period}:${series}`,
              className: 'landing-chart-frame',
            }) as never,
          ),
          h.div
            .class(
              'mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-5',
            )
            .children(
              h.div
                .class('flex items-center gap-5 text-xs text-muted-foreground')
                .children(
                  h.span
                    .class('flex items-center gap-2')
                    .children(
                      h.span.class('size-2 rounded-full bg-chart-1'),
                      'Visitors',
                    ),
                  h.span
                    .class('flex items-center gap-2')
                    .children(
                      h.span.class('size-2 rounded-full bg-chart-2'),
                      'Signups',
                    ),
                ),
              subtleLink(
                h,
                '/charts/area',
                'Explore 70 chart examples',
                Icon(h, { name: 'arrow-up-right', size: 'sm' }) as never,
              ),
            ),
        ),
    )

const mapSection = (h: Html.H<Message>) =>
  h.section
    .class('mx-auto w-full max-w-[1200px] px-4 py-14 md:px-8 md:py-20')
    .children(
      sectionHeader(
        h,
        'An interactive map, built from parts.',
        'A live OpenFreeMap basemap with controls, a route, and named markers. Each layer is composed in the view, with no map API key.',
      ),
      h.div
        .class('landing-map')
        .children(
          h.div.class('landing-map-grid'),
          h.div.class('landing-map-route'),
          h.div
            .class('landing-map-marker landing-map-marker-a')
            .children('Marienplatz'),
          h.div
            .class('landing-map-marker landing-map-marker-b')
            .children('Odeonsplatz'),
          h.div.class('landing-map-controls').children('+', '−'),
        ),
      h.div
        .class('flex flex-wrap items-center justify-between gap-x-6 gap-y-2')
        .children(
          h.p
            .class('text-sm text-muted-foreground')
            .children('Pan, zoom, or inspect the composed map layers.'),
          subtleLink(
            h,
            '/docs/components/map',
            'Explore map docs',
            Icon(h, { name: 'arrow-up-right', size: 'sm' }) as never,
          ),
        ),
    )

const install = 'npx creaseui@latest add button card input'

const gettingStarted = (h: Html.H<Message>) =>
  h.section
    .class('mx-auto w-full max-w-[1200px] px-4 py-14 md:px-8 md:py-20')
    .children(
      h.div
        .class(
          'grid items-center gap-8 rounded-2xl bg-muted/40 p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr]',
        )
        .children(
          h.div
            .class('grid gap-4')
            .children(
              h.h2
                .class(
                  'text-2xl font-semibold tracking-tight text-balance sm:text-3xl',
                )
                .children('Take it from here.'),
              h.p
                .class(
                  'max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground',
                )
                .children(
                  'Add a component. Read the source. Make it your own. The next interface is yours to build.',
                ),
              h.div
                .class('flex flex-wrap gap-3')
                .children(
                  ButtonLink(h, { href: '/docs/components/button' }).children(
                    'Get started',
                    Icon(h, { name: 'arrow-right', size: 'sm' }) as never,
                  ) as never,
                  ButtonLink(h, { href: '/create', variant: 'ghost' }).children(
                    'Choose a theme',
                  ) as never,
                ),
            ),
          h.div
            .class(
              'min-w-0 rounded-xl bg-background p-5 shadow-[0_0_0_1px_var(--border)]',
            )
            .children(
              h.div.class('mb-4 flex items-center justify-between').children(
                h.span
                  .class('font-mono text-xs text-muted-foreground')
                  .children('Terminal'),
                Badge(h, {
                  variant: 'secondary',
                  children: ['registry available'],
                }) as never,
              ),
              h.div.class('flex items-start gap-3').children(
                h.span
                  .class('font-mono text-sm text-muted-foreground')
                  .children('$'),
                h.code
                  .class(
                    'min-w-0 flex-1 font-mono text-xs leading-6 break-words sm:text-sm',
                  )
                  .children(install),
                Button(h, {
                  variant: 'ghost',
                  size: 'icon',
                }).children(
                  Icon(h, { name: 'copy', size: 'sm' }) as never,
                ) as never,
              ),
              h.p
                .class(
                  'mt-4 border-t pt-4 text-xs leading-relaxed text-muted-foreground',
                )
                .children(
                  'MIT licensed. Source in your project. Built on Effect UI.',
                ),
            ),
        ),
    )

const faq = (h: Html.H<Message>) =>
  h.section
    .class(
      'mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-14 md:grid-cols-[1fr_1.5fr] md:px-8 md:py-20',
    )
    .children(
      h.div
        .class('max-w-sm')
        .children(
          h.h2
            .class('text-2xl font-semibold tracking-tight sm:text-3xl')
            .children('A few practical things.'),
          h.p
            .class('mt-3 text-sm leading-relaxed text-muted-foreground')
            .children('The details before you get started.'),
        ),
      h.div.children(
        ...[
          [
            'Do I need React?',
            'Crease UI is built for Effect UI. Its components use Effect UI models, messages, and view functions.',
          ],
          [
            'Can I use my shadcn theme?',
            'Yes. Crease uses the same CSS token contract, including --background, --primary, and --radius.',
          ],
          [
            'Where does accessibility come from?',
            'Effect UI provides the headless behavior, keyboard navigation, focus management, and ARIA attributes. Crease adds the styling.',
          ],
          [
            'Is it free to use?',
            'The components and registry source are MIT licensed. Crease UI is an independent project, with credit to shadcn/ui.',
          ],
        ].map(([question, answer]) =>
          h.details
            .key(question ?? '')
            .class('group border-b border-border py-5 first:pt-0')
            .children(
              h.summary
                .class(
                  'flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-sm font-medium outline-none [&::-webkit-details-marker]:hidden',
                )
                .children(
                  question,
                  h.span
                    .class(
                      'text-lg font-normal text-muted-foreground transition-transform group-open:rotate-45',
                    )
                    .children('+'),
                ),
              h.p
                .class(
                  'max-w-lg pt-3 text-sm leading-relaxed text-pretty text-muted-foreground',
                )
                .children(answer),
            ),
        ),
      ),
    )

const footer = (h: Html.H<Message>) =>
  h.footer
    .class('border-t')
    .children(
      h.div
        .class(
          'mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground md:px-8',
        )
        .children(
          h.span.children('crease/ui — the visible layer.'),
          h.div
            .class('flex flex-wrap items-center gap-4')
            .children(
              h.a
                .class('hover:text-foreground')
                .attrs({ href: 'https://ui.effect.website' })
                .children('Effect UI'),
              h.span.children('MIT'),
              h.span.children(
                'Credits: shadcn/ui · Astryx · Effect UI · Apache ECharts · Lucide · Hugeicons · Tabler · Phosphor · Remix Icon',
              ),
            ),
        ),
    )

export const LandingPage = Html.component({
  name: 'DocsLandingPage',
  model: Schema.Struct({
    compare: Schema.Number,
    showcase: Schema.String,
    accent: Schema.String,
    radius: Schema.String,
    font: Schema.String,
    period: Schema.String,
    series: Schema.String,
  }),
  message: Message,
}).make({
  init: () => ({
    compare: 50,
    showcase: 'dashboard',
    accent: 'green',
    radius: 'large',
    font: 'inter',
    period: 'month',
    series: 'both',
  }),
  update: {
    DraggedCompare: ($, { value }) =>
      $.evolve({ compare: Math.min(100, Math.max(0, value)) }),
    SelectedShowcase: ($, { value }) => $.evolve({ showcase: value }),
    SelectedAccent: ($, { value }) => $.evolve({ accent: value }),
    SelectedRadius: ($, { value }) => $.evolve({ radius: value }),
    SelectedFont: ($, { value }) => $.evolve({ font: value }),
    SelectedPeriod: ($, { value }) => $.evolve({ period: value }),
    SelectedSeries: ($, { value }) => $.evolve({ series: value }),
    ChartEvent: $ => $,
  },
  view: (h, model) =>
    h.div
      .attrs({ 'data-landing-tour': '' })
      .children(
        hero(h),
        comparison(h, model.compare),
        showcase(h, model.showcase),
        studio(h, model.accent, model.radius, model.font),
        stateSection(h),
        playground(h),
        chartSection(h, model.period, model.series),
        mapSection(h),
        gettingStarted(h),
        faq(h),
        footer(h),
      ),
})
