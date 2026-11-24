import type * as DisclosureModule from '@/lib/disclosure'

type Disclosure = typeof DisclosureModule

/** Scene requires a result for each mount. The panel observer emits no messages. */
export const mockDisclosureMount = async (
  importOriginal: () => Promise<Disclosure>,
): Promise<Disclosure> => {
  const disclosure = await importOriginal()
  const view: Disclosure['view'] = (config, h) =>
    disclosure.view(config, {
      ...h,
      div: (attributes, children) =>
        h.div(
          attributes.filter(
            attribute =>
              !('_tag' in attribute) ||
              attribute._tag !== 'OnMount' ||
              attribute.action.name !== 'ObserveDisclosurePanel',
          ),
          children,
        ),
    })
  return { ...disclosure, view }
}
