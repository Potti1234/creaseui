import { readFile, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { readdir } from 'node:fs/promises'

const roots = ['src', 'docs', 'brand']
const rootFiles = ['README.md', 'CONTRIBUTING.md']
const textExtensions = new Set(['.ts', '.md', '.json', '.css', '.html', '.svg'])
const suspicious = /(?:Ã.|Â.|â.|ð.|Ø.|Ù.|ï.)/u

const windows1252 = new Map([
  ['€', 0x80], ['‚', 0x82], ['ƒ', 0x83], ['„', 0x84], ['…', 0x85],
  ['†', 0x86], ['‡', 0x87], ['ˆ', 0x88], ['‰', 0x89], ['Š', 0x8a],
  ['‹', 0x8b], ['Œ', 0x8c], ['Ž', 0x8e], ['‘', 0x91], ['’', 0x92],
  ['“', 0x93], ['”', 0x94], ['•', 0x95], ['–', 0x96], ['—', 0x97],
  ['˜', 0x98], ['™', 0x99], ['š', 0x9a], ['›', 0x9b], ['œ', 0x9c],
  ['ž', 0x9e], ['Ÿ', 0x9f],
])

const encodeWindows1252 = (value) => {
  const bytes = []
  for (const character of value) {
    const codePoint = character.codePointAt(0)
    if (codePoint <= 0xff) bytes.push(codePoint)
    else if (windows1252.has(character)) bytes.push(windows1252.get(character))
    else return undefined
  }
  return Buffer.from(bytes)
}

const repairLine = (line) => {
  if (!suspicious.test(line)) return line
  const bytes = encodeWindows1252(line)
  if (bytes === undefined) return line
  const repaired = bytes.toString('utf8')
  if (repaired.includes('\uFFFD')) return line
  return suspicious.test(repaired) ? line : repaired
}

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else if (textExtensions.has(extname(entry.name))) files.push(path)
  }
  return files
}

const files = [
  ...rootFiles,
  ...(await Promise.all(roots.map(walk))).flat(),
]
const write = process.argv.includes('--write')
const failures = []

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const repaired = source
    .split(/(?<=\n)/u)
    .map(repairLine)
    .join('')

  if (repaired === source) continue
  if (write) await writeFile(file, repaired, 'utf8')
  else failures.push(file)
}

if (failures.length > 0) {
  console.error('Mojibake-like UTF-8 text found in:')
  for (const file of failures) console.error(`- ${file}`)
  console.error('Run `npm run docs:encoding:fix` and review the changes.')
  process.exitCode = 1
} else if (write) {
  console.log('Documentation text normalized to UTF-8.')
} else {
  console.log('Documentation encoding check passed.')
}
