import { Effect, Queue, Schema, Stream } from 'effect'
import * as Mount from 'foldkit/mount'
import { defineMessageUnion } from 'foldkit/message'

export const Platform = Schema.Literals(['apple', 'other'])

export type Platform = typeof Platform.Type

export const currentPlatform = (): Platform =>
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/u.test(navigator.platform || navigator.userAgent)
    ? 'apple'
    : 'other'

const keyNames: Readonly<Record<string, string>> = {
  alt: 'Alt',
  option: 'Alt',
  opt: 'Alt',
  shift: 'Shift',
  ctrl: 'Control',
  control: 'Control',
  cmd: 'Meta',
  command: 'Meta',
  meta: 'Meta',
  backspace: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  enter: 'Enter',
  return: 'Enter',
  escape: 'Escape',
  esc: 'Escape',
  tab: 'Tab',
  space: 'Space',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
}

export const toAriaKeyshortcuts = (keys: string, platform: Platform): string =>
  keys
    .split('+')
    .map(key =>
      key.toLowerCase() === 'mod'
        ? platform === 'apple'
          ? 'Meta'
          : 'Control'
        : (keyNames[key.toLowerCase()] ??
          (key.length === 1
            ? key.toUpperCase()
            : key.charAt(0).toUpperCase() + key.slice(1))),
    )
    .join('+')

const glyphs: Readonly<Record<string, string>> = {
  Meta: '⌘',
  Control: '⌃',
  Alt: '⌥',
  Shift: '⇧',
  Backspace: '⌫',
  Delete: '⌦',
  Enter: '↩',
  Escape: '⎋',
  Tab: '⇥',
  Space: '␣',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  PageUp: '⇞',
  PageDown: '⇟',
  Home: '↖',
  End: '↘',
}

const names: Readonly<Record<string, string>> = {
  Control: 'Ctrl',
  Delete: 'Del',
  Escape: 'Esc',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
}

export const formatShortcut = (keys: string, platform: Platform): string =>
  `\u2066${toAriaKeyshortcuts(keys, platform)
    .split('+')
    .map(key => (platform === 'apple' ? glyphs[key] : names[key]) ?? key)
    .join(platform === 'apple' ? '' : '+')}\u2069`

export type ShortcutEvent = Readonly<{
  key: string
  code: string
  metaKey: boolean
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
}>

export const matchesShortcut = (
  event: ShortcutEvent,
  keys: string,
  platform: Platform,
): boolean => {
  const parts = toAriaKeyshortcuts(keys, platform).split('+')
  const key = parts.at(-1) ?? ''
  const typed = event.key.toLowerCase()
  const matches =
    key === 'Space'
      ? typed === ' '
      : typed === key.toLowerCase() ||
        (/^[A-Z0-9]$/u.test(key) &&
          !/^[a-z0-9]$/u.test(typed) &&
          event.code === (/\d/u.test(key) ? `Digit${key}` : `Key${key}`))
  return (
    matches &&
    event.metaKey === parts.includes('Meta') &&
    event.ctrlKey === parts.includes('Control') &&
    event.altKey === parts.includes('Alt') &&
    event.shiftKey === parts.includes('Shift')
  )
}

export const hasCommandModifier = (keys: string): boolean =>
  /(^|\+)(Meta|Control|Alt)(\+|$)/u.test(toAriaKeyshortcuts(keys, 'apple'))

export type TypingTarget = Readonly<{
  tagName?: string
  type?: string
  isContentEditable?: boolean
}>

export const isTypingTarget = (
  target: TypingTarget | null | undefined,
): boolean => {
  if (!target?.tagName) return false
  if (
    target.isContentEditable ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  )
    return true
  return (
    target.tagName === 'INPUT' &&
    !/^(button|checkbox|radio|submit|reset|range|color|file|image)$/u.test(
      target.type ?? '',
    )
  )
}

export type Binding = Readonly<{
  keys: string
  allowInInput?: boolean
  isEnabled?: () => boolean
}>

export const resolveShortcut = <Entry extends Binding>(
  bindings: ReadonlyArray<Entry>,
  event: ShortcutEvent,
  context: Readonly<{ platform: Platform; target?: TypingTarget | null }>,
): Entry | undefined =>
  [...bindings]
    .reverse()
    .find(
      binding =>
        matchesShortcut(event, binding.keys, context.platform) &&
        (!isTypingTarget(context.target) ||
          binding.allowInInput === true ||
          hasCommandModifier(binding.keys)) &&
        (binding.isEnabled?.() ?? true),
    )

export const Message = defineMessageUnion({
  PressedShortcut: { keys: Schema.String },
})

export type Message = typeof Message.Type

export const ListenShortcuts = Mount.defineStream('ListenShortcuts', {
  args: { keys: Schema.Array(Schema.String) },
  messages: [Message.PressedShortcut],
  execute: ({ keys }) =>
    Stream.callback<typeof Message.PressedShortcut.Type>(queue =>
      Effect.acquireRelease(
        Effect.sync(() => {
          if (typeof document === 'undefined') return undefined
          const listener = (event: KeyboardEvent): void => {
            if (event.repeat || event.isComposing || event.defaultPrevented)
              return
            const target = event.composedPath()[0]
            const binding = resolveShortcut(
              keys.map(key => ({ keys: key })),
              event,
              {
                platform: currentPlatform(),
                target: target instanceof HTMLElement ? target : null,
              },
            )
            if (!binding) return
            event.preventDefault()
            Queue.offerUnsafe(
              queue,
              Message.PressedShortcut({ keys: binding.keys }),
            )
          }
          document.addEventListener('keydown', listener)
          return listener
        }),
        listener =>
          Effect.sync(() => {
            if (listener) document.removeEventListener('keydown', listener)
          }),
      ).pipe(Effect.asVoid),
    ),
})
