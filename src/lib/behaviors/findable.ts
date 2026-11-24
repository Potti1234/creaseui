import { Option } from 'effect'
import { inertHtml, type Attribute } from 'foldkit/html'

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

/** Lift the browser's beforematch event into the parent model. */
export const reveal = <Msg>(message: Msg): Attribute<Msg> => ({
  _tag: 'OnCustomEvent',
  name: 'beforematch',
  f: () => Option.some(message),
})
