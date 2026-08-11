import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import {
  parsePresetInput,
  presetManifest,
  presetRegistryJson,
} from '../src/demo/create-preset.ts'

const option = (name: string): string | undefined => {
  const index = process.argv.indexOf(name)
  return index < 0 ? undefined : process.argv[index + 1]
}

const input = option('--preset') ?? process.argv.find(argument => /^[ab][0-9A-Za-z]+$/u.test(argument))
if (!input) throw new Error('Pass --preset <code> from the Create page.')
const config = parsePresetInput(input)
if (!config) throw new Error(`Invalid preset: ${input}`)

const manifest = presetManifest(config)
const output = resolve(option('--output') ?? `.registry/presets/${manifest.preset}`)
await mkdir(output, { recursive: true })
await Promise.all([
  writeFile(resolve(output, 'registry-item.json'), presetRegistryJson(config), 'utf8'),
  ...manifest.files.map(file =>
    writeFile(resolve(output, file.target.split('/').at(-1) ?? 'preset.txt'), file.content, 'utf8'),
  ),
])

console.log(`Materialized ${manifest.preset} in ${output}`)
