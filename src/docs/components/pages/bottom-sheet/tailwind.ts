import { Option, Schema as S } from 'effect'
import { Command } from 'foldkit'
import type { Update } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import { definePreviewProgram } from '@/docs/components/pages/authored-page'
import * as BottomSheet from '@/ui/bottom-sheet'
import * as Button from '@/ui/button'
import * as Checkbox from '@/ui/checkbox'
import * as Input from '@/ui/input'
import * as RadioGroup from '@/ui/radio-group'
import * as Separator from '@/ui/separator'
import * as Textarea from '@/ui/textarea'

import {
  type BottomSheetFixture,
  bottomSheetFixtures,
  directionSteps,
  heightsCopy,
} from './shared'

const SheetHeightSchema = S.Literals(['hug', 'capped', 'tall'])

const PreviewModel = S.Struct({
  _docsPage: S.Literal('bottom-sheet'),
  sheet: BottomSheet.Model,
  switcher: BottomSheet.SwitcherModel,
  inStock: S.Boolean,
  onSale: S.Boolean,
  freeShipping: S.Boolean,
  frequency: RadioGroup.Model,
  frequencyValue: S.String,
  emailChannel: S.Boolean,
  pushChannel: S.Boolean,
  textChannel: S.Boolean,
  name: S.String,
  email: S.String,
  company: S.String,
  role: S.String,
  bio: S.String,
  notes: S.String,
  selectedHeight: SheetHeightSchema,
  backgroundClicks: S.Number,
})
type PreviewModel = typeof PreviewModel.Type

const PreviewMessage = defineMessageUnion({
  ClickedOpenSheetPreview: {},
  ClickedDismissSheetPreview: {},
  ClickedOpenHeightPreview: { height: SheetHeightSchema },
  ClickedOpenSwitcherPreview: {},
  RequestedSheetStepPreview: { sheetId: S.String },
  ClickedDismissSwitcherPreview: {},
  ClickedBackgroundPreview: {},
  ToggledFilterPreview: {
    field: S.Literals(['inStock', 'onSale', 'freeShipping']),
    isChecked: S.Boolean,
  },
  ToggledChannelPreview: {
    field: S.Literals(['emailChannel', 'pushChannel', 'textChannel']),
    isChecked: S.Boolean,
  },
  ChangedProfileFieldPreview: {
    field: S.Literals(['name', 'email', 'company', 'role', 'bio', 'notes']),
    value: S.String,
  },
  GotRadioMessagePreview: { message: RadioGroup.Message },
  GotSheetPreviewMessage: { message: BottomSheet.Message },
  GotSwitcherPreviewMessage: { message: BottomSheet.SwitcherMessage },
})
type PreviewMessage = typeof PreviewMessage.Type

const fixtureFor = (index: number): BottomSheetFixture =>
  bottomSheetFixtures[index] ?? bottomSheetFixtures[0]!

const init = (index: number): PreviewModel => {
  const fixture = fixtureFor(index)
  const id = `docs-bottom-sheet-${String(index)}`
  return {
    _docsPage: 'bottom-sheet',
    sheet:
      fixture.kind === 'noscrim'
        ? BottomSheet.init({ id, height: 'hug', hasScrim: false })
        : fixture.kind === 'snappoints'
          ? BottomSheet.init({
              id,
              height: 'tall',
              snapPoints: ['96px', '50%'],
            })
          : fixture.kind === 'keyboard'
            ? BottomSheet.init({ id, height: 'tall' })
            : BottomSheet.init({ id }),
    switcher:
      fixture.kind === 'switcher'
        ? BottomSheet.initSwitcher({
            id: `docs-switcher-${String(index)}`,
            sheets: [
              { id: 'overview', label: 'Set up notifications', height: 'hug' },
              {
                id: 'frequency',
                label: 'Notification frequency',
                height: 'hug',
              },
              { id: 'channels', label: 'Notification channels', height: 'hug' },
            ],
          })
        : fixture.kind === 'reviewflow'
          ? BottomSheet.initSwitcher({
              id: `docs-switcher-${String(index)}`,
              sheets: [
                {
                  id: 'review',
                  label: 'Review notification settings',
                  height: 'hug',
                  purpose: 'form',
                },
                { id: 'confirm', label: 'Confirm settings', height: 'hug' },
              ],
            })
          : BottomSheet.initSwitcher({
              id: `docs-switcher-${String(index)}`,
              sheets: [],
            }),
    inStock: false,
    onSale: false,
    freeShipping: false,
    frequency: RadioGroup.init({ id: `docs-frequency-group-${String(index)}` }),
    frequencyValue: 'weekly',
    emailChannel: true,
    pushChannel: true,
    textChannel: false,
    name: '',
    email: '',
    company: '',
    role: '',
    bio: '',
    notes: '',
    selectedHeight: 'hug',
    backgroundClicks: 0,
  }
}

const mapSheet = (
  model: PreviewModel,
  result: ReturnType<typeof BottomSheet.update>,
): Update.Return<PreviewModel, PreviewMessage> => ({
  model: { ...model, sheet: result.model },
  commands: Command.mapMessages(result.commands ?? [], message =>
    PreviewMessage.GotSheetPreviewMessage({ message }),
  ),
})

const mapSwitcher = (
  model: PreviewModel,
  result: ReturnType<typeof BottomSheet.updateSwitcher>,
): Update.Return<PreviewModel, PreviewMessage> => ({
  model: { ...model, switcher: result.model },
  commands: Command.mapMessages(result.commands ?? [], message =>
    PreviewMessage.GotSwitcherPreviewMessage({ message }),
  ),
})

const update = (
  model: PreviewModel,
  message: PreviewMessage,
): Update.Return<PreviewModel, PreviewMessage> => {
  switch (message._tag) {
    case 'ClickedOpenSheetPreview':
      return mapSheet(model, BottomSheet.open(model.sheet))
    case 'ClickedDismissSheetPreview':
      return mapSheet(model, BottomSheet.close(model.sheet))
    case 'ClickedOpenHeightPreview':
      return mapSheet(
        { ...model, selectedHeight: message.height },
        BottomSheet.open({ ...model.sheet, height: message.height }),
      )
    case 'ClickedOpenSwitcherPreview': {
      const firstId =
        model.switcher.sheets['overview'] !== undefined ? 'overview' : 'review'
      return mapSwitcher(model, BottomSheet.openSheet(model.switcher, firstId))
    }
    case 'RequestedSheetStepPreview':
      return mapSwitcher(
        model,
        BottomSheet.openSheet(model.switcher, message.sheetId),
      )
    case 'ClickedDismissSwitcherPreview':
      return mapSwitcher(model, BottomSheet.closeSwitcher(model.switcher))
    case 'ClickedBackgroundPreview':
      return {
        model: { ...model, backgroundClicks: model.backgroundClicks + 1 },
      }
    case 'ToggledFilterPreview': {
      if (message.field === 'inStock')
        return { model: { ...model, inStock: message.isChecked } }
      if (message.field === 'onSale')
        return { model: { ...model, onSale: message.isChecked } }
      return { model: { ...model, freeShipping: message.isChecked } }
    }
    case 'ToggledChannelPreview': {
      if (message.field === 'emailChannel')
        return { model: { ...model, emailChannel: message.isChecked } }
      if (message.field === 'pushChannel')
        return { model: { ...model, pushChannel: message.isChecked } }
      return { model: { ...model, textChannel: message.isChecked } }
    }
    case 'ChangedProfileFieldPreview': {
      if (message.field === 'name')
        return { model: { ...model, name: message.value } }
      if (message.field === 'email')
        return { model: { ...model, email: message.value } }
      if (message.field === 'company')
        return { model: { ...model, company: message.value } }
      if (message.field === 'role')
        return { model: { ...model, role: message.value } }
      if (message.field === 'bio')
        return { model: { ...model, bio: message.value } }
      return { model: { ...model, notes: message.value } }
    }
    case 'GotRadioMessagePreview': {
      const result = RadioGroup.update(model.frequency, message.message)
      const selection = Option.fromNullishOr(result.outMessage)
      return {
        model: {
          ...model,
          frequency: result.model,
          frequencyValue: Option.match(selection, {
            onNone: () => model.frequencyValue,
            onSome: selected => selected.value,
          }),
        },
      }
    }
    case 'GotSheetPreviewMessage':
      return mapSheet(model, BottomSheet.update(model.sheet, message.message))
    case 'GotSwitcherPreviewMessage':
      return mapSwitcher(
        model,
        BottomSheet.updateSwitcher(model.switcher, message.message),
      )
  }
}

const filterContent = (
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-4 p-4')],
    [
      h.h3([h.Class('text-base font-semibold')], ['Filters']),
      Separator.separator({}, h),
      h.div(
        [h.Class('flex flex-col gap-2')],
        [
          Checkbox.checkbox(
            {
              id: 'in-stock',
              isChecked: model.inStock,
              onToggle: isChecked =>
                PreviewMessage.ToggledFilterPreview({
                  field: 'inStock',
                  isChecked,
                }),
              label: 'In stock',
            },
            h,
          ),
          Checkbox.checkbox(
            {
              id: 'on-sale',
              isChecked: model.onSale,
              onToggle: isChecked =>
                PreviewMessage.ToggledFilterPreview({
                  field: 'onSale',
                  isChecked,
                }),
              label: 'On sale',
            },
            h,
          ),
          Checkbox.checkbox(
            {
              id: 'free-shipping',
              isChecked: model.freeShipping,
              onToggle: isChecked =>
                PreviewMessage.ToggledFilterPreview({
                  field: 'freeShipping',
                  isChecked,
                }),
              label: 'Free shipping',
            },
            h,
          ),
        ],
      ),
      Button.button(
        {
          variant: 'default',
          onClick: PreviewMessage.ClickedDismissSheetPreview(),
          children: ['Apply'],
        },
        h,
      ),
    ],
  )

const heightsContent = (
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-4 p-4')],
    [
      h.h3(
        [h.Class('text-base font-semibold capitalize')],
        [`${model.selectedHeight} height`],
      ),
      Separator.separator({}, h),
      h.p([h.Class('text-sm')], [heightsCopy[model.selectedHeight]]),
      Button.button(
        {
          variant: 'default',
          onClick: PreviewMessage.ClickedDismissSheetPreview(),
          children: ['Close'],
        },
        h,
      ),
    ],
  )

const noScrimContent = (h: HtmlBuilder<PreviewMessage>): Html =>
  h.div(
    [h.Class('flex flex-col gap-4 p-4')],
    [
      h.h3([h.Class('text-base font-semibold')], ['Central Park']),
      Separator.separator({}, h),
      h.p(
        [h.Class('text-sm')],
        ['The page remains visible and interactive behind this sheet.'],
      ),
      Button.button(
        {
          variant: 'default',
          onClick: PreviewMessage.ClickedDismissSheetPreview(),
          children: ['Close details'],
        },
        h,
      ),
    ],
  )

const stepsContent = (h: HtmlBuilder<PreviewMessage>): Html =>
  h.div(
    [h.Class('flex flex-col gap-4 p-4')],
    [
      h.div(
        [h.Class('flex flex-col gap-1')],
        [
          h.h3([h.Class('text-base font-semibold')], ['Ferry Building']),
          h.div(
            [h.Class('flex items-center gap-2')],
            [
              h.span([h.Class('text-sm font-medium')], ['18 min']),
              h.span(
                [h.Class('text-xs text-muted-foreground')],
                ['3.7 mi · arrive 9:41 AM'],
              ),
            ],
          ),
        ],
      ),
      Separator.separator({}, h),
      h.div(
        [h.Class('flex flex-col')],
        directionSteps.map(step =>
          h.div(
            [h.Class('flex items-center gap-3 py-2')],
            [
              h.div(
                [h.Class('flex-1')],
                [
                  h.p([h.Class('text-sm')], [step.label]),
                  h.p(
                    [h.Class('text-xs text-muted-foreground')],
                    [step.detail],
                  ),
                ],
              ),
              h.span(
                [h.Class('text-xs text-muted-foreground')],
                [step.distance],
              ),
            ],
          ),
        ),
      ),
      Separator.separator({}, h),
      Button.button(
        {
          variant: 'default',
          onClick: PreviewMessage.ClickedDismissSheetPreview(),
          children: ['Start'],
        },
        h,
      ),
    ],
  )

const profileInput = (
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
  field: 'name' | 'email' | 'company' | 'role',
  label: string,
  type?: string,
): Html =>
  Input.input(
    {
      id: `profile-${field}`,
      label,
      value: model[field],
      onInput: value =>
        PreviewMessage.ChangedProfileFieldPreview({ field, value }),
      ...(type === undefined ? {} : { type }),
    },
    h,
  )

const profileArea = (
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
  field: 'bio' | 'notes',
  label: string,
): Html =>
  Textarea.textarea(
    {
      id: `profile-${field}`,
      label,
      rows: 5,
      value: model[field],
      onInput: value =>
        PreviewMessage.ChangedProfileFieldPreview({ field, value }),
    },
    h,
  )

const keyboardContent = (
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
): Html =>
  h.form(
    [
      h.OnSubmit(PreviewMessage.ClickedDismissSheetPreview()),
      h.Class('flex flex-col gap-4 p-4'),
    ],
    [
      h.h3([h.Class('text-base font-semibold')], ['Edit profile']),
      Separator.separator({}, h),
      h.p(
        [h.Class('text-xs text-muted-foreground')],
        [
          'Focus fields throughout the form to see them remain visible above the mobile keyboard.',
        ],
      ),
      profileInput(model, h, 'name', 'Name'),
      profileInput(model, h, 'email', 'Email', 'email'),
      profileInput(model, h, 'company', 'Company'),
      profileInput(model, h, 'role', 'Role'),
      profileArea(model, h, 'bio', 'Bio'),
      profileArea(model, h, 'notes', 'Notes'),
      Button.button(
        {
          variant: 'default',
          type: 'submit',
          children: ['Save profile'],
        },
        h,
      ),
    ],
  )

const sheetHead = (
  h: HtmlBuilder<PreviewMessage>,
  title: string,
  meta: string,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-1')],
    [
      h.h3([h.Class('text-base font-semibold')], [title]),
      h.p([h.Class('text-xs text-muted-foreground')], [meta]),
    ],
  )

const switcherSheet = (
  h: HtmlBuilder<PreviewMessage>,
  id: string,
  title: string,
  meta: string,
  body: ReadonlyArray<Html>,
  buttons: ReadonlyArray<Html>,
): { id: string; content: Html } => ({
  id,
  content: h.div(
    [h.Class('flex flex-col gap-4 p-4')],
    [
      sheetHead(h, title, meta),
      Separator.separator({}, h),
      ...body,
      h.div([h.Class('flex justify-end gap-2')], buttons),
    ],
  ),
})

const switcherSheets = (
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
): ReadonlyArray<{ id: string; content: Html }> => [
  switcherSheet(
    h,
    'overview',
    'Set up notifications',
    'Step 1 of 3',
    [
      h.p(
        [h.Class('text-xs text-muted-foreground')],
        [
          'Stay informed about activity that matters without checking back throughout the day.',
        ],
      ),
      h.div(
        [h.Class('flex flex-col gap-3')],
        (
          [
            'Important activity',
            'Timely reminders',
            'Useful summaries',
          ] as const
        ).map((label, i) =>
          h.div(
            [h.Class('flex flex-col gap-1')],
            [
              h.p([h.Class('text-sm font-medium')], [label]),
              h.p(
                [h.Class('text-xs text-muted-foreground')],
                [
                  [
                    'Know when someone mentions you or needs your attention.',
                    'Get a reminder before work reaches its due date.',
                    'Catch up on anything you may have missed.',
                  ][i]!,
                ],
              ),
            ],
          ),
        ),
      ),
    ],
    [
      Button.button(
        {
          variant: 'secondary',
          onClick: PreviewMessage.ClickedDismissSwitcherPreview(),
          children: ['Cancel'],
        },
        h,
      ),
      Button.button(
        {
          variant: 'default',
          onClick: PreviewMessage.RequestedSheetStepPreview({
            sheetId: 'frequency',
          }),
          children: ['Continue'],
        },
        h,
      ),
    ],
  ),
  switcherSheet(
    h,
    'frequency',
    'How often?',
    'Step 2 of 3',
    [
      RadioGroup.radioGroup(
        {
          model: model.frequency,
          selectedValue: Option.some(model.frequencyValue),
          toParentMessage: message =>
            PreviewMessage.GotRadioMessagePreview({ message }),
          ariaLabel: 'Notification frequency',
          options: [
            { value: 'immediately', label: 'Immediately' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
          ],
        },
        h,
      ),
    ],
    [
      Button.button(
        {
          variant: 'secondary',
          onClick: PreviewMessage.RequestedSheetStepPreview({
            sheetId: 'overview',
          }),
          children: ['Back'],
        },
        h,
      ),
      Button.button(
        {
          variant: 'default',
          onClick: PreviewMessage.RequestedSheetStepPreview({
            sheetId: 'channels',
          }),
          children: ['Continue'],
        },
        h,
      ),
    ],
  ),
  switcherSheet(
    h,
    'channels',
    'Where should we notify you?',
    'Step 3 of 3',
    [
      h.p(
        [h.Class('text-xs text-muted-foreground')],
        ['Choose any combination. You can change these preferences later.'],
      ),
      h.div(
        [h.Class('flex flex-col gap-2')],
        [
          Checkbox.checkbox(
            {
              id: 'channel-email',
              isChecked: model.emailChannel,
              onToggle: isChecked =>
                PreviewMessage.ToggledChannelPreview({
                  field: 'emailChannel',
                  isChecked,
                }),
              label: 'Email',
            },
            h,
          ),
          Checkbox.checkbox(
            {
              id: 'channel-push',
              isChecked: model.pushChannel,
              onToggle: isChecked =>
                PreviewMessage.ToggledChannelPreview({
                  field: 'pushChannel',
                  isChecked,
                }),
              label: 'Push notifications',
            },
            h,
          ),
          Checkbox.checkbox(
            {
              id: 'channel-text',
              isChecked: model.textChannel,
              onToggle: isChecked =>
                PreviewMessage.ToggledChannelPreview({
                  field: 'textChannel',
                  isChecked,
                }),
              label: 'Text messages',
            },
            h,
          ),
        ],
      ),
    ],
    [
      Button.button(
        {
          variant: 'secondary',
          onClick: PreviewMessage.RequestedSheetStepPreview({
            sheetId: 'frequency',
          }),
          children: ['Back'],
        },
        h,
      ),
      Button.button(
        {
          variant: 'default',
          onClick: PreviewMessage.ClickedDismissSwitcherPreview(),
          children: ['Finish'],
        },
        h,
      ),
    ],
  ),
]

const reviewSheets = (
  h: HtmlBuilder<PreviewMessage>,
): ReadonlyArray<{ id: string; content: Html }> => [
  switcherSheet(
    h,
    'review',
    'Review settings',
    'Daily summaries will be sent by email.',
    [],
    [
      Button.button(
        {
          variant: 'secondary',
          onClick: PreviewMessage.ClickedDismissSwitcherPreview(),
          children: ['Cancel'],
        },
        h,
      ),
      Button.button(
        {
          variant: 'default',
          onClick: PreviewMessage.RequestedSheetStepPreview({
            sheetId: 'confirm',
          }),
          children: ['Continue'],
        },
        h,
      ),
    ],
  ),
  switcherSheet(
    h,
    'confirm',
    'Confirm settings',
    'Your notification settings are ready to save.',
    [],
    [
      Button.button(
        {
          variant: 'secondary',
          onClick: PreviewMessage.RequestedSheetStepPreview({
            sheetId: 'review',
          }),
          children: ['Back'],
        },
        h,
      ),
      Button.button(
        {
          variant: 'default',
          onClick: PreviewMessage.ClickedDismissSwitcherPreview(),
          children: ['Save'],
        },
        h,
      ),
    ],
  ),
]

const centerMain = (
  h: HtmlBuilder<PreviewMessage>,
  children: ReadonlyArray<Html>,
): Html =>
  h.main(
    [h.Class('flex min-h-screen items-center justify-center p-8')],
    children,
  )

const sheetOf = (
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
  label: string,
  content: Html,
): Html =>
  BottomSheet.bottomSheet(
    {
      model: model.sheet,
      toParentMessage: message =>
        PreviewMessage.GotSheetPreviewMessage({ message }),
      label,
      content,
    },
    h,
  )

const switcherOf = (
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
  sheets: ReadonlyArray<{ id: string; content: Html }>,
): Html =>
  BottomSheet.bottomSheetSwitcher(
    {
      model: model.switcher,
      toParentMessage: message =>
        PreviewMessage.GotSwitcherPreviewMessage({ message }),
      sheets,
    },
    h,
  )

const view = (
  index: number,
  model: PreviewModel,
  h: HtmlBuilder<PreviewMessage>,
): Html => {
  const fixture = fixtureFor(index)
  switch (fixture.kind) {
    case 'showcase':
      return centerMain(h, [
        Button.button(
          {
            variant: 'outline',
            onClick: PreviewMessage.ClickedOpenSheetPreview(),
            children: [fixture.triggerLabel],
          },
          h,
        ),
        sheetOf(model, h, 'Filters', filterContent(model, h)),
      ])
    case 'heights':
      return centerMain(h, [
        h.div(
          [h.Class('flex flex-wrap gap-2')],
          (['hug', 'capped', 'tall'] as const).map(height =>
            Button.button(
              {
                variant: 'outline',
                onClick: PreviewMessage.ClickedOpenHeightPreview({ height }),
                children: [`Open ${height}`],
              },
              h,
            ),
          ),
        ),
        sheetOf(
          model,
          h,
          `${model.selectedHeight} height`,
          heightsContent(model, h),
        ),
      ])
    case 'noscrim':
      return centerMain(h, [
        h.div(
          [h.Class('flex flex-col gap-3 p-4')],
          [
            h.h3([h.Class('text-base font-semibold')], ['Nearby places']),
            h.p(
              [h.Class('text-sm')],
              [`Background interactions: ${model.backgroundClicks}`],
            ),
            Button.button(
              {
                variant: 'secondary',
                onClick: PreviewMessage.ClickedBackgroundPreview(),
                children: ['Interact with page'],
              },
              h,
            ),
            Button.button(
              {
                variant: 'default',
                onClick: PreviewMessage.ClickedOpenSheetPreview(),
                children: [fixture.triggerLabel],
              },
              h,
            ),
          ],
        ),
        sheetOf(model, h, 'Place details', noScrimContent(h)),
      ])
    case 'snappoints':
      return centerMain(h, [
        h.div(
          [h.Class('flex max-w-md flex-col gap-3')],
          [
            h.p(
              [h.Class('text-sm')],
              [
                'This sheet has two extra stops: half the viewport, and a 96px peek. Drag the handle down to collapse it, then back up — it rests at each stop instead of following your finger.',
              ],
            ),
            Button.button(
              {
                variant: 'default',
                onClick: PreviewMessage.ClickedOpenSheetPreview(),
                children: [fixture.triggerLabel],
              },
              h,
            ),
          ],
        ),
        sheetOf(model, h, 'Directions to the Ferry Building', stepsContent(h)),
      ])
    case 'keyboard':
      return centerMain(h, [
        Button.button(
          {
            variant: 'default',
            onClick: PreviewMessage.ClickedOpenSheetPreview(),
            children: [fixture.triggerLabel],
          },
          h,
        ),
        sheetOf(model, h, 'Edit profile', keyboardContent(model, h)),
      ])
    case 'switcher':
      return centerMain(h, [
        Button.button(
          {
            variant: 'default',
            onClick: PreviewMessage.ClickedOpenSwitcherPreview(),
            children: [fixture.triggerLabel],
          },
          h,
        ),
        switcherOf(model, h, switcherSheets(model, h)),
      ])
    case 'reviewflow':
      return centerMain(h, [
        Button.button(
          {
            variant: 'default',
            onClick: PreviewMessage.ClickedOpenSwitcherPreview(),
            children: [fixture.triggerLabel],
          },
          h,
        ),
        switcherOf(model, h, reviewSheets(h)),
      ])
  }
}

export const bottomSheetTailwindPreviewProgram = definePreviewProgram<
  PreviewModel,
  PreviewMessage
>({
  Model: PreviewModel,
  Message: PreviewMessage,
  init,
  update,
  view,
})
