import * as stylex from '@stylexjs/stylex'
import type { Html, HtmlBuilder } from 'foldkit/html'

import { Input as InputPrimitive } from '@foldkit/ui'

import type { ComponentLayoutStyle } from './contracts'
import { className } from './style'
import { tokens } from './tokens.stylex'
import { interactionTokens } from './interaction-tokens.stylex.const'

const styles = stylex.create({
  field: {
    gap: '0.5rem',
    display: 'grid',
  },
  label: {
    gap: '0.5rem',
    alignItems: 'center',
    display: 'flex',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1,
  },
  input: {
    borderColor: {
      default: tokens.input,
      ':focus-visible': tokens.ring,
    },
    borderRadius: tokens.controlRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    paddingBlock: '0.25rem',
    paddingInline: '0.625rem',
    backgroundColor: tokens.inputSurface,
    boxShadow: {
      default: tokens.shadowSm,
      ':focus-visible': tokens.focusRingShadow,
    },
    color: tokens.foreground,
    display: 'flex',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    outlineStyle: 'none',
    transitionDuration: interactionTokens.motionFast,
    transitionProperty: 'color, border-color, box-shadow',
    height: '2rem',
    minWidth: 0,
    width: '100%',
    '::placeholder': { color: tokens.mutedForeground },
  },
  disabled: { cursor: interactionTokens.cursorDisabled, opacity: 0.5, pointerEvents: 'none' },
  invalid: {
    borderColor: tokens.destructive,
    boxShadow: tokens.destructiveRingShadow,
  },
  description: {
    color: tokens.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

export type InputProps<Msg> = Readonly<{
  id: string
  value: string
  onInput: (value: string) => Msg
  label?: string
  description?: string
  placeholder?: string
  type?: string
  name?: string
  isDisabled?: boolean
  isInvalid?: boolean
  describedBy?: string
  /** Parent-layout positioning only. Add visual choices as named variants. */
  layoutStyle?: ComponentLayoutStyle
}>

export const input = <Msg>(props: InputProps<Msg>, h: HtmlBuilder<Msg>): Html =>
  InputPrimitive.view(
    {
      id: props.id,
      value: props.value,
      onInput: props.onInput,
      isDisabled: props.isDisabled ?? false,
      isInvalid: props.isInvalid ?? false,
      type: props.type ?? 'text',
      ...(props.name === undefined ? {} : { name: props.name }),
      ...(props.placeholder === undefined ? {} : { placeholder: props.placeholder }),
      toView: ({ input: inputAttributes, label, description }) => {
        const control = h.input([
          ...inputAttributes,
          ...(props.describedBy === undefined
            ? []
            : [h.AriaDescribedBy(props.describedBy)]),
          h.Class(
            className(
              styles.input,
              props.isDisabled && styles.disabled,
              props.isInvalid && styles.invalid,
              props.layoutStyle,
            ),
          ),
        ])

        if (props.label === undefined && props.description === undefined) return control

        return h.div(
          [h.Class(className(styles.field))],
          [
            ...(props.label === undefined
              ? []
              : [h.label([...label, h.Class(className(styles.label))], [props.label])]),
            control,
            ...(props.description === undefined
              ? []
              : [h.p([...description, h.Class(className(styles.description))], [props.description])]),
          ],
        )
      },
    },
    h,
  )


