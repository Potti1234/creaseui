import { Runtime } from 'foldkit'
import * as Catalog from '@/docs/components/catalog'
import { renderer } from '@/site/config'

const params = new URLSearchParams(location.search)
const slug = params.get('component')
const index = Number(params.get('example'))
const container = document.getElementById('root')
const dark = matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.classList.toggle('dark', dark)

const start = async (component: string) => {
  if (renderer === 'pleat') await import('@/docs/components/pleat-integration')
  if (renderer === 'stylex')
    await import('@/docs/components/stylex-integration')
  Runtime.run(
    Runtime.makeElement({
      Model: Catalog.Model,
      init: () => ({ model: Catalog.init(component) }),
      update: Catalog.update,
      view: (model, h) => Catalog.view(model, component, dark, h, index),
      subscriptions: Catalog.exampleSubscriptions(component, index),
      container,
      devTools: false,
    }),
  )
}

const startHistory = async () => {
  const Demo = await import('@/docs/behavior-demo')
  const Site = await import('@/docs/getting-started-view')
  Runtime.run(
    Runtime.makeElement({
      Model: Demo.Model,
      init: () => ({ model: Demo.init() }),
      update: Demo.update,
      view: (model, h) => Site.behaviorDemo(model, message => message, h),
      container,
      devTools: false,
    }),
  )
}

if (params.get('demo') === 'history') {
  void startHistory()
} else if (
  slug &&
  Catalog.hasDedicatedDefinition(slug) &&
  Number.isSafeInteger(index) &&
  index >= 0
) {
  void start(slug)
} else if (container) {
  container.textContent = 'Choose an example from the behavior reference.'
}
