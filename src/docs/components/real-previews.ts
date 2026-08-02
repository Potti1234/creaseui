import { Option } from 'effect';
import { type Html, type HtmlBuilder } from 'foldkit/html';

import * as State from '@/docs/components/catalog-state';

import * as Alert from '@/ui/alert';
import * as AlertDialog from '@/ui/alert-dialog';
import * as Attachment from '@/ui/attachment';
import * as Avatar from '@/ui/avatar';
import * as AspectRatio from '@/ui/aspect-ratio';
import * as Badge from '@/ui/badge';
import * as Breadcrumb from '@/ui/breadcrumb';
import * as Button from '@/ui/button';
import * as ButtonGroup from '@/ui/button-group';
import * as Bubble from '@/ui/bubble';
import * as Card from '@/ui/card';
import * as Carousel from '@/ui/carousel';
import * as Chart from '@/ui/chart';
import * as Checkbox from '@/ui/checkbox';
import * as Collapsible from '@/ui/collapsible';
import * as Combobox from '@/ui/combobox';
import * as CommandMenu from '@/ui/command';
import * as ContextMenu from '@/ui/context-menu';
import * as DataTable from '@/ui/data-table';
import * as DatePicker from '@/ui/date-picker';
import * as Dialog from '@/ui/dialog';
import * as Direction from '@/ui/direction';
import * as Drawer from '@/ui/drawer';
import * as DropdownMenu from '@/ui/dropdown-menu';
import * as Empty from '@/ui/empty';
import * as Field from '@/ui/field';
import * as Form from '@/ui/form';
import * as HoverCard from '@/ui/hover-card';
import * as Input from '@/ui/input';
import * as InputGroup from '@/ui/input-group';
import * as InputOtp from '@/ui/input-otp';
import * as Kbd from '@/ui/kbd';
import * as Label from '@/ui/label';
import * as Item from '@/ui/item';
import * as Marker from '@/ui/marker';
import * as MessageUi from '@/ui/message';
import * as MessageScroller from '@/ui/message-scroller';
import * as Menubar from '@/ui/menubar';
import * as NativeSelect from '@/ui/native-select';
import * as NavigationMenu from '@/ui/navigation-menu';
import * as Pagination from '@/ui/pagination';
import * as Progress from '@/ui/progress';
import * as Popover from '@/ui/popover';
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
import * as Typography from '@/ui/typography';
import * as Tooltip from '@/ui/tooltip';

type PreviewMessage = State.Message;
const interacted: PreviewMessage = State.ClickedPreviewAction();
const today = { year: 2026, month: 7, day: 28 };

const invoiceTable = (
  _model: State.Model,
  h: HtmlBuilder<PreviewMessage>,
): Html =>
  Table.table<PreviewMessage>(
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
                      { class: 'text-right', children: ['Total'] },
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
            children: [
              ['INV001', 'Paid', '$250.00'],
              ['INV002', 'Pending', '$150.00'],
              ['INV003', 'Unpaid', '$350.00'],
            ].map((row) =>
              Table.tableRow(
                {
                  children: row.map((cell, index) =>
                    Table.tableCell(
                      {
                        ...(index === 2 ? { class: 'text-right' } : {}),
                        children: [cell],
                      },
                      h,
                    ),
                  ),
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
  );

export const hasRealPreview = (slug: string): boolean => slug in previews;

export const realPreview = (
  slug: string,
  model: State.Model,
  h: HtmlBuilder<PreviewMessage>,
): Html => previews[slug]?.(model, h) ?? h.div([], []);

const previews: Readonly<
  Record<string, (model: State.Model, h: HtmlBuilder<PreviewMessage>) => Html>
> = {
  alert: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Alert.alert(
      {
        children: [
          Alert.alertTitle({ children: ['Heads up!'] }, h),
          Alert.alertDescription(
            { children: ['You can add components to your app using the CLI.'] },
            h,
          ),
        ],
      },
      h,
    ),
  attachment: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Attachment.attachment(
      {
        state: 'done',
        children: [
          Attachment.attachmentMedia({ variant: 'icon', children: ['PDF'] }, h),
          Attachment.attachmentContent(
            {
              children: [
                Attachment.attachmentTitle(
                  { children: ['project-brief.pdf'] },
                  h,
                ),
                Attachment.attachmentDescription(
                  { children: ['2.4 MB Â· Uploaded'] },
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
                    children: ['Remove'],
                    onClick: interacted,
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
  avatar: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Avatar.avatar(
      {
        size: 'lg',
        children: [
          Avatar.avatarImage(
            { src: 'https://github.com/shadcn.png', alt: '@shadcn' },
            h,
          ),
          Avatar.avatarFallback({ children: ['CN'] }, h),
        ],
      },
      h,
    ),
  'aspect-ratio': (_model, h: HtmlBuilder<PreviewMessage>) =>
    AspectRatio.aspectRatio(
      {
        ratio: 16 / 9,
        class: 'w-full max-w-md overflow-hidden rounded-lg bg-muted',
        children: [
          h.img([
            h.Src(
              'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80',
            ),
            h.Alt('Mountain landscape'),
            h.Class('size-full object-cover'),
          ]),
        ],
      },
      h,
    ),
  badge: (_model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [h.Class('flex flex-wrap gap-2')],
      [
        Badge.badge({ children: ['Badge'] }, h),
        Badge.badge({ variant: 'secondary', children: ['Secondary'] }, h),
        Badge.badge({ variant: 'outline', children: ['Outline'] }, h),
        Badge.badge({ variant: 'destructive', children: ['Destructive'] }, h),
      ],
    ),
  breadcrumb: (_model, h: HtmlBuilder<PreviewMessage>) =>
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
                Breadcrumb.breadcrumbSeparator({}, h),
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
                Breadcrumb.breadcrumbSeparator({}, h),
                Breadcrumb.breadcrumbItem(
                  {
                    children: [
                      Breadcrumb.breadcrumbPage(
                        { children: ['Breadcrumb'] },
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
  button: (_model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [h.Class('flex flex-wrap gap-3')],
      [
        Button.button({ children: ['Button'], onClick: interacted }, h),
        Button.button(
          {
            variant: 'secondary',
            children: ['Secondary'],
            onClick: interacted,
          },
          h,
        ),
        Button.button(
          { variant: 'outline', children: ['Outline'], onClick: interacted },
          h,
        ),
        Button.button(
          { variant: 'ghost', children: ['Ghost'], onClick: interacted },
          h,
        ),
      ],
    ),
  'button-group': (_model, h: HtmlBuilder<PreviewMessage>) =>
    ButtonGroup.buttonGroup(
      {
        children: [
          Button.button(
            { variant: 'outline', children: ['Previous'], onClick: interacted },
            h,
          ),
          Button.button(
            { variant: 'outline', children: ['Next'], onClick: interacted },
            h,
          ),
        ],
      },
      h,
    ),
  bubble: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Bubble.bubbleGroup(
      {
        class: 'w-full max-w-md',
        children: [
          Bubble.bubble(
            {
              align: 'start',
              children: [
                Bubble.bubbleContent(
                  { children: ['Hey! How can I help you today?'] },
                  h,
                ),
              ],
            },
            h,
          ),
          Bubble.bubble(
            {
              align: 'end',
              variant: 'tinted',
              children: [
                Bubble.bubbleContent(
                  { children: ['Show me how Crease UI works.'] },
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
  card: (model, h: HtmlBuilder<PreviewMessage>) =>
    Card.card(
      {
        class: 'w-full max-w-sm',
        children: [
          Card.cardHeader(
            {
              children: [
                Card.cardTitle({ children: ['Login to your account'] }, h),
                Card.cardDescription(
                  { children: ['Enter your email below to login.'] },
                  h,
                ),
              ],
            },
            h,
          ),
          Card.cardContent(
            {
              children: [
                Input.input(
                  {
                    id: 'card-email',
                    value: model.cardEmail,
                    onInput: (value) =>
                      State.ChangedText({ target: 'cardEmail', value }),
                    label: 'Email',
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
              children: [
                Button.button(
                  { class: 'w-full', children: ['Login'], onClick: interacted },
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
  carousel: (model, h: HtmlBuilder<PreviewMessage>) =>
    Carousel.carousel(
      {
        model: model.carousel,
        toParentMessage: (message) => State.GotCarouselMessage({ message }),
        class: 'w-full max-w-xs',
        items: [1, 2, 3].map((number) =>
          Card.card(
            {
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
    ),
  chart: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Chart.barChart(
      {
        class: 'max-w-xl',
        data: [
          { label: 'Jan', value: 186 },
          { label: 'Feb', value: 305 },
          { label: 'Mar', value: 237 },
          { label: 'Apr', value: 73 },
          { label: 'May', value: 209 },
          { label: 'Jun', value: 214 },
        ],
      },
      h,
    ),
  checkbox: (model, h: HtmlBuilder<PreviewMessage>) =>
    Checkbox.checkbox(
      {
        id: 'docs-checkbox',
        isChecked: model.isCheckboxChecked,
        onToggle: (isChecked) => State.ToggledCheckbox({ isChecked }),
        label: 'Accept terms and conditions',
        description: 'You agree to our Terms of Service and Privacy Policy.',
      },
      h,
    ),
  collapsible: (model, h: HtmlBuilder<PreviewMessage>) =>
    Collapsible.collapsible(
      {
        id: 'docs-collapsible',
        isOpen: model.isCollapsibleOpen,
        onToggle: (isOpen) => State.ToggledCollapsible({ isOpen }),
        class: 'w-full max-w-sm space-y-2',
        triggerClass:
          'flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-semibold',
        trigger: '@peduarte starred 3 repositories',
        contentClass: 'space-y-2',
        content: h.div(
          [h.Class('rounded-md border px-4 py-3 text-sm')],
          ['@radix-ui/primitives'],
        ),
      },
      h,
    ),
  direction: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Direction.direction(
      {
        direction: 'rtl',
        children: [
          Card.card(
            {
              class: 'w-full max-w-sm',
              children: [
                Card.cardHeader(
                  {
                    children: [
                      Card.cardTitle(
                        {
                          children: [
                            'Ø§ØªØ¬Ø§Ù‡ Ù…Ù† Ø§Ù„ÙŠÙ…ÙŠÙ† Ø¥Ù„Ù‰ Ø§Ù„ÙŠØ³Ø§Ø±',
                          ],
                        },
                        h,
                      ),
                      Card.cardDescription(
                        {
                          children: [
                            'Ù‡Ø°Ø§ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙŠØ³ØªØ®Ø¯Ù… Ø§ØªØ¬Ø§Ù‡ RTL.',
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
        ],
      },
      h,
    ),
  'data-table': (model, h: HtmlBuilder<PreviewMessage>) =>
    DataTable.dataTable(
      {
        model: model.dataTable,
        toParentMessage: (message) => State.GotDataTableMessage({ message }),
        rows: [
          {
            id: '728ed52f',
            status: 'success',
            email: 'm@example.com',
            amount: 100,
          },
          {
            id: '489e1d42',
            status: 'pending',
            email: 'a@example.com',
            amount: 125,
          },
          {
            id: 'f7a4b3c2',
            status: 'processing',
            email: 's@example.com',
            amount: 250,
          },
        ],
        columns: [
          {
            key: 'status',
            header: 'Status',
            cell: (row) => row.status,
            sortValue: (row) => row.status,
          },
          {
            key: 'email',
            header: 'Email',
            cell: (row) => row.email,
            sortValue: (row) => row.email,
          },
          {
            key: 'amount',
            header: 'Amount',
            class: 'text-right',
            cell: (row) => `$${row.amount.toFixed(2)}`,
            sortValue: (row) => row.amount,
          },
        ],
        rowKey: (row) => row.id,
        filterText: (row) => `${row.status} ${row.email}`,
        filterPlaceholder: 'Filter emailsâ€¦',
      },
      h,
    ),
  empty: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Empty.empty(
      {
        class: 'w-full max-w-md border',
        children: [
          Empty.emptyHeader(
            {
              children: [
                Empty.emptyMedia({ variant: 'icon', children: ['ï¼‹'] }, h),
                Empty.emptyTitle({ children: ['No projects yet'] }, h),
                Empty.emptyDescription(
                  { children: ['Get started by creating your first project.'] },
                  h,
                ),
              ],
            },
            h,
          ),
          Empty.emptyContent(
            {
              children: [
                Button.button(
                  { children: ['Create project'], onClick: interacted },
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
  field: (model, h: HtmlBuilder<PreviewMessage>) =>
    Field.fieldGroup(
      {
        class: 'w-full max-w-sm',
        children: [
          Field.field(
            {
              children: [
                Field.fieldLabel(
                  { for: 'docs-field-name', children: ['Name'] },
                  h,
                ),
                Input.input(
                  {
                    id: 'docs-field-name',
                    value: model.fieldName,
                    onInput: (value) =>
                      State.ChangedText({ target: 'fieldName', value }),
                    placeholder: 'Evil Rabbit',
                  },
                  h,
                ),
                Field.fieldDescription(
                  { children: ['This is your public display name.'] },
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
  form: (model, h: HtmlBuilder<PreviewMessage>) =>
    Form.form(
      {
        class: 'w-full max-w-sm',
        onSubmit: interacted,
        children: [
          Form.formItem(
            {
              id: 'docs-form-email',
              children: [
                Form.formLabel(
                  { for: 'docs-form-email', children: ['Email'] },
                  h,
                ),
                Input.input(
                  {
                    id: 'docs-form-email',
                    value: model.formEmail,
                    onInput: (value) =>
                      State.ChangedText({ target: 'formEmail', value }),
                    placeholder: 'm@example.com',
                  },
                  h,
                ),
                Form.formDescription(
                  { children: ['We will never share your email.'] },
                  h,
                ),
              ],
            },
            h,
          ),
          Button.button({ type: 'submit', children: ['Submit'] }, h),
        ],
      },
      h,
    ),
  input: (model, h: HtmlBuilder<PreviewMessage>) =>
    Input.input(
      {
        id: 'docs-input',
        value: model.input,
        onInput: (value) => State.ChangedText({ target: 'input', value }),
        placeholder: 'Email',
        class: 'max-w-sm',
      },
      h,
    ),
  'input-group': (model, h: HtmlBuilder<PreviewMessage>) =>
    InputGroup.inputGroup(
      {
        class: 'max-w-sm',
        children: [
          InputGroup.inputGroupAddon(
            {
              children: [
                InputGroup.inputGroupText({ children: ['https://'] }, h),
              ],
            },
            h,
          ),
          InputGroup.inputGroupInput(
            {
              id: 'docs-input-group',
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
  'input-otp': (model, h: HtmlBuilder<PreviewMessage>) =>
    InputOtp.inputOtp(
      {
        id: 'docs-otp',
        value: model.inputOtp,
        onInput: (value) => State.ChangedText({ target: 'inputOtp', value }),
        separator: (index) =>
          index === 2 ? InputOtp.inputOtpSeparator(h) : h.span([], []),
      },
      h,
    ),
  kbd: (_model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [h.Class('flex items-center gap-2 text-sm')],
      [
        'Press',
        Kbd.kbd({ children: ['âŒ˜'] }, h),
        Kbd.kbd({ children: ['K'] }, h),
        'to open the command menu',
      ],
    ),
  label: (model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [h.Class('grid w-full max-w-sm gap-2')],
      [
        Label.label({ for: 'docs-label-input', children: ['Email'] }, h),
        Input.input(
          {
            id: 'docs-label-input',
            value: model.labelInput,
            onInput: (value) =>
              State.ChangedText({ target: 'labelInput', value }),
            placeholder: 'Email',
          },
          h,
        ),
      ],
    ),
  item: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Item.item(
      {
        variant: 'outline',
        class: 'w-full max-w-md',
        children: [
          Item.itemMedia({ variant: 'icon', children: ['ðŸ“„'] }, h),
          Item.itemContent(
            {
              children: [
                Item.itemTitle({ children: ['Document.pdf'] }, h),
                Item.itemDescription(
                  { children: ['A project specification document.'] },
                  h,
                ),
              ],
            },
            h,
          ),
          Item.itemActions(
            {
              children: [
                Button.button(
                  {
                    variant: 'outline',
                    size: 'sm',
                    children: ['Open'],
                    onClick: interacted,
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
  marker: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Marker.marker(
      {
        variant: 'separator',
        class: 'max-w-md',
        children: [Marker.markerContent({ children: ['Today'] }, h)],
      },
      h,
    ),
  message: (_model, h: HtmlBuilder<PreviewMessage>) =>
    MessageUi.message(
      {
        class: 'max-w-md',
        children: [
          MessageUi.messageAvatar({ children: ['AI'] }, h),
          MessageUi.messageContent(
            {
              children: [
                MessageUi.messageHeader({ children: ['Assistant'] }, h),
                Bubble.bubble(
                  {
                    children: [
                      Bubble.bubbleContent(
                        { children: ['How can I help with your project?'] },
                        h,
                      ),
                    ],
                  },
                  h,
                ),
                MessageUi.messageFooter({ children: ['Just now'] }, h),
              ],
            },
            h,
          ),
        ],
      },
      h,
    ),
  'native-select': (model, h: HtmlBuilder<PreviewMessage>) =>
    NativeSelect.nativeSelect(
      {
        id: 'docs-native-select',
        value: model.nativeSelect,
        onChange: (value) => State.ChangedNativeSelect({ value }),
        options: [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'blueberry', label: 'Blueberry' },
        ],
        class: 'max-w-xs',
      },
      h,
    ),
  pagination: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Pagination.pagination(
      {
        children: [
          Pagination.paginationContent(
            {
              children: [
                Pagination.paginationItem(
                  {
                    children: [Pagination.paginationPrevious({ href: '#' }, h)],
                  },
                  h,
                ),
                ...[1, 2, 3].map((page) =>
                  Pagination.paginationItem(
                    {
                      children: [
                        Pagination.paginationLink(
                          {
                            href: '#',
                            isActive: page === 1,
                            children: [String(page)],
                          },
                          h,
                        ),
                      ],
                    },
                    h,
                  ),
                ),
                Pagination.paginationItem(
                  { children: [Pagination.paginationNext({ href: '#' }, h)] },
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
  progress: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Progress.progress({ value: 60, class: 'w-full max-w-sm' }, h),
  'radio-group': (model, h: HtmlBuilder<PreviewMessage>) =>
    RadioGroup.radioGroup(
      {
        id: 'docs-radio',
        selectedValue: Option.some(model.selectedRadioValue),
        onSelect: (value) => State.SelectedRadioValue({ value }),
        ariaLabel: 'Density',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'comfortable', label: 'Comfortable' },
          { value: 'compact', label: 'Compact' },
        ],
      },
      h,
    ),
  resizable: (model, h: HtmlBuilder<PreviewMessage>) =>
    Resizable.resizable(
      {
        model: model.resizable,
        toParentMessage: (message) => State.GotResizableMessage({ message }),
        class: 'h-48 w-full max-w-xl',
        withHandle: true,
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
    ),
  'scroll-area': (_model, h: HtmlBuilder<PreviewMessage>) =>
    ScrollArea.scrollArea(
      {
        class: 'h-72 w-48 rounded-md border p-4',
        children: Array.from({ length: 30 }, (_, index) =>
          h.div([h.Class('py-1 text-sm')], [`Tag ${index + 1}`]),
        ),
      },
      h,
    ),
  separator: (_model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [h.Class('w-full max-w-sm')],
      [
        h.h4([h.Class('text-sm font-medium')], ['Radix Primitives']),
        h.p(
          [h.Class('text-sm text-muted-foreground')],
          ['An open-source UI component library.'],
        ),
        Separator.separator({ class: 'my-4' }, h),
        h.div(
          [h.Class('flex h-5 items-center gap-4 text-sm')],
          [
            'Blog',
            Separator.separator({ orientation: 'vertical' }, h),
            'Docs',
            Separator.separator({ orientation: 'vertical' }, h),
            'Source',
          ],
        ),
      ],
    ),
  skeleton: (_model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [h.Class('flex items-center gap-4')],
      [
        Skeleton.skeleton({ class: 'size-12 rounded-full' }, h),
        h.div(
          [h.Class('space-y-2')],
          [
            Skeleton.skeleton({ class: 'h-4 w-52' }, h),
            Skeleton.skeleton({ class: 'h-4 w-40' }, h),
          ],
        ),
      ],
    ),
  slider: (model, h: HtmlBuilder<PreviewMessage>) =>
    Slider.slider(
      {
        model: model.slider,
        value: model.sliderValue,
        toParentMessage: (message) => State.GotSliderMessage({ message }),
        ariaLabel: 'Volume',
        class: 'w-full max-w-sm',
      },
      h,
    ),
  spinner: (_model, h) => Spinner.spinner({ class: 'size-6' }, h),
  switch: (model, h: HtmlBuilder<PreviewMessage>) =>
    Switch.switchControl(
      {
        id: 'docs-switch',
        isChecked: model.isSwitchChecked,
        onToggle: (isChecked) => State.ToggledSwitch({ isChecked }),
        label: 'Airplane Mode',
      },
      h,
    ),
  table: invoiceTable,
  tabs: (model, h: HtmlBuilder<PreviewMessage>) =>
    Tabs.tabs(
      {
        model: model.tabs,
        selectedValue: model.selectedTabValue,
        toParentMessage: (message) => State.GotTabsMessage({ message }),
        class: 'w-full max-w-md',
        tabs: [
          {
            value: 'account',
            label: 'Account',
            content: Card.card(
              {
                children: [
                  Card.cardHeader(
                    {
                      children: [
                        Card.cardTitle({ children: ['Account'] }, h),
                        Card.cardDescription(
                          { children: ['Make changes to your account here.'] },
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
          },
          {
            value: 'password',
            label: 'Password',
            content: Card.card(
              {
                children: [
                  Card.cardHeader(
                    {
                      children: [
                        Card.cardTitle({ children: ['Password'] }, h),
                        Card.cardDescription(
                          { children: ['Change your password here.'] },
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
          },
        ],
      },
      h,
    ),
  textarea: (model, h: HtmlBuilder<PreviewMessage>) =>
    Textarea.textarea(
      {
        id: 'docs-textarea',
        value: model.textarea,
        onInput: (value) => State.ChangedText({ target: 'textarea', value }),
        placeholder: 'Type your message here.',
        class: 'max-w-sm',
      },
      h,
    ),
  toggle: (model, h: HtmlBuilder<PreviewMessage>) =>
    Toggle.toggle(
      {
        isPressed: model.togglePressed,
        onToggle: State.ToggledPreview(),
        children: ['Bold'],
      },
      h,
    ),
  'toggle-group': (model, h: HtmlBuilder<PreviewMessage>) =>
    ToggleGroup.toggleGroup(
      {
        value: model.toggleGroupValue,
        onToggle: (value) => State.ChangedToggleGroup({ value }),
        variant: 'outline',
        items: [
          { value: 'left', children: ['Left'] },
          { value: 'center', children: ['Center'] },
          { value: 'right', children: ['Right'] },
        ],
      },
      h,
    ),
  typography: (_model, h: HtmlBuilder<PreviewMessage>) =>
    h.article(
      [h.Class('max-w-lg space-y-4')],
      [
        Typography.typographyH2({ children: ['The Joke Tax Chronicles'] }, h),
        Typography.typographyP(
          {
            children: [
              'Once upon a time, in a far-off land, there was a very lazy king.',
            ],
          },
          h,
        ),
        Typography.typographyBlockquote(
          { children: ['After all, he thought, why should he have to work?'] },
          h,
        ),
      ],
    ),
  'alert-dialog': (model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [],
      [
        Button.button(
          {
            children: ['Show dialog'],
            onClick: State.OpenedOverlay({ target: 'alertDialog' }),
          },
          h,
        ),
        AlertDialog.alertDialog(
          {
            model: model.alertDialog,
            toParentMessage: (message) =>
              State.GotAlertDialogMessage({ message }),
            title: 'Are you absolutely sure?',
            description:
              'This action cannot be undone. This will permanently delete your account.',
            actionLabel: 'Continue',
          },
          h,
        ),
      ],
    ),
  combobox: (model, h: HtmlBuilder<PreviewMessage>) =>
    Combobox.combobox(
      {
        model: model.combobox,
        maybeSelectedValue: model.selectedComboboxValue,
        restingInputValue: Option.match(model.selectedComboboxValue, {
          onNone: () => '',
          onSome: (value) =>
            ({ next: 'Next.js', svelte: 'SvelteKit', nuxt: 'Nuxt.js' })[
              value as 'next' | 'svelte' | 'nuxt'
            ] ?? value,
        }),
        toParentMessage: (message) => State.GotComboboxMessage({ message }),
        items: [
          { value: 'next', label: 'Next.js' },
          { value: 'svelte', label: 'SvelteKit' },
          { value: 'nuxt', label: 'Nuxt.js' },
        ],
        itemToValue: (item) => item.value,
        itemToLabel: (item) => item.label,
        placeholder: 'Select frameworkâ€¦',
      },
      h,
    ),
  command: (model, h: HtmlBuilder<PreviewMessage>) =>
    CommandMenu.command(
      {
        model: model.command,
        maybeSelectedValue: model.selectedCommandValue,
        restingInputValue: Option.match(model.selectedCommandValue, {
          onNone: () => '',
          onSome: (value) => value[0]?.toUpperCase() + value.slice(1),
        }),
        toParentMessage: (message) => State.GotCommandMessage({ message }),
        class: 'w-full max-w-md border shadow-md',
        items: ['calendar', 'search', 'settings'],
        itemToConfig: (item) => ({
          content: item[0]?.toUpperCase() + item.slice(1),
        }),
        placeholder: 'Type a command or searchâ€¦',
      },
      h,
    ),
  'context-menu': (model, h: HtmlBuilder<PreviewMessage>) =>
    ContextMenu.contextMenu(
      {
        model: model.contextMenu,
        toParentMessage: (message) => State.GotContextMenuMessage({ message }),
        class:
          'flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm',
        trigger: 'Right click here',
        items: ['back', 'forward', 'reload'],
        itemToConfig: (item) => ({
          label: item[0]?.toUpperCase() + item.slice(1),
        }),
      },
      h,
    ),
  'date-picker': (model, h: HtmlBuilder<PreviewMessage>) =>
    DatePicker.datePicker(
      {
        model: model.datePicker,
        maybeSelectedDate: model.selectedDate,
        toParentMessage: (message) => State.GotDatePickerMessage({ message }),
      },
      h,
    ),
  dialog: (model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [],
      [
        Button.button(
          {
            children: ['Edit profile'],
            onClick: State.OpenedOverlay({ target: 'dialog' }),
          },
          h,
        ),
        Dialog.dialog(
          {
            model: model.dialog,
            toParentMessage: (message) => State.GotDialogMessage({ message }),
            title: 'Edit profile',
            description:
              'Make changes to your profile here. Click save when youâ€™re done.',
            content: () => [
              Input.input(
                {
                  id: 'docs-dialog-name',
                  value: model.dialogName,
                  onInput: (value) =>
                    State.ChangedText({ target: 'dialogName', value }),
                  label: 'Name',
                },
                h,
              ),
            ],
            footer: () => [
              Button.button(
                { children: ['Save changes'], onClick: interacted },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    ),
  drawer: (model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [],
      [
        Button.button(
          {
            children: ['Open drawer'],
            onClick: State.OpenedOverlay({ target: 'drawer' }),
          },
          h,
        ),
        Drawer.drawer(
          {
            model: model.drawer,
            toParentMessage: (message) => State.GotDrawerMessage({ message }),
            title: 'Move Goal',
            description: 'Set your daily activity goal.',
            content: () => [
              h.div(
                [h.Class('px-4 pb-6 text-center text-5xl font-bold')],
                ['350'],
              ),
            ],
          },
          h,
        ),
      ],
    ),
  'dropdown-menu': (model, h: HtmlBuilder<PreviewMessage>) =>
    DropdownMenu.dropdownMenu(
      {
        model: model.dropdownMenu,
        toParentMessage: (message) => State.GotDropdownMenuMessage({ message }),
        triggerClass:
          'rounded-md border px-4 py-2 text-sm font-medium shadow-xs',
        trigger: 'Open',
        items: ['profile', 'billing', 'settings', 'logout'],
        itemToConfig: (item) => ({
          label: item[0]?.toUpperCase() + item.slice(1),
          separatorBefore: item === 'logout',
        }),
      },
      h,
    ),
  'hover-card': (model, h: HtmlBuilder<PreviewMessage>) =>
    HoverCard.hoverCard(
      {
        model: model.hoverCard,
        toParentMessage: (message) => State.GotHoverCardMessage({ message }),
        triggerClass: 'underline underline-offset-4',
        trigger: '@nextjs',
        content: h.div(
          [h.Class('space-y-1')],
          [
            h.h4([h.Class('font-semibold')], ['@nextjs']),
            h.p(
              [h.Class('text-sm')],
              ['The React Framework â€“ created and maintained by @vercel.'],
            ),
          ],
        ),
      },
      h,
    ),
  'message-scroller': (model, h: HtmlBuilder<PreviewMessage>) =>
    MessageScroller.messageScroller(
      {
        class: 'relative h-72 w-full max-w-md rounded-md border',
        children: [
          MessageScroller.messageScrollerViewport(
            {
              model: model.messageScroller,
              toParentMessage: (message) =>
                State.GotMessageScrollerMessage({ message }),
              children: [
                MessageScroller.messageScrollerContent(
                  {
                    children: Array.from({ length: 18 }, (_, index) =>
                      MessageScroller.messageScrollerItem(
                        {
                          scrollAnchor: index === 17,
                          children: [
                            Bubble.bubble(
                              {
                                align: index % 2 === 0 ? 'start' : 'end',
                                children: [
                                  Bubble.bubbleContent(
                                    { children: [`Message ${index + 1}`] },
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
                  },
                  h,
                ),
              ],
            },
            h,
          ),
          MessageScroller.messageScrollerButton(
            {
              model: model.messageScroller,
              toParentMessage: (message) =>
                State.GotMessageScrollerMessage({ message }),
              direction: 'end',
            },
            h,
          ),
        ],
      },
      h,
    ),
  menubar: (model, h: HtmlBuilder<PreviewMessage>) =>
    Menubar.menubar<string, PreviewMessage>(
      {
        menus: (
          [
            ['file', 'File', model.menubarFile],
            ['edit', 'Edit', model.menubarEdit],
            ['view', 'View', model.menubarView],
          ] as const
        ).map(([target, label, menu]) => ({
          id: `docs-menubar-${target}`,
          label,
          model: menu,
          toParentMessage: (message) =>
            State.GotMenubarMessage({ target, message }),
          items: ['new', 'open', 'save'],
          itemToConfig: (item) => ({
            label: item[0]?.toUpperCase() + item.slice(1),
          }),
        })),
      },
      h,
    ),
  popover: (model, h: HtmlBuilder<PreviewMessage>) =>
    Popover.popover(
      {
        model: model.popover,
        toParentMessage: (message) => State.GotPopoverMessage({ message }),
        triggerClass: 'rounded-md border px-4 py-2 text-sm font-medium',
        trigger: 'Open popover',
        content: h.div(
          [h.Class('grid gap-2')],
          [
            h.h4([h.Class('font-medium')], ['Dimensions']),
            h.p(
              [h.Class('text-sm text-muted-foreground')],
              ['Set the dimensions for the layer.'],
            ),
          ],
        ),
      },
      h,
    ),
  select: (model, h: HtmlBuilder<PreviewMessage>) =>
    Select.select(
      {
        model: model.select,
        maybeSelectedValue: model.selectedSelectValue,
        toParentMessage: (message) => State.GotSelectMessage({ message }),
        items: [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'blueberry', label: 'Blueberry' },
        ],
        itemToValue: (item) => item.value,
        itemToLabel: (item) => item.label,
        placeholder: 'Select a fruit',
      },
      h,
    ),
  sheet: (model, h: HtmlBuilder<PreviewMessage>) =>
    h.div(
      [],
      [
        Button.button(
          {
            children: ['Open sheet'],
            onClick: State.OpenedOverlay({ target: 'sheet' }),
          },
          h,
        ),
        Sheet.sheet(
          {
            model: model.sheet,
            toParentMessage: (message) => State.GotSheetMessage({ message }),
            title: 'Edit profile',
            description: 'Make changes to your profile here.',
            content: () => [
              Input.input(
                {
                  id: 'docs-sheet-name',
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
    ),
  tooltip: (model, h: HtmlBuilder<PreviewMessage>) =>
    Tooltip.tooltip(
      {
        model: model.tooltip,
        toParentMessage: (message) => State.GotTooltipMessage({ message }),
        triggerClass: 'rounded-md border px-3 py-2 text-sm',
        trigger: 'Hover',
        content: 'Add to library',
      },
      h,
    ),
  'navigation-menu': (_model, h: HtmlBuilder<PreviewMessage>) =>
    NavigationMenu.navigationMenu(
      {
        children: [
          NavigationMenu.navigationMenuList(
            {
              children: ['Home', 'Components', 'Docs'].map((label, index) =>
                NavigationMenu.navigationMenuItem(
                  {
                    children: [
                      NavigationMenu.navigationMenuLink(
                        { href: '#', isActive: index === 0, children: [label] },
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
  sidebar: (_model, h: HtmlBuilder<PreviewMessage>) =>
    Sidebar.sidebarProvider(
      {
        class:
          'h-80 min-h-0 w-full max-w-2xl overflow-hidden rounded-lg border',
        children: [
          Sidebar.sidebar(
            {
              collapsible: 'none',
              children: [
                Sidebar.sidebarHeader(
                  {
                    children: [
                      h.div(
                        [h.Class('px-2 py-1 font-semibold')],
                        ['Acme Inc.'],
                      ),
                    ],
                  },
                  h,
                ),
                Sidebar.sidebarContent(
                  {
                    children: [
                      Sidebar.sidebarGroup(
                        {
                          children: [
                            Sidebar.sidebarGroupLabel(
                              { children: ['Platform'] },
                              h,
                            ),
                            Sidebar.sidebarGroupContent(
                              {
                                children: [
                                  Sidebar.sidebarMenu(
                                    {
                                      children: [
                                        'Playground',
                                        'Models',
                                        'Documentation',
                                      ].map((label) =>
                                        Sidebar.sidebarMenuItem(
                                          {
                                            children: [
                                              Sidebar.sidebarMenuButton(
                                                {
                                                  isActive:
                                                    label === 'Playground',
                                                  children: [label],
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
              ],
            },
            h,
          ),
        ],
      },
      h,
    ),
  sonner: (model, h: HtmlBuilder<PreviewMessage>) =>
    Sonner.sonner(
      {
        model: model.sonner,
        toParentMessage: (message) => State.GotSonnerMessage({ message }),
        class: 'relative right-auto bottom-auto p-0',
      },
      h,
    ),
  toast: (model, h: HtmlBuilder<PreviewMessage>) =>
    Toast.toast(
      {
        model: model.toast,
        toParentMessage: (message) => State.GotToastMessage({ message }),
        class: 'relative right-auto bottom-auto p-0',
      },
      h,
    ),
};
