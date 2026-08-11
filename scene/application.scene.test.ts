import { Option } from 'effect'
import * as Scene from 'foldkit/scene'
import { fromString } from 'foldkit/url'
import { describe, it } from 'vitest'

import * as Landing from '@/demo/landing'
import * as Chart from '@/lib/echarts'
import { init, update, view } from '@/main'

const modelAt = (path: string) => {
  const url = Option.getOrThrow(fromString(`https://creaseui.com${path}`))
  const [model] = init({ isDark: false }, url)
  return model
}

describe('application scenes', () => {
  it('renders the landing route with accessible navigation and one heading', () => {
    Scene.scene(
      { update, view },
      Scene.given(modelAt('/')),
      Scene.expect(
        Scene.role('heading', {
          level: 1,
          name: 'Beautiful components for foldkit.',
        }),
      ).toExist(),
      Scene.expect(
        Scene.role('navigation', { name: 'Site navigation' }),
      ).toExist(),
      Scene.Mount.resolve(
        Chart.MountChart,
        Landing.GotChartMessage({
          message: Chart.ChartMounted({ hostId: 'landing-hero-chart' }),
        }),
      ),
    )
  })

  it('renders the blocks route through its real application view', () => {
    Scene.scene(
      { update, view },
      Scene.given(modelAt('/blocks/sidebar')),
      Scene.expect(
        Scene.role('heading', { level: 1, name: 'Sidebar Blocks' }),
      ).toExist(),
      Scene.expect(Scene.role('link', { name: 'Open' })).toExist(),
    )
  })
})
