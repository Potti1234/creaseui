import * as stylex from '@stylexjs/stylex'

import { tokens } from './tokens.stylex'

/** Element defaults, applied before component recipes. No global reset needed. */
export const reset = stylex.create({
  button: {
    margin: 0,
    padding: 0,
    borderRadius: '0px',
    borderStyle: 'solid',
    borderWidth: 0,
    backgroundColor: tokens.transparent,
    color: 'inherit',
    fontFamily: 'inherit',
    fontFeatureSettings: 'inherit',
    fontSize: 'inherit',
    fontVariationSettings: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    lineHeight: 'inherit',
    textDecorationLine: 'none',
    textTransform: 'none',
  },
  input: {
    margin: 0,
    padding: 0,
    borderRadius: '0px',
    borderStyle: 'solid',
    borderWidth: 0,
    backgroundColor: tokens.transparent,
    color: 'inherit',
    fontFamily: 'inherit',
    fontFeatureSettings: 'inherit',
    fontSize: 'inherit',
    fontVariationSettings: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    lineHeight: 'inherit',
    '::placeholder': {
      color: tokens.controlPlaceholder,
      opacity: 1,
    },
  },
  list: { margin: 0, padding: 0, listStyleType: 'none' },
  link: { color: 'inherit', textDecorationLine: 'none' },
  text: { margin: 0, padding: 0, fontSize: 'inherit', fontWeight: 'inherit' },
  fieldset: { margin: 0, padding: 0, borderWidth: 0, minWidth: 0 },
})
