import type { Html } from '@effect/ui/html'
import { Style } from '@pleat/core'

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
import { Tooltip as RenderTooltip } from '../ui/tooltip'
import {
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
  tooltip,
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
