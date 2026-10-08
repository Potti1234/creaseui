import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as MapLibre from 'maplibre-gl'
import { mountMap } from '@/lib/map-runtime'
import type { MapMessage } from '@/lib/map-runtime'

const renderer = vi.hoisted(() => ({
  autoIdle: true,
  instances: [] as Array<{
    emit: (name: string) => void
    center: { lng: number; lat: number }
    zoom: number
    sources: Map<string, object>
    layers: Map<string, object>
    setStyle: ReturnType<typeof vi.fn>
    jumpTo: ReturnType<typeof vi.fn>
    zoomIn: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
  }>,
}))

vi.mock('maplibre-gl', () => ({
  GeoJSONSource: class {},
  Map: class {
    listeners = new Map<string, Array<() => void>>()
    center = { lng: 13.405, lat: 52.52 }
    zoom = 11
    sources = new Map<string, object>()
    layers = new Map<string, object>()
    setStyle = vi.fn(() => {
      this.sources.clear()
      this.layers.clear()
      queueMicrotask(() => {
        this.emit('style.load')
        if (renderer.autoIdle) this.emit('idle')
      })
    })
    jumpTo = vi.fn((viewport: { center: [number, number]; zoom: number }) => {
      this.center = { lng: viewport.center[0], lat: viewport.center[1] }
      this.zoom = viewport.zoom
      this.emit('moveend')
    })
    zoomIn = vi.fn(() => {
      this.zoom += 1
      this.emit('moveend')
    })
    remove = vi.fn()
    constructor() {
      renderer.instances.push(this)
      queueMicrotask(() => {
        this.emit('style.load')
        if (renderer.autoIdle) this.emit('idle')
      })
    }
    on(name: string, callback: () => void) {
      this.listeners.set(name, [...(this.listeners.get(name) ?? []), callback])
      return this
    }
    emit(name: string) {
      for (const callback of this.listeners.get(name) ?? []) callback()
    }
    isStyleLoaded() {
      return false
    }
    getCenter() {
      return this.center
    }
    getZoom() {
      return this.zoom
    }
    getBearing() {
      return 0
    }
    getPitch() {
      return 0
    }
    getCanvas() {
      return document.createElement('canvas')
    }
    project() {
      return { x: 100, y: 120 }
    }
    unproject(point: [number, number]) {
      return { lng: point[0] / 10, lat: point[1] / 10 }
    }
    resize() {}
    getLayer(id: string) {
      return this.layers.get(id)
    }
    addLayer(layer: { id: string }) {
      this.layers.set(layer.id, layer)
    }
    removeLayer(id: string) {
      this.layers.delete(id)
    }
    getSource(id: string) {
      return this.sources.get(id)
    }
    addSource(id: string, source: object) {
      this.sources.set(id, source)
    }
    removeSource(id: string) {
      this.sources.delete(id)
    }
  },
}))

const baseStyle = { version: 8, sources: {}, layers: [] }
let release: (() => void) | undefined
let root: HTMLDivElement
let messages: MapMessage[]

const mount = () => {
  release = mountMap(root, MapLibre, message => messages.push(message))
}
const settle = () => new Promise(resolve => setTimeout(resolve, 50))

beforeEach(() => {
  renderer.autoIdle = true
  renderer.instances.length = 0
  messages = []
  root = document.createElement('div')
  root.dataset.mapConfig = JSON.stringify({
    styles: { light: baseStyle, dark: baseStyle },
  })
  root.innerHTML =
    '<div data-slot="map-canvas"></div><div data-slot="map-status"><span data-slot="map-status-text"></span><button data-map-action="retry"></button></div><button data-map-action="zoom-in">+</button><button data-map-coordinate="[13.4,52.5]">Marker</button>'
  document.body.append(root)
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(JSON.stringify(baseStyle)))),
  )
})
afterEach(() => {
  release?.()
  release = undefined
  root.remove()
  vi.unstubAllGlobals()
})

describe('map host lifecycle and interactions', () => {
  it('keeps the loading state until the renderer has drawn its tiles', async () => {
    renderer.autoIdle = false
    mount()
    await settle()
    expect(root.dataset.mapState).toBe('loading')
    renderer.instances[0]!.emit('idle')
    expect(root.dataset.mapState).toBe('ready')
  })
  it('ignores readiness events from the old style while its replacement is fetching', async () => {
    mount()
    await settle()
    let resolveFetch: (response: Response) => void = () => {}
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise(resolve => {
        resolveFetch = resolve
      }),
    )
    root.dataset.mapConfig = JSON.stringify({
      styles: { light: 'https://example.test/replacement.json' },
    })
    await settle()
    renderer.instances[0]!.emit('style.load')
    renderer.instances[0]!.emit('idle')
    expect(root.dataset.mapState).toBe('loading')
    resolveFetch(new Response(JSON.stringify(baseStyle)))
    await settle()
    expect(root.dataset.mapState).toBe('ready')
  })
  it('inherits control and popup translations from the map and updates them with its language', async () => {
    const group = document.createElement('div')
    group.dataset.slot = 'map-controls'
    group.innerHTML = '<button data-map-action="zoom-in">+</button>'
    root.append(group)
    const popup = document.createElement('div')
    popup.dataset.slot = 'map-popup'
    popup.innerHTML = '<button data-slot="map-popup-close">×</button>'
    root.append(popup)
    root.dataset.mapConfig = JSON.stringify({
      styles: { light: baseStyle },
      language: 'de',
    })
    mount()
    await settle()
    expect(group.querySelector('button')!.getAttribute('aria-label')).toBe(
      'Vergrößern',
    )
    expect(popup.querySelector('button')!.getAttribute('aria-label')).toBe(
      'Popup schließen',
    )
    root.dataset.mapConfig = JSON.stringify({
      styles: { light: baseStyle },
      language: 'fr',
    })
    await settle()
    expect(group.querySelector('button')!.getAttribute('aria-label')).toBe(
      'Zoom avant',
    )
    expect(group.getAttribute('aria-label')).toBe('Commandes de la carte')
    expect(popup.querySelector('button')!.getAttribute('aria-label')).toBe(
      'Fermer la fenêtre',
    )
  })
  it('refreshes the palette when scoped CSS tokens change on the map root', async () => {
    const style = {
      ...baseStyle,
      layers: [{ id: 'water', type: 'fill', source: 'base' }],
    }
    root.dataset.mapConfig = JSON.stringify({
      styles: { light: style },
      themed: true,
    })
    mount()
    await settle()
    root.style.setProperty('--map-water', '#123456')
    await settle()
    const applied = renderer.instances[0]!.setStyle.mock.calls[0]![0]
    expect(applied.layers[0].paint['fill-color']).toBe('#123456')
  })
  it('allows a focused draggable marker to move with arrow keys', async () => {
    const marker = root.querySelector<HTMLButtonElement>(
      '[data-map-coordinate]',
    )!
    marker.dataset.mapDraggable = 'true'
    marker.dataset.mapMarkerId = 'gate'
    mount()
    await settle()
    marker.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    )
    expect(marker.dataset.mapCoordinate).toBe('[10.5,12]')
    expect(messages).toContainEqual(
      expect.objectContaining({
        _tag: 'MapMarkerDragged',
        id: 'gate',
        longitude: 10.5,
      }),
    )
  })
  it('loads the map, projects real overlay nodes, and reports control changes', async () => {
    mount()
    await settle()
    expect(root.dataset.mapState).toBe('ready')
    expect(
      root.querySelector<HTMLElement>('[data-slot="map-status"]')!.hidden,
    ).toBe(true)
    expect(
      root.querySelector<HTMLElement>('[data-map-coordinate]')!.style.left,
    ).toBe('100px')
    root
      .querySelector<HTMLButtonElement>('[data-map-action="zoom-in"]')!
      .click()
    expect(renderer.instances[0]!.zoomIn).toHaveBeenCalledOnce()
    expect(messages).toContainEqual(
      expect.objectContaining({ _tag: 'MapViewportChanged', zoom: 12 }),
    )
  })
  it('restores layers after language/style changes without replacing the map', async () => {
    const layer = document.createElement('div')
    layer.dataset.mapLayer = JSON.stringify({
      id: 'route',
      source: {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      },
      layers: [{ id: 'route-line', type: 'line', source: 'route' }],
    })
    root.append(layer)
    mount()
    await settle()
    const map = renderer.instances[0]!
    expect(map.layers.has('route-line')).toBe(true)
    root.dataset.mapConfig = JSON.stringify({
      styles: { light: baseStyle },
      language: 'de',
    })
    await settle()
    expect(renderer.instances).toHaveLength(1)
    expect(map.setStyle).toHaveBeenCalledOnce()
    expect(map.layers.has('route-line')).toBe(true)
    layer.remove()
    await settle()
    expect(map.sources.size).toBe(0)
    expect(map.layers.size).toBe(0)
  })
  it('applies a controlled viewport once and avoids a feedback loop', async () => {
    mount()
    await settle()
    const viewport = { center: [2.35, 48.85], zoom: 9, bearing: 0, pitch: 0 }
    root.dataset.mapConfig = JSON.stringify({
      styles: { light: baseStyle },
      viewport,
    })
    await settle()
    expect(renderer.instances[0]!.jumpTo).toHaveBeenCalledOnce()
    root.dataset.mapConfig = JSON.stringify({
      styles: { light: baseStyle },
      viewport,
      language: 'de',
    })
    await settle()
    expect(renderer.instances[0]!.jumpTo).toHaveBeenCalledOnce()
  })
  it('shows a localized retry after a failed style request and recovers', async () => {
    root.dataset.mapConfig = JSON.stringify({
      styles: { light: 'https://example.test/style.json' },
      language: 'de',
    })
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 503 }))
    mount()
    await settle()
    expect(root.dataset.mapState).toBe('error')
    expect(
      root.querySelector('[data-slot="map-status-text"]')!.textContent,
    ).toBe('Die Karte konnte nicht geladen werden.')
    expect(messages).toContainEqual(
      expect.objectContaining({ _tag: 'MapFailed' }),
    )
    root.querySelector<HTMLButtonElement>('[data-map-action="retry"]')!.click()
    await settle()
    expect(root.dataset.mapState).toBe('ready')
  })
  it('releases the renderer and prevents further control and observer effects', async () => {
    mount()
    await settle()
    const map = renderer.instances[0]!
    release!()
    release = undefined
    root
      .querySelector<HTMLButtonElement>('[data-map-action="zoom-in"]')!
      .click()
    root.dataset.mapConfig = JSON.stringify({ language: 'de' })
    await settle()
    expect(map.remove).toHaveBeenCalledOnce()
    expect(map.zoomIn).not.toHaveBeenCalled()
    expect(map.setStyle).not.toHaveBeenCalled()
  })
  it('aborts a pending style fetch and ignores its late response after unmount', async () => {
    let resolveFetch: (response: Response) => void = () => {}
    const pending = new Promise<Response>(resolve => {
      resolveFetch = resolve
    })
    vi.mocked(fetch).mockReturnValueOnce(pending)
    root.dataset.mapConfig = JSON.stringify({
      styles: { light: 'https://example.test/style.json' },
    })
    mount()
    const signal = vi.mocked(fetch).mock.calls[0]![1]!.signal!
    release!()
    release = undefined
    expect(signal.aborted).toBe(true)
    resolveFetch(new Response(JSON.stringify(baseStyle)))
    await settle()
    expect(renderer.instances).toHaveLength(0)
  })
})
