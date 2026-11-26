import type { Html } from '@effect/ui/html'
import { Style } from '@pleat/core'

import { Accordion as RenderAccordion } from '../ui/accordion'
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
import { Calendar as RenderCalendar } from '../ui/calendar'
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
