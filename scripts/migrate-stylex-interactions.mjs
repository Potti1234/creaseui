import fs from 'node:fs'
import path from 'node:path'

const roots = [
  'src/stylex',
  'src/demo/stylex-cards',
  'src/demo/board-stylex.ts',
]

const files = roots.flatMap((root) => {
  const stat = fs.statSync(root)
  if (stat.isFile()) return [root]
  return fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
    .map((entry) => path.join(entry.parentPath, entry.name))
})

const replacements = new Map([
  [/(transitionDuration:\s*)['"]150ms['"]/g, '$1interactionTokens.motionFast'],
  [/(transitionDuration:\s*)['"]200ms['"]/g, '$1interactionTokens.motionModerate'],
  [/(transitionDuration:\s*)['"]300ms['"]/g, '$1interactionTokens.motionSlow'],
  [/(animationDuration:\s*)['"]1s['"]/g, '$1interactionTokens.motionLoopFast'],
  [/(animationDuration:\s*)['"]1\.5s['"]/g, '$1interactionTokens.motionLoopMedium'],
  [/(animationDuration:\s*)['"]2s['"]/g, '$1interactionTokens.motionLoopSlow'],
  [/(animationTimingFunction:\s*)['"]linear['"]/g, '$1interactionTokens.easingLinear'],
  [/(animationTimingFunction:\s*)['"]ease-in-out['"]/g, '$1interactionTokens.easingStandard'],
  [/(cursor:\s*)['"]pointer['"]/g, '$1interactionTokens.cursorAction'],
  [/(cursor:\s*)['"]default['"]/g, '$1interactionTokens.cursorDefault'],
  [/(cursor:\s*)['"]not-allowed['"]/g, '$1interactionTokens.cursorDisabled'],
  [/(cursor:\s*)['"]col-resize['"]/g, '$1interactionTokens.cursorResizeHorizontal'],
  [/(cursor:\s*)['"]row-resize['"]/g, '$1interactionTokens.cursorResizeVertical'],
  [/(cursor:\s*)['"]text['"]/g, '$1interactionTokens.cursorText'],
])

const importFor = (file) => {
  const normalized = file.replaceAll('\\', '/')
  if (normalized.startsWith('src/demo/stylex-cards/')) {
    return "import { interactionTokens } from '../../stylex/interaction-tokens.stylex.const'"
  }
  if (normalized === 'src/demo/board-stylex.ts') {
    return "import { interactionTokens } from '../stylex/interaction-tokens.stylex.const'"
  }
  return "import { interactionTokens } from './interaction-tokens.stylex.const'"
}

let changed = 0
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  let output = source
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement)
  }
  if (output === source) continue

  if (!output.includes("import { interactionTokens }")) {
    const lines = output.split(/\r?\n/u)
    const lastImport = lines.reduce(
      (last, line, index) => (line.startsWith('import ') ? index : last),
      0,
    )
    lines.splice(lastImport + 1, 0, importFor(file))
    output = `${lines.join('\n')}${source.endsWith('\n') ? '\n' : ''}`
  }

  fs.writeFileSync(file, output)
  changed += 1
}

console.log(JSON.stringify({ changedFiles: changed }))
