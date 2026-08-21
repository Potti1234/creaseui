import { readFile, writeFile } from 'node:fs/promises'
import ts from 'typescript'

const definitionsPaths = [
  'src/docs/components/definitions/a-to-command.ts',
  'src/docs/components/definitions/context-to-pagination.ts',
  'src/docs/components/definitions/popover-to-typography.ts',
]
const previewsPath = 'src/docs/components/real-previews.ts'
const outputPath = 'src/docs/components/generated-example-sources.ts'

const sourceFile = async (path) => ts.createSourceFile(
  path,
  await readFile(path, 'utf8'),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
)

const propertyName = (node) => {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text
  return undefined
}

const variableObject = (file, ...names) => {
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !names.includes(declaration.name.text)) continue
      if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
        return declaration.initializer
      }
    }
  }
  throw new Error(`Could not find object variable ${names.join(' or ')} in ${file.fileName}`)
}

const objectProperty = (object, name) => object.properties.find(property =>
  ts.isPropertyAssignment(property) && propertyName(property.name) === name,
)

const literalText = (node) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  return undefined
}

const slugForNamespace = (namespace) => namespace
  .replaceAll(/([a-z0-9])([A-Z])/g, '$1-$2')
  .toLowerCase()

const definitionFiles = await Promise.all(definitionsPaths.map(sourceFile))
const previews = await sourceFile(previewsPath)
const previewObject = variableObject(previews, 'previews')
const previewSources = new Map()

for (const property of previewObject.properties) {
  if (!ts.isPropertyAssignment(property)) continue
  const slug = propertyName(property.name)
  if (slug) previewSources.set(slug, property.initializer.getText(previews))
}

const generated = {}
const unsupported = []

for (const definitions of definitionFiles) {
  const rawDefinitions = variableObject(definitions, 'definitions', 'rawDefinitions')

  for (const componentProperty of rawDefinitions.properties) {
    if (!ts.isPropertyAssignment(componentProperty)) continue
    const slug = propertyName(componentProperty.name)
    if (!slug || !ts.isObjectLiteralExpression(componentProperty.initializer)) continue
    const examplesProperty = objectProperty(componentProperty.initializer, 'examples')
    if (!examplesProperty || !ts.isArrayLiteralExpression(examplesProperty.initializer)) continue

    for (const expression of examplesProperty.initializer.elements) {
      if (ts.isSpreadElement(expression)) {
        // Shared menu examples provide explicit `code` strings at runtime and
        // therefore never depend on function source serialization.
        if (
          ts.isCallExpression(expression.expression) &&
          ts.isIdentifier(expression.expression.expression) &&
          expression.expression.expression.text === 'menuExamples'
        ) continue
      }

      let title
      let namespace
      let previewSource

      if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
        const helper = expression.expression.text
        if (helper === 'basic') {
          title = 'Basic'
          const authoredCode = literalText(expression.arguments[1])
          // The early definitions pass a component namespace here, while the
          // later definitions pass the actual source snippet. Never interpret
          // arbitrary code as an import identifier.
          if (authoredCode && /^[A-Z][A-Za-z0-9]*$/.test(authoredCode)) {
            namespace = authoredCode
            previewSource = previewSources.get(slug)
          } else {
            previewSource = authoredCode
          }
        } else if (helper === 'staticExample' || helper === 'statefulExample') {
          title = literalText(expression.arguments[0])
          namespace = literalText(expression.arguments[1])
          previewSource = expression.arguments[2]?.getText(definitions)
        }
      } else if (ts.isObjectLiteralExpression(expression)) {
        const titleProperty = objectProperty(expression, 'title')
        const codeProperty = objectProperty(expression, 'code')
        title = titleProperty ? literalText(titleProperty.initializer) : undefined
        previewSource = codeProperty ? literalText(codeProperty.initializer) : undefined
      }

      if (!title || !previewSource) {
        unsupported.push(`${slug}: ${expression.getText(definitions).slice(0, 80)}`)
        continue
      }

      const imports = namespace
        ? `import * as ${namespace} from '@/ui/${slugForNamespace(namespace)}'\n\n`
        : ''
      generated[`${slug}/${title}`] = `${imports}const preview = ${previewSource}\n`
    }
  }
}

if (unsupported.length > 0) {
  throw new Error(`Unsupported documentation examples:\n${unsupported.join('\n')}`)
}

const output = `/* This file is generated by scripts/generate-doc-example-sources.mjs.\n` +
  ` * It preserves readable source through production minification. */\n\n` +
  `export const generatedExampleSources: Readonly<Record<string, string>> = ${JSON.stringify(generated, null, 2)};\n`

if (process.argv.includes('--write')) {
  await writeFile(outputPath, output, 'utf8')
  console.log(`Generated ${Object.keys(generated).length} stable documentation sources.`)
} else {
  const current = await readFile(outputPath, 'utf8').catch(() => '')
  if (current !== output) {
    console.error(`Generated documentation sources are stale. Run npm run docs:sources:generate.`)
    process.exitCode = 1
  } else {
    console.log(`Documentation source check passed (${Object.keys(generated).length} examples).`)
  }
}
