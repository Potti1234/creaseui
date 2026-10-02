import type { DocsExample } from '@/docs/components/page-definition';
import { foldkitApplication } from '@/docs/components/pages/authored-page';
import type { TourStepSpec } from '@/ui/tour';

export type TourKind = 'showcase' | 'lightweight' | 'placement';

export type TourFixture = Readonly<{
  title: string;
  description?: string;
  kind: TourKind;
  hasBackdrop: boolean;
  isStepCountShown: boolean;
  heroOnly?: boolean;
  targets: ReadonlyArray<string>;
  steps: ReadonlyArray<Readonly<{
    id: string;
    targetId: string;
    heading: string;
    body: string;
    placement?: 'below' | 'above' | 'start' | 'end';
    alignment?: 'start' | 'center' | 'end';
  }>>;
}>;

/* astryx ships no example blocks for Tour (lab component); these examples are
   derived from Tour.doc.mjs usage + Tour.test.tsx scenarios — flagged as
   derived per the porting instructions. */
export const tourFixtures: ReadonlyArray<TourFixture> = [
  {
    title: 'Tour',
    description:
      'A three-step onboarding tour with a backdrop cutout and a visible step count.',
    kind: 'showcase',
    hasBackdrop: true,
    isStepCountShown: true,
    /* heroOnly: the tour looks targets up by DOM id, so a hero/named twin
       would share 'target-create' etc. — the hero copy's rewritten -hero ids
       would never be found and the named copy would anchor to the hero's
       buttons. Rendering the showcase only as the hero keeps every target id
       unique on the page. */
    heroOnly: true,
    targets: ['target-create', 'target-invite', 'target-reports'],
    steps: [
      {
        id: 'welcome',
        targetId: 'target-create',
        heading: 'Create your first project',
        body: 'Start here — a project groups boards, docs, and people in one place.',
        placement: 'below',
        alignment: 'start',
      },
      {
        id: 'invite',
        targetId: 'target-invite',
        heading: 'Bring the team along',
        body: 'Invite teammates by email; they land directly in this workspace.',
        placement: 'below',
        alignment: 'center',
      },
      {
        id: 'reports',
        targetId: 'target-reports',
        heading: 'See it working',
        body: 'Reports update live as your team ships — check back any time.',
        placement: 'below',
        alignment: 'end',
      },
    ],
  },
  {
    title: 'Tour — Lightweight',
    description:
      'Coachmark steps without a backdrop — the page stays fully visible and interactive around the ring.',
    kind: 'lightweight',
    hasBackdrop: false,
    isStepCountShown: false,
    targets: ['target-save', 'target-share'],
    steps: [
      {
        id: 'save',
        targetId: 'target-save',
        heading: 'Save for later',
        body: 'Everything you save syncs across your devices.',
        placement: 'below',
        alignment: 'start',
      },
      {
        id: 'share',
        targetId: 'target-share',
        heading: 'Share it forward',
        body: 'Send a link; recipients do not need an account to view.',
        placement: 'below',
        alignment: 'start',
      },
    ],
  },
  {
    title: 'Tour — Callout placement',
    description:
      'A step whose callout sits above the target and aligns to the end of the placement side.',
    kind: 'placement',
    hasBackdrop: true,
    isStepCountShown: true,
    targets: ['target-shortcut', 'target-filters'],
    steps: [
      {
        id: 'shortcut',
        targetId: 'target-shortcut',
        heading: 'Quick actions live here',
        body: 'This callout anchors above the target, aligned to its trailing edge.',
        placement: 'above',
        alignment: 'end',
      },
      {
        id: 'filters',
        targetId: 'target-filters',
        heading: 'Narrow the noise',
        body: 'Filters stack; combine them to reach the view you want.',
        placement: 'above',
        alignment: 'end',
      },
    ],
  },
];

const emitStyles = `const styles = stylex.create({
  main: { alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: '100vh', padding: '2rem' },
  card: { borderColor: 'var(--border)', borderRadius: 'var(--radius)', borderStyle: 'solid', borderWidth: '1px', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '28rem', padding: '1.5rem', width: '100%' },
  heading: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: 600 },
  body: { color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: '1.25rem' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
})`;

const emitSteps = (fixture: TourFixture): string =>
  `[\n${fixture.steps
    .map(
      step => `    { id: '${step.id}', targetId: '${step.targetId}', heading: '${step.heading}', content: '${step.body}'${step.placement === undefined ? '' : `, placement: '${step.placement}'`}${step.alignment === undefined ? '' : `, alignment: '${step.alignment}'`} },`,
    )
    .join('\n')}\n  ]`;

const emitView = (fixture: TourFixture, isStyleX: boolean): string => {
  const cls = (tailwind: string, stylexRef: string) =>
    isStyleX ? `className(${stylexRef})` : `'${tailwind}'`;
  const buttons = fixture.targets
    .map((targetId, i) => {
      const label = fixture.kind === 'showcase'
        ? ['New project', 'Invite team', 'Reports'][i]!
        : fixture.kind === 'lightweight'
          ? ['Save', 'Share'][i]!
          : ['Quick actions', 'Filters'][i]!;
      return `    Button.button({ variant: 'outline', id: '${targetId}', children: ['${label}'] }, h)`;
    })
    .join(',\n');
  return `export const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: 'Tour — ${fixture.title}',
  body: h.main([h.Class(${cls('flex min-h-screen items-center justify-center p-8', 'styles.main')})], [
    h.div([h.Class(${cls('flex w-full max-w-md flex-col gap-4 rounded-lg border p-6', 'styles.card')})], [
      h.h3([h.Class(${cls('text-lg font-semibold', 'styles.heading')})], ['Workspace']),
      h.p([h.Class(${cls('text-sm text-muted-foreground', 'styles.body')})], ['A tour walks new teammates through the parts that matter.']),
      h.div([h.Class(${cls('flex flex-wrap gap-2', 'styles.actions')})], [
${buttons},
        Button.button({ variant: 'default', onClick: ClickedStartTour(), children: ['Start tour'] }, h),
      ]),
    ]),
    Tour.tour({
      model: model.tour,
      toParentMessage: message => GotTourMessage({ message }),
      steps: ${emitSteps(fixture)},
      hasBackdrop: ${fixture.hasBackdrop},
      isStepCountShown: ${fixture.isStepCountShown},
    }, h),
  ]),
})`;
};

const source = (fixture: TourFixture, renderer: 'tailwind' | 'stylex'): string => {
  const isStyleX = renderer === 'stylex';
  const u = isStyleX ? 'stylex' : 'ui';
  const tag = fixture.title.replaceAll(/[^a-zA-Z0-9]/g, '');
  return foldkitApplication({
    title: `Tour — ${fixture.title}`,
    imports: `import { Schema as S } from 'effect'
import { Command, Runtime, Subscription, Update } from 'foldkit'
import { type Document, type HtmlBuilder } from 'foldkit/html'
import { taggedStruct } from 'foldkit/schema'
${isStyleX ? "\nimport * as stylex from '@stylexjs/stylex'\nimport { className } from '@/stylex/style'\n" : ''}import * as Button from '@/${u}/button'
import * as Tour from '@/${u}/tour'${isStyleX ? `\n\n${emitStyles}` : ''}`,
    model: `export const Model = S.Struct({ tour: Tour.Model })
export type Model = typeof Model.Type`,
    messages: `export const ClickedStartTour = taggedStruct('ClickedStartTour${tag}');
export const GotTourMessage = taggedStruct('GotTourMessage${tag}', { message: Tour.Message });
export const Message = S.Union([ClickedStartTour, GotTourMessage])
export type Message = typeof Message.Type`,
    init: `export const init = (): Update.Return<Model, Message> => ({ model: { tour: Tour.init() } })`,
    update: `export const update = (
  model: Model,
  message: Message,
): Update.Return<Model, Message> => {
  switch (message._tag) {
    case 'ClickedStartTour${tag}': {
      const result = Tour.activate(model.tour)
      return { model: { ...model, tour: result.model } }
    }
    case 'GotTourMessage${tag}': {
      const result = Tour.update(model.tour, message.message)
      const tour = result.outMessage === undefined ? result.model : Tour.deactivate(result.model).model
      return {
        model: { ...model, tour },
        commands: Command.mapMessages(result.commands ?? [], next => GotTourMessage({ message: next })),
      }
    }
  }
}`,
    view: emitView(fixture, isStyleX),
  });
};

export const tourExamples = (
  renderer: 'tailwind' | 'stylex',
): ReadonlyArray<DocsExample> => tourFixtures.map(fixture => ({
  title: fixture.title,
  ...(fixture.description === undefined ? {} : { description: fixture.description }),
  ...(fixture.heroOnly === true ? { heroOnly: true } : {}),
  code: source(fixture, renderer),
}));

export const stepsFor = (fixture: TourFixture): ReadonlyArray<TourStepSpec> =>
  fixture.steps.map(step => ({
    id: step.id,
    targetId: step.targetId,
    heading: step.heading,
    content: step.body,
    ...(step.placement === undefined ? {} : { placement: step.placement }),
    ...(step.alignment === undefined ? {} : { alignment: step.alignment }),
  }));
