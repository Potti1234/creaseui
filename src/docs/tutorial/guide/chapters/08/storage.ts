import * as KeyValueStore from 'effect/unstable/persistence/KeyValueStore'

/* The essay's stand-in for localStorage: an in-memory Storage that can be
   told to refuse writes, so a reader can watch a save fail. It is part of
   the essay's harness, not of the app; the app only sees a KeyValueStore. */

let failing = false
const entries = new Map<string, string>()

export const setStorageFailing = (value: boolean): void => {
  failing = value
}

const storage: Storage = {
  get length() {
    return entries.size
  },
  clear: () => entries.clear(),
  getItem: key => entries.get(key) ?? null,
  key: index => [...entries.keys()][index] ?? null,
  removeItem: key => {
    entries.delete(key)
  },
  setItem: (key, value) => {
    if (failing)
      throw new DOMException(
        'The quota has been exceeded.',
        'QuotaExceededError',
      )
    entries.set(key, value)
  },
}

export const essayStore = KeyValueStore.layerStorage(() => storage)
