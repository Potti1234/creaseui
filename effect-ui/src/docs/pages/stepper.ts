import { UiSchema } from '@effect/ui'
import { Html } from '@effect/ui/html'
import { Schema } from 'effect'

import { Badge, Button, Card, Icon, Input, Stepper } from '#components'
import type { IconName } from '../../behaviors/icon'
import type { StepperStep } from '../../ui/stepper'
import {
  defineComponentDocs,
  type DocsExampleImplementation,
  type DocsMessage,
} from '../types'
import { exampleApplicationSource } from './source'

type FixtureStep = {
  label: string
  description?: string
  status?: 'accent' | 'success' | 'warning' | 'error'
  optional?: boolean
  indicator?: 'number' | 'auto' | 'none' | 'icon'
  icon?: IconName
  content?: 'form' | 'review' | 'deploy'
}
type Panel = {
  id: string
  heading?: string
  orientation?: 'horizontal' | 'vertical'
  indicatorPosition?: 'separated' | 'on-track'
  minimumStepWidth?: number
  collapsedVariant?: 'withLabelAndControls'
  steps: readonly FixtureStep[]
}
type Fixture = {
  width?: number
  activeStep: number
  panels: readonly Panel[]
}

const indicatorModeSteps = (
  indicator: FixtureStep['indicator'],
  icons: readonly IconName[] = [],
): readonly FixtureStep[] =>
  ['Account', 'Profile', 'Settings', 'Review'].map((label, index) => ({
    label,
    ...(indicator === 'auto' || indicator === undefined
      ? {}
      : indicator === 'icon'
        ? { indicator: 'icon' as const, icon: icons[index] ?? 'info' }
        : { indicator }),
  }))

const fixtures: Record<string, Fixture> = {
  checkout: {
    width: 640,
    activeStep: 2,
    panels: [
      {
        id: 'checkout',
        steps: [
          { label: 'Cart' },
          { label: 'Shipping' },
          { label: 'Payment' },
          { label: 'Review' },
          { label: 'Confirm' },
        ],
      },
    ],
  },
  indicators: {
    activeStep: 2,
    panels: [
      {
        id: 'none',
        heading: 'None',
        orientation: 'vertical',
        steps: indicatorModeSteps('none'),
      },
      {
        id: 'auto',
        heading: 'Auto',
        orientation: 'vertical',
        steps: indicatorModeSteps('auto'),
      },
      {
        id: 'number',
        heading: 'Number',
        orientation: 'vertical',
        steps: indicatorModeSteps('number'),
      },
      {
        id: 'custom',
        heading: 'Custom icon',
        orientation: 'vertical',
        steps: indicatorModeSteps('icon', [
          'info',
          'search',
          'wrench',
          'check',
        ]),
      },
    ],
  },
  onTrackHorizontal: {
    width: 560,
    activeStep: 2,
    panels: [
      {
        id: 'on-track-h',
        indicatorPosition: 'on-track',
        steps: ['Workspace', 'Team', 'Integrations', 'Import', 'Launch'].map(
          label => ({ label, indicator: 'number' as const }),
        ),
      },
    ],
  },
  onTrackVertical: {
    width: 400,
    activeStep: 2,
    panels: [
      {
        id: 'on-track-v',
        orientation: 'vertical',
        indicatorPosition: 'on-track',
        steps: [
          {
            label: 'Create workspace',
            description: 'Name and configure your workspace',
          },
          {
            label: 'Invite team members',
            description: 'Add collaborators by email',
          },
          {
            label: 'Set up integrations',
            description: 'Connect Slack, GitHub, Jira',
          },
          { label: 'Import data', description: 'Bring in existing projects' },
          { label: 'Launch', description: 'Go live with your team' },
        ],
      },
    ],
  },
  status: {
    width: 400,
    activeStep: 3,
    panels: [
      {
        id: 'status',
        orientation: 'vertical',
        steps: [
          {
            label: 'Email verified',
            description: 'you@example.com',
            status: 'success',
          },
          {
            label: 'Phone verified',
            description: '+1 (555) 012-3456',
            status: 'success',
          },
          {
            label: 'Identity document',
            description: 'Passport upload failed',
            status: 'error',
          },
          {
            label: 'Address verification',
            description: 'Pending review',
            status: 'accent',
          },
          { label: 'Background check', description: 'Skipped', optional: true },
          { label: 'Account activated' },
        ],
      },
    ],
  },
  collapsed: {
    width: 320,
    activeStep: 1,
    panels: [
      {
        id: 'collapsed',
        minimumStepWidth: 112,
        collapsedVariant: 'withLabelAndControls',
        steps: [
          { label: 'Cart' },
          { label: 'Shipping', description: 'Where it goes' },
          { label: 'Delivery' },
          { label: 'Payment' },
        ],
      },
    ],
  },
  custom: {
    width: 680,
    activeStep: 0,
    panels: [
      {
        id: 'custom-content',
        orientation: 'vertical',
        steps: [
          {
            label: 'Project details',
            description: 'Name it and point us at the source',
            indicator: 'number',
            content: 'form',
          },
          {
            label: 'Review the build',
            description: 'What we detected from your default branch',
            indicator: 'number',
            content: 'review',
          },
          {
            label: 'Deploy',
            description: 'Ships to production',
            indicator: 'number',
            content: 'deploy',
          },
          { label: 'Live', indicator: 'number' },
        ],
      },
    ],
  },
}

const Message = UiSchema.TaggedEnum({
  PickedStep: { index: Schema.Number },
})
const StepperDemo = Html.component({
  name: 'DocsStepperDemo',
  props: Schema.Struct({ kind: Schema.String, idPrefix: Schema.String }),
  model: Schema.Struct({ activeStep: Schema.Number }),
  message: Message,
}).make({
  init: h => ({
    activeStep: (fixtures[h.props.kind] ?? fixtures['checkout']!).activeStep,
  }),
  update: {
    PickedStep: ($, { index }) => $.evolve({ activeStep: index }),
  },
  view: (h, model) => {
    const fixture = fixtures[h.props.kind] ?? fixtures['checkout']!
    const contentFor = (kind: NonNullable<FixtureStep['content']>) => {
      if (kind === 'form')
        return h.div.class('flex flex-col gap-3').children(
          h.div.class('flex gap-3').children(
            Input(h, {
              id: `${h.props.idPrefix}-project-name`,
              element: h.input.attrs({ placeholder: 'My awesome project' }),
              props: { value: '' },
              onUpdate: () => undefined,
            }),
            Input(h, {
              id: `${h.props.idPrefix}-repo-url`,
              element: h.input.attrs({ placeholder: 'https://github.com/...' }),
              props: { value: '' },
              onUpdate: () => undefined,
            }),
          ),
          h.div.children(
            Button(h, {
              onPress: Message.PickedStep({ index: 1 }),
            }).children('Continue'),
          ),
        )
      if (kind === 'review')
        return h.div.class('flex flex-col gap-3').children(
          Card(h, {
            children: card => [
              card.content({
                children: [
                  h.div
                    .class('flex flex-col gap-2')
                    .children(
                      h.div
                        .class('flex items-center gap-2')
                        .children(
                          h.span
                            .class('text-sm font-medium')
                            .children('Effect UI + Vite'),
                          Badge(h, { variant: 'secondary' }).children(
                            'Detected',
                          ),
                        ),
                      h.p
                        .class('text-muted-foreground text-xs')
                        .children(
                          'Build command ',
                          h.code.children('vite build'),
                          ' · Output ',
                          h.code.children('dist'),
                          ' · Node 22',
                        ),
                    ),
                ],
              }),
            ],
          }),
          h.div.class('flex gap-2').children(
            Button(h, {
              variant: 'secondary',
              onPress: Message.PickedStep({ index: 0 }),
            }).children('Back'),
            Button(h, {
              onPress: Message.PickedStep({ index: 2 }),
            }).children('Looks right'),
          ),
        )
      return h.div.class('flex flex-col gap-3').children(
        h.div
          .class('rounded-lg border px-4 py-3 text-sm')
          .children(
            h.div
              .class('font-medium')
              .children('First deploy takes a few minutes'),
            h.div
              .class('text-muted-foreground')
              .children(
                'Later deploys reuse the build cache and finish in under a minute.',
              ),
          ),
        h.div.class('flex gap-2').children(
          Button(h, {
            variant: 'secondary',
            onPress: Message.PickedStep({ index: 1 }),
          }).children('Back'),
          Button(h, {
            onPress: Message.PickedStep({ index: 3 }),
          }).children('Deploy now'),
        ),
      )
    }
    const stepConfig = (
      step: FixtureStep,
    ): StepperStep<typeof Message.Type, any> => ({
      key: step.label,
      label: step.label,
      ...(step.description === undefined
        ? {}
        : { description: step.description }),
      ...(step.status === undefined ? {} : { status: step.status }),
      ...(step.optional === true ? { optional: true } : {}),
      ...(step.indicator === 'icon'
        ? { indicator: Icon(h, { name: step.icon ?? 'info' }) }
        : step.indicator !== undefined && step.indicator !== 'auto'
          ? { indicator: step.indicator }
          : {}),
      ...(step.content === undefined
        ? {}
        : { content: contentFor(step.content) }),
    })
    const panels = fixture.panels.map((panel, panelIndex) => {
      const stepper = Stepper(h, {
        key: `${h.props.idPrefix}-${panel.id}`,
        id: `${h.props.idPrefix}-${panel.id}`,
        activeStep: model.activeStep,
        steps: panel.steps.map(stepConfig),
        buttons: true,
        ...(panel.orientation === undefined
          ? {}
          : { orientation: panel.orientation }),
        ...(panel.indicatorPosition === undefined
          ? {}
          : { indicatorPosition: panel.indicatorPosition }),
        ...(panel.minimumStepWidth === undefined
          ? {}
          : { minimumStepWidth: panel.minimumStepWidth }),
        ...(panel.collapsedVariant === undefined
          ? {}
          : { collapsedVariant: panel.collapsedVariant }),
        onEmit: {
          Picked: ({ index }) => Message.PickedStep({ index }),
        },
      })
      return panel.heading === undefined
        ? stepper
        : h.div
            .class('w-55')
            .key(panel.id)
            .children(
              h.p.class('mb-2 text-sm font-medium').children(panel.heading),
              stepper,
            )
    })
    const inner =
      panels.length > 1
        ? h.div.class('flex flex-wrap gap-12').children(panels)
        : panels[0]!
    return fixture.width === undefined
      ? inner
      : h.div.class(`w-[${fixture.width}px]`).children(inner)
  },
})

const view =
  (kind: keyof typeof fixtures): DocsExampleImplementation['view'] =>
  (h, context) =>
    StepperDemo(h, {
      key: `${context.idPrefix}-${kind}`,
      props: { kind, idPrefix: `${context.idPrefix}-${kind}` },
    }) as never

const source = exampleApplicationSource({
  imports: `import { Stepper } from '@/ui/effect/ui'`,
  body: `Stepper(h, {
  key: 'checkout',
  id: 'checkout',
  activeStep,
  buttons: true,
  steps: [
    { key: 'cart', label: 'Cart' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
  ],
  onEmit: { Picked: ({ index }) => PickedStep({ index }) },
})`,
})

export const componentDocs = defineComponentDocs({
  usage: `import { Stepper } from '@/ui/effect/ui'\n\nStepper(h, { key, id, activeStep, steps, onEmit })`,
  examples: [
    { title: 'Stepper — Checkout Progress', view: view('checkout'), source },
    { title: 'Stepper — Indicator Modes', view: view('indicators'), source },
    {
      title: 'Stepper — On-Track Horizontal',
      view: view('onTrackHorizontal'),
      source,
    },
    {
      title: 'Stepper — On-Track Vertical',
      view: view('onTrackVertical'),
      source,
    },
    { title: 'Stepper — Validation Status', view: view('status'), source },
    {
      title: 'Stepper — Horizontal Narrow Collapsed',
      view: view('collapsed'),
      source,
    },
    { title: 'Stepper — Custom Content', view: view('custom'), source },
  ],
})
