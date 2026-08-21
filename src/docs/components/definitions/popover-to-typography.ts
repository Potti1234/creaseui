import { Option } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import type { PageDefinitions } from '@/docs/components/page-definition';
import { realPreview } from '@/docs/components/real-previews';
import * as State from '@/docs/components/catalog-state';
import * as Badge from '@/ui/badge';
import * as Button from '@/ui/button';
import * as Card from '@/ui/card';
import * as Input from '@/ui/input';
import * as Kbd from '@/ui/kbd';
import * as Popover from '@/ui/popover';
import * as Progress from '@/ui/progress';
import * as RadioGroup from '@/ui/radio-group';
import * as Resizable from '@/ui/resizable';
import * as ScrollArea from '@/ui/scroll-area';
import * as Select from '@/ui/select';
import * as Separator from '@/ui/separator';
import * as Sheet from '@/ui/sheet';
import * as Sidebar from '@/ui/sidebar';
import * as Skeleton from '@/ui/skeleton';
import * as Slider from '@/ui/slider';
import * as Sonner from '@/ui/sonner';
import * as Spinner from '@/ui/spinner';
import * as Switch from '@/ui/switch';
import * as Table from '@/ui/table';
import * as Tabs from '@/ui/tabs';
import * as Textarea from '@/ui/textarea';
import * as Toast from '@/ui/toast';
import * as Toggle from '@/ui/toggle';
import * as ToggleGroup from '@/ui/toggle-group';
import * as Tooltip from '@/ui/tooltip';
import * as Typography from '@/ui/typography';

type Message = State.Message;
const action = State.ClickedPreviewAction();
const width = 'w-full max-w-sm';

const basic = (slug: string, code: string) => ({
  title: 'Basic',
  preview: (model: State.Model, h: HtmlBuilder<Message>) =>
    realPreview(slug, model, h),
  code,
});

const rtl = (child: Html, h: HtmlBuilder<Message>): Html =>
  h.div([h.Dir('rtl')], [child]);
type PreviewChild = Html | string;

const previewGroup = (
  className: string,
  args: readonly (
    PreviewChild | ReadonlyArray<PreviewChild> | HtmlBuilder<Message>
  )[],
): Html => {
  const h = args.at(-1) as HtmlBuilder<Message>;
  const children = args.slice(0, -1).flat() as ReadonlyArray<PreviewChild>;
  return h.div([h.Class(className)], children);
};

const row = (
  ...args: [
    ...Array<PreviewChild | ReadonlyArray<PreviewChild>>,
    HtmlBuilder<Message>,
  ]
): Html => previewGroup('flex flex-wrap items-center gap-3', args);
const stack = (
  ...args: [
    ...Array<PreviewChild | ReadonlyArray<PreviewChild>>,
    HtmlBuilder<Message>,
  ]
): Html => previewGroup('grid w-full max-w-md gap-3', args);

const popover = (
  model: State.Model,
  suffix: string,
  align: Popover.PopoverAlign = 'center',
  variantIndex: number | undefined,
  h: HtmlBuilder<Message>,
) =>
  Popover.popover(
    {
      model: variantIndex === undefined
        ? { ...model.popover, id: `docs-popover-${suffix}` }
        : model.popoverVariants[variantIndex] ?? model.popover,
      toParentMessage: (message) => variantIndex === undefined
        ? State.GotPopoverMessage({ message })
        : State.GotPopoverVariantMessage({ index: variantIndex, message }),
      trigger: 'Open popover',
      triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium',
      align,
      content: stack(
        h.h4([h.Class('font-medium')], ['Dimensions']),
        h.p(
          [h.Class('text-sm text-muted-foreground')],
          ['Set the dimensions for the layer.'],
        ),
        h,
      ),
    },
    h,
  );

const radio = (
  model: State.Model,
  suffix: string,
  options: ReadonlyArray<RadioGroup.RadioGroupOption>,
  config: Readonly<{ disabled?: boolean; class?: string }> = {},
  h: HtmlBuilder<Message>,
) =>
  RadioGroup.radioGroup(
    {
      id: `docs-radio-${suffix}`,
      selectedValue: Option.some(model.selectedRadioValue),
      onSelect: (value) => State.SelectedRadioValue({ value }),
      ariaLabel: 'Notification preference',
      options,
      ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
      ...(config.class === undefined ? {} : { class: config.class }),
    },
    h,
  );

const resizePanel = (
  model: State.Model,
  suffix: string,
  direction: 'horizontal' | 'vertical' = 'horizontal',
  withHandle = false,
  h: HtmlBuilder<Message>,
) =>
  Resizable.resizable(
    {
      model: { ...model.resizable, id: `docs-resizable-${suffix}` },
      toParentMessage: (message) => State.GotResizableMessage({ message }),
      direction,
      withHandle,
      class: 'h-48 w-full max-w-xl',
      first: h.div(
        [h.Class('flex size-full items-center justify-center p-6')],
        ['One'],
      ),
      second: h.div(
        [h.Class('flex size-full items-center justify-center p-6')],
        ['Two'],
      ),
    },
    h,
  );

type Fruit = Readonly<{ value: string; label: string; group?: string }>;
const fruits: ReadonlyArray<Fruit> = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'blueberry', label: 'Blueberry', group: 'Berries' },
  { value: 'strawberry', label: 'Strawberry', group: 'Berries' },
];
const select = (
  model: State.Model,
  suffix: string,
  items: ReadonlyArray<Fruit> = fruits,
  grouped = false,
  h: HtmlBuilder<Message>,
  isDisabled = false,
) =>
  Select.select(
    {
      model: { ...model.select, id: `docs-select-${suffix}` },
      maybeSelectedValue: model.selectedSelectValue,
      toParentMessage: (message) => State.GotSelectMessage({ message }),
      items,
      itemToValue: (item) => item.value,
      itemToLabel: (item) => item.label,
      placeholder: 'Select a fruit',
      isDisabled,
      ...(grouped
        ? {
            itemGroupKey: (item: Fruit) => item.group ?? '',
            groupToHeading: (group: string) => group,
          }
        : {}),
    },
    h,
  );

const sheet = (
  model: State.Model,
  suffix: string,
  side: Sheet.SheetSide = 'right',
  showCloseButton = true,
  variantIndex: number | undefined,
  h: HtmlBuilder<Message>,
  compound = false,
) =>
  h.div(
    [],
    [
      Button.button(
        {
          children: [`Open ${side} sheet`],
          onClick: variantIndex === undefined
            ? State.OpenedOverlay({ target: 'sheet' })
            : State.OpenedSheetVariant({ index: variantIndex }),
        },
        h,
      ),
      Sheet.sheet(
        {
          model: variantIndex === undefined
            ? model.sheet
            : model.sheetVariants[variantIndex] ?? model.sheet,
          toParentMessage: (message) => variantIndex === undefined
            ? State.GotSheetMessage({ message })
            : State.GotSheetVariantMessage({ index: variantIndex, message }),
          title: 'Edit profile',
          description:
            'Make changes to your profile here. Click save when you are done.',
          side,
          showCloseButton,
          ...(compound
            ? {
                layout: (parts: Sheet.SheetParts<Message>) => [
                  parts.header({
                    children: [
                      parts.title({ children: ['Edit profile'] }),
                      parts.description({
                        children: ['Make changes to your profile here.'],
                      }),
                    ],
                  }),
                  Input.input(
                    {
                      id: `sheet-name-${suffix}-compound`,
                      value: model.sheetName,
                      onInput: (value) =>
                        State.ChangedText({ target: 'sheetName', value }),
                      label: 'Name',
                    },
                    h,
                  ),
                  parts.footer({
                    children: [
                      parts.close({
                        ariaLabel: 'Cancel',
                        children: ['Cancel'],
                        class:
                          'inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium',
                      }),
                    ],
                  }),
                  parts.close(),
                ],
              }
            : {}),
          content: () => [
            Input.input(
              {
                id: `sheet-name-${suffix}`,
                value: model.sheetName,
                onInput: (value) =>
                  State.ChangedText({ target: 'sheetName', value }),
                label: 'Name',
              },
              h,
            ),
          ],
        },
        h,
      ),
    ],
  );

const skeletonLines = (h: HtmlBuilder<Message>): Html =>
  stack(
    Skeleton.skeleton({ class: 'h-4 w-3/4' }, h),
    Skeleton.skeleton({ class: 'h-4 w-full' }, h),
    Skeleton.skeleton({ class: 'h-4 w-2/3' }, h),
    h,
  );

const slider = (
  model: State.Model,
  suffix: string,
  config: Readonly<{ disabled?: boolean; class?: string; label?: string }> = {},
  h: HtmlBuilder<Message>,
) =>
  Slider.slider(
    {
      model: { ...model.slider, id: `docs-slider-${suffix}` },
      value: model.sliderValue,
      toParentMessage: (message) => State.GotSliderMessage({ message }),
      ariaLabel: config.label ?? 'Volume',
      ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
      class: config.class ?? width,
    },
    h,
  );

const switchControl = (
  model: State.Model,
  suffix: string,
  config: Readonly<{
    description?: string;
    disabled?: boolean;
    size?: Switch.SwitchSize;
  }> = {},
  h: HtmlBuilder<Message>,
) =>
  Switch.switchControl(
    {
      id: `docs-switch-${suffix}`,
      isChecked: model.isSwitchChecked,
      onToggle: (isChecked) => State.ToggledSwitch({ isChecked }),
      label: 'Airplane Mode',
      ...(config.description === undefined
        ? {}
        : { description: config.description }),
      ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
      ...(config.size === undefined ? {} : { size: config.size }),
    },
    h,
  );

const invoices = [
  ['INV001', 'Paid', '$250.00'],
  ['INV002', 'Pending', '$150.00'],
  ['INV003', 'Unpaid', '$350.00'],
] as const;
const invoiceTable = (
  footer = false,
  actions = false,
  h: HtmlBuilder<Message>,
): Html =>
  Table.table(
    {
      children: [
        Table.tableCaption(
          { children: ['A list of your recent invoices.'] },
          h,
        ),
        Table.tableHeader(
          {
            children: [
              Table.tableRow(
                {
                  children: [
                    Table.tableHead({ children: ['Invoice'] }, h),
                    Table.tableHead({ children: ['Status'] }, h),
                    Table.tableHead(
                      {
                        class: 'text-right',
                        children: [actions ? 'Actions' : 'Total'],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Table.tableBody(
          {
            children: invoices.map((invoice) =>
              Table.tableRow(
                {
                  children: [
                    Table.tableCell({ children: [invoice[0]] }, h),
                    Table.tableCell({ children: [invoice[1]] }, h),
                    Table.tableCell(
                      {
                        class: 'text-right',
                        children: actions
                          ? [
                              Button.button(
                                {
                                  variant: 'ghost',
                                  size: 'sm',
                                  onClick: action,
                                  children: ['View'],
                                },
                                h,
                              ),
                            ]
                          : [invoice[2]],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ),
          },
          h,
        ),
        ...(footer
          ? [
              Table.tableFooter(
                {
                  children: [
                    Table.tableRow(
                      {
                        children: [
                          Table.tableCell({ children: ['Total'] }, h),
                          Table.tableCell({ children: [''] }, h),
                          Table.tableCell(
                            { class: 'text-right', children: ['$750.00'] },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ]
          : []),
      ],
    },
    h,
  );

const tabSet = (
  model: State.Model,
  suffix: string,
  config: Readonly<{
    variant?: 'default' | 'line';
    orientation?: 'horizontal' | 'vertical';
    disabled?: boolean;
    icons?: boolean;
  }> = {},
  h: HtmlBuilder<Message>,
) =>
  Tabs.tabs(
    {
      model: { ...model.tabs, id: `docs-tabs-${suffix}` },
      selectedValue: model.selectedTabValue,
      toParentMessage: (message) => State.GotTabsMessage({ message }),
      ...(config.variant === undefined ? {} : { variant: config.variant }),
      ...(config.orientation === undefined
        ? {}
        : { orientation: config.orientation }),
      class: 'w-full max-w-md',
      tabs: [
        {
          value: 'account',
          label: config.icons ? '⚙ Account' : 'Account',
          content: 'Make changes to your account here.',
        },
        {
          value: 'password',
          label: config.icons ? '🔒 Password' : 'Password',
          content: 'Change your password here.',
          ...(config.disabled === undefined
            ? {}
            : { isDisabled: config.disabled }),
        },
      ],
    },
    h,
  );

const textarea = (
  model: State.Model,
  suffix: string,
  config: Readonly<{
    disabled?: boolean;
    invalid?: boolean;
    label?: string;
  }> = {},
  h: HtmlBuilder<Message>,
) =>
  Textarea.textarea(
    {
      id: `docs-textarea-${suffix}`,
      value: model.textarea,
      onInput: (value) => State.ChangedText({ target: 'textarea', value }),
      placeholder: 'Type your message here.',
      ...(config.label === undefined ? {} : { label: config.label }),
      ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
      ...(config.invalid === undefined ? {} : { isInvalid: config.invalid }),
      class: width,
    },
    h,
  );

const toggle = (
  config: Readonly<{
    variant?: 'default' | 'outline';
    size?: 'sm' | 'default' | 'lg';
    text?: boolean;
    disabled?: boolean;
  }> = {},
  h: HtmlBuilder<Message>,
) =>
  Toggle.toggle(
    {
      isPressed: true,
      onToggle: action,
      ...(config.variant === undefined ? {} : { variant: config.variant }),
      ...(config.size === undefined ? {} : { size: config.size }),
      ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
      children: [config.text ? 'Bold' : 'B'],
    },
    h,
  );

const toggleGroup = (
  config: Readonly<{
    variant?: 'default' | 'outline';
    size?: 'sm' | 'default' | 'lg';
    vertical?: boolean;
    disabled?: boolean;
    custom?: boolean;
  }> = {},
  h: HtmlBuilder<Message>,
) =>
  ToggleGroup.toggleGroup(
    {
      value: config.custom ? 'bold' : 'center',
      onToggle: () => action,
      ...(config.variant === undefined ? {} : { variant: config.variant }),
      ...(config.size === undefined ? {} : { size: config.size }),
      ...(config.vertical === true
        ? { class: 'flex-col [&>*]:rounded-md!' }
        : {}),
      items: config.custom
        ? [
            { value: 'bold', children: ['Bold'] },
            { value: 'italic', children: ['Italic'] },
            { value: 'underline', children: ['Underline'] },
          ]
        : [
            { value: 'left', children: ['Left'] },
            { value: 'center', children: ['Center'] },
            {
              value: 'right',
              children: ['Right'],
              ...(config.disabled === undefined
                ? {}
                : { isDisabled: config.disabled }),
            },
          ],
    },
    h,
  );

const tooltip = (
  model: State.Model,
  suffix: string,
  config: Readonly<{
    side?: Tooltip.TooltipSide;
    content?: Html | string;
    disabled?: boolean;
    showArrow?: boolean;
  }> = {},
  variantIndex: number | undefined,
  h: HtmlBuilder<Message>,
) =>
  Tooltip.tooltip(
    {
      model: variantIndex === undefined
        ? { ...model.tooltip, id: `docs-tooltip-${suffix}` }
        : model.tooltipVariants[variantIndex] ?? model.tooltip,
      toParentMessage: (message) => variantIndex === undefined
        ? State.GotTooltipMessage({ message })
        : State.GotTooltipVariantMessage({ index: variantIndex, message }),
      trigger: config.disabled ? 'Disabled' : 'Hover me',
      triggerClass: 'rounded-md border px-3 py-2 text-sm',
      content: config.content ?? 'Add to library',
      ...(config.side === undefined ? {} : { side: config.side }),
      ...(config.disabled === undefined ? {} : { isDisabled: config.disabled }),
      ...(config.showArrow === undefined ? {} : { showArrow: config.showArrow }),
    },
    h,
  );

const rawDefinitions: PageDefinitions = {
  popover: {
    description: 'Displays rich content in a portal, triggered by a button.',
    composition: 'Popover\n├── PopoverTrigger\n└── PopoverContent',
    examples: [
      basic(
        'popover',
        `Popover.popover({ model, trigger: 'Open popover', content })`,
      ),
      {
        title: 'Align',
        preview: (model, h: HtmlBuilder<Message>) =>
          row(
            popover(model, 'start', 'start', 0, h),
            popover(model, 'center', undefined, 1, h),
            popover(model, 'end', 'end', 2, h),
            h,
          ),
        code: `Popover.popover({ ...props, align: 'start' })`,
      },
      {
        title: 'With Form',
        preview: (model, h: HtmlBuilder<Message>) =>
          Popover.popover(
            {
              model: { ...model.popover, id: 'docs-popover-form' },
              toParentMessage: (message) =>
                State.GotPopoverMessage({ message }),
              trigger: 'Open form',
              triggerClass: 'rounded-md border px-4 py-2 text-sm',
              content: stack(
                Input.input(
                  {
                    id: 'popover-width',
                    value: model.input,
                    onInput: (value) =>
                      State.ChangedText({ target: 'input', value }),
                    label: 'Width',
                    placeholder: '100%',
                  },
                  h,
                ),
                Input.input(
                  {
                    id: 'popover-height',
                    value: model.inputGroup,
                    onInput: (value) =>
                      State.ChangedText({ target: 'inputGroup', value }),
                    label: 'Height',
                    placeholder: '25px',
                  },
                  h,
                ),
                h,
              ),
            },
            h,
          ),
        code: `Popover.popover({ content: dimensionsForm })`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(popover(model, 'rtl', 'end', undefined, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  progress: {
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
    composition:
      'Progress\n└── ProgressIndicator\n\nWith label and value: Label + value + Progress',
    examples: [
      basic('progress', `Progress.progress({ value: 60 })`),
      {
        title: 'Label',
        preview: (_model, h: HtmlBuilder<Message>) =>
          stack(
            row(
              'Uploading',
              h.span(
                [h.Class('ml-auto text-sm text-muted-foreground')],
                ['60%'],
              ),
              h,
            ),
            Progress.progress({ value: 60 }, h),
            h,
          ),
        code: `Progress.progress({ value: 60 })`,
      },
      {
        title: 'Controlled',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Progress.progress({ value: 42, class: width }, h),
        code: `Progress.progress({ value: model.progress })`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(Progress.progress({ value: 60, class: width }, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  'radio-group': {
    description:
      'A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.',
    composition:
      'RadioGroup\n├── RadioGroupItem\n├── Label\n└── Description',
    examples: [
      basic('radio-group', `RadioGroup.radioGroup({ model, options })`),
      {
        title: 'Description',
        preview: (model, h: HtmlBuilder<Message>) =>
          radio(
            model,
            'description',
            [
              {
                value: 'comfortable',
                label: 'Comfortable',
                description: 'Balances content density and readability.',
              },
              {
                value: 'compact',
                label: 'Compact',
                description: 'Fits more content on the screen.',
              },
            ],
            {},
            h,
          ),
        code: `options: [{ value, label, description }]`,
      },
      {
        title: 'Choice Card',
        preview: (model, h: HtmlBuilder<Message>) =>
          radio(
            model,
            'cards',
            [
              {
                value: 'starter',
                label: 'Starter',
                description: 'For personal projects.',
              },
              { value: 'pro', label: 'Pro', description: 'For growing teams.' },
            ],
            { class: 'rounded-lg border p-4' },
            h,
          ),
        code: `RadioGroup.radioGroup({ class: 'rounded-lg border p-4', … })`,
      },
      {
        title: 'Fieldset',
        preview: (model, h: HtmlBuilder<Message>) =>
          h.fieldset(
            [h.Class('grid gap-3')],
            [
              h.legend(
                [h.Class('text-sm font-medium')],
                ['Notify me about…'],
              ),
              radio(
                model,
                'fieldset',
                [
                  { value: 'all', label: 'All new messages' },
                  { value: 'mentions', label: 'Direct messages and mentions' },
                ],
                {},
                h,
              ),
            ],
          ),
        code: `<fieldset><legend>…</legend>{radioGroup}</fieldset>`,
      },
      {
        title: 'Disabled',
        preview: (model, h: HtmlBuilder<Message>) =>
          radio(
            model,
            'disabled',
            [
              { value: 'default', label: 'Default' },
              { value: 'comfortable', label: 'Comfortable' },
            ],
            { disabled: true },
            h,
          ),
        code: `RadioGroup.radioGroup({ isDisabled: true, … })`,
      },
      {
        title: 'Invalid',
        preview: (model, h: HtmlBuilder<Message>) =>
          h.div(
            [h.AriaInvalid(true)],
            [
              radio(
                model,
                'invalid',
                [
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' },
                ],
                {},
                h,
              ),
              h.p(
                [h.Class('text-sm text-destructive')],
                ['Choose a contact method.'],
              ),
            ],
          ),
        code: `<div aria-invalid="true">…</div>`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(
            radio(
              model,
              'rtl',
              [
                { value: 'one', label: 'الخيار الأول' },
                { value: 'two', label: 'الخيار الثاني' },
              ],
              {},
              h,
            ),
            h,
          ),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  resizable: {
    description:
      'Accessible resizable panel groups and layouts with keyboard support.',
    composition:
      'ResizablePanelGroup\n├── ResizablePanel\n├── ResizableHandle\n└── ResizablePanel',
    examples: [
      basic('resizable', `Resizable.resizable({ model, first, second })`),
      {
        title: 'Vertical',
        preview: (model, h: HtmlBuilder<Message>) =>
          resizePanel(model, 'vertical', 'vertical', undefined, h),
        code: `Resizable.resizable({ direction: 'vertical', … })`,
      },
      {
        title: 'Handle',
        preview: (model, h: HtmlBuilder<Message>) =>
          resizePanel(model, 'handle', 'horizontal', true, h),
        code: `Resizable.resizable({ withHandle: true, … })`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(resizePanel(model, 'rtl', 'horizontal', false, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  'scroll-area': {
    description:
      'Augments native scroll functionality for custom, cross-browser styling.',
    composition: 'ScrollArea\n└── native scroll viewport',
    examples: [
      basic('scroll-area', `ScrollArea.scrollArea({ children })`),
      {
        title: 'Horizontal',
        preview: (_model, h: HtmlBuilder<Message>) =>
          ScrollArea.scrollArea(
            {
              class: 'w-96 rounded-md border whitespace-nowrap',
              children: [
                h.div(
                  [h.Class('flex w-max gap-4 p-4')],
                  ['Nature', 'Architecture', 'Travel', 'Portraits'].map(
                    (label, index) =>
                      Card.card(
                        {
                          class: 'w-40 shrink-0',
                          children: [
                            Card.cardContent(
                              {
                                class: 'flex h-32 items-end p-4',
                                children: [`${index + 1}. ${label}`],
                              },
                              h,
                            ),
                          ],
                        },
                        h,
                      ),
                  ),
                ),
              ],
            },
            h,
          ),
        code: `ScrollArea.scrollArea({ class: 'w-96 whitespace-nowrap', children })`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(
            ScrollArea.scrollArea(
              {
                class: 'h-56 w-48 rounded-md border p-4',
                children: Array.from({ length: 20 }, (_, index) =>
                  h.div([h.Class('py-1 text-sm')], [`وسم ${index + 1}`]),
                ),
              },
              h,
            ),
            h,
          ),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  select: {
    description:
      'Displays a list of options for the user to pick from—triggered by a button.',
    composition:
      'Select\n├── SelectTrigger\n├── SelectContent\n├── SelectGroup\n└── SelectItem',
    examples: [
      basic(
        'select',
        `Select.select({ model, items, itemToValue, itemToLabel })`,
      ),
      {
        title: 'Align Item With Trigger',
        preview: (model, h: HtmlBuilder<Message>) =>
          select(model, 'aligned', fruits, false, h),
        code: `Select.select({ model, items })`,
      },
      {
        title: 'Groups',
        preview: (model, h: HtmlBuilder<Message>) =>
          select(model, 'groups', fruits, true, h),
        code: `Select.select({ itemGroupKey, groupToHeading, … })`,
      },
      {
        title: 'Scrollable',
        preview: (model, h: HtmlBuilder<Message>) =>
          select(
            model,
            'scrollable',
            Array.from({ length: 30 }, (_, index) => ({
              value: `zone-${index}`,
              label: `Time zone ${index + 1}`,
            })),
            undefined,
            h,
          ),
        code: `Select.select({ items: timeZones, … })`,
      },
      {
        title: 'Disabled',
        preview: (model, h: HtmlBuilder<Message>) =>
          select(model, 'disabled', fruits, false, h, true),
        code: `Select.select({ isDisabled: true, … })`,
      },
      {
        title: 'Invalid',
        preview: (model, h: HtmlBuilder<Message>) =>
          h.div(
            [h.AriaInvalid(true), h.Class('grid gap-2')],
            [
              select(model, 'invalid', fruits, false, h),
              h.p(
                [h.Class('text-sm text-destructive')],
                ['Please select a fruit.'],
              ),
            ],
          ),
        code: `<div aria-invalid="true">…</div>`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(select(model, 'rtl', fruits, false, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  separator: {
    description: 'Visually or semantically separates content.',
    examples: [
      basic('separator', `Separator.separator()`),
      {
        title: 'Vertical',
        preview: (_model, h: HtmlBuilder<Message>) =>
          row(
            'Blog',
            Separator.separator({ orientation: 'vertical', class: 'h-5' }, h),
            'Docs',
            Separator.separator({ orientation: 'vertical', class: 'h-5' }, h),
            'Source',
            h,
          ),
        code: `Separator.separator({ orientation: 'vertical' })`,
      },
      {
        title: 'Menu',
        preview: (_model, h: HtmlBuilder<Message>) =>
          row(
            'Home',
            Separator.separator({ orientation: 'vertical', class: 'h-5' }, h),
            'Components',
            Separator.separator({ orientation: 'vertical', class: 'h-5' }, h),
            'Pricing',
            h,
          ),
        code: `Separator.separator({ orientation: 'vertical' })`,
      },
      {
        title: 'List',
        preview: (_model, h: HtmlBuilder<Message>) =>
          stack(
            ['Introduction', 'Installation', 'Typography'].flatMap(
              (item, index) =>
                index === 0 ? [item] : [Separator.separator({}, h), item],
            ),
            h,
          ),
        code: `items.flatMap(item => [Separator.separator(), item])`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(
            row(
              'الرئيسية',
              Separator.separator({ orientation: 'vertical', class: 'h-5' }, h),
              'التوثيق',
              h,
            ),
            h,
          ),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  sheet: {
    description:
      'Extends the Dialog component to display content that complements the main content of the screen.',
    composition:
      'Sheet\n├── SheetTrigger\n├── SheetContent\n├── SheetHeader\n└── SheetFooter',
    examples: [
      basic('sheet', `Sheet.sheet({ model, title, content })`),
      {
        title: 'Compound Layout',
        preview: (model, h: HtmlBuilder<Message>) =>
          sheet(model, 'compound', 'right', true, undefined, h, true),
        code: `Sheet.sheet({
  model,
  toParentMessage,
  title: 'Edit profile',
  layout: parts => [
    parts.header({ children: [parts.title({ children: ['Edit profile'] })] }),
    form,
    parts.footer({ children: [parts.close({ children: ['Cancel'] })] }),
    parts.close(),
  ],
})`,
      },
      {
        title: 'Side',
        preview: (model, h: HtmlBuilder<Message>) =>
          row(
            (['top', 'right', 'bottom', 'left'] as const).map((side, index) =>
              sheet(model, side, side, undefined, index, h),
            ),
            h,
          ),
        code: `Sheet.sheet({ side: 'left', … })`,
      },
      {
        title: 'No Close Button',
        preview: (model, h: HtmlBuilder<Message>) =>
          sheet(model, 'no-close', 'right', false, undefined, h),
        code: `Sheet.sheet({ showCloseButton: false, … })`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(sheet(model, 'rtl', 'right', true, undefined, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  sidebar: {
    description: 'A composable, themeable and customizable sidebar component.',
    composition:
      'SidebarProvider\n├── Sidebar\n│   ├── SidebarHeader\n│   ├── SidebarContent\n│   └── SidebarFooter\n└── SidebarInset',
    examples: [
      basic(
        'sidebar',
        `Sidebar.sidebarProvider({ children: [Sidebar.sidebar({ … })] })`,
      ),
      {
        title: 'Structure',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Sidebar.sidebarProvider(
            {
              class: 'h-80 min-h-0 overflow-hidden rounded-lg border',
              children: [
                Sidebar.sidebar(
                  {
                    collapsible: 'none',
                    children: [
                      Sidebar.sidebarHeader({ children: ['Header'] }, h),
                      Sidebar.sidebarContent(
                        {
                          children: [
                            Sidebar.sidebarGroup(
                              {
                                children: [
                                  Sidebar.sidebarGroupLabel(
                                    { children: ['Application'] },
                                    h,
                                  ),
                                  Sidebar.sidebarGroupContent(
                                    {
                                      children: [
                                        Sidebar.sidebarMenu(
                                          {
                                            children: [
                                              'Dashboard',
                                              'Inbox',
                                              'Calendar',
                                            ].map((label) =>
                                              Sidebar.sidebarMenuItem(
                                                {
                                                  children: [
                                                    Sidebar.sidebarMenuButton(
                                                      { children: [label] },
                                                      h,
                                                    ),
                                                  ],
                                                },
                                                h,
                                              ),
                                            ),
                                          },
                                          h,
                                        ),
                                      ],
                                    },
                                    h,
                                  ),
                                ],
                              },
                              h,
                            ),
                          ],
                        },
                        h,
                      ),
                      Sidebar.sidebarFooter({ children: ['Footer'] }, h),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        code: `SidebarProvider > Sidebar > Header + Content + Footer`,
      },
      {
        title: 'SidebarMenu',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Sidebar.sidebarMenu(
            {
              children: ['Home', 'Inbox', 'Calendar'].map((label, index) =>
                Sidebar.sidebarMenuItem(
                  {
                    children: [
                      Sidebar.sidebarMenuButton(
                        { isActive: index === 0, children: [label] },
                        h,
                      ),
                      Sidebar.sidebarMenuBadge(
                        { children: [String(index + 1)] },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ),
            },
            h,
          ),
        code: `Sidebar.sidebarMenu({ children: items.map(…) })`,
      },
      {
        title: 'SidebarMenuSkeleton',
        preview: (_model, h: HtmlBuilder<Message>) =>
          stack(
            Array.from({ length: 4 }, () =>
              Sidebar.sidebarMenuSkeleton({ showIcon: true }, h),
            ),
            h,
          ),
        code: `Sidebar.sidebarMenuSkeleton({ showIcon: true })`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(
            Sidebar.sidebarMenu(
              {
                children: [
                  'الرئيسية',
                  'البريد',
                  'التقويم',
                ].map((label) =>
                  Sidebar.sidebarMenuItem(
                    {
                      children: [
                        Sidebar.sidebarMenuButton({ children: [label] }, h),
                      ],
                    },
                    h,
                  ),
                ),
              },
              h,
            ),
            h,
          ),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  skeleton: {
    description: 'Use to show a placeholder while content is loading.',
    examples: [
      basic('skeleton', `Skeleton.skeleton({ class: 'h-4 w-52' })`),
      {
        title: 'Avatar',
        preview: (_model, h: HtmlBuilder<Message>) =>
          row(
            Skeleton.skeleton({ class: 'size-12 rounded-full' }, h),
            skeletonLines(h),
            h,
          ),
        code: `Skeleton.skeleton({ class: 'size-12 rounded-full' })`,
      },
      {
        title: 'Card',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Card.card(
            {
              class: width,
              children: [
                Card.cardHeader(
                  {
                    children: [Skeleton.skeleton({ class: 'h-40 w-full' }, h)],
                  },
                  h,
                ),
                Card.cardContent({ children: [skeletonLines(h)] }, h),
              ],
            },
            h,
          ),
        code: `Card.card({ children: [Skeleton.skeleton(…), …] })`,
      },
      {
        title: 'Text',
        preview: (_model, h: HtmlBuilder<Message>) => skeletonLines(h),
        code: `Skeleton.skeleton({ class: 'h-4 w-full' })`,
      },
      {
        title: 'Form',
        preview: (_model, h: HtmlBuilder<Message>) =>
          stack(
            Skeleton.skeleton({ class: 'h-4 w-20' }, h),
            Skeleton.skeleton({ class: 'h-9 w-full' }, h),
            Skeleton.skeleton({ class: 'h-9 w-24' }, h),
            h,
          ),
        code: `Skeleton.skeleton({ class: 'h-9 w-full' })`,
      },
      {
        title: 'Table',
        preview: (_model, h: HtmlBuilder<Message>) =>
          stack(
            Array.from({ length: 5 }, () =>
              row(
                Skeleton.skeleton({ class: 'h-4 w-28' }, h),
                Skeleton.skeleton({ class: 'h-4 w-20' }, h),
                Skeleton.skeleton({ class: 'h-4 w-16' }, h),
                h,
              ),
            ),
            h,
          ),
        code: `rows.map(() => Skeleton.skeleton(…))`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(
            row(
              Skeleton.skeleton({ class: 'size-12 rounded-full' }, h),
              skeletonLines(h),
              h,
            ),
            h,
          ),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  slider: {
    description:
      'An input where the user selects a value from within a given range.',
    examples: [
      basic('slider', `Slider.slider({ model, ariaLabel: 'Volume' })`),
      {
        title: 'Range',
        preview: (model, h: HtmlBuilder<Message>) =>
          slider(model, 'range', { label: 'Price range' }, h),
        code: `Slider.slider({ model: rangeModel, ariaLabel: 'Price range' })`,
      },
      {
        title: 'Multiple Thumbs',
        preview: (model, h: HtmlBuilder<Message>) =>
          slider(model, 'multiple', { label: 'Range' }, h),
        code: `Slider.slider({ model: multipleThumbModel, … })`,
      },
      {
        title: 'Vertical',
        preview: (model, h: HtmlBuilder<Message>) =>
          h.div(
            [h.Class('flex h-48 items-center')],
            [slider(model, 'vertical', { class: 'w-48 -rotate-90' }, h)],
          ),
        code: `Slider.slider({ class: '-rotate-90', … })`,
      },
      {
        title: 'Controlled',
        preview: (model, h: HtmlBuilder<Message>) =>
          stack(
            slider(model, 'controlled', {}, h),
            h.p(
              [h.Class('text-sm text-muted-foreground')],
              [`Value: ${Math.round(model.sliderValue)}`],
            ),
            h,
          ),
        code: `const value = model.sliderValue`,
      },
      {
        title: 'Disabled',
        preview: (model, h: HtmlBuilder<Message>) =>
          slider(model, 'disabled', { disabled: true }, h),
        code: `Slider.slider({ isDisabled: true, … })`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(slider(model, 'rtl', {}, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  sonner: {
    description: 'An opinionated toast notification component for Crease UI.',
    apiDescription:
      'Sonner is a Crease UI extension. shadcn Base has no Sonner page; its current official Sonner variants target the Radix and React Aria registries.',
    examples: [
      basic('sonner', `Sonner.sonner({ model, toParentMessage })`),
      {
        title: 'Success',
        preview: (model, h: HtmlBuilder<Message>) =>
          Sonner.sonner(
            {
              model: model.sonner,
              toParentMessage: (message) => State.GotSonnerMessage({ message }),
              class: 'relative right-auto bottom-auto p-0',
            },
            h,
          ),
        code: `Sonner.show(model, Sonner.success({ title: 'Event created' }))`,
      },
      {
        title: 'Variants',
        preview: (_model, h: HtmlBuilder<Message>) =>
          row(
            Badge.badge({ children: ['Success'] }, h),
            Badge.badge({ variant: 'destructive', children: ['Error'] }, h),
            Badge.badge({ variant: 'outline', children: ['Info'] }, h),
            Badge.badge({ variant: 'secondary', children: ['Warning'] }, h),
            h,
          ),
        code: `Sonner.success(…), Sonner.error(…), Sonner.info(…), Sonner.warning(…)`,
      },
    ],
  },
  spinner: {
    description: 'An indicator that can be used to show a loading state.',
    examples: [
      basic('spinner', `Spinner.spinner()`),
      {
        title: 'Customization',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Spinner.spinner({ class: 'size-7 text-blue-600' }, h),
        code: `Spinner.spinner({ class: 'size-7 text-blue-600' })`,
      },
      {
        title: 'Size',
        preview: (_model, h: HtmlBuilder<Message>) =>
          row(
            Spinner.spinner({ class: 'size-3' }, h),
            Spinner.spinner({ class: 'size-5' }, h),
            Spinner.spinner({ class: 'size-8' }, h),
            h,
          ),
        code: `Spinner.spinner({ class: 'size-8' })`,
      },
      {
        title: 'Button',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Button.button(
            {
              isDisabled: true,
              children: [Spinner.spinner({}, h), 'Please wait'],
            },
            h,
          ),
        code: `Button.button({ isDisabled: true, children: [Spinner.spinner(), 'Please wait'] })`,
      },
      {
        title: 'Badge',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Badge.badge(
            {
              variant: 'secondary',
              children: [Spinner.spinner({ class: 'size-3' }, h), 'Syncing'],
            },
            h,
          ),
        code: `Badge.badge({ children: [Spinner.spinner(), 'Syncing'] })`,
      },
      {
        title: 'Input Group',
        preview: (_model, h: HtmlBuilder<Message>) =>
          h.div(
            [h.Class('relative w-full max-w-sm')],
            [
              Input.input(
                {
                  id: 'spinner-search',
                  value: '',
                  onInput: () => action,
                  placeholder: 'Searching…',
                },
                h,
              ),
              h.div(
                [h.Class('absolute right-3 top-2.5')],
                [Spinner.spinner({ class: 'size-4' }, h)],
              ),
            ],
          ),
        code: `Input + positioned Spinner`,
      },
      {
        title: 'Empty',
        preview: (_model, h: HtmlBuilder<Message>) =>
          stack(
            Spinner.spinner({ class: 'mx-auto size-6' }, h),
            h.p(
              [h.Class('text-center text-sm text-muted-foreground')],
              ['Loading your projects…'],
            ),
            h,
          ),
        code: `Spinner.spinner({ class: 'mx-auto' })`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(row(Spinner.spinner({}, h), 'جارٍ التحميل…', h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  switch: {
    description:
      'A control that allows the user to toggle between checked and not checked.',
    examples: [
      basic(
        'switch',
        `Switch.switchControl({ model, label: 'Airplane Mode' })`,
      ),
      {
        title: 'Description',
        preview: (model, h: HtmlBuilder<Message>) =>
          switchControl(
            model,
            'description',
            { description: 'Enable or disable wireless communications.' },
            h,
          ),
        code: `Switch.switchControl({ description: '…', … })`,
      },
      {
        title: 'Choice Card',
        preview: (model, h: HtmlBuilder<Message>) =>
          Card.card(
            {
              class: width,
              children: [
                Card.cardContent(
                  {
                    class: 'p-4',
                    children: [
                      switchControl(
                        model,
                        'card',
                        {
                          description: 'Receive emails about account activity.',
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        code: `Card.card({ children: [Switch.switchControl(…)] })`,
      },
      {
        title: 'Disabled',
        preview: (model, h: HtmlBuilder<Message>) =>
          switchControl(model, 'disabled', { disabled: true }, h),
        code: `Switch.switchControl({ isDisabled: true, … })`,
      },
      {
        title: 'Invalid',
        preview: (model, h: HtmlBuilder<Message>) =>
          h.div(
            [h.AriaInvalid(true)],
            [
              switchControl(model, 'invalid', {}, h),
              h.p(
                [h.Class('mt-2 text-sm text-destructive')],
                ['This setting is required.'],
              ),
            ],
          ),
        code: `<div aria-invalid="true">…</div>`,
      },
      {
        title: 'Size',
        preview: (model, h: HtmlBuilder<Message>) =>
          row(
            switchControl(model, 'small', { size: 'sm' }, h),
            switchControl(model, 'default', {}, h),
            h,
          ),
        code: `Switch.switchControl({ size: 'sm', … })`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(switchControl(model, 'rtl', {}, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  table: {
    description: 'A responsive table component.',
    composition:
      'Table\n├── TableCaption\n├── TableHeader\n├── TableBody\n└── TableFooter',
    examples: [
      basic('table', `Table.table({ children: […] })`),
      {
        title: 'Footer',
        preview: (_model, h: HtmlBuilder<Message>) =>
          invoiceTable(true, undefined, h),
        code: `Table.tableFooter({ children: […] })`,
      },
      {
        title: 'Actions',
        preview: (_model, h: HtmlBuilder<Message>) =>
          invoiceTable(false, true, h),
        code: `Table.tableCell({ children: [Button.button({ children: ['View'] })] })`,
      },
      {
        title: 'Data Table',
        description:
          'For sorting, filtering, and pagination, compose the dedicated Data Table component.',
        preview: (_model, h: HtmlBuilder<Message>) =>
          h.a(
            [
              h.Href('/docs/components/data-table'),
              h.Class('text-sm font-medium underline underline-offset-4'),
            ],
            ['Open the Data Table documentation'],
          ),
        code: `import * as DataTable from '@/ui/data-table'`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(invoiceTable(false, false, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  tabs: {
    description:
      'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
    composition:
      'Tabs\n├── TabsList\n│   └── TabsTrigger\n└── TabsContent',
    examples: [
      basic('tabs', `Tabs.tabs({ model, tabs })`),
      {
        title: 'Line',
        preview: (model, h: HtmlBuilder<Message>) =>
          tabSet(model, 'line', { variant: 'line' }, h),
        code: `Tabs.tabs({ variant: 'line', … })`,
      },
      {
        title: 'Vertical',
        preview: (model, h: HtmlBuilder<Message>) =>
          tabSet(model, 'vertical', { orientation: 'vertical' }, h),
        code: `Tabs.tabs({ orientation: 'vertical', … })`,
      },
      {
        title: 'Disabled',
        preview: (model, h: HtmlBuilder<Message>) =>
          tabSet(model, 'disabled', { disabled: true }, h),
        code: `tabs: [{ …, isDisabled: true }]`,
      },
      {
        title: 'Icons',
        preview: (model, h: HtmlBuilder<Message>) =>
          tabSet(model, 'icons', { icons: true }, h),
        code: `tabs: [{ label: iconAndLabel, … }]`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(tabSet(model, 'rtl', {}, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  textarea: {
    description:
      'Displays a form textarea or a component that looks like a textarea.',
    examples: [
      basic('textarea', `Textarea.textarea({ id, value, onInput })`),
      {
        title: 'Field',
        preview: (model, h: HtmlBuilder<Message>) =>
          textarea(model, 'field', { label: 'Message' }, h),
        code: `Textarea.textarea({ label: 'Message', … })`,
      },
      {
        title: 'Disabled',
        preview: (model, h: HtmlBuilder<Message>) =>
          textarea(model, 'disabled', { disabled: true }, h),
        code: `Textarea.textarea({ isDisabled: true, … })`,
      },
      {
        title: 'Invalid',
        preview: (model, h: HtmlBuilder<Message>) =>
          stack(
            textarea(model, 'invalid', { invalid: true, label: 'Message' }, h),
            h.p(
              [h.Class('text-sm text-destructive')],
              ['A message is required.'],
            ),
            h,
          ),
        code: `Textarea.textarea({ isInvalid: true, … })`,
      },
      {
        title: 'Button',
        preview: (model, h: HtmlBuilder<Message>) =>
          stack(
            textarea(model, 'button', {}, h),
            Button.button(
              { class: 'w-fit', onClick: action, children: ['Send message'] },
              h,
            ),
            h,
          ),
        code: `Textarea.textarea(…) + Button.button(…)`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(textarea(model, 'rtl', {}, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  toast: {
    kind: 'recipe',
    description:
      'A source-owned notification recipe with typed variants, timed dismissal, actions, and a single root-level viewport.',
    architecture:
      'Toast is the compatibility name for Crease UI\'s Sonner notification model. Keep one Toast.Model at the application root, call Toast.show from domain update branches, map its Commands, and render Toast.toast once near the root view.',
    apiHref: 'https://foldkit.dev/ui/toast',
    apiDescription:
      'Crease UI Toast is implemented by the source-owned Sonner module. The Foldkit Toast reference demonstrates the same parent-model, command-mapping, root-view, and dismissal-output architecture.',
    sections: [
      {
        id: 'add-to-model',
        title: 'Add it to the application',
        description:
          'Notifications outlive the view that creates them, so the model and viewport belong at the application root.',
        code: `const Model = S.Struct({
  toast: Toast.Model,
  // your domain state
})

const init = () => [{
  toast: Toast.init({ id: 'app-toast' }),
}, []]`,
      },
      {
        id: 'delegate-messages',
        title: 'Delegate messages',
        description:
          'Embed Toast.Message in the parent message union. Always lift returned commands so timers dispatch back through the application update loop.',
        code: `const GotToastMessage = m('GotToastMessage', {
  message: Toast.Message,
})

GotToastMessage: ({ message }) => {
  const [toast, commands, outMessage] = Toast.update(model.toast, message)
  return [
    { ...model, toast },
    Command.mapMessages(commands, message => GotToastMessage({ message })),
  ]
}`,
      },
      {
        id: 'show-a-toast',
        title: 'Show a toast from update',
        description:
          'Programmatic helpers return the next Toast model, timer commands, and an optional output. Keep all three in the update branch rather than triggering notifications from the view.',
        code: `ClickedSave: () => {
  const [toast, commands] = Toast.show(
    model.toast,
    Toast.success({
      title: 'Changes saved',
      description: 'Your preferences are now up to date.',
    }),
  )

  return [
    { ...model, toast },
    Command.mapMessages(commands, message => GotToastMessage({ message })),
  ]
}`,
      },
      {
        id: 'render-the-viewport',
        title: 'Render one viewport',
        description:
          'Place the viewport once near the root of the document. Feature views only dispatch domain messages that eventually call Toast.show.',
        code: `Toast.toast(
  {
    model: model.toast,
    toParentMessage: message => GotToastMessage({ message }),
    actionToMessage: entry => ClickedToastAction({ id: entry.id }),
  },
  h,
)`,
      },
    ],
    styling:
      'The installed source owns the shadcn-like surface styles. Use class for viewport placement and entryClass for entry-level overrides; data-slot="sonner" and data-slot="sonner-toast" are stable styling and testing hooks.',
    accessibility:
      'The viewport is an aria-live="polite" notifications region. Error entries use role="alert" while other variants use role="status". Every entry has a labeled dismiss button and action controls remain keyboard reachable.',
    keyboard: [
      ['Tab', 'Moves through action and dismiss controls in visible notifications.'],
      ['Enter / Space', 'Activates the focused action or dismiss button.'],
    ],
    examples: [
      basic(
        'toast',
        `Toast.toast({
  model: model.toast,
  toParentMessage: message => GotToastMessage({ message }),
}, h)`,
      ),
      {
        title: 'Types',
        preview: (model, h: HtmlBuilder<Message>) =>
          Toast.toast(
            {
              model: model.toast,
              toParentMessage: (message) => State.GotToastMessage({ message }),
              class: 'relative right-auto bottom-auto p-0',
            },
            h,
          ),
        description:
          'Use semantic constructors so visual treatment and live-region roles stay aligned.',
        code: `Toast.success({ title: 'Saved' })
Toast.error({ title: 'Could not save' })
Toast.warning({ title: 'Storage almost full' })
Toast.info({ title: 'New version available' })`,
      },
      {
        title: 'Action',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Button.button(
            { onClick: action, children: ['Show toast with action'] },
            h,
          ),
        description:
          'Provide an action label in the payload and map the selected entry to a domain message in the root viewport.',
        code: `Toast.success({
  title: 'Event created',
  actionLabel: 'Undo',
})`,
      },
      {
        title: 'Promise',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Button.button({ onClick: action, children: ['Start upload'] }, h),
        description:
          'Model async work with a Foldkit Command. Show the result from the completion message rather than awaiting inside the view.',
        code: `CompletedUpload: ({ result }) =>
  Result.match(result, {
    onFailure: () => showToast(model, Toast.error({ title: 'Upload failed' })),
    onSuccess: () => showToast(model, Toast.success({ title: 'Upload complete' })),
  })`,
      },
    ],
  },
  toggle: {
    description: 'A two-state button that can be either on or off.',
    examples: [
      basic(
        'toggle',
        `Toggle.toggle({ isPressed, onToggle, children: ['Bold'] })`,
      ),
      {
        title: 'Outline',
        preview: (_model, h: HtmlBuilder<Message>) =>
          toggle({ variant: 'outline' }, h),
        code: `Toggle.toggle({ variant: 'outline', … })`,
      },
      {
        title: 'With Text',
        preview: (_model, h: HtmlBuilder<Message>) => toggle({ text: true }, h),
        code: `Toggle.toggle({ children: ['Bold'] })`,
      },
      {
        title: 'Size',
        preview: (_model, h: HtmlBuilder<Message>) =>
          row(
            toggle({ size: 'sm' }, h),
            toggle({}, h),
            toggle({ size: 'lg' }, h),
            h,
          ),
        code: `Toggle.toggle({ size: 'sm' | 'default' | 'lg', … })`,
      },
      {
        title: 'Disabled',
        preview: (_model, h: HtmlBuilder<Message>) =>
          toggle({ disabled: true }, h),
        code: `Toggle.toggle({ isDisabled: true, … })`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(toggle({ text: true }, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  'toggle-group': {
    description: 'A set of two-state buttons that can be toggled on or off.',
    composition: 'ToggleGroup\n└── ToggleGroupItem',
    examples: [
      basic(
        'toggle-group',
        `ToggleGroup.toggleGroup({ value, onToggle, items })`,
      ),
      {
        title: 'Outline',
        preview: (_model, h: HtmlBuilder<Message>) =>
          toggleGroup({ variant: 'outline' }, h),
        code: `ToggleGroup.toggleGroup({ variant: 'outline', … })`,
      },
      {
        title: 'Size',
        preview: (_model, h: HtmlBuilder<Message>) =>
          stack(
            toggleGroup({ size: 'sm' }, h),
            toggleGroup({}, h),
            toggleGroup({ size: 'lg' }, h),
            h,
          ),
        code: `ToggleGroup.toggleGroup({ size: 'sm' | 'default' | 'lg', … })`,
      },
      {
        title: 'Spacing',
        preview: (_model, h: HtmlBuilder<Message>) =>
          toggleGroup({ variant: 'outline' }, h),
        code: `ToggleGroup.toggleGroup({ class: 'gap-2', … })`,
      },
      {
        title: 'Vertical',
        preview: (_model, h: HtmlBuilder<Message>) =>
          toggleGroup({ vertical: true, variant: 'outline' }, h),
        code: `ToggleGroup.toggleGroup({ class: 'flex-col', … })`,
      },
      {
        title: 'Disabled',
        preview: (_model, h: HtmlBuilder<Message>) =>
          toggleGroup({ disabled: true }, h),
        code: `items: [{ …, isDisabled: true }]`,
      },
      {
        title: 'Custom',
        preview: (_model, h: HtmlBuilder<Message>) =>
          toggleGroup({ custom: true, variant: 'outline' }, h),
        code: `items: fontWeightOptions`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(toggleGroup({ variant: 'outline' }, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  tooltip: {
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    composition: 'Tooltip\n├── TooltipTrigger\n└── TooltipContent',
    examples: [
      basic(
        'tooltip',
        `Tooltip.tooltip({ model, trigger: 'Hover', content: 'Add to library' })`,
      ),
      {
        title: 'Side',
        preview: (model, h: HtmlBuilder<Message>) =>
          row(
            (['top', 'right', 'bottom', 'left'] as const).map((side, index) =>
              tooltip(model, side, { side }, index, h),
            ),
            h,
          ),
        code: `Tooltip.tooltip({ side: 'right', … })`,
      },
      {
        title: 'With Keyboard Shortcut',
        preview: (model, h: HtmlBuilder<Message>) =>
          tooltip(
            model,
            'keyboard',
            {
              showArrow: false,
              content: h.span(
                [h.Class('flex items-center gap-2')],
                [
                  'Open command menu',
                  Kbd.kbdGroup(
                    {
                      children: [
                        Kbd.kbd({ children: ['⌘'] }, h),
                        Kbd.kbd({ children: ['K'] }, h),
                      ],
                    },
                    h,
                  ),
                ],
              ),
            },
            undefined,
            h,
          ),
        code: `Tooltip.tooltip({
  content: Kbd.kbdGroup({ children: ['⌘', 'K'] }),
  …
})`,
      },
      {
        title: 'Disabled Button',
        preview: (model, h: HtmlBuilder<Message>) =>
          tooltip(
            model,
            'disabled',
            { content: 'This action is unavailable', disabled: false },
            undefined,
            h,
          ),
        code: `Tooltip.tooltip({ trigger: disabledButton, … })`,
      },
      {
        title: 'RTL',
        preview: (model, h: HtmlBuilder<Message>) =>
          rtl(tooltip(model, 'rtl', {}, undefined, h), h),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
  typography: {
    description: 'Styles for headings, paragraphs, lists, etc.',
    examples: [
      basic(
        'typography',
        `Typography.typographyH2({ children: ['The Joke Tax Chronicles'] })`,
      ),
      {
        title: 'h1',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyH1(
            { children: ['Taxing Laughter: The Joke Tax Chronicles'] },
            h,
          ),
        code: `Typography.typographyH1({ children: ['…'] })`,
      },
      {
        title: 'h2',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyH2(
            { children: ['The People of the Kingdom'] },
            h,
          ),
        code: `Typography.typographyH2({ children: ['…'] })`,
      },
      {
        title: 'h3',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyH3({ children: ['The Joke Tax'] }, h),
        code: `Typography.typographyH3({ children: ['…'] })`,
      },
      {
        title: 'h4',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyH4(
            { children: ['People stopped telling jokes'] },
            h,
          ),
        code: `Typography.typographyH4({ children: ['…'] })`,
      },
      {
        title: 'p',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyP(
            {
              children: [
                'The king, seeing how much happier his subjects were, realized the error of his ways.',
              ],
            },
            h,
          ),
        code: `Typography.typographyP({ children: ['…'] })`,
      },
      {
        title: 'blockquote',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyBlockquote(
            {
              children: ['After all, he thought, why should he have to work?'],
            },
            h,
          ),
        code: `Typography.typographyBlockquote({ children: ['…'] })`,
      },
      {
        title: 'table',
        preview: (_model, h: HtmlBuilder<Message>) =>
          invoiceTable(false, false, h),
        code: `Table.table({ children: […] })`,
      },
      {
        title: 'list',
        preview: (_model, h: HtmlBuilder<Message>) =>
          h.ul(
            [h.Class('my-6 ml-6 list-disc [&>li]:mt-2')],
            [
              h.li([], ['1st level of puns: 5 gold coins']),
              h.li([], ['2nd level of jokes: 10 gold coins']),
              h.li([], ['3rd level of one-liners: 20 gold coins']),
            ],
          ),
        code: `<ul class="my-6 ml-6 list-disc">…</ul>`,
      },
      {
        title: 'Inline code',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyInlineCode({ children: ['@foldkit/ui'] }, h),
        code: `Typography.typographyInlineCode({ children: ['@foldkit/ui'] })`,
      },
      {
        title: 'Lead',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyLead(
            {
              children: [
                'A modal dialog that interrupts the user with important content.',
              ],
            },
            h,
          ),
        code: `Typography.typographyLead({ children: ['…'] })`,
      },
      {
        title: 'Large',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyLarge(
            { children: ['Are you absolutely sure?'] },
            h,
          ),
        code: `Typography.typographyLarge({ children: ['…'] })`,
      },
      {
        title: 'Small',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographySmall({ children: ['Email address'] }, h),
        code: `Typography.typographySmall({ children: ['…'] })`,
      },
      {
        title: 'Muted',
        preview: (_model, h: HtmlBuilder<Message>) =>
          Typography.typographyMuted(
            { children: ['Enter your email address.'] },
            h,
          ),
        code: `Typography.typographyMuted({ children: ['…'] })`,
      },
      {
        title: 'RTL',
        preview: (_model, h: HtmlBuilder<Message>) =>
          rtl(
            Typography.typographyP(
              {
                children: [
                  'في قديم الزمان، كان هناك ملك كسول جدًا.',
                ],
              },
              h,
            ),
            h,
          ),
        code: `<Direction direction="rtl">…</Direction>`,
      },
    ],
  },
};

/** Keep documentation executable: an abbreviated snippet falls back to the
 * precise Foldkit view function that renders its live preview. */
export const definitions: PageDefinitions = Object.fromEntries(
  Object.entries(rawDefinitions).map(([slug, definition]) => [
    slug,
    {
      ...definition,
      examples: definition.examples.map((example) => ({
        ...example,
        code: /\.\.\.|<\/?[A-Z]|<(?:div|fieldset|legend)\b/.test(example.code)
          ? `const preview = ${example.preview.toString()}`
          : example.code,
      })),
    },
  ]),
);
