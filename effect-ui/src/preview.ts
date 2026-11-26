import { UiSchema } from '@effect/ui'
import { BrowserHost, Html } from '@effect/ui/html'
import { Effect, Layer, Redacted, Schema } from 'effect'

import {
  Accordion,
  AspectRatio,
  Blockquote,
  Badge,
  Kbd,
  Label,
  VisuallyHidden,
  StatusDot,
  Skeleton,
  Spinner,
  Center,
  Direction,
  ToggleGroup,
  InputOtp,
  NumberInput,
  Avatar,
  AlertDialog,
  Grid,
  GridSpan,
  HStack,
  VStack,
  StackItem,
  Section,
  Form,
  ErrorSummary,
  NativeSelect,
  Textarea,
  Card,
  Alert,
  Empty,
  Table,
  Code,
  Text,
  Heading,
  Typography,
  ScrollArea,
  Toolbar,
  Breadcrumb,
  AvatarGroup,
  AvatarGroupOverflow,
  AvatarStatusDot,
  DropdownMenu,
  ContextMenu,
  Drawer,
  Sheet,
  CircularProgress,
  Stat,
  Bubble,
  BubbleGroup,
  Token,
  Button,
  ButtonLink,
  Calendar,
  RangeCalendar,
  Checkbox,
  Collapsible,
  Combobox,
  Dialog,
  Field,
  Fieldset,
  Input,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Separator,
  Slider,
  Switch,
  Tabs,
  Toggle,
  Tooltip,
} from '#components'
import { CalendarDate, CalendarRange } from './behaviors/calendar'
import '#theme'
import './preview.css'

const Message = UiSchema.TaggedEnum({
  Pressed: {},
  PickedFruit: { value: Schema.NullOr(Schema.String) },
  PickedFruits: { value: Schema.Array(Schema.String) },
  PickedDate: { value: CalendarDate },
  PickedDateRange: { value: CalendarRange },
  PickedTheme: { value: Schema.NullOr(Schema.String) },
  ToggledSummary: { checked: Schema.Boolean },
  ToggledAlerts: { checked: Schema.Boolean },
  SelectedSettingsTab: { value: Schema.String },
  ToggledPin: { pressed: Schema.Boolean },
  UpdatedProfileName: { value: Schema.String },
  UpdatedContactEmail: { value: Schema.String },
  PickedFrequency: { value: Schema.String },
  MovedVolume: { value: Schema.Number },
  MovedRange: { value: Schema.Array(Schema.Number) },
  FormattedText: { value: Schema.Array(Schema.String) },
  UpdatedSeats: { value: Schema.NullOr(Schema.Number) },
  UpdatedOtp: { value: Schema.Redacted(Schema.String) },
  SetArchiveOpen: { open: Schema.Boolean },
  Archived: {},
  ProjectChanged: { value: Schema.String },
  NotesChanged: { value: Schema.String },
  ProjectSaved: { value: Schema.String, notes: Schema.String },
  SetMenu: {
    menu: Schema.Literals(['actionsOpen', 'shareOpen', 'rowOpen']),
    open: Schema.Boolean,
  },
  PickedMenuItem: { value: Schema.String },
  ToggledArchivedItems: { checked: Schema.Boolean },
  SetPanel: {
    panel: Schema.Literals(['drawerOpen', 'sheetOpen']),
    open: Schema.Boolean,
  },
  RemovedActivityToken: {},
})

const fruits = [
  { value: 'apple', label: 'Apple', group: 'Orchard' },
  { value: 'banana', label: 'Banana', group: 'Tropical' },
  { value: 'pear', label: 'Pear', group: 'Orchard' },
  { value: 'plum', label: 'Plum', group: 'Orchard', disabled: true },
]
const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dim', label: 'Dim', disabled: true },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
const today = new Date().toISOString().slice(0, 10)

const Preview = Html.component({
  name: 'CreaseUiPreview',
  message: Message,
  model: Schema.Struct({
    presses: Schema.Number,
    fruit: Schema.NullOr(Schema.String),
    fruits: Schema.Array(Schema.String),
    date: Schema.NullOr(CalendarDate),
    dateRange: Schema.NullOr(CalendarRange),
    theme: Schema.NullOr(Schema.String),
    summary: Schema.Boolean,
    alerts: Schema.Boolean,
    settingsTab: Schema.String,
    pinned: Schema.Boolean,
    profileName: Schema.String,
    contactEmail: Schema.String,
    frequency: Schema.String,
    volume: Schema.Number,
    range: Schema.Array(Schema.Number),
    textFormats: Schema.Array(Schema.String),
    seats: Schema.NullOr(Schema.Number),
    otp: Schema.Redacted(Schema.String),
    archiveOpen: Schema.Boolean,
    archived: Schema.Boolean,
    project: Schema.String,
    notes: Schema.String,
    rejectedNotes: Schema.Boolean,
    projectSaved: Schema.String,
    actionsOpen: Schema.Boolean,
    shareOpen: Schema.Boolean,
    rowOpen: Schema.Boolean,
    lastMenuItem: Schema.String,
    showArchived: Schema.Boolean,
    drawerOpen: Schema.Boolean,
    sheetOpen: Schema.Boolean,
    activityTokenRemoved: Schema.Boolean,
  }),
}).make({
  init: () => ({
    presses: 0,
    fruit: 'banana',
    fruits: ['banana'],
    date: null,
    dateRange: null,
    theme: 'light',
    summary: false,
    alerts: false,
    settingsTab: 'profile',
    pinned: false,
    profileName: 'Ada',
    contactEmail: '',
    frequency: 'daily',
    volume: 40,
    range: [20, 70],
    textFormats: ['bold'],
    seats: 2,
    otp: Redacted.make(''),
    archiveOpen: false,
    archived: false,
    project: 'plan',
    notes: '',
    rejectedNotes: false,
    projectSaved: '',
    actionsOpen: false,
    shareOpen: false,
    rowOpen: false,
    lastMenuItem: '',
    showArchived: false,
    drawerOpen: false,
    sheetOpen: false,
    activityTokenRemoved: false,
  }),
  update: {
    Pressed: $ => $.evolve({ presses: count => count + 1 }),
    PickedFruit: ($, { value }) => $.evolve({ fruit: value }),
    PickedFruits: ($, { value }) => $.evolve({ fruits: value }),
    PickedDate: ($, { value }) => $.evolve({ date: value }),
    PickedDateRange: ($, { value }) => $.evolve({ dateRange: value }),
    PickedTheme: ($, { value }) => $.evolve({ theme: value }),
    ToggledSummary: ($, { checked }) => $.evolve({ summary: checked }),
    ToggledAlerts: ($, { checked }) => $.evolve({ alerts: checked }),
    SelectedSettingsTab: ($, { value }) => $.evolve({ settingsTab: value }),
    ToggledPin: ($, { pressed }) => $.evolve({ pinned: pressed }),
    UpdatedProfileName: ($, { value }) => $.evolve({ profileName: value }),
    UpdatedContactEmail: ($, { value }) => $.evolve({ contactEmail: value }),
    PickedFrequency: ($, { value }) => $.evolve({ frequency: value }),
    MovedVolume: ($, { value }) => $.evolve({ volume: value }),
    MovedRange: ($, { value }) => $.evolve({ range: value }),
    FormattedText: ($, { value }) => $.evolve({ textFormats: value }),
    UpdatedSeats: ($, { value }) => $.evolve({ seats: value }),
    UpdatedOtp: ($, { value }) => $.evolve({ otp: value }),
    SetArchiveOpen: ($, { open }) => $.evolve({ archiveOpen: open }),
    Archived: $ => $.evolve({ archiveOpen: false, archived: true }),
    ProjectChanged: ($, { value }) => $.evolve({ project: value }),
    NotesChanged: ($, { value }) =>
      $.evolve({ notes: value, rejectedNotes: false }),
    ProjectSaved: ($, { value, notes }) =>
      $.evolve({
        rejectedNotes: notes.trim() === '',
        projectSaved: notes.trim() === '' ? '' : value,
      }),
    SetMenu: ($, { menu, open }) => $.evolve({ [menu]: open }),
    PickedMenuItem: ($, { value }) => $.evolve({ lastMenuItem: value }),
    ToggledArchivedItems: ($, { checked }) =>
      $.evolve({ showArchived: checked }),
    SetPanel: ($, { panel, open }) => $.evolve({ [panel]: open }),
    RemovedActivityToken: $ => $.evolve({ activityTokenRemoved: true }),
  },
  view: (h, model) =>
    h.main.class('preview').children(
      h.h1.children('CreaseUI for Effect UI'),
      h.div.class('examples').children(
        h.section.class('example').children(
          h.h2.children('Activity signals'),
          Stat(h, {
            label: 'Review requests',
            value: '64',
            delta: { direction: 'up', value: '8' },
            description: 'Compared with last week',
          }),
          HStack(h, {
            gap: 3,
            children: [
              CircularProgress(h, {
                key: 'activity-review',
                label: 'Reviews completed',
                value: 64,
                showValue: true,
              }),
              CircularProgress(h, {
                key: 'activity-sync',
                label: 'Syncing status',
                value: null,
                size: 'sm',
              }),
            ],
          }),
          BubbleGroup(h, {
            children: [
              Bubble(h, {
                variant: 'outline',
                children: ['Please review today’s changes.'],
              }),
              Bubble(h, {
                variant: 'muted',
                align: 'end',
                children: ['I’ll take a look.'],
              }),
            ],
          }),
          model.activityTokenRemoved
            ? undefined
            : Token(h, {
                label: 'Needs review',
                color: 'blue',
                href: '#project-activity',
                onRemove: Message.RemovedActivityToken(),
              }),
        ),
        h.section.class('example').children(
          h.h2.children('Workspace panels'),
          Drawer(h, {
            key: 'downloads',
            props: { open: model.drawerOpen },
            title: 'Downloads',
            description: 'Files exported from this workspace.',
            trigger: Button(h, { variant: 'outline' }).children(
              'Show downloads',
            ),
            content: () =>
              h.div
                .style({ minHeight: '8rem' })
                .children('Your downloads appear here.'),
            onEmit: {
              RequestedOpen: () =>
                Message.SetPanel({ panel: 'drawerOpen', open: true }),
              RequestedClose: () =>
                Message.SetPanel({ panel: 'drawerOpen', open: false }),
              Settled: () => undefined,
              Snapped: () => undefined,
            },
          }),
          Sheet(h, {
            key: 'preferences',
            side: 'right',
            props: { open: model.sheetOpen },
            title: 'Preferences',
            description: 'Manage this workspace.',
            trigger: Button(h, { variant: 'outline' }).children(
              'Show preferences',
            ),
            content: () => h.p.children('Notifications are enabled.'),
            onEmit: {
              RequestedOpen: () =>
                Message.SetPanel({ panel: 'sheetOpen', open: true }),
              RequestedClose: () =>
                Message.SetPanel({ panel: 'sheetOpen', open: false }),
              Settled: () => undefined,
              Snapped: () => undefined,
            },
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Project menus'),
          DropdownMenu(h, {
            key: 'project-actions',
            label: 'Project actions',
            trigger: Button(h, { variant: 'outline' }).children(
              'Project actions',
            ),
            props: {
              open: model.actionsOpen,
              sideOffset: 4,
              items: [
                { value: 'archive-filter', label: 'Show archived' },
                { value: 'rename', label: 'Rename' },
                { value: 'share', label: 'Share' },
                { value: 'delete', label: 'Delete', disabled: true },
              ],
            },
            decorateItem: ({ value }) => {
              if (value === 'archive-filter')
                return {
                  kind: 'checkbox',
                  checked: model.showArchived,
                  group: 'View',
                }
              if (value === 'delete')
                return { tone: 'destructive', separatorBefore: true }
              if (value === 'share')
                return {
                  kind: 'submenu',
                  render: (item, parentMenu) =>
                    DropdownMenu(h, {
                      key: 'share-options',
                      label: 'Share options',
                      submenuTrigger: h.div.children('Share'),
                      parentMenu,
                      props: {
                        open: model.shareOpen,
                        parentItem: item.value,
                        items: [{ value: 'copy-link', label: 'Copy link' }],
                      },
                      onEmit: {
                        RequestedOpen: () =>
                          Message.SetMenu({ menu: 'shareOpen', open: true }),
                        RequestedClose: () =>
                          Message.SetMenu({ menu: 'shareOpen', open: false }),
                        Picked: ({ value }) =>
                          Message.PickedMenuItem({ value }),
                        Highlighted: () => undefined,
                        RequestedQuery: () => undefined,
                        Settled: () => undefined,
                      },
                    }),
                }
              return { shortcut: 'F2', keys: 'F2' }
            },
            onEmit: {
              RequestedOpen: () =>
                Message.SetMenu({ menu: 'actionsOpen', open: true }),
              RequestedClose: () =>
                Message.SetMenu({ menu: 'actionsOpen', open: false }),
              Picked: ({ value, checked }) =>
                value === 'archive-filter'
                  ? Message.ToggledArchivedItems({ checked: checked ?? false })
                  : Message.PickedMenuItem({ value }),
              Highlighted: () => undefined,
              RequestedQuery: () => undefined,
              Settled: () => undefined,
            },
          }),
          ContextMenu(h, {
            key: 'project-row',
            label: 'Row actions',
            triggerLabel: 'Project row',
            trigger: 'Open project row actions',
            props: {
              open: model.rowOpen,
              items: [{ value: 'duplicate', label: 'Duplicate' }],
            },
            onEmit: {
              RequestedOpen: () =>
                Message.SetMenu({ menu: 'rowOpen', open: true }),
              RequestedClose: () =>
                Message.SetMenu({ menu: 'rowOpen', open: false }),
              Picked: ({ value }) => Message.PickedMenuItem({ value }),
              Highlighted: () => undefined,
              Settled: () => undefined,
            },
          }),
          h.output.children(model.lastMenuItem),
        ),
        h.section.class('example').children(
          h.h2.children('Workspace navigation'),
          Breadcrumb(h, {
            items: [
              { kind: 'link', href: '#project-activity', label: 'Workspace' },
              { kind: 'link', href: '#project-activity', label: 'Projects' },
              { kind: 'link', href: '#project-activity', label: 'Activity' },
              { kind: 'page', label: 'History' },
            ],
            maxItems: 3,
          }),
          Toolbar(h, {
            label: 'Workspace actions',
            variant: 'muted',
            dividers: ['bottom'],
            props: {
              items: [
                { value: 'refresh' },
                {
                  value: 'remove',
                  disabled: true,
                  focusableWhenDisabled: false,
                },
                { value: 'history' },
              ],
            },
            startContent: toolbar => [
              Button(h, {
                element: toolbar.button({
                  value: 'refresh',
                  element: h.button,
                }),
                onPress: Message.Pressed(),
              }).children('Refresh'),
              Button(h, {
                element: toolbar.button({ value: 'remove', element: h.button }),
                disabled: toolbar.isDisabled('remove'),
                variant: 'outline',
              }).children('Remove'),
            ],
            endContent: toolbar =>
              toolbar
                .link({
                  value: 'history',
                  element: h.a.attr('href', '#project-activity'),
                })
                .children('History'),
          }),
          AvatarGroup(h, {
            ariaLabel: 'Team members',
            children: [
              Avatar(h, {
                key: 'grace',
                props: {},
                alt: 'Grace Hopper',
                fallbackContent: ['GH'],
                badge: [
                  AvatarStatusDot(h, {
                    variant: 'success',
                    ariaLabel: 'Online',
                  }),
                ],
              }),
              Avatar(h, {
                key: 'katherine',
                props: {},
                alt: 'Katherine Johnson',
                fallbackContent: ['KJ'],
                tone: 'accent',
              }),
              AvatarGroupOverflow(h, { count: 3, onPress: Message.Pressed() }),
            ],
          }),
          h.div.style({ height: '7rem' }).children(
            ScrollArea(h, {
              props: {},
              ariaLabel: 'Activity feed',
              orientation: 'vertical',
              children: [
                h.ol
                  .style({ width: '26rem' })
                  .children(
                    Array.from({ length: 12 }, (_, index) =>
                      h.li.key(String(index)).children(`Update ${index + 1}`),
                    ),
                  ),
              ],
            }),
          ),
        ),
        h.section.class('example').children(
          Heading(h, { level: 2, children: ['Project activity'] }),
          Card(h, {
            as: 'article',
            id: 'project-activity',
            size: 'sm',
            children: card => [
              card.header({
                children: [
                  card.title({ children: ['Team updates'] }),
                  card.description({
                    children: ['Recent changes from this workspace.'],
                  }),
                  card.action({
                    children: [
                      Badge(h, { variant: 'secondary', children: ['Live'] }),
                    ],
                  }),
                ],
              }),
              card.content({
                children: [
                  Alert(h, {
                    severity: 'info',
                    announcement: 'status',
                    title: 'Updates are on time.',
                  }),
                  Table(h, {
                    ariaLabel: 'Activity history',
                    children: table => [
                      table.header({
                        children: [
                          table.row({
                            children: [
                              table.head({ children: ['Project'] }),
                              table.head({ children: ['Status'] }),
                            ],
                          }),
                        ],
                      }),
                      table.body({
                        children: [
                          table.row({
                            selected: true,
                            children: [
                              table.head({
                                scope: 'row',
                                children: ['Workspace'],
                              }),
                              table.cell({
                                children: [Code(h, { children: ['review'] })],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  Empty(h, {
                    title: 'No drafts',
                    description: 'Drafts show here while they’re being edited.',
                  }),
                ],
              }),
              card.footer({
                children: [
                  Typography(h, {
                    variant: 'muted',
                    children: [
                      Text(h, {
                        type: 'inherit',
                        hasTabularNumbers: true,
                        children: ['1 activity this week'],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Project notes'),
          Form(h, {
            key: 'project-notes',
            element: h.form.attr('aria-label', 'Project notes'),
            onSubmit: ({ fields }) =>
              Message.ProjectSaved({
                value: fields.project ?? '',
                notes: fields.notes ?? '',
              }),
            children: [
              ErrorSummary(h, {
                id: 'project-errors',
                title: 'Check your notes',
                errors: model.rejectedNotes
                  ? [
                      {
                        controlId: 'project-notes',
                        message: 'Enter your project notes.',
                      },
                    ]
                  : [],
              }),
              Section(h, {
                variant: 'transparent',
                padding: 0,
                children: [
                  Grid(h, {
                    columns: { minWidth: 180, max: 2, repeat: 'fit' },
                    gap: 3,
                    children: [
                      NativeSelect(h, {
                        id: 'project-kind',
                        label: 'Project',
                        element: h.select.attrs({ name: 'project' }),
                        value: model.project,
                        onChange: value => Message.ProjectChanged({ value }),
                        options: [{ value: 'plan', label: 'Planning' }],
                        groups: [
                          {
                            label: 'Delivery',
                            options: [
                              { value: 'build', label: 'Implementation' },
                              {
                                value: 'review',
                                label: 'Review',
                                disabled: true,
                              },
                            ],
                          },
                        ],
                      }),
                      GridSpan(h, {
                        columns: 'full',
                        children: [
                          Textarea(h, {
                            id: 'project-notes',
                            label: 'Notes',
                            description: 'A short summary for your team.',
                            value: model.notes,
                            invalid: model.rejectedNotes,
                            element: h.textarea.attrs({
                              name: 'notes',
                              rows: '3',
                            }),
                            onInput: value => Message.NotesChanged({ value }),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              HStack(h, {
                hAlign: 'between',
                vAlign: 'center',
                gap: 2,
                children: [
                  StackItem(h, {
                    children: [
                      h.button.attrs({ type: 'submit' }).children('Save notes'),
                    ],
                  }),
                  VStack(h, {
                    children: [
                      h.output.children(
                        model.projectSaved === ''
                          ? ''
                          : `Saved ${model.projectSaved}`,
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Formatting'),
          ToggleGroup(h, {
            ariaLabel: 'Text formatting',
            props: {
              multiple: true,
              value: model.textFormats,
              items: [
                { value: 'bold' },
                { value: 'italic' },
                { value: 'underline', disabled: true },
              ],
            },
            onEmit: {
              Toggled: ({ value }) => Message.FormattedText({ value }),
            },
            variant: 'outline',
            renderItem: value => ({
              children: [value[0]?.toUpperCase() + value.slice(1)],
            }),
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Booking'),
          NumberInput(h, {
            id: 'booking-seats',
            label: ['Seats'],
            description: ['Choose up to eight seats.'],
            props: {
              value: model.seats,
              min: 1,
              max: 8,
              step: 1,
              name: 'seats',
            },
            onEmit: {
              Updated: ({ value }) => Message.UpdatedSeats({ value }),
              Committed: () => undefined,
            },
          }),
          InputOtp(h, {
            ariaLabel: 'Booking code',
            props: {
              value: model.otp,
              length: 6,
              validationType: 'numeric',
              name: 'booking-code',
            },
            onEmit: {
              Updated: ({ value }) => Message.UpdatedOtp({ value }),
              Completed: () => undefined,
              Rejected: () => undefined,
            },
            separator: index =>
              index === 3
                ? h.span.attr('aria-hidden', 'true').children('–')
                : undefined,
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Workspace'),
          Avatar(h, {
            props: {},
            alt: 'Ada Lovelace',
            fallbackContent: ['AL'],
            tone: 'accent',
          }),
          AlertDialog(h, {
            props: { open: model.archiveOpen },
            trigger: Button(h, { variant: 'outline' }).children(
              'Archive workspace',
            ),
            title: 'Archive workspace?',
            description: 'You can restore the workspace from Settings.',
            actionLabel: 'Archive',
            actionVariant: 'destructive',
            onAction: Message.Archived(),
            onEmit: {
              RequestedOpen: () => Message.SetArchiveOpen({ open: true }),
              RequestedClose: () => Message.SetArchiveOpen({ open: false }),
              Settled: () => undefined,
            },
          }),
          model.archived
            ? h.p.attr('role', 'status').children('Workspace archived')
            : undefined,
        ),
        h.section
          .class('example example-compact')
          .children(
            h.h2.children('Button'),
            Button(h, { onPress: Message.Pressed() }).children('Count'),
            Button(h, { disabled: true, variant: 'outline' }).children(
              'Disabled',
            ),
            h.output.children(`Presses: ${model.presses}`),
          ),
        h.section.class('example example-compact').children(
          h.h2.children('Dialog'),
          Dialog(h, {
            props: {},
            title: 'Edit profile',
            description:
              'Try opening the dialog with the keyboard and closing it with Escape.',
            trigger: Button(h, { variant: 'outline' }).children('Edit profile'),
            content: h.label
              .class('example-label')
              .children(
                'Display name',
                h.input.class('example-input').attr('autocomplete', 'name'),
              ),
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Dates'),
          RangeCalendar(h, {
            key: 'travel-dates',
            props: { today, value: model.dateRange, locale: 'en-US' },
            captionLayout: 'dropdown',
            weekNumbers: true,
            onEmit: {
              Picked: ({ start, end }) =>
                Message.PickedDateRange({ value: { start, end } }),
            },
          }),
          h.output.children(
            model.dateRange === null
              ? 'Choose a date range'
              : `${model.dateRange.start} to ${model.dateRange.end}`,
          ),
        ),
        h.section.class('example').children(
          h.h2.children('Combobox'),
          Combobox(h, {
            label: 'Fruit',
            placeholder: 'Choose fruit',
            props: { items: fruits, value: model.fruit },
            onEmit: {
              Picked: ({ value }) =>
                value === null || typeof value === 'string'
                  ? Message.PickedFruit({ value })
                  : undefined,
            },
          }),
          h.output.children(`Selected fruit: ${model.fruit ?? 'None'}`),
        ),
        h.section.class('example').children(
          h.h2.children('Multiple fruits'),
          Combobox(h, {
            key: 'many-fruits',
            label: 'Fruits',
            placeholder: 'Add fruits',
            props: {
              items: fruits,
              value: model.fruits,
              multiple: true,
              name: 'fruits',
            },
            onEmit: {
              Picked: ({ value }) =>
                value !== null && typeof value !== 'string'
                  ? Message.PickedFruits({ value })
                  : undefined,
            },
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Calendar'),
          Calendar(h, {
            props: { today, locale: 'en-US', value: model.date },
            onEmit: {
              Picked: ({ date }) => Message.PickedDate({ value: date }),
            },
          }),
          h.output.children(`Selected date: ${model.date ?? 'None'}`),
        ),
        h.section.class('example example-compact').children(
          h.h2.children('Select'),
          Select(h, {
            label: 'Theme',
            props: { items: themes, value: model.theme },
            onEmit: {
              Picked: ({ value }) =>
                typeof value === 'string' || value === null
                  ? Message.PickedTheme({ value })
                  : undefined,
              RequestedOpen: () => undefined,
              RequestedClose: () => undefined,
              Settled: () => undefined,
            },
          }),
          h.output.children(`Selected theme: ${model.theme ?? 'None'}`),
        ),
        h.section.class('example').children(
          h.h2.children('Checkbox and Switch'),
          h.form.class('example-label').children(
            Checkbox(h, {
              id: 'weekly-summary',
              label: 'Weekly summary',
              description: 'Get one email each week.',
              props: { checked: model.summary, name: 'summary' },
              onEmit: {
                Toggled: ({ checked }) => Message.ToggledSummary({ checked }),
              },
            }),
            Switch(h, {
              id: 'email-alerts',
              label: 'Email alerts',
              props: { checked: model.alerts, name: 'alerts' },
              onToggle: Message.ToggledAlerts,
            }),
          ),
        ),
        h.section.class('example').children(
          h.h2.children('Popover'),
          h.div.class('example-end').children(
            Popover(h, {
              props: { side: 'right' },
              title: 'Display options',
              trigger: Button(h, { variant: 'outline' }).children(
                'Display options',
              ),
              content: h.label
                .class('example-label')
                .children(
                  'Display name',
                  h.input.class('example-input').attr('autocomplete', 'name'),
                ),
            }),
          ),
        ),
        h.section.class('example example-compact').children(
          h.h2.attr('id', 'retention-policy').children('Tooltip'),
          Tooltip(h, {
            key: 'retention-button',
            props: { delay: 250 },
            trigger: Button(h, { variant: 'outline' }).children(
              'Retention details',
            ),
            content: 'Archived items are kept for 30 days.',
          }),
          Tooltip(h, {
            key: 'retention-link',
            props: { delay: 250 },
            trigger: ButtonLink(h, {
              href: '#retention-policy',
              variant: 'link',
            }).children('Retention policy'),
            content: 'Read the retention policy.',
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Tabs'),
          Tabs(h, {
            ariaLabel: 'Settings',
            props: { value: model.settingsTab },
            tabs: [
              {
                value: 'profile',
                label: 'Profile',
                content: 'Update your profile.',
              },
              {
                value: 'billing',
                label: 'Billing',
                content: 'Billing is unavailable.',
                disabled: true,
              },
              {
                value: 'privacy',
                label: 'Privacy',
                content: 'Manage how information is shared.',
              },
            ],
            onEmit: {
              Selected: ({ value }) => Message.SelectedSettingsTab({ value }),
            },
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Accordion'),
          Accordion(h, {
            props: { defaultValue: ['delivery'] },
            items: [
              {
                value: 'delivery',
                trigger: 'When will it arrive?',
                content: 'Delivery takes three to five days.',
              },
              {
                value: 'return',
                trigger: 'Can I return it?',
                content: 'Returns are accepted within 30 days.',
              },
              {
                value: 'status',
                trigger: 'Where is my order?',
                content: 'Tracking is unavailable.',
                disabled: true,
              },
            ],
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Collapsible'),
          Collapsible(h, {
            props: { keepMounted: 'css' },
            trigger: Button(h, { variant: 'outline' }).children(
              'Show storage details',
            ),
            content: h.p.children('Files are stored in your workspace.'),
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Progress'),
          Progress(h, {
            key: 'files-uploaded',
            props: { value: 3, max: 5 },
            label: 'Files uploaded',
            showValue: true,
          }),
          Progress(h, {
            key: 'preparing-report',
            props: { value: null },
            label: 'Preparing report',
          }),
        ),
        h.section.class('example').children(
          h.h2.children('Toggle and Separator'),
          Toggle(h, {
            props: { pressed: model.pinned },
            onToggle: Message.ToggledPin,
            variant: 'outline',
          }).children('Pin item'),
          Separator(h),
          h.div.children('Recent items'),
        ),
        h.section.class('example').children(
          h.h2.children('Input and Radio Group'),
          h.form.class('example-label').children(
            Input(h, {
              id: 'profile-name',
              label: 'Profile name',
              description: 'Shown on your profile.',
              element: h.input.attrs({
                name: 'profileName',
                autocomplete: 'name',
              }),
              props: { value: model.profileName },
              onUpdate: Message.UpdatedProfileName,
            }),
            RadioGroup(h, {
              id: 'summary-frequency',
              ariaLabel: 'Summary frequency',
              props: { value: model.frequency, name: 'frequency' },
              items: [
                { value: 'daily', label: 'Daily' },
                { value: 'hourly', label: 'Hourly', disabled: true },
                {
                  value: 'weekly',
                  label: 'Weekly',
                  description: 'Send on Monday.',
                },
              ],
              onEmit: { Picked: Message.PickedFrequency },
            }),
          ),
        ),
        h.section.class('example').children(
          h.h2.children('Slider'),
          h.form.class('example-label').children(
            Slider(h, {
              key: 'volume',
              label: 'Volume',
              showValue: true,
              name: 'volume',
              props: { value: model.volume },
              onEmit: {
                Moved: ({ value }) =>
                  typeof value === 'number'
                    ? Message.MovedVolume({ value })
                    : undefined,
                Committed: () => undefined,
              },
            }),
            Slider(h, {
              key: 'volume-limit',
              label: 'Volume limit',
              showValue: true,
              name: 'limit',
              readOnly: true,
              props: { value: 80 },
            }),
            Slider(h, {
              key: 'range',
              label: 'Frequency range',
              thumbLabels: ['Minimum frequency', 'Maximum frequency'],
              showValue: true,
              name: 'range',
              props: {
                value: model.range,
                orientation: 'vertical',
                step: 5,
                minStepsBetweenValues: 2,
                thumbCollisionBehavior: 'none',
              },
              onEmit: {
                Moved: ({ value }) =>
                  typeof value === 'number'
                    ? undefined
                    : Message.MovedRange({ value }),
                Committed: () => undefined,
              },
            }),
          ),
        ),
        h.section.class('example').children(
          h.h2.children('Layout and status'),
          Badge(h, { variant: 'outline', children: ['Draft'] }),
          Label(h, {
            for: 'foundation-reference',
            required: true,
            children: ['Reference'],
          }),
          h.input
            .class('example-input')
            .attrs({ id: 'foundation-reference', required: '' }),
          Direction(h, {
            key: 'shortcuts-rtl',
            direction: 'rtl',
            children: [
              Kbd(h, {
                group: true,
                children: [
                  Kbd(h, { children: ['Ctrl'] }),
                  Kbd(h, { children: ['K'] }),
                ],
              }),
            ],
          }),
          Blockquote(h, {
            children: ['Plans are saved automatically.'],
            cite: 'Workspace settings',
          }),
          AspectRatio(h, {
            ratio: 4,
            children: [
              Center(h, {
                height: '100%',
                children: [
                  Spinner(h, { label: 'Loading' }),
                  VisuallyHidden(h, { children: ['Loading preview'] }),
                ],
              }),
            ],
          }),
          h.div.children(
            StatusDot(h, { variant: 'success', label: 'Online' }),
            ' Online',
          ),
          Skeleton(h, { shape: 'text', size: 'md' }),
        ),
        h.section.class('example').children(
          h.h2.children('Field and Fieldset'),
          h.form.class('example-label').children(
            Fieldset(h, {
              id: 'contact-settings',
              legend: 'Contact settings',
              content: Field(h, {
                props: {
                  id: 'contact-email',
                  invalid: model.contactEmail.trim() === '',
                },
                label: 'Contact email',
                layout: 'responsive',
                description: 'Used for account notifications.',
                error: 'Enter an email address.',
                control: field =>
                  Input(h, {
                    id: 'contact-email',
                    element: field.control(
                      h.input.attrs({
                        type: 'email',
                        name: 'contactEmail',
                        autocomplete: 'email',
                      }),
                    ),
                    props: {
                      value: model.contactEmail,
                      disabled: field.disabled,
                    },
                    onUpdate: Message.UpdatedContactEmail,
                  }),
              }),
            }),
            Fieldset(h, {
              id: 'billing-settings',
              legend: 'Billing settings',
              props: { disabled: true },
              content: Field(h, {
                props: { id: 'billing-email', invalid: true },
                label: 'Billing email',
                error: 'Enter a billing email.',
                control: field =>
                  Input(h, {
                    id: 'billing-email',
                    element: field.control(
                      h.input.attrs({ type: 'email', name: 'billingEmail' }),
                    ),
                    props: {
                      value: 'billing@example.com',
                      disabled: field.disabled,
                    },
                  }),
              }),
            }),
          ),
        ),
      ),
    ),
})

const root = document.getElementById('root')
if (root === null) throw new Error('Missing preview root')
Layer.launch(BrowserHost.mount(Preview, {}, root)).pipe(Effect.runFork)
