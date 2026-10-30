// @ts-nocheck: snapshot of creaseui-demo chapter-11:src/theme/mode.ts
import { Effect } from 'effect'

/** Switches the preset's dark token set (`.dark` in tokens.css) for the whole document. */
export const applyTheme = (isDark: boolean): Effect.Effect<void> =>
  Effect.sync(() => {
    document.documentElement.classList.toggle('dark', isDark)
  })
