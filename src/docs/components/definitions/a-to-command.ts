import { Option } from 'effect';
import { type Html, type HtmlBuilder } from 'foldkit/html';

import { type PageDefinitions } from '@/docs/components/page-definition';
import { realPreview } from '@/docs/components/real-previews';
import * as State from '@/docs/components/catalog-state';
import * as Alert from '@/ui/alert';
import * as AlertDialog from '@/ui/alert-dialog';
import * as AspectRatio from '@/ui/aspect-ratio';
import * as Attachment from '@/ui/attachment';
import * as Avatar from '@/ui/avatar';
import * as Badge from '@/ui/badge';
import * as Breadcrumb from '@/ui/breadcrumb';
import * as Bubble from '@/ui/bubble';
import * as Button from '@/ui/button';
import * as ButtonGroup from '@/ui/button-group';
import * as Card from '@/ui/card';
import * as Carousel from '@/ui/carousel';
import * as Chart from '@/ui/chart';
import * as Checkbox from '@/ui/checkbox';
import * as Collapsible from '@/ui/collapsible';
import * as Combobox from '@/ui/combobox';
import * as CommandMenu from '@/ui/command';
import * as DropdownMenu from '@/ui/dropdown-menu';
import * as Input from '@/ui/input';
import * as InputGroup from '@/ui/input-group';
import * as Popover from '@/ui/popover';
import * as Select from '@/ui/select';
import * as Spinner from '@/ui/spinner';
import * as Tooltip from '@/ui/tooltip';

type Msg = State.Message;
const clicked = State.ClickedPreviewAction();
type Preview = (model: State.Model, h: HtmlBuilder<Msg>) => Html;

const code = (
  component: string,
  preview: (...args: ReadonlyArray<never>) => Html,
): string =>
  `import * as ${component} from '@/ui/${component.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}'\n\nconst preview = ${preview.toString()}`;

const basic = (slug: string, component: string) => {
  const preview = (model: State.Model, h: HtmlBuilder<Msg>) =>
    realPreview(slug, model, h);
  return {
    title: 'Basic',
    preview,
    code: code(component, preview),
  };
};

const staticExample = (
  title: string,
  component: string,
  render: (h: HtmlBuilder<Msg>) => Html,
  description?: string,
) => {
  const preview: Preview = (_model, h) => render(h);
  return {
    title,
    ...(description === undefined ? {} : { description }),
    preview,
    code: code(component, render),
  };
};

const statefulExample = (
  title: string,
  component: string,
  preview: Preview,
  description?: string,
) => ({
  title,
  ...(description === undefined ? {} : { description }),
  preview,
  code: code(component, preview),
});

const row = (
  children: ReadonlyArray<Html | string>,
  className: string,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [h.Class(`flex flex-wrap items-center justify-center gap-3 ${className}`)],
    children,
  );

const stack = (
  children: ReadonlyArray<Html | string>,
  className: string,
  h: HtmlBuilder<Msg>,
): Html =>
  h.div([h.Class(`grid w-full max-w-md gap-3 ${className}`)], children);

const alertPreview = (
  variant: 'default' | 'destructive',
  action = false,
  custom = false,
  h: HtmlBuilder<Msg>,
): Html =>
  Alert.alert(
    {
      variant,
      ...(custom
        ? {
            class:
              'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300',
          }
        : {}),
      children: [
        Alert.alertTitle(
          { children: [variant === 'destructive' ? 'Error' : 'Heads up!'] },
          h,
        ),
        Alert.alertDescription(
          {
            children: [
              variant === 'destructive'
                ? 'Your session has expired. Please log in again.'
                : 'You can add components to your app using the CLI.',
            ],
          },
          h,
        ),
        ...(action
          ? [
              Button.button(
                {
                  variant: 'outline',
                  size: 'sm',
                  class: 'mt-3',
                  onClick: clicked,
                  children: ['Upgrade'],
                },
                h,
              ),
            ]
          : []),
      ],
    },
    h,
  );

const alertDialogPreview = (
  model: State.Model,
  options: Readonly<{
    size?: 'default' | 'sm';
    media?: boolean;
    destructive?: boolean;
    rtl?: boolean;
  }> = {},
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [...(options.rtl ? [h.Dir('rtl')] : [])],
    [
      Button.button(
        {
          variant: 'outline',
          onClick: State.OpenedOverlay({ target: 'alertDialog' }),
          children: ['Show Dialog'],
        },
        h,
      ),
      AlertDialog.alertDialog(
        {
          model: model.alertDialog,
          toParentMessage: (message) =>
            State.GotAlertDialogMessage({ message }),
          title: options.destructive
            ? 'Delete project?'
            : 'Are you absolutely sure?',
          description: options.destructive
            ? 'This permanently deletes the project and all of its data.'
            : 'This action cannot be undone. This will permanently delete your account.',
          actionLabel: options.destructive ? 'Delete' : 'Continue',
          ...(options.size === undefined ? {} : { size: options.size }),
          ...(options.destructive
            ? {
                actionClass:
                  'bg-destructive text-white hover:bg-destructive/90',
              }
            : {}),
          ...(options.media ? { media: ['!'] } : {}),
        },
        h,
      ),
    ],
  );

const aspectPreview = (
  ratio: number,
  className: string,
  h: HtmlBuilder<Msg>,
): Html =>
  AspectRatio.aspectRatio(
    {
      ratio,
      class: `w-full max-w-md overflow-hidden rounded-lg ${className}`,
      children: [
        h.div(
          [
            h.Class(
              'flex size-full items-end bg-gradient-to-br from-sky-300 via-indigo-300 to-fuchsia-300 p-5',
            ),
          ],
          [
            h.span(
              [
                h.Class(
                  'rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur',
                ),
              ],
              [`${ratio}:1`],
            ),
          ],
        ),
      ],
    },
    h,
  );

const attachmentPreview = (
  state: Attachment.AttachmentState = 'done',
  size: 'sm' | 'default' = 'default',
  h: HtmlBuilder<Msg>,
): Html =>
  Attachment.attachment(
    {
      state,
      size,
      children: [
        Attachment.attachmentMedia(
          { variant: 'icon', children: [state === 'error' ? '!' : 'PDF'] },
          h,
        ),
        Attachment.attachmentContent(
          {
            children: [
              Attachment.attachmentTitle(
                { children: ['project-brief.pdf'] },
                h,
              ),
              Attachment.attachmentDescription(
                {
                  children: [
                    state === 'uploading'
                      ? 'Uploading 64%'
                      : state === 'error'
                        ? 'Upload failed'
                        : '2.4 MB Â· PDF',
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        Attachment.attachmentActions(
          {
            children: [
              Button.button(
                {
                  variant: 'ghost',
                  size: 'sm',
                  onClick: clicked,
                  children: ['Remove'],
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
  );

const avatar = (
  initials: string,
  size: 'default' | 'sm' | 'lg' = 'default',
  h: HtmlBuilder<Msg>,
): Html =>
  Avatar.avatar(
    {
      size,
      children: [
        Avatar.avatarImage(
          {
            src: `https://github.com/${initials === 'CN' ? 'shadcn' : 'vercel'}.png`,
            alt: initials,
          },
          h,
        ),
        Avatar.avatarFallback({ children: [initials] }, h),
      ],
    },
    h,
  );

const breadcrumbPreview = (
  separator = '/',
  collapsed = false,
  h: HtmlBuilder<Msg>,
): Html =>
  Breadcrumb.breadcrumb(
    {
      children: [
        Breadcrumb.breadcrumbList(
          {
            children: [
              Breadcrumb.breadcrumbItem(
                {
                  children: [
                    Breadcrumb.breadcrumbLink(
                      { href: '/', children: ['Home'] },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Breadcrumb.breadcrumbSeparator({ children: [separator] }, h),
              ...(collapsed
                ? [
                    Breadcrumb.breadcrumbItem(
                      { children: [Breadcrumb.breadcrumbEllipsis({}, h)] },
                      h,
                    ),
                    Breadcrumb.breadcrumbSeparator(
                      { children: [separator] },
                      h,
                    ),
                  ]
                : [
                    Breadcrumb.breadcrumbItem(
                      {
                        children: [
                          Breadcrumb.breadcrumbLink(
                            { href: '/docs', children: ['Components'] },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    Breadcrumb.breadcrumbSeparator(
                      { children: [separator] },
                      h,
                    ),
                  ]),
              Breadcrumb.breadcrumbItem(
                {
                  children: [
                    Breadcrumb.breadcrumbPage({ children: ['Breadcrumb'] }, h),
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
  );

const buttonPreview = (
  variant:
    'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link',
  label: string,
  className: string | undefined,
  h: HtmlBuilder<Msg>,
): Html =>
  Button.button(
    {
      variant,
      ...(className === undefined ? {} : { class: className }),
      onClick: clicked,
      children: [label],
    },
    h,
  );

const bubblePreview = (
  variant: 'default' | 'tinted' | 'outline' = 'default',
  align: 'start' | 'end' = 'start',
  text = 'Hey! How can I help you today?',
  h: HtmlBuilder<Msg>,
): Html =>
  Bubble.bubble(
    {
      variant,
      align,
      children: [Bubble.bubbleContent({ children: [text] }, h)],
    },
    h,
  );

const cardPreview = (
  options: Readonly<{
    small?: boolean;
    image?: boolean;
    rtl?: boolean;
    edge?: boolean;
  }> = {},
  h: HtmlBuilder<Msg>,
): Html =>
  Card.card(
    {
      class: `${options.small ? 'max-w-xs' : 'max-w-sm'} w-full ${options.rtl ? 'text-right' : ''}`,
      children: [
        ...(options.image
          ? [
              h.div(
                [
                  h.Class(
                    'mx-4 aspect-video rounded-lg bg-gradient-to-br from-amber-200 via-orange-300 to-rose-300',
                  ),
                ],
                [],
              ),
            ]
          : []),
        Card.cardHeader(
          {
            children: [
              Card.cardTitle(
                {
                  children: [
                    options.image
                      ? 'Beautiful destination'
                      : 'Login to your account',
                  ],
                },
                h,
              ),
              Card.cardDescription(
                {
                  children: [
                    options.image
                      ? 'Plan your next weekend away.'
                      : 'Enter your email below to login.',
                  ],
                },
                h,
              ),
              Card.cardAction(
                {
                  children: [
                    Button.button(
                      {
                        variant: 'ghost',
                        size: 'sm',
                        onClick: clicked,
                        children: ['Sign Up'],
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
        Card.cardContent(
          {
            ...(options.edge ? { class: 'px-0' } : {}),
            children: [
              h.p(
                [
                  h.Class(
                    options.edge
                      ? 'border-y px-4 py-4 text-sm text-muted-foreground'
                      : 'text-sm text-muted-foreground',
                  ),
                ],
                ['Source-owned components you can compose and customize.'],
              ),
            ],
          },
          h,
        ),
        Card.cardFooter(
          {
            children: [
              Button.button(
                { class: 'w-full', onClick: clicked, children: ['Continue'] },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const carouselPreview = (
  model: State.Model,
  options: Readonly<{
    orientation?: 'horizontal' | 'vertical';
    compact?: boolean;
    spacing?: boolean;
  }> = {},
  h: HtmlBuilder<Msg>,
): Html =>
  Carousel.carousel(
    {
      model: model.carousel,
      toParentMessage: (message) => State.GotCarouselMessage({ message }),
      ...(options.orientation === undefined
        ? {}
        : { orientation: options.orientation }),
      class:
        options.orientation === 'vertical'
          ? 'h-56 w-56'
          : options.compact
            ? 'w-56'
            : 'w-full max-w-xs',
      items: [1, 2, 3].map((number) =>
        Card.card(
          {
            class: options.spacing ? 'mx-2' : '',
            children: [
              Card.cardContent(
                {
                  class:
                    'flex aspect-square items-center justify-center p-6 text-4xl font-semibold',
                  children: [String(number)],
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
  );

const checkboxPreview = (
  model: State.Model,
  options: Readonly<{
    description?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    label?: string;
    instance?: string;
  }> = {},
  h: HtmlBuilder<Msg>,
): Html =>
  Checkbox.checkbox(
    {
      id: `docs-checkbox-${options.instance ?? 'default'}`,
      isChecked: model.isCheckboxChecked,
      onToggle: (isChecked) => State.ToggledCheckbox({ isChecked }),
      label: options.label ?? 'Accept terms and conditions',
      ...(options.description
        ? {
            description:
              'You agree to our Terms of Service and Privacy Policy.',
          }
        : {}),
      ...(options.disabled ? { isDisabled: true } : {}),
      ...(options.invalid
        ? {
            class:
              'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          }
        : {}),
    },
    h,
  );

const collapsiblePreview = (
  model: State.Model,
  kind: 'basic' | 'settings' | 'tree' = 'basic',
  h: HtmlBuilder<Msg>,
): Html =>
  Collapsible.collapsible(
    {
      id: `docs-collapsible-${kind}`,
      isOpen: model.isCollapsibleOpen,
      onToggle: (isOpen) => State.ToggledCollapsible({ isOpen }),
      class: 'w-full max-w-sm space-y-2',
      triggerClass:
        'flex w-full items-center justify-between rounded-md border px-4 py-2 text-left text-sm font-semibold',
      trigger:
        kind === 'settings'
          ? 'Notification settings'
          : kind === 'tree'
            ? 'src'
            : '@peduarte starred 3 repositories',
      contentClass: 'space-y-2 rounded-md border px-4 py-3 text-sm',
      content:
        kind === 'settings'
          ? 'Email Â· Push Â· Weekly digest'
          : kind === 'tree'
            ? 'components/\nlib/\nmain.ts'
            : '@radix-ui/primitives',
    },
    h,
  );

type Framework = 'next' | 'svelte' | 'nuxt' | 'remix' | 'astro';
const frameworks: ReadonlyArray<
  Readonly<{ value: Framework; label: string; group: string }>
> = [
  { value: 'next', label: 'Next.js', group: 'React' },
  { value: 'remix', label: 'Remix', group: 'React' },
  { value: 'svelte', label: 'SvelteKit', group: 'Svelte' },
  { value: 'nuxt', label: 'Nuxt.js', group: 'Vue' },
  { value: 'astro', label: 'Astro', group: 'Other' },
];

const comboboxPreview = (
  model: State.Model,
  options: Readonly<{
    disabled?: boolean;
    groups?: boolean;
    clear?: boolean;
    popup?: boolean;
  }> = {},
  h: HtmlBuilder<Msg>,
): Html =>
  Combobox.combobox<(typeof frameworks)[number], Framework, Msg>(
    {
      model: model.combobox,
      maybeSelectedValue:
        model.selectedComboboxValue as Option.Option<Framework>,
      restingInputValue: Option.match(model.selectedComboboxValue, {
        onNone: () => '',
        onSome: (value) =>
          frameworks.find((item) => item.value === value)?.label ?? value,
      }),
      toParentMessage: (message) => State.GotComboboxMessage({ message }),
      items: frameworks,
      itemToValue: (item) => item.value,
      itemToLabel: (item) => item.label,
      placeholder: options.popup ? 'Search commandsâ€¦' : 'Select frameworkâ€¦',
      ...(options.disabled
        ? { triggerClass: 'pointer-events-none opacity-50' }
        : options.clear
          ? { triggerClass: 'pr-10' }
          : {}),
      ...(options.groups
        ? {
            itemGroupKey: (item) => item.group,
            groupToHeading: (group) => group,
          }
        : {}),
    },
    h,
  );

type CommandItem =
  'calendar' | 'search' | 'calculator' | 'profile' | 'settings';
const commandItems: ReadonlyArray<CommandItem> = [
  'calendar',
  'search',
  'calculator',
  'profile',
  'settings',
];
const commandPreview = (
  model: State.Model,
  options: Readonly<{
    shortcuts?: boolean;
    groups?: boolean;
    scrollable?: boolean;
    rtl?: boolean;
  }> = {},
  h: HtmlBuilder<Msg>,
): Html =>
  h.div(
    [
      ...(options.rtl ? [h.Dir('rtl')] : []),
      h.Class(
        options.scrollable
          ? 'max-h-56 w-full max-w-md overflow-y-auto'
          : 'w-full max-w-md',
      ),
    ],
    [
      CommandMenu.command(
        {
          model: model.command,
          maybeSelectedValue: model.selectedCommandValue,
          restingInputValue: Option.match(model.selectedCommandValue, {
            onNone: () => '',
            onSome: (value) => value[0]?.toUpperCase() + value.slice(1),
          }),
          toParentMessage: (message) => State.GotCommandMessage({ message }),
          class: 'border shadow-md',
          items: commandItems,
          itemToConfig: (item) => ({
            content: item[0]?.toUpperCase() + item.slice(1),
            ...(options.shortcuts
              ? { shortcut: item === 'settings' ? 'âŒ˜,' : 'âŒ˜K' }
              : {}),
          }),
          placeholder: 'Type a command or searchâ€¦',
          ...(options.groups
            ? {
                itemGroupKey: (item) =>
                  ['profile', 'settings'].includes(item)
                    ? 'Settings'
                    : 'Suggestions',
                groupToHeading: (group) => group,
              }
            : {}),
        },
        h,
      ),
    ],
  );

export const definitions: PageDefinitions = {
  alert: {
    description: 'Displays a callout for user attention.',
    composition:
      'Alert\nâ”œâ”€â”€ AlertTitle\nâ”œâ”€â”€ AlertDescription\nâ””â”€â”€ AlertAction',
    examples: [
      basic('alert', 'Alert'),
      staticExample('Destructive', 'Alert', (h: HtmlBuilder<Msg>) =>
        alertPreview('destructive', false, false, h),
      ),
      staticExample('Action', 'Alert', (h: HtmlBuilder<Msg>) =>
        alertPreview('default', true, undefined, h),
      ),
      staticExample('Custom Colors', 'Alert', (h: HtmlBuilder<Msg>) =>
        alertPreview('default', false, true, h),
      ),
      staticExample('RTL', 'Alert', (h: HtmlBuilder<Msg>) =>
        h.div([h.Dir('rtl')], [alertPreview('default', false, false, h)]),
      ),
    ],
  },
  'alert-dialog': {
    description:
      'A modal dialog that interrupts the user with important content and expects a response.',
    composition:
      'AlertDialog\nâ”œâ”€â”€ Trigger\nâ”œâ”€â”€ Content\nâ”‚   â”œâ”€â”€ Header / Media / Title / Description\nâ”‚   â””â”€â”€ Footer / Cancel / Action',
    examples: [
      basic('alert-dialog', 'AlertDialog'),
      statefulExample('Small', 'AlertDialog', (model, h: HtmlBuilder<Msg>) =>
        alertDialogPreview(model, { size: 'sm' }, h),
      ),
      statefulExample('Media', 'AlertDialog', (model, h: HtmlBuilder<Msg>) =>
        alertDialogPreview(model, { media: true }, h),
      ),
      statefulExample(
        'Small with Media',
        'AlertDialog',
        (model, h: HtmlBuilder<Msg>) =>
          alertDialogPreview(model, { size: 'sm', media: true }, h),
      ),
      statefulExample(
        'Destructive',
        'AlertDialog',
        (model, h: HtmlBuilder<Msg>) =>
          alertDialogPreview(model, { destructive: true }, h),
      ),
      statefulExample('RTL', 'AlertDialog', (model, h: HtmlBuilder<Msg>) =>
        alertDialogPreview(model, { rtl: true }, h),
      ),
    ],
  },
  'aspect-ratio': {
    description: 'Displays content within a desired ratio.',
    examples: [
      basic('aspect-ratio', 'AspectRatio'),
      staticExample('Square', 'AspectRatio', (h: HtmlBuilder<Msg>) =>
        aspectPreview(1, 'aspect-square', h),
      ),
      staticExample('Portrait', 'AspectRatio', (h: HtmlBuilder<Msg>) =>
        aspectPreview(3 / 4, 'max-w-xs', h),
      ),
      staticExample('RTL', 'AspectRatio', (h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl'), h.Class('w-full')],
          [aspectPreview(16 / 9, '', h)],
        ),
      ),
    ],
  },
  attachment: {
    description:
      'Displays a file or image attachment with media, metadata, upload state, and actions.',
    composition:
      'Attachment\nâ”œâ”€â”€ AttachmentMedia\nâ”œâ”€â”€ AttachmentContent\nâ”‚   â”œâ”€â”€ AttachmentTitle\nâ”‚   â””â”€â”€ AttachmentDescription\nâ””â”€â”€ AttachmentActions',
    examples: [
      basic('attachment', 'Attachment'),
      staticExample('Image', 'Attachment', (h: HtmlBuilder<Msg>) =>
        Attachment.attachment(
          {
            state: 'done',
            children: [
              Attachment.attachmentMedia(
                {
                  variant: 'image',
                  children: [
                    h.div(
                      [
                        h.Class(
                          'size-full bg-gradient-to-br from-cyan-300 to-blue-500',
                        ),
                      ],
                      [],
                    ),
                  ],
                },
                h,
              ),
              Attachment.attachmentContent(
                {
                  children: [
                    Attachment.attachmentTitle(
                      { children: ['mountains.jpg'] },
                      h,
                    ),
                    Attachment.attachmentDescription(
                      { children: ['1.8 MB Â· Image'] },
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
      ),
      staticExample('States', 'Attachment', (h: HtmlBuilder<Msg>) =>
        stack(
          ['uploading', 'processing', 'error', 'done'].map((state) =>
            attachmentPreview(
              state as Attachment.AttachmentState,
              undefined,
              h,
            ),
          ),
          '',
          h,
        ),
      ),
      staticExample('Sizes', 'Attachment', (h: HtmlBuilder<Msg>) =>
        stack(
          [
            attachmentPreview('done', 'sm', h),
            attachmentPreview('done', undefined, h),
          ],
          '',
          h,
        ),
      ),
      staticExample('Group', 'Attachment', (h: HtmlBuilder<Msg>) =>
        Attachment.attachmentGroup(
          {
            children: [
              attachmentPreview('done', 'default', h),
              attachmentPreview('processing', undefined, h),
              attachmentPreview('error', undefined, h),
            ],
          },
          h,
        ),
      ),
      staticExample('Trigger', 'Attachment', (h: HtmlBuilder<Msg>) =>
        Attachment.attachmentTrigger(
          { label: 'Add attachment', onClick: clicked },
          h,
        ),
      ),
    ],
  },
  avatar: {
    description: 'An image element with a fallback for representing the user.',
    composition: 'Avatar\nâ”œâ”€â”€ AvatarImage\nâ””â”€â”€ AvatarFallback',
    examples: [
      basic('avatar', 'Avatar'),
      staticExample('Badge', 'Avatar', (h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Class('relative')],
          [
            avatar('CN', 'lg', h),
            Badge.badge(
              { class: 'absolute -right-3 -bottom-2 px-1', children: ['New'] },
              h,
            ),
          ],
        ),
      ),
      staticExample('Badge with Icon', 'Avatar', (h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Class('relative')],
          [
            avatar('CN', 'lg', h),
            Badge.badge(
              {
                class: 'absolute -right-1 -bottom-1 size-4 rounded-full p-0',
                children: ['âœ“'],
              },
              h,
            ),
          ],
        ),
      ),
      staticExample('Avatar Group', 'Avatar', (h: HtmlBuilder<Msg>) =>
        row(
          [
            avatar('CN', undefined, h),
            avatar('VC', undefined, h),
            avatar('CN', undefined, h),
          ],
          '-space-x-5 gap-0',
          h,
        ),
      ),
      staticExample('Avatar Group Count', 'Avatar', (h: HtmlBuilder<Msg>) =>
        row(
          [
            avatar('CN', undefined, h),
            avatar('VC', undefined, h),
            Avatar.avatar(
              { children: [Avatar.avatarFallback({ children: ['+3'] }, h)] },
              h,
            ),
          ],
          '-space-x-5 gap-0',
          h,
        ),
      ),
      staticExample('Avatar Group with Icon', 'Avatar', (h: HtmlBuilder<Msg>) =>
        row(
          [
            avatar('CN', undefined, h),
            avatar('VC', undefined, h),
            Avatar.avatar(
              { children: [Avatar.avatarFallback({ children: ['â€¦'] }, h)] },
              h,
            ),
          ],
          '-space-x-5 gap-0',
          h,
        ),
      ),
      staticExample('Sizes', 'Avatar', (h: HtmlBuilder<Msg>) =>
        row(
          [
            avatar('CN', 'sm', h),
            avatar('CN', undefined, h),
            avatar('CN', 'lg', h),
          ],
          '',
          h,
        ),
      ),
      statefulExample('Dropdown', 'Avatar', (model, h: HtmlBuilder<Msg>) =>
        DropdownMenu.dropdownMenu(
          {
            model: model.dropdownMenu,
            toParentMessage: (message) =>
              State.GotDropdownMenuMessage({ message }),
            trigger: avatar('CN', 'lg', h),
            triggerClass: 'rounded-full',
            items: ['profile', 'billing', 'logout'],
            itemToConfig: (item) => ({
              label: item[0]?.toUpperCase() + item.slice(1),
              separatorBefore: item === 'logout',
            }),
          },
          h,
        ),
      ),
      staticExample('RTL', 'Avatar', (h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl')],
          [
            row(
              [avatar('CN', undefined, h), avatar('VC', undefined, h)],
              '',
              h,
            ),
          ],
        ),
      ),
    ],
  },
  badge: {
    description: 'Displays a badge or a component that looks like a badge.',
    examples: [
      basic('badge', 'Badge'),
      staticExample('Variants', 'Badge', (h: HtmlBuilder<Msg>) =>
        row(
          [
            Badge.badge({ children: ['Default'] }, h),
            Badge.badge({ variant: 'secondary', children: ['Secondary'] }, h),
            Badge.badge({ variant: 'outline', children: ['Outline'] }, h),
            Badge.badge(
              { variant: 'destructive', children: ['Destructive'] },
              h,
            ),
          ],
          '',
          h,
        ),
      ),
      staticExample('With Icon', 'Badge', (h: HtmlBuilder<Msg>) =>
        Badge.badge({ children: ['âœ“', 'Verified'] }, h),
      ),
      staticExample('With Spinner', 'Badge', (h: HtmlBuilder<Msg>) =>
        Badge.badge(
          {
            variant: 'secondary',
            children: [Spinner.spinner({ class: 'size-3' }, h), 'Syncing'],
          },
          h,
        ),
      ),
      staticExample('Link', 'Badge', (h: HtmlBuilder<Msg>) =>
        Badge.badge(
          { variant: 'outline', children: ['View documentation', 'â†—'] },
          h,
        ),
      ),
      staticExample('Custom Colors', 'Badge', (h: HtmlBuilder<Msg>) =>
        row(
          [
            Badge.badge(
              {
                class: 'border-transparent bg-blue-500 text-white',
                children: ['Blue'],
              },
              h,
            ),
            Badge.badge(
              {
                class: 'border-transparent bg-emerald-500 text-white',
                children: ['Green'],
              },
              h,
            ),
          ],
          '',
          h,
        ),
      ),
      staticExample('RTL', 'Badge', (h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl')],
          [Badge.badge({ children: ['ØªÙ… Ø§Ù„ØªØ­Ù‚Ù‚', 'âœ“'] }, h)],
        ),
      ),
    ],
  },
  breadcrumb: {
    description:
      'Displays the path to the current resource using a hierarchy of links.',
    composition:
      'Breadcrumb\nâ””â”€â”€ BreadcrumbList\n    â”œâ”€â”€ BreadcrumbItem / BreadcrumbLink / BreadcrumbPage\n    â”œâ”€â”€ BreadcrumbSeparator\n    â””â”€â”€ BreadcrumbEllipsis',
    examples: [
      basic('breadcrumb', 'Breadcrumb'),
      staticExample('Custom separator', 'Breadcrumb', (h: HtmlBuilder<Msg>) =>
        breadcrumbPreview('â€º', undefined, h),
      ),
      statefulExample('Dropdown', 'Breadcrumb', (model, h: HtmlBuilder<Msg>) =>
        row(
          [
            breadcrumbPreview('/', false, h),
            DropdownMenu.dropdownMenu(
              {
                model: model.dropdownMenu,
                toParentMessage: (message) =>
                  State.GotDropdownMenuMessage({ message }),
                trigger: 'More',
                triggerClass: 'rounded-md border px-2 py-1 text-sm',
                items: ['documentation', 'themes', 'github'],
                itemToConfig: (item) => ({
                  label: item[0]?.toUpperCase() + item.slice(1),
                }),
              },
              h,
            ),
          ],
          '',
          h,
        ),
      ),
      staticExample('Collapsed', 'Breadcrumb', (h: HtmlBuilder<Msg>) =>
        breadcrumbPreview('/', true, h),
      ),
      staticExample('Link component', 'Breadcrumb', (h: HtmlBuilder<Msg>) =>
        breadcrumbPreview('â†’', undefined, h),
      ),
      staticExample('RTL', 'Breadcrumb', (h: HtmlBuilder<Msg>) =>
        h.div([h.Dir('rtl')], [breadcrumbPreview('â€¹', undefined, h)]),
      ),
    ],
  },
  button: {
    description: 'Displays a button or a component that looks like a button.',
    examples: [
      basic('button', 'Button'),
      staticExample('Size', 'Button', (h: HtmlBuilder<Msg>) =>
        row(
          [
            Button.button(
              { size: 'sm', onClick: clicked, children: ['Small'] },
              h,
            ),
            Button.button({ onClick: clicked, children: ['Default'] }, h),
            Button.button(
              { size: 'lg', onClick: clicked, children: ['Large'] },
              h,
            ),
          ],
          '',
          h,
        ),
      ),
      staticExample('Default', 'Button', (h: HtmlBuilder<Msg>) =>
        buttonPreview('default', 'Button', '', h),
      ),
      staticExample('Outline', 'Button', (h: HtmlBuilder<Msg>) =>
        buttonPreview('outline', 'Outline', '', h),
      ),
      staticExample('Secondary', 'Button', (h: HtmlBuilder<Msg>) =>
        buttonPreview('secondary', 'Secondary', '', h),
      ),
      staticExample('Ghost', 'Button', (h: HtmlBuilder<Msg>) =>
        buttonPreview('ghost', 'Ghost', '', h),
      ),
      staticExample('Destructive', 'Button', (h: HtmlBuilder<Msg>) =>
        buttonPreview('destructive', 'Delete', '', h),
      ),
      staticExample('Link', 'Button', (h: HtmlBuilder<Msg>) =>
        buttonPreview('link', 'Learn more', '', h),
      ),
      staticExample('Icon', 'Button', (h: HtmlBuilder<Msg>) =>
        Button.button({ size: 'icon', onClick: clicked, children: ['ï¼‹'] }, h),
      ),
      staticExample('With Icon', 'Button', (h: HtmlBuilder<Msg>) =>
        Button.button(
          { onClick: clicked, children: ['âœ‰', 'Login with Email'] },
          h,
        ),
      ),
      staticExample('Rounded', 'Button', (h: HtmlBuilder<Msg>) =>
        buttonPreview('default', 'Rounded', 'rounded-full', h),
      ),
      staticExample('Spinner', 'Button', (h: HtmlBuilder<Msg>) =>
        Button.button(
          {
            isDisabled: true,
            children: [Spinner.spinner({ class: 'size-4' }, h), 'Please wait'],
          },
          h,
        ),
      ),
      staticExample('Button Group', 'Button', (h: HtmlBuilder<Msg>) =>
        ButtonGroup.buttonGroup(
          {
            children: [
              buttonPreview('outline', 'Back', '', h),
              buttonPreview('outline', 'Next', '', h),
            ],
          },
          h,
        ),
      ),
      staticExample('As Link', 'Button', (h: HtmlBuilder<Msg>) =>
        buttonPreview('link', 'Open documentation â†—', '', h),
      ),
      staticExample('RTL', 'Button', (h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl')],
          [
            Button.button(
              { onClick: clicked, children: ['Ø§Ù„ØªØ§Ù„ÙŠ', 'â†'] },
              h,
            ),
          ],
        ),
      ),
    ],
  },
  'button-group': {
    description:
      'A container that groups related buttons together with consistent styling.',
    composition:
      'ButtonGroup\nâ”œâ”€â”€ Button / Input / Select\nâ”œâ”€â”€ ButtonGroupSeparator\nâ””â”€â”€ ButtonGroupText',
    examples: [
      basic('button-group', 'ButtonGroup'),
      staticExample('Orientation', 'ButtonGroup', (h: HtmlBuilder<Msg>) =>
        row(
          [
            ButtonGroup.buttonGroup(
              {
                children: [
                  buttonPreview('outline', 'Left', '', h),
                  buttonPreview('outline', 'Center', '', h),
                  buttonPreview('outline', 'Right', '', h),
                ],
              },
              h,
            ),
            ButtonGroup.buttonGroup(
              {
                orientation: 'vertical',
                children: [
                  buttonPreview('outline', 'Top', '', h),
                  buttonPreview('outline', 'Middle', '', h),
                  buttonPreview('outline', 'Bottom', '', h),
                ],
              },
              h,
            ),
          ],
          '',
          h,
        ),
      ),
      staticExample('Size', 'ButtonGroup', (h: HtmlBuilder<Msg>) =>
        stack(
          [
            ButtonGroup.buttonGroup(
              {
                children: [
                  Button.button(
                    {
                      size: 'sm',
                      variant: 'outline',
                      onClick: clicked,
                      children: ['One'],
                    },
                    h,
                  ),
                  Button.button(
                    {
                      size: 'sm',
                      variant: 'outline',
                      onClick: clicked,
                      children: ['Two'],
                    },
                    h,
                  ),
                ],
              },
              h,
            ),
            ButtonGroup.buttonGroup(
              {
                children: [
                  buttonPreview('outline', 'One', '', h),
                  buttonPreview('outline', 'Two', '', h),
                ],
              },
              h,
            ),
          ],
          '',
          h,
        ),
      ),
      staticExample('Nested', 'ButtonGroup', (h: HtmlBuilder<Msg>) =>
        ButtonGroup.buttonGroup(
          {
            children: [
              buttonPreview('outline', 'Save', '', h),
              ButtonGroup.buttonGroup(
                {
                  children: [
                    buttonPreview('outline', 'Undo', '', h),
                    buttonPreview('outline', 'Redo', '', h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ),
      staticExample('Separator', 'ButtonGroup', (h: HtmlBuilder<Msg>) =>
        ButtonGroup.buttonGroup(
          {
            children: [
              buttonPreview('outline', 'Copy', '', h),
              ButtonGroup.buttonGroupSeparator({}, h),
              buttonPreview('outline', 'Paste', '', h),
            ],
          },
          h,
        ),
      ),
      staticExample('Split', 'ButtonGroup', (h: HtmlBuilder<Msg>) =>
        ButtonGroup.buttonGroup(
          {
            children: [
              buttonPreview('default', 'Create', '', h),
              Button.button({ onClick: clicked, children: ['âŒ„'] }, h),
            ],
          },
          h,
        ),
      ),
      statefulExample('Input', 'ButtonGroup', (model, h: HtmlBuilder<Msg>) =>
        ButtonGroup.buttonGroup(
          {
            class: 'w-full max-w-sm',
            children: [
              ButtonGroup.buttonGroupText({ children: ['@'] }, h),
              Input.input(
                {
                  id: 'button-group-input',
                  value: model.inputGroup,
                  onInput: (value) =>
                    State.ChangedText({ target: 'inputGroup', value }),
                  placeholder: 'username',
                },
                h,
              ),
            ],
          },
          h,
        ),
      ),
      statefulExample(
        'Input Group',
        'ButtonGroup',
        (model, h: HtmlBuilder<Msg>) =>
          ButtonGroup.buttonGroup(
            {
              class: 'w-full max-w-sm',
              children: [
                InputGroup.inputGroup(
                  {
                    children: [
                      InputGroup.inputGroupAddon(
                        {
                          children: [
                            InputGroup.inputGroupText(
                              { children: ['https://'] },
                              h,
                            ),
                          ],
                        },
                        h,
                      ),
                      InputGroup.inputGroupInput(
                        {
                          id: 'button-group-url',
                          value: model.inputGroup,
                          onInput: (value) =>
                            State.ChangedText({ target: 'inputGroup', value }),
                          placeholder: 'example.com',
                        },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                Button.button({ onClick: clicked, children: ['Go'] }, h),
              ],
            },
            h,
          ),
      ),
      statefulExample(
        'Dropdown Menu',
        'ButtonGroup',
        (model, h: HtmlBuilder<Msg>) =>
          ButtonGroup.buttonGroup(
            {
              children: [
                buttonPreview('outline', 'Save', '', h),
                DropdownMenu.dropdownMenu(
                  {
                    model: model.dropdownMenu,
                    toParentMessage: (message) =>
                      State.GotDropdownMenuMessage({ message }),
                    trigger: 'âŒ„',
                    triggerClass: 'rounded-md border px-3',
                    items: ['save-as', 'export'],
                    itemToConfig: (item) => ({
                      label: item === 'save-as' ? 'Save asâ€¦' : 'Export',
                    }),
                  },
                  h,
                ),
              ],
            },
            h,
          ),
      ),
      statefulExample('Select', 'ButtonGroup', (model, h: HtmlBuilder<Msg>) =>
        ButtonGroup.buttonGroup(
          {
            children: [
              ButtonGroup.buttonGroupText({ children: ['Framework'] }, h),
              Select.select(
                {
                  model: model.select,
                  maybeSelectedValue: model.selectedSelectValue,
                  toParentMessage: (message) =>
                    State.GotSelectMessage({ message }),
                  items: [
                    { value: 'apple', label: 'Next.js' },
                    { value: 'banana', label: 'SvelteKit' },
                  ],
                  itemToValue: (item) => item.value,
                  itemToLabel: (item) => item.label,
                },
                h,
              ),
            ],
          },
          h,
        ),
      ),
      statefulExample('Popover', 'ButtonGroup', (model, h: HtmlBuilder<Msg>) =>
        ButtonGroup.buttonGroup(
          {
            children: [
              buttonPreview('outline', 'Share', '', h),
              Popover.popover(
                {
                  model: model.popover,
                  toParentMessage: (message) =>
                    State.GotPopoverMessage({ message }),
                  trigger: 'Options',
                  triggerClass: 'rounded-md border px-3 text-sm',
                  content: 'Anyone with the link can view.',
                },
                h,
              ),
            ],
          },
          h,
        ),
      ),
      staticExample('RTL', 'ButtonGroup', (h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl')],
          [
            ButtonGroup.buttonGroup(
              {
                children: [
                  buttonPreview('outline', 'Ø§Ù„Ø³Ø§Ø¨Ù‚', '', h),
                  buttonPreview('outline', 'Ø§Ù„ØªØ§Ù„ÙŠ', '', h),
                ],
              },
              h,
            ),
          ],
        ),
      ),
    ],
  },
  bubble: {
    description:
      'Displays conversational content in a message bubble. Supports variants, alignment, grouping, reactions, and collapsible content.',
    composition:
      'BubbleGroup\nâ””â”€â”€ Bubble\n    â”œâ”€â”€ BubbleContent\n    â””â”€â”€ BubbleReactions',
    examples: [
      basic('bubble', 'Bubble'),
      staticExample('Variants', 'Bubble', (h: HtmlBuilder<Msg>) =>
        stack(
          [
            bubblePreview(
              'default',
              'start',
              'Hey! How can I help you today?',
              h,
            ),
            bubblePreview(
              'tinted',
              'start',
              'Hey! How can I help you today?',
              h,
            ),
            bubblePreview(
              'outline',
              'start',
              'Hey! How can I help you today?',
              h,
            ),
          ],
          '',
          h,
        ),
      ),
      staticExample('Alignment', 'Bubble', (h: HtmlBuilder<Msg>) =>
        Bubble.bubbleGroup(
          {
            children: [
              bubblePreview('default', 'start', '', h),
              bubblePreview('tinted', 'end', 'Show me how it works.', h),
            ],
          },
          h,
        ),
      ),
      staticExample('Bubble Group', 'Bubble', (h: HtmlBuilder<Msg>) =>
        Bubble.bubbleGroup(
          {
            children: [
              bubblePreview('default', 'start', 'First message', h),
              bubblePreview('default', 'start', 'A related follow-up', h),
              bubblePreview('tinted', 'end', 'Thanks!', h),
            ],
          },
          h,
        ),
      ),
      staticExample('Links and Buttons', 'Bubble', (h: HtmlBuilder<Msg>) =>
        Bubble.bubble(
          {
            children: [
              Bubble.bubbleContent(
                {
                  children: [
                    'Read the guide ',
                    Button.button(
                      {
                        variant: 'link',
                        size: 'sm',
                        onClick: clicked,
                        children: ['Documentation'],
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
      ),
      staticExample('Reactions', 'Bubble', (h: HtmlBuilder<Msg>) =>
        Bubble.bubble(
          {
            children: [
              Bubble.bubbleContent({ children: ['Was this helpful?'] }, h),
              Bubble.bubbleReactions(
                {
                  children: [
                    Button.button(
                      {
                        variant: 'outline',
                        size: 'sm',
                        onClick: clicked,
                        children: ['ðŸ‘ 12'],
                      },
                      h,
                    ),
                    Button.button(
                      {
                        variant: 'outline',
                        size: 'sm',
                        onClick: clicked,
                        children: ['ðŸ‘Ž'],
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
      ),
      statefulExample(
        'Show More / Collapsible',
        'Bubble',
        (model, h: HtmlBuilder<Msg>) =>
          Bubble.bubble(
            {
              children: [
                Bubble.bubbleContent(
                  {
                    children: [
                      Collapsible.collapsible(
                        {
                          id: 'docs-bubble-collapsible',
                          isOpen: model.isCollapsibleOpen,
                          onToggle: (isOpen) =>
                            State.ToggledCollapsible({ isOpen }),
                          trigger: 'Show more',
                          triggerClass:
                            'font-medium underline underline-offset-4',
                          content:
                            'Here is the rest of this longer conversational response.',
                          contentClass: 'mt-2',
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
      ),
      statefulExample('Tooltip', 'Bubble', (model, h: HtmlBuilder<Msg>) =>
        Bubble.bubble(
          {
            children: [
              Bubble.bubbleContent(
                { children: ['Hover over the reaction.'] },
                h,
              ),
              Bubble.bubbleReactions(
                {
                  children: [
                    Tooltip.tooltip(
                      {
                        model: model.tooltip,
                        toParentMessage: (message) =>
                          State.GotTooltipMessage({ message }),
                        trigger: 'ðŸ‘',
                        triggerClass: 'rounded-md border px-2 py-1',
                        content: 'Helpful',
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
      ),
      statefulExample('Popover', 'Bubble', (model, h: HtmlBuilder<Msg>) =>
        Bubble.bubble(
          {
            children: [
              Bubble.bubbleContent({ children: ['Open message actions.'] }, h),
              Bubble.bubbleReactions(
                {
                  children: [
                    Popover.popover(
                      {
                        model: model.popover,
                        toParentMessage: (message) =>
                          State.GotPopoverMessage({ message }),
                        trigger: 'â€¢â€¢â€¢',
                        triggerClass: 'rounded-md border px-2 py-1',
                        content: 'Copy Â· Reply Â· Delete',
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
      ),
    ],
  },
  carousel: {
    description: 'A carousel with motion and swipe built using Embla.',
    composition:
      'Carousel\nâ”œâ”€â”€ CarouselContent\nâ”‚   â””â”€â”€ CarouselItem\nâ”œâ”€â”€ CarouselPrevious\nâ””â”€â”€ CarouselNext',
    examples: [
      basic('carousel', 'Carousel'),
      statefulExample('Sizes', 'Carousel', (model, h: HtmlBuilder<Msg>) =>
        carouselPreview(model, { compact: true }, h),
      ),
      statefulExample('Spacing', 'Carousel', (model, h: HtmlBuilder<Msg>) =>
        carouselPreview(model, { spacing: true }, h),
      ),
      statefulExample('Orientation', 'Carousel', (model, h: HtmlBuilder<Msg>) =>
        carouselPreview(model, { orientation: 'vertical' }, h),
      ),
      statefulExample('API', 'Carousel', (model, h: HtmlBuilder<Msg>) =>
        stack(
          [
            carouselPreview(model, {}, h),
            h.p(
              [h.Class('text-center text-sm text-muted-foreground')],
              [`Slide ${model.carousel.index + 1} of ${model.carousel.count}`],
            ),
          ],
          '',
          h,
        ),
      ),
      statefulExample(
        'Plugins',
        'Carousel',
        (model, h: HtmlBuilder<Msg>) => carouselPreview(model, {}, h),
        'Use the same Foldkit messages to compose autoplay or other application-level behavior.',
      ),
      statefulExample('RTL', 'Carousel', (model, h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl'), h.Class('w-full')],
          [carouselPreview(model, {}, h)],
        ),
      ),
    ],
  },
  card: {
    description: 'Displays a card with header, content, and footer.',
    composition:
      'Card\nâ”œâ”€â”€ CardHeader\nâ”‚   â”œâ”€â”€ CardTitle\nâ”‚   â”œâ”€â”€ CardDescription\nâ”‚   â””â”€â”€ CardAction\nâ”œâ”€â”€ CardContent\nâ””â”€â”€ CardFooter',
    examples: [
      basic('card', 'Card'),
      staticExample('Size', 'Card', (h: HtmlBuilder<Msg>) =>
        cardPreview({ small: true }, h),
      ),
      statefulExample('Spacing', 'Card', (model, h: HtmlBuilder<Msg>) =>
        Card.card(
          {
            class: 'w-full max-w-sm gap-8 py-8',
            children: [
              Card.cardHeader(
                {
                  class: 'px-8',
                  children: [
                    Card.cardTitle({ children: ['Sign in'] }, h),
                    Card.cardDescription(
                      {
                        children: [
                          'Use custom spacing without changing the composition.',
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Card.cardContent(
                {
                  class: 'px-8',
                  children: [
                    Input.input(
                      {
                        id: 'card-spacing-email',
                        value: model.cardEmail,
                        onInput: (value) =>
                          State.ChangedText({ target: 'cardEmail', value }),
                        placeholder: 'm@example.com',
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Card.cardFooter(
                {
                  class: 'px-8',
                  children: [
                    Button.button(
                      {
                        class: 'w-full',
                        onClick: clicked,
                        children: ['Continue'],
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
      ),
      staticExample('Edge to Edge', 'Card', (h: HtmlBuilder<Msg>) =>
        cardPreview({ edge: true }, h),
      ),
      staticExample('Image', 'Card', (h: HtmlBuilder<Msg>) =>
        cardPreview({ image: true }, h),
      ),
      staticExample('RTL', 'Card', (h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl'), h.Class('w-full')],
          [cardPreview({ rtl: true }, h)],
        ),
      ),
    ],
  },
  chart: {
    description:
      'Beautiful charts. Built using Recharts. Copy and paste into your apps.',
    examples: [
      basic('chart', 'Chart'),
      staticExample('Your First Chart', 'Chart', (h: HtmlBuilder<Msg>) =>
        Chart.barChart(
          {
            data: [
              { label: 'Jan', value: 186 },
              { label: 'Feb', value: 305 },
              { label: 'Mar', value: 237 },
            ],
          },
          h,
        ),
      ),
      staticExample('Add a Grid', 'Chart', (h: HtmlBuilder<Msg>) =>
        Chart.barChart(
          {
            class: 'rounded-lg border bg-card p-4',
            data: [
              { label: 'Jan', value: 186 },
              { label: 'Feb', value: 305 },
              { label: 'Mar', value: 237 },
            ],
          },
          h,
        ),
      ),
      staticExample('Add an Axis', 'Chart', (h: HtmlBuilder<Msg>) =>
        Chart.areaChart({ data: [86, 205, 137, 173] }, h),
      ),
      staticExample('Add Tooltip', 'Chart', (h: HtmlBuilder<Msg>) =>
        Chart.areaChart(
          { class: 'rounded-lg border p-4', data: [120, 210, 160] },
          h,
        ),
      ),
      staticExample('Add Legend', 'Chart', (h: HtmlBuilder<Msg>) =>
        stack(
          [
            Chart.barChart(
              {
                data: [
                  { label: 'Desktop', value: 275 },
                  { label: 'Mobile', value: 200 },
                ],
              },
              h,
            ),
            row(
              [
                Badge.badge({ children: ['Desktop'] }, h),
                Badge.badge({ variant: 'secondary', children: ['Mobile'] }, h),
              ],
              '',
              h,
            ),
          ],
          '',
          h,
        ),
      ),
      staticExample('Tooltip', 'Chart', (h: HtmlBuilder<Msg>) =>
        Chart.areaChart({ data: [186, 305, 237] }, h),
      ),
      staticExample('RTL', 'Chart', (h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl'), h.Class('w-full')],
          [
            Chart.barChart(
              {
                data: [
                  { label: 'ÙŠÙ†Ø§ÙŠØ±', value: 186 },
                  { label: 'ÙØ¨Ø±Ø§ÙŠØ±', value: 305 },
                  { label: 'Ù…Ø§Ø±Ø³', value: 237 },
                ],
              },
              h,
            ),
          ],
        ),
      ),
    ],
  },
  checkbox: {
    description:
      'A control that allows the user to toggle between checked and not checked.',
    examples: [
      basic('checkbox', 'Checkbox'),
      statefulExample(
        'Invalid State',
        'Checkbox',
        (model, h: HtmlBuilder<Msg>) =>
          checkboxPreview(
            model,
            { invalid: true, label: 'Accept the terms to continue' },
            h,
          ),
      ),
      statefulExample('Description', 'Checkbox', (model, h: HtmlBuilder<Msg>) =>
        checkboxPreview(model, { description: true }, h),
      ),
      statefulExample('Disabled', 'Checkbox', (model, h: HtmlBuilder<Msg>) =>
        checkboxPreview(
          model,
          { disabled: true, label: 'Enable notifications' },
          h,
        ),
      ),
      statefulExample('Group', 'Checkbox', (model, h: HtmlBuilder<Msg>) =>
        stack(
          [
            checkboxPreview(model, { label: 'Email', instance: 'email' }, h),
            checkboxPreview(model, { label: 'SMS', instance: 'sms' }, h),
            checkboxPreview(
              model,
              { label: 'Push notifications', instance: 'push' },
              h,
            ),
          ],
          '',
          h,
        ),
      ),
      statefulExample('Table', 'Checkbox', (model, h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Class('w-full max-w-md overflow-hidden rounded-md border')],
          [
            h.div(
              [
                h.Class(
                  'grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b p-3 font-medium',
                ),
              ],
              [
                checkboxPreview(
                  model,
                  { label: 'Select all', instance: 'all' },
                  h,
                ),
                'Status',
              ],
            ),
            h.div(
              [h.Class('grid grid-cols-[auto_1fr] items-center gap-4 p-3')],
              [
                checkboxPreview(
                  model,
                  { label: 'Invoice #001', instance: 'invoice' },
                  h,
                ),
                Badge.badge({ children: ['Paid'] }, h),
              ],
            ),
          ],
        ),
      ),
      statefulExample('RTL', 'Checkbox', (model, h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl')],
          [
            checkboxPreview(
              model,
              {
                description: true,
                label: 'Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…',
              },
              h,
            ),
          ],
        ),
      ),
    ],
  },
  collapsible: {
    description: 'An interactive component which expands/collapses a panel.',
    composition:
      'Collapsible\nâ”œâ”€â”€ CollapsibleTrigger\nâ””â”€â”€ CollapsibleContent',
    examples: [
      basic('collapsible', 'Collapsible'),
      statefulExample(
        'Settings Panel',
        'Collapsible',
        (model, h: HtmlBuilder<Msg>) =>
          collapsiblePreview(model, 'settings', h),
      ),
      statefulExample(
        'File Tree',
        'Collapsible',
        (model, h: HtmlBuilder<Msg>) => collapsiblePreview(model, 'tree', h),
      ),
      statefulExample('RTL', 'Collapsible', (model, h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl'), h.Class('w-full')],
          [collapsiblePreview(model, undefined, h)],
        ),
      ),
    ],
  },
  combobox: {
    description: 'Autocomplete input with a list of suggestions.',
    composition:
      'Combobox\nâ”œâ”€â”€ ComboboxInput / Trigger\nâ”œâ”€â”€ ComboboxContent\nâ””â”€â”€ ComboboxItem / Group',
    examples: [
      basic('combobox', 'Combobox'),
      statefulExample(
        'Multiple',
        'Combobox',
        (model, h: HtmlBuilder<Msg>) =>
          stack(
            [
              comboboxPreview(model, {}, h),
              row(
                [
                  Badge.badge({ children: ['Next.js'] }, h),
                  Badge.badge(
                    { variant: 'secondary', children: ['SvelteKit'] },
                    h,
                  ),
                ],
                '',
                h,
              ),
            ],
            '',
            h,
          ),
        'Selected values are represented as removable badges while the combobox remains searchable.',
      ),
      statefulExample(
        'Clear Button',
        'Combobox',
        (model, h: HtmlBuilder<Msg>) =>
          row(
            [
              comboboxPreview(model, { clear: true }, h),
              Button.button(
                {
                  variant: 'ghost',
                  size: 'sm',
                  onClick: clicked,
                  children: ['Clear'],
                },
                h,
              ),
            ],
            '',
            h,
          ),
      ),
      statefulExample('Groups', 'Combobox', (model, h: HtmlBuilder<Msg>) =>
        comboboxPreview(model, { groups: true }, h),
      ),
      statefulExample(
        'Custom Items',
        'Combobox',
        (model, h: HtmlBuilder<Msg>) =>
          comboboxPreview(model, { groups: true }, h),
      ),
      statefulExample('Invalid', 'Combobox', (model, h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Class('w-full max-w-sm rounded-md ring-2 ring-destructive/30')],
          [comboboxPreview(model, {}, h)],
        ),
      ),
      statefulExample('Disabled', 'Combobox', (model, h: HtmlBuilder<Msg>) =>
        comboboxPreview(model, { disabled: true }, h),
      ),
      statefulExample(
        'Auto Highlight',
        'Combobox',
        (model, h: HtmlBuilder<Msg>) => comboboxPreview(model, {}, h),
      ),
      statefulExample('Popup', 'Combobox', (model, h: HtmlBuilder<Msg>) =>
        comboboxPreview(model, { popup: true }, h),
      ),
      statefulExample('Input Group', 'Combobox', (model, h: HtmlBuilder<Msg>) =>
        InputGroup.inputGroup(
          {
            class: 'w-full max-w-sm',
            children: [
              InputGroup.inputGroupAddon(
                {
                  children: [
                    InputGroup.inputGroupText({ children: ['âŒ•'] }, h),
                  ],
                },
                h,
              ),
              comboboxPreview(model, {}, h),
            ],
          },
          h,
        ),
      ),
      statefulExample('RTL', 'Combobox', (model, h: HtmlBuilder<Msg>) =>
        h.div(
          [h.Dir('rtl'), h.Class('w-full')],
          [comboboxPreview(model, { groups: true }, h)],
        ),
      ),
    ],
  },
  command: {
    description: 'Command menu for search and quick actions.',
    composition:
      'Command\nâ”œâ”€â”€ CommandInput\nâ”œâ”€â”€ CommandList / Empty / Group / Separator\nâ””â”€â”€ CommandItem / Shortcut',
    examples: [
      basic('command', 'Command'),
      statefulExample('Shortcuts', 'Command', (model, h: HtmlBuilder<Msg>) =>
        commandPreview(model, { shortcuts: true }, h),
      ),
      statefulExample('Groups', 'Command', (model, h: HtmlBuilder<Msg>) =>
        commandPreview(model, { groups: true }, h),
      ),
      statefulExample('Scrollable', 'Command', (model, h: HtmlBuilder<Msg>) =>
        commandPreview(model, { scrollable: true, groups: true }, h),
      ),
      statefulExample('RTL', 'Command', (model, h: HtmlBuilder<Msg>) =>
        commandPreview(model, { rtl: true, shortcuts: true }, h),
      ),
    ],
  },
};
