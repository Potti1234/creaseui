import type { Html } from '@effect/ui/html'
import { Style } from '@pleat/core'

import { Accordion as RenderAccordion } from '../ui/accordion'
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
) => RenderNumberInput(h, options, partClasses(numberInput))

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
