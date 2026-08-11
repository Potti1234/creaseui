import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [name] = process.argv.slice(2)

if (name === undefined || !/^[a-z][a-z0-9-]*$/.test(name)) {
  process.stderr.write(
    'Usage: npm run component:create -- <lowercase-kebab-name>\n',
  )
  process.exit(1)
}

const target = join(process.cwd(), 'src', 'ui', `${name}.ts`)

if (existsSync(target)) {
  process.stderr.write(`${target} already exists.\n`)
  process.exit(1)
}

const exportName = name.replaceAll(/-([a-z])/g, (_, letter) =>
  letter.toUpperCase(),
)

writeFileSync(
  target,
  `import type { Html, HtmlBuilder } from 'foldkit/html'\n\nexport type ${exportName[0].toUpperCase() + exportName.slice(1)}Props = Readonly<{\n  children: ReadonlyArray<Html | string>\n  class?: string\n}>\n\nexport const ${exportName} = <Message>(\n  props: ${exportName[0].toUpperCase() + exportName.slice(1)}Props,\n  h: HtmlBuilder<Message>,\n): Html => h.div(\n  props.class === undefined ? [] : [h.Class(props.class)],\n  [...props.children],\n)\n`,
)

process.stdout.write(
  `Created ${target}. Add its docs definition, preview, capability entry, and tests before running npm run registry:generate.\n`,
)
