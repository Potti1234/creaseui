import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { StyleSpecification } from 'maplibre-gl'
import {
  createMapStyle,
  localizeMapLabel,
  MAP_PALETTES,
  mapTranslations,
} from '../src/lib/map-style.ts'
import { arcCoordinates } from '../src/lib/map-layers.ts'
import {
  COMPONENT_GROUPS,
  MAP_COMPONENTS,
} from '../src/docs/component-metadata.ts'

const base: StyleSpecification = {
  version: 8,
  sources: {
    basemap: {
      type: 'vector',
      tiles: ['https://example.test/{z}/{x}/{y}.pbf'],
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#ffffff' },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'basemap',
      'source-layer': 'water',
      paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.4 },
    },
    {
      id: 'highway_major_casing',
      type: 'line',
      source: 'basemap',
      'source-layer': 'transportation',
      paint: { 'line-color': '#ffffff', 'line-width': 2 },
    },
    {
      id: 'label_city',
      type: 'symbol',
      source: 'basemap',
      'source-layer': 'place',
      layout: {
        'text-field': [
          'case',
          ['has', 'name:nonlatin'],
          ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']],
          ['coalesce', ['get', 'name_en'], ['get', 'name']],
        ],
      },
    },
  ],
}

describe('map palettes and localization', () => {
  it('themes a copy while retaining source definitions and unrelated paint', () => {
    const snapshot = structuredClone(base)
    const result = createMapStyle(base, {
      palette: MAP_PALETTES.dark,
      language: 'de-DE',
    })
    assert.deepEqual(base, snapshot)
    assert.deepEqual(result.sources, base.sources)
    assert.equal(
      result.layers[0]?.type === 'background' &&
        result.layers[0].paint?.['background-color'],
      MAP_PALETTES.dark.bg,
    )
    const water = result.layers[1]!
    assert.equal(
      water.type === 'fill' && water.paint?.['fill-color'],
      MAP_PALETTES.dark.water,
    )
    assert.equal(water.type === 'fill' && water.paint?.['fill-opacity'], 0.4)
    const road = result.layers[2]!
    assert.equal(
      road.type === 'line' && road.paint?.['line-color'],
      MAP_PALETTES.dark.roadCasing,
    )
    const label = result.layers[3]!
    assert.deepEqual(
      label.type === 'symbol' && label.layout?.['text-field'],
      localizeMapLabel(['get', 'name'], 'de-DE'),
    )
  })
  it('preserves custom style colors unless theming is requested', () => {
    assert.deepEqual(createMapStyle(base), base)
    assert.deepEqual(createMapStyle(base, { language: 'native' }), base)
  })
  it('retains non-name fields and formatting while localizing names', () => {
    const name = localizeMapLabel(['get', 'name'], 'fr')
    assert.deepEqual(
      localizeMapLabel(
        ['concat', ['get', 'name_en'], ' (', ['get', 'ref'], ')'],
        'fr',
      ),
      ['concat', name, ' (', ['get', 'ref'], ')'],
    )
    assert.deepEqual(localizeMapLabel('{name} ({ref})', 'fr'), [
      'concat',
      name,
      ' (',
      ['to-string', ['get', 'ref']],
      ')',
    ])
    assert.deepEqual(localizeMapLabel(['literal', ['name']], 'fr'), [
      'literal',
      ['name'],
    ])
    assert.equal(localizeMapLabel('{ref}', 'fr'), '{ref}')
    assert.deepEqual(
      localizeMapLabel(['get', 'name_de'], 'de'),
      localizeMapLabel(['get', 'name:de'], 'de'),
    )
  })
  it('supports regional locale codes and product-specific translations', () => {
    assert.equal(mapTranslations('de-DE').zoomIn, 'Vergrößern')
    assert.equal(mapTranslations('fr-FR').close, 'Fermer la fenêtre')
    assert.equal(
      mapTranslations('ja', { loading: '読み込み中' }).loading,
      '読み込み中',
    )
    assert.equal(mapTranslations('ja').zoomIn, 'Zoom in')
  })
})

describe('map composition', () => {
  it('keeps all ten map pages together without duplicates in other groups', () => {
    assert.equal(MAP_COMPONENTS.length, 10)
    assert.deepEqual(
      COMPONENT_GROUPS.map(group => group.label),
      ['Components', 'Maps'],
    )
    assert.deepEqual(COMPONENT_GROUPS[1].components, MAP_COMPONENTS)
    assert.ok(
      COMPONENT_GROUPS[0].components.every(
        name => !MAP_COMPONENTS.some(map => map === name),
      ),
    )
    assert.ok(COMPONENT_GROUPS[0].components.includes('Markdown'))
  })
  it('keeps arc endpoints and takes the short path across the antimeridian', () => {
    const points = arcCoordinates({
      from: [179, 10],
      to: [-179, 12],
      samples: 8,
      curvature: 0,
    })
    assert.deepEqual(points[0], [179, 10])
    assert.deepEqual(points.at(-1), [181, 12])
    assert.equal(points.length, 9)
    assert.deepEqual(points[4], [180, 11])
  })
})
