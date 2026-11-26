import type { Html } from '@effect/ui/html'
import * as stylex from '@stylexjs/stylex'

import {
  Button as RenderButton,
  ButtonLink as RenderButtonLink,
} from '../ui/button'
import { Calendar as RenderCalendar } from '../ui/calendar'
import { Combobox as RenderCombobox } from '../ui/combobox'
import { Dialog as RenderDialog } from '../ui/dialog'
import {
  buttonSizes,
  buttonVariants,
  calendar,
  combobox,
  controls,
  dialog,
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
