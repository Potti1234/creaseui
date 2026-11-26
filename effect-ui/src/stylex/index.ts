import type { Html } from '@effect/ui/html'
import * as stylex from '@stylexjs/stylex'

import { Accordion as RenderAccordion } from '../ui/accordion'
import {
  Button as RenderButton,
  ButtonLink as RenderButtonLink,
} from '../ui/button'
import { Calendar as RenderCalendar } from '../ui/calendar'
import { Checkbox as RenderCheckbox } from '../ui/checkbox'
import { Combobox as RenderCombobox } from '../ui/combobox'
import { Dialog as RenderDialog } from '../ui/dialog'
import { Popover as RenderPopover } from '../ui/popover'
import { Select as RenderSelect } from '../ui/select'
import { Switch as RenderSwitch } from '../ui/switch'
import { Tabs as RenderTabs } from '../ui/tabs'
import { Tooltip as RenderTooltip } from '../ui/tooltip'
import { Collapsible as RenderCollapsible } from '../ui/collapsible'
import { Progress as RenderProgress } from '../ui/progress'
import { Separator as RenderSeparator } from '../ui/separator'
import { Toggle as RenderToggle } from '../ui/toggle'
import {
  accordion,
  buttonSizes,
  buttonVariants,
  calendar,
  checkbox,
  choiceField,
  combobox,
  controls,
  dialog,
  popover,
  select,
  switchControl,
  tabs,
  tooltip,
  collapsible,
  progress,
  separator,
  toggle,
} from './styles.stylex'

const buttonClasses: NonNullable<Parameters<typeof RenderButton>[2]> = (
  { variant, size },
  disabled,
) =>
  stylex.props(
    controls.box,
    controls.button,
    buttonVariants[variant],
    buttonSizes[size],
    disabled && controls.disabled,
  ).className ?? ''

const partClasses = <Part extends string>(
  parts: Record<Part, stylex.StaticStyles>,
): Record<Part, string> =>
  Object.fromEntries(
    Object.entries<stylex.StaticStyles>(parts).map(([part, style]) => [
      part,
      stylex.props(controls.box, style).className ?? '',
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
