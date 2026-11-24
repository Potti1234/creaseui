import type { HtmlBuilder } from 'foldkit/html'

export type EnterKeyHint =
  | 'enter'
  | 'done'
  | 'go'
  | 'next'
  | 'previous'
  | 'search'
  | 'send'

type Hints = Readonly<{
  mode: string
  autocomplete?: string
  capitalize?: string
  corrections?: boolean
  enter?: EnterKeyHint
}>

const patterns = {
  email: { mode: 'email', autocomplete: 'email' },
  url: { mode: 'url', autocomplete: 'url' },
  tel: { mode: 'tel', autocomplete: 'tel' },
  'one-time-code': { mode: 'numeric', autocomplete: 'one-time-code' },
  numeric: { mode: 'numeric', autocomplete: 'off' },
  decimal: { mode: 'decimal', autocomplete: 'off' },
  search: { mode: 'search', enter: 'search', autocomplete: 'off' },
  name: { mode: 'text', autocomplete: 'name', capitalize: 'words' },
  username: { mode: 'text', autocomplete: 'username' },
  'postal-code': {
    mode: 'text',
    autocomplete: 'postal-code',
    capitalize: 'characters',
  },
  'current-password': { mode: 'text', autocomplete: 'current-password' },
  'new-password': { mode: 'text', autocomplete: 'new-password' },
  message: {
    mode: 'text',
    capitalize: 'sentences',
    corrections: true,
    enter: 'send',
  },
} as const satisfies Readonly<Record<string, Hints>>

export type Kind = keyof typeof patterns

/** Build mobile keyboard, autofill and text correction hints for a field. */
export const attributes = <Msg>(
  kind: Kind,
  h: HtmlBuilder<Msg>,
  overrides: Readonly<{
    enter?: EnterKeyHint
    mode?: string
    autocomplete?: string
  }> = {},
) => {
  const hints: Hints = patterns[kind]
  const enter = overrides.enter ?? hints.enter
  const autocomplete = overrides.autocomplete ?? hints.autocomplete
  return [
    h.InputMode(overrides.mode ?? hints.mode),
    h.Autocapitalize(hints.capitalize ?? 'none'),
    h.Autocorrect(hints.corrections ? 'on' : 'off'),
    h.Spellcheck(hints.corrections ?? false),
    ...(enter === undefined ? [] : [h.EnterKeyHint(enter)]),
    ...(autocomplete === undefined ? [] : [h.Autocomplete(autocomplete)]),
  ]
}
