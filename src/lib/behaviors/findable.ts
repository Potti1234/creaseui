import { Stream } from 'effect'
import { inertHtml, type Attribute } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import * as Mount from 'foldkit/mount'

export const supportsHiddenUntilFound = (
  doc: Document | undefined = globalThis.document,
): boolean => {
  if (!doc) return false
  const element = doc.createElement('div')
  element.setAttribute('hidden', 'until-found')
  return element.hidden === 'until-found' && 'onbeforematch' in element
}

export const hiddenAttributes = (
  isOpen: boolean,
  isFindable: boolean,
): ReadonlyArray<Attribute<never>> =>
  isOpen ? [] : [inertHtml.Attribute('hidden', isFindable ? 'until-found' : '')]

const Message = defineMessageUnion({ Matched: {} })

const ObserveMatch = Mount.defineStream('ObserveFindMatch', {
  messages: [Message.Matched],
  execute: ({ element }) =>
    Stream.fromEventListener<Event>(element, 'beforematch').pipe(
      Stream.filter(event => event.target === element),
      Stream.map(() => Message.Matched()),
    ),
})

/** Lift the browser's native beforematch event into the parent Model. */
export const reveal = <Msg>(message: Msg): Attribute<Msg> => ({
  _tag: 'OnMount',
  action: Mount.mapMessage(ObserveMatch(), () => message),
})
