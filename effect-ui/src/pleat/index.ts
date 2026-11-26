import type { Html } from '@effect/ui/html'
import { chart, dataTable, dataGrid } from './data-styles'
import { EChart as RenderEChart } from '../ui/chart'
import { ChartContainer as RenderChartContainer } from '../ui/chart'
import { ChartLegend as RenderChartLegend } from '../ui/chart'
import { ChartTooltipContent as RenderChartTooltipContent } from '../ui/chart'
import { BarChart as RenderBarChart } from '../ui/chart'
import { AreaChart as RenderAreaChart } from '../ui/chart'
import { InteractiveAreaChart as RenderInteractiveAreaChart } from '../ui/chart'
import { DonutChart as RenderDonutChart } from '../ui/chart'
import { DataTable as RenderDataTable } from '../ui/data-table'
import { DataGrid as RenderDataGrid } from '../ui/data-grid'
import {
  command,
  multiSelector,
  listInput,
  tokenizer,
  transferList,
  treeList,
} from './selector-styles'
import { Command as RenderCommand } from '../ui/command'
import { MultiSelector as RenderMultiSelector } from '../ui/multi-selector'
import { ListInput as RenderListInput } from '../ui/list-input'
import { Tokenizer as RenderTokenizer } from '../ui/tokenizer'
import { TransferList as RenderTransferList } from '../ui/transfer-list'
import { TreeList as RenderTreeList } from '../ui/tree-list'
import { codeBlock, markdown, overflowList, lightbox } from './content-styles'
import { CodeBlock as RenderCodeBlock } from '../ui/code-block'
import { Markdown as RenderMarkdown } from '../ui/markdown'
import { OverflowList as RenderOverflowList } from '../ui/overflow-list'
import { Lightbox as RenderLightbox } from '../ui/lightbox'
import { Style } from '@pleat/core'

import { Accordion as RenderAccordion } from '../ui/accordion'
import { DateInput as RenderDateInput } from '../ui/date-input'
import { TimeInput as RenderTimeInput } from '../ui/time-input'
import { DateTimeInput as RenderDateTimeInput } from '../ui/date-time-input'
import { DatePicker as RenderDatePicker } from '../ui/date-picker'
import { DateRangeInput as RenderDateRangeInput } from '../ui/date-range-input'
import { Map as RenderMap } from '../ui/map'
import { MapControls as RenderMapControls } from '../ui/map-controls'
import { MapMarker as RenderMapMarker } from '../ui/map-marker'
import { MapPopup as RenderMapPopup } from '../ui/map-popup'
import { MapMarkerContent as RenderMapMarkerContent } from '../ui/map-marker'
import { MapMarkerLabel as RenderMapMarkerLabel } from '../ui/map-marker'
import { MapMarkerTooltip as RenderMapMarkerTooltip } from '../ui/map-marker'
import { CircularProgress as RenderCircularProgress } from '../ui/circular-progress'
import { Stat as RenderStat } from '../ui/stat'
import { Bubble as RenderBubble } from '../ui/bubble'
import { Token as RenderToken } from '../ui/token'
import { BubbleGroup as RenderBubbleGroup } from '../ui/bubble'
import { Drawer as RenderDrawer } from '../ui/drawer'
import {
  Sheet as RenderSheet,
  SheetSwitcher as RenderSheetSwitcher,
} from '../ui/sheet'
import { DropdownMenu as RenderDropdownMenu } from '../ui/dropdown-menu'
import { ContextMenu as RenderContextMenu } from '../ui/context-menu'
import { ScrollArea as RenderScrollArea } from '../ui/scroll-area'
import { Toolbar as RenderToolbar } from '../ui/toolbar'
import { Breadcrumb as RenderBreadcrumb } from '../ui/breadcrumb'
import { AvatarGroup as RenderAvatarGroup } from '../ui/avatar-group'
import { AvatarGroupOverflow as RenderAvatarGroupOverflow } from '../ui/avatar-group'
import { AvatarStatusDot as RenderAvatarStatusDot } from '../ui/avatar-group'
import { Card as RenderCard } from '../ui/card'
import { Alert as RenderAlert } from '../ui/alert'
import { Empty as RenderEmpty } from '../ui/empty'
import { Table as RenderTable } from '../ui/table'
import { Code as RenderCode } from '../ui/code'
import { Typography as RenderTypography } from '../ui/typography'
import { Textarea as RenderTextarea } from '../ui/textarea'
import { NativeSelect as RenderNativeSelect } from '../ui/native-select'
import {
  Form as RenderForm,
  ErrorSummary as RenderErrorSummary,
} from '../ui/form'
import { ToggleGroup as RenderToggleGroup } from '../ui/toggle-group'
import { InputOtp as RenderInputOtp } from '../ui/input-otp'
import { NumberInput as RenderNumberInput } from '../ui/number-input'
import { Icon as RenderIcon } from '../ui/icon'
import { FieldStatus as RenderFieldStatus } from '../ui/field-status'
import { Indicator as RenderIndicator } from '../ui/indicator'
import { InputGroup as RenderInputGroup } from '../ui/input-group'
import { ButtonGroup as RenderButtonGroup } from '../ui/button-group'
import { Carousel as RenderCarousel } from '../ui/carousel'
import { Resizable as RenderResizable } from '../ui/resizable'
import { ResizableGroup as RenderResizableGroup } from '../ui/resizable'
import { Stepper as RenderStepper } from '../ui/stepper'
import { ColorPicker as RenderColorPicker } from '../ui/color-picker'
import { Sidebar as RenderSidebar } from '../ui/sidebar'
import { Message as RenderMessage } from '../ui/message'
import { MessageGroup as RenderMessageGroup } from '../ui/message'
import { ChatReasoning as RenderChatReasoning } from '../ui/chat-reasoning'
import { MessageScroller as RenderMessageScroller } from '../ui/message-scroller'
import { LogStream as RenderLogStream } from '../ui/log-stream'
import { Attachment as RenderAttachment } from '../ui/attachment'
import { AttachmentGroup as RenderAttachmentGroup } from '../ui/attachment'
import { SelectableCard as RenderSelectableCard } from '../ui/selectable-card'
import { Timer as RenderTimer } from '../ui/timer'
import { Timestamp as RenderTimestamp } from '../ui/timestamp'
import { Banner as RenderBanner } from '../ui/banner'
import { ActionBar as RenderActionBar } from '../ui/action-bar'
import { Menubar as RenderMenubar } from '../ui/menubar'
import { NavigationMenu as RenderNavigationMenu } from '../ui/navigation-menu'
import { MoreMenu as RenderMoreMenu } from '../ui/more-menu'
import { MobileNav as RenderMobileNav } from '../ui/mobile-nav'
import { TopNav as RenderTopNav } from '../ui/top-nav'
import { Link as RenderLink } from '../ui/link'
import { Pagination as RenderPagination } from '../ui/pagination'
import { Thumbnail as RenderThumbnail } from '../ui/thumbnail'
import { HoverCard as RenderHoverCard } from '../ui/hover-card'
import { InfoTip as RenderInfoTip } from '../ui/info-tip'
import { Item as RenderItem } from '../ui/item'
import { ItemGroup as RenderItemGroup } from '../ui/item'
import { List as RenderList } from '../ui/list'
import { Marker as RenderMarker } from '../ui/marker'
import { MetadataList as RenderMetadataList } from '../ui/metadata-list'
import { FileInput as RenderFileInput } from '../ui/file-input'
import { Toast as RenderToast } from '../ui/toast'
import { Avatar as RenderAvatar } from '../ui/avatar'
import { AlertDialog as RenderAlertDialog } from '../ui/alert-dialog'
import { AspectRatio as RenderAspectRatio } from '../ui/aspect-ratio'
import { Blockquote as RenderBlockquote } from '../ui/blockquote'
import { Badge as RenderBadge } from '../ui/badge'
import { Kbd as RenderKbd } from '../ui/kbd'
import { Label as RenderLabel } from '../ui/label'
import { VisuallyHidden as RenderVisuallyHidden } from '../ui/visually-hidden'
import { StatusDot as RenderStatusDot } from '../ui/status-dot'
import { Skeleton as RenderSkeleton } from '../ui/skeleton'
import { Spinner as RenderSpinner } from '../ui/spinner'
import {
  Button as RenderButton,
  ButtonLink as RenderButtonLink,
} from '../ui/button'
import {
  Calendar as RenderCalendar,
  RangeCalendar as RenderRangeCalendar,
} from '../ui/calendar'
import { Checkbox as RenderCheckbox } from '../ui/checkbox'
import { Combobox as RenderCombobox } from '../ui/combobox'
import { Dialog as RenderDialog } from '../ui/dialog'
import { Field as RenderField } from '../ui/field'
import { Fieldset as RenderFieldset } from '../ui/fieldset'
import { Input as RenderInput } from '../ui/input'
import { Popover as RenderPopover } from '../ui/popover'
import { Select as RenderSelect } from '../ui/select'
import { RadioGroup as RenderRadioGroup } from '../ui/radio-group'
import { Slider as RenderSlider } from '../ui/slider'
import { Switch as RenderSwitch } from '../ui/switch'
import { Tabs as RenderTabs } from '../ui/tabs'
import { Tooltip as RenderTooltip } from '../ui/tooltip'
import { Collapsible as RenderCollapsible } from '../ui/collapsible'
import { Progress as RenderProgress } from '../ui/progress'
import { Separator as RenderSeparator } from '../ui/separator'
import { Toggle as RenderToggle } from '../ui/toggle'
import {
  accordion,
  dateInput,
  timeInput,
  dateTimeInput,
  datePicker,
  dateRangeInput,
  mapStyles,
  circularProgress,
  stat,
  bubble,
  token,
  drawer,
  menu,
  scrollArea,
  toolbar,
  breadcrumb,
  avatarGroup,
  card,
  alert,
  empty,
  table,
  code,
  typography,
  textarea,
  nativeSelect,
  form,
  toggleGroup,
  inputOtp,
  numberInput,
  icon,
  fieldStatus,
  indicator,
  inputGroup,
  buttonGroup,
  carousel,
  resizable,
  stepper,
  colorPicker,
  sidebar,
  message,
  chatReasoning,
  messageScroller,
  logStream,
  attachment,
  selectableCard,
  timestamp,
  banner,
  actionBar,
  menubar,
  navigationMenu,
  topNav,
  link,
  pagination,
  thumbnail,
  hoverCard,
  infoTip,
  item,
  list,
  marker,
  metadataList,
  fileInput,
  toast,
  avatar,
  alertDialog,
  aspectRatio,
  blockquote,
  badge,
  kbd,
  label,
  visuallyHidden,
  statusDot,
  skeleton,
  spinner,
  buttonSizes,
  buttonVariants,
  calendar,
  checkbox,
  choiceField,
  combobox,
  controls,
  dialog,
  field,
  fieldset,
  input,
  popover,
  select,
  radioGroup,
  slider,
  switchControl,
  tabs,
  tooltip,
  collapsible,
  progress,
  separator,
  toggle,
} from './styles'

const buttonClasses: NonNullable<Parameters<typeof RenderButton>[2]> = (
  { variant, size },
  disabled,
) =>
  Style.use(
    Style.mergeAll([
      controls.box,
      controls.button,
      buttonVariants[variant],
      buttonSizes[size],
      ...(disabled ? [controls.disabled] : []),
    ]),
  )

const partClasses = <Part extends string>(
  parts: Record<Part, Style.Style>,
): Record<Part, string> =>
  Object.fromEntries(
    Object.entries<Style.Style>(parts).map(([part, style]) => [
      part,
      Style.use(Style.merge(controls.box, style)),
    ]),
  ) as Record<Part, string>

export const Button = <Msg, R = never>(
  h: Html.H<Msg>,
  options?: Parameters<typeof RenderButton<Msg, R>>[1],
) => RenderButton(h, options, buttonClasses)

export const ButtonLink = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderButtonLink<Msg>>[1],
) => RenderButtonLink(h, options, buttonClasses)

export const Dialog = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDialog<Msg, R>>[1],
) => RenderDialog(h, options, partClasses(dialog))

export const Combobox = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCombobox<Msg>>[1],
) => RenderCombobox(h, options, partClasses(combobox))

export const Calendar = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCalendar<Msg>>[1],
) => RenderCalendar(h, options, partClasses(calendar))

export const RangeCalendar = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderRangeCalendar<Msg>>[1],
) => RenderRangeCalendar(h, options, partClasses(calendar))

export const Popover = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderPopover<Msg, R>>[1],
) => RenderPopover(h, options, partClasses(popover))

export const Select = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderSelect<Msg, R>>[1],
) => RenderSelect(h, options, partClasses(select))

export const Checkbox = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCheckbox<Msg, R>>[1],
) => RenderCheckbox(h, options, partClasses({ ...choiceField, ...checkbox }))

export const Switch = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderSwitch<Msg, R>>[1],
) => RenderSwitch(h, options, partClasses({ ...choiceField, ...switchControl }))

export const Tooltip = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTooltip<Msg, R>>[1],
) => RenderTooltip(h, options, partClasses(tooltip))

export const Tabs = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTabs<Msg, R>>[1],
) => RenderTabs(h, options, partClasses(tabs))

export const Accordion = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAccordion<Msg, R>>[1],
) => RenderAccordion(h, options, partClasses(accordion))

export const Collapsible = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCollapsible<Msg, R>>[1],
) => RenderCollapsible(h, options, partClasses(collapsible))

export const Progress = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderProgress<Msg>>[1],
) => RenderProgress(h, options, partClasses(progress))

export const Separator = <Msg>(
  h: Html.H<Msg>,
  options?: Parameters<typeof RenderSeparator<Msg>>[1],
) => RenderSeparator(h, options, partClasses(separator))

export const Toggle = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderToggle<Msg, R>>[1],
) => RenderToggle(h, options, partClasses(toggle))

export const Input = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderInput<Msg, R>>[1],
) => RenderInput(h, options, partClasses(input))

export const RadioGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderRadioGroup<Msg, R>>[1],
) =>
  RenderRadioGroup(h, options, partClasses({ ...choiceField, ...radioGroup }))

export const Slider = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderSlider<Msg>>[1],
) => RenderSlider(h, options, partClasses(slider))

export const Field = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderField<Msg, R>>[1],
) => RenderField(h, options, partClasses(field))

export const Fieldset = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderFieldset<Msg, R>>[1],
) => RenderFieldset(h, options, partClasses(fieldset))

export const AspectRatio = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAspectRatio<Msg, R>>[1],
) => RenderAspectRatio(h, options, partClasses(aspectRatio))

export const Blockquote = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderBlockquote<Msg, R>>[1],
) => RenderBlockquote(h, options, partClasses(blockquote))

export const Badge = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderBadge<Msg, R>>[1],
) => RenderBadge(h, options, partClasses(badge))

export const Kbd = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderKbd<Msg, R>>[1],
) => RenderKbd(h, options, partClasses(kbd))

export const Label = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderLabel<Msg, R>>[1],
) => RenderLabel(h, options, partClasses(label))

export const VisuallyHidden = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderVisuallyHidden<Msg, R>>[1],
) => RenderVisuallyHidden(h, options, partClasses(visuallyHidden))

export const StatusDot = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderStatusDot<Msg, R>>[1],
) => RenderStatusDot(h, options, partClasses(statusDot))

export const Skeleton = <Msg>(
  h: Html.H<Msg>,
  options?: Parameters<typeof RenderSkeleton<Msg>>[1],
) => RenderSkeleton(h, options, partClasses(skeleton))

export const Spinner = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderSpinner<Msg>>[1],
) => RenderSpinner(h, options, partClasses(spinner))

export { Center } from '../ui/center'

export { Direction } from '../ui/direction'

export const ToggleGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderToggleGroup<Msg, R>>[1],
) => RenderToggleGroup(h, options, partClasses(toggleGroup))

export const InputOtp = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderInputOtp<Msg, R>>[1],
) => RenderInputOtp(h, options, partClasses(inputOtp))

export const NumberInput = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderNumberInput<Msg, R>>[1],
) => RenderNumberInput(h, options, partClasses(numberInput), FieldStatus)

export const Avatar = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAvatar<Msg, R>>[1],
) => RenderAvatar(h, options, partClasses(avatar))

export const AlertDialog = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAlertDialog<Msg, R>>[1],
) => RenderAlertDialog(h, options, partClasses(alertDialog))

export { Stack, HStack, VStack, StackItem } from '../ui/stack'

export { Grid, GridSpan } from '../ui/grid'

export { Section } from '../ui/section'

export { formControlIds } from '../ui/form'

export const Textarea = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTextarea<Msg, R>>[1],
) => RenderTextarea(h, options, partClasses(textarea))

export const NativeSelect = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderNativeSelect<Msg, R>>[1],
) => RenderNativeSelect(h, options, partClasses(nativeSelect))

export const Form = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderForm<Msg, R>>[1],
) => RenderForm(h, options, partClasses(form))

export const ErrorSummary = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderErrorSummary<Msg, R>>[1],
) => RenderErrorSummary(h, options, partClasses(form))

export { Text } from '../ui/text'

export { Heading } from '../ui/heading'

export const Card = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCard<Msg, R>>[1],
) => RenderCard(h, options, partClasses(card))

export const Alert = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAlert<Msg, R>>[1],
) => RenderAlert(h, options, partClasses(alert))

export const Empty = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderEmpty<Msg, R>>[1],
) => RenderEmpty(h, options, partClasses(empty))

export const Table = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTable<Msg, R>>[1],
) => RenderTable(h, options, partClasses(table))

export const Code = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCode<Msg, R>>[1],
) => RenderCode(h, options, partClasses(code))

export const Typography = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTypography<Msg, R>>[1],
) => RenderTypography(h, options, partClasses(typography))

export const ScrollArea = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderScrollArea<Msg, R>>[1],
) => RenderScrollArea(h, options, partClasses(scrollArea))

export const Toolbar = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderToolbar<Msg, R>>[1],
) => RenderToolbar(h, options, partClasses(toolbar))

export const Breadcrumb = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderBreadcrumb<Msg, R>>[1],
) => RenderBreadcrumb(h, options, partClasses(breadcrumb))

export const AvatarGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAvatarGroup<Msg, R>>[1],
) => RenderAvatarGroup(h, options, partClasses(avatarGroup))

export const AvatarGroupOverflow = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAvatarGroupOverflow<Msg, R>>[1],
) => RenderAvatarGroupOverflow(h, options, partClasses(avatarGroup))

export const AvatarStatusDot = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAvatarStatusDot<Msg>>[1],
) => RenderAvatarStatusDot(h, options, partClasses(avatarGroup))

export const DropdownMenu = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDropdownMenu<Msg, R>>[1],
) => RenderDropdownMenu(h, options, partClasses(menu))

export const ContextMenu = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderContextMenu<Msg, R>>[1],
) => RenderContextMenu(h, options, partClasses(menu))

export const Drawer = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDrawer<Msg, R>>[1],
) => RenderDrawer(h, options, partClasses(drawer))

export const Sheet = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderSheet<Msg, R>>[1],
) => RenderSheet(h, options, partClasses(drawer))

export const SheetSwitcher = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderSheetSwitcher<Msg, R>>[1],
) => RenderSheetSwitcher(h, options, partClasses(drawer))

export const CircularProgress = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCircularProgress<Msg, R>>[1],
) => RenderCircularProgress(h, options, partClasses(circularProgress))

export const Stat = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderStat<Msg, R>>[1],
) => RenderStat(h, options, partClasses(stat))

export const Bubble = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderBubble<Msg, R>>[1],
) => RenderBubble(h, options, partClasses(bubble))

export const Token = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderToken<Msg, R>>[1],
) => RenderToken(h, options, partClasses(token))

export { MapMessage } from '../ui/map'
export { MapRoute } from '../ui/map-route'
export { MapArc, arcCoordinates } from '../ui/map-arc'
export { MapClusterLayer } from '../ui/map-cluster'
export { MapGeoJSON } from '../ui/map-geojson'
export * from '../ui/map-styles'
export * from '../ui/map-localization'

export const Map = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMap<Msg, R>>[1],
) => RenderMap(h, options, partClasses(mapStyles))

export const MapControls = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMapControls<Msg>>[1],
) => RenderMapControls(h, options, partClasses(mapStyles))

export const MapMarker = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMapMarker<Msg, R>>[1],
) => RenderMapMarker(h, options, partClasses(mapStyles))

export const MapPopup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMapPopup<Msg, R>>[1],
) => RenderMapPopup(h, options, partClasses(mapStyles))

export const MapMarkerContent = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMapMarkerContent<Msg, R>>[1],
) => RenderMapMarkerContent(h, options, partClasses(mapStyles))

export const MapMarkerLabel = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMapMarkerLabel<Msg, R>>[1],
) => RenderMapMarkerLabel(h, options, partClasses(mapStyles))

export const MapMarkerTooltip = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMapMarkerTooltip<Msg, R>>[1],
) => RenderMapMarkerTooltip(h, options, partClasses(mapStyles))

export const DateInput = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDateInput<Msg, R>>[1],
) => RenderDateInput(h, options, partClasses(dateInput), partClasses(calendar))

export const TimeInput = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTimeInput<Msg, R>>[1],
) => RenderTimeInput(h, options, partClasses(timeInput))

export const DateTimeInput = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDateTimeInput<Msg, R>>[1],
) =>
  RenderDateTimeInput(
    h,
    options,
    partClasses(dateTimeInput),
    DateInput,
    TimeInput,
  )

export const DatePicker = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDatePicker<Msg, R>>[1],
) =>
  RenderDatePicker(h, options, partClasses(datePicker), partClasses(calendar))

export const DateRangeInput = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDateRangeInput<Msg, R>>[1],
) =>
  RenderDateRangeInput(
    h,
    options,
    partClasses(dateRangeInput),
    partClasses(calendar),
  )

export const BubbleGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderBubbleGroup<Msg, R>>[1],
) => RenderBubbleGroup(h, options, partClasses(bubble))

export { hasIcon, iconNames } from '../ui/icon'

export const Icon = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderIcon<Msg>>[1],
) => RenderIcon(h, options, partClasses(icon))

export const FieldStatus = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderFieldStatus<Msg, R>>[1],
) => RenderFieldStatus(h, options, partClasses(fieldStatus))

export const Indicator = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderIndicator<Msg, R>>[1],
) => RenderIndicator(h, options, partClasses(indicator))

export const InputGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderInputGroup<Msg, R>>[1],
) => RenderInputGroup(h, options, partClasses(inputGroup))

export const ButtonGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderButtonGroup<Msg, R>>[1],
) => RenderButtonGroup(h, options, partClasses(buttonGroup))

export const EChart = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderEChart<Msg, R>>[1],
) => RenderEChart<Msg, R>(h, options, partClasses(chart))

export const ChartContainer = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderChartContainer<Msg, R>>[1],
) => RenderChartContainer<Msg, R>(h, options, partClasses(chart))

export const ChartLegend = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderChartLegend<Msg, R>>[1],
) => RenderChartLegend<Msg, R>(h, options, partClasses(chart))

export const ChartTooltipContent = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderChartTooltipContent<Msg, R>>[1],
) => RenderChartTooltipContent<Msg, R>(h, options, partClasses(chart))

export const BarChart = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderBarChart<Msg>>[1],
) => RenderBarChart<Msg>(h, options, partClasses(chart))

export const AreaChart = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAreaChart<Msg>>[1],
) => RenderAreaChart<Msg>(h, options, partClasses(chart))

export const InteractiveAreaChart = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderInteractiveAreaChart<Msg>>[1],
) => RenderInteractiveAreaChart<Msg>(h, options, partClasses(chart))

export const DonutChart = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDonutChart<Msg>>[1],
) => RenderDonutChart<Msg>(h, options, partClasses(chart))

export const DataTable = <Row, Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDataTable<Row, Msg, R>>[1],
) => RenderDataTable<Row, Msg, R>(h, options, partClasses(dataTable))

export const DataGrid = <Row, Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderDataGrid<Row, Msg, R>>[1],
) =>
  RenderDataGrid<Row, Msg, R>(
    h,
    options,
    partClasses(dataGrid),
    partClasses(menu),
  )

export const Command = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCommand<Msg, R>>[1],
) => RenderCommand<Msg, R>(h, options, partClasses(command))

export const MultiSelector = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMultiSelector<Msg>>[1],
) => RenderMultiSelector<Msg>(h, options, partClasses(multiSelector))

export const ListInput = <T, Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderListInput<T, Msg, R>>[1],
) => RenderListInput<T, Msg, R>(h, options, partClasses(listInput))

export const Tokenizer = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTokenizer<Msg, R>>[1],
) => RenderTokenizer<Msg, R>(h, options, partClasses(tokenizer))

export const TransferList = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTransferList<Msg, R>>[1],
) => RenderTransferList<Msg, R>(h, options, partClasses(transferList))

export const TreeList = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTreeList<Msg, R>>[1],
) => RenderTreeList<Msg, R>(h, options, partClasses(treeList))

export const CommandPalette = Command

export const CodeBlock = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCodeBlock<Msg>>[1],
) => RenderCodeBlock<Msg>(h, options, partClasses(codeBlock))

export const Markdown = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMarkdown<Msg>>[1],
) => RenderMarkdown<Msg>(h, options, partClasses(markdown), CodeBlock)

export const OverflowList = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderOverflowList<Msg, R>>[1],
) => RenderOverflowList<Msg, R>(h, options, partClasses(overflowList))

export const Lightbox = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderLightbox<Msg, R>>[1],
) => RenderLightbox<Msg, R>(h, options, partClasses(lightbox))

export const Carousel = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderCarousel<Msg, R>>[1],
) => RenderCarousel(h, options, partClasses(carousel))

export const Resizable = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderResizable<Msg, R>>[1],
) => RenderResizable(h, options, partClasses(resizable))

export const ResizableGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderResizableGroup<Msg, R>>[1],
) => RenderResizableGroup(h, options, partClasses(resizable))

export const Stepper = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderStepper<Msg, R>>[1],
) => RenderStepper(h, options, partClasses(stepper))

export const ColorPicker = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderColorPicker<Msg>>[1],
) => RenderColorPicker(h, options, partClasses(colorPicker))

export const Sidebar = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderSidebar<Msg, R>>[1],
) => RenderSidebar(h, options, partClasses(sidebar))

export const Message = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMessage<Msg, R>>[1],
) => RenderMessage(h, options, partClasses(message))

export const MessageGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMessageGroup<Msg, R>>[1],
) => RenderMessageGroup(h, options, partClasses(message))

export const ChatReasoning = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderChatReasoning<Msg, R>>[1],
) => RenderChatReasoning(h, options, partClasses(chatReasoning))

export const MessageScroller = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMessageScroller<Msg, R>>[1],
) => RenderMessageScroller(h, options, partClasses(messageScroller))

export const LogStream = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderLogStream<Msg, R>>[1],
) => RenderLogStream(h, options, partClasses(logStream), MessageScroller)

export const Attachment = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAttachment<Msg, R>>[1],
) => RenderAttachment(h, options, partClasses(attachment))

export const AttachmentGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderAttachmentGroup<Msg, R>>[1],
) => RenderAttachmentGroup(h, options, partClasses(attachment))

export const SelectableCard = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderSelectableCard<Msg, R>>[1],
) => RenderSelectableCard(h, options, partClasses(selectableCard))

export const Timer = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTimer<Msg>>[1],
) => RenderTimer(h, options)

export const Timestamp = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTimestamp<Msg>>[1],
) => RenderTimestamp(h, options, partClasses(timestamp), HoverCard)

export const Banner = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderBanner<Msg, R>>[1],
) => RenderBanner(h, options, partClasses(banner))

export const ActionBar = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderActionBar<Msg, R>>[1],
) => RenderActionBar(h, options, partClasses(actionBar))

export const Menubar = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMenubar<Msg, R>>[1],
) => RenderMenubar(h, options, partClasses(menubar), partClasses(menu))

export const NavigationMenu = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderNavigationMenu<Msg, R>>[1],
) => RenderNavigationMenu(h, options, partClasses(navigationMenu))

export const MoreMenu = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMoreMenu<Msg, R>>[1],
) => RenderMoreMenu(h, options, Button, DropdownMenu)

export const MobileNav = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMobileNav<Msg, R>>[1],
) => RenderMobileNav(h, options, partClasses(drawer))

export const TopNav = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderTopNav<Msg, R>>[1],
) => RenderTopNav(h, options, partClasses(topNav), DropdownMenu, Popover)

export const Link = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderLink<Msg, R>>[1],
) => RenderLink(h, options, partClasses(link), Tooltip)

export const Pagination = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderPagination<Msg, R>>[1],
) => RenderPagination(h, options, partClasses(pagination))

export const Thumbnail = <Msg>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderThumbnail<Msg>>[1],
) => RenderThumbnail(h, options, partClasses(thumbnail))

export const HoverCard = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderHoverCard<Msg, R>>[1],
) => RenderHoverCard(h, options, partClasses(hoverCard))

export const InfoTip = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderInfoTip<Msg, R>>[1],
) => RenderInfoTip(h, options, partClasses(infoTip))

export const Item = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderItem<Msg, R>>[1],
) => RenderItem(h, options, partClasses(item))

export const ItemGroup = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderItemGroup<Msg, R>>[1],
) => RenderItemGroup(h, options, partClasses(item))

export const List = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderList<Msg, R>>[1],
) => RenderList(h, options, partClasses(list))

export const Marker = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMarker<Msg, R>>[1],
) => RenderMarker(h, options, partClasses(marker))

export const MetadataList = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderMetadataList<Msg, R>>[1],
) => RenderMetadataList(h, options, partClasses(metadataList))

export const FileInput = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderFileInput<Msg, R>>[1],
) => RenderFileInput(h, options, partClasses(fileInput))

export const Toast = <Msg, R = never>(
  h: Html.H<Msg>,
  options: Parameters<typeof RenderToast<Msg, R>>[1],
) => RenderToast(h, options, partClasses(toast))

export { PaginationItem, paginationItems } from '../ui/pagination'
