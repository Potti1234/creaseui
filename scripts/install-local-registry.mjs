import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { isAbsolute, join, resolve } from 'node:path'

const root = process.cwd()
const [consumerArgument, ...requestedItems] = process.argv.slice(2)

if (consumerArgument === undefined || requestedItems.length === 0) {
  console.error('Usage: npm run registry:install-local -- <consumer-path> <item...>')
  process.exitCode = 1
  process.exit()
}

const consumer = isAbsolute(consumerArgument)
  ? consumerArgument
  : resolve(root, consumerArgument)
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const output = join(root, '.registry')

const run = (command, args, cwd) =>
  new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.once('error', reject)
    child.once('exit', code =>
      code === 0
        ? resolveRun()
        : reject(new Error(`${command} exited with code ${code ?? 'unknown'}`)),
    )
  })

await run(npx, ['--yes', 'shadcn@latest', 'build', 'registry.json', '--output', '.registry'], root)

const server = createServer((request, response) => {
  const name = request.url?.match(/^\/([a-z0-9-]+)\.json$/)?.[1]
  if (name === undefined) {
    response.writeHead(404).end()
    return
  }

  try {
    const item = JSON.parse(readFileSync(join(output, `${name}.json`), 'utf8'))
    item.registryDependencies = (item.registryDependencies ?? []).map(dependency => {
      const dependencyName = dependency.match(/\/([^/#]+)(?:#.*)?$/)?.[1]
      return dependencyName === undefined
        ? dependency
        : `http://127.0.0.1:${server.address().port}/${dependencyName}.json`
    })
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(item))
  } catch {
    response.writeHead(404).end()
  }
})

await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen))
const address = server.address()
if (address === null || typeof address === 'string') {
  server.close()
  throw new Error('Could not start the local registry server')
}

try {
  const urls = requestedItems.map(
    item => `http://127.0.0.1:${address.port}/${item}.json`,
  )
  await run(npx, ['--yes', 'shadcn@latest', 'add', ...urls, '--yes'], consumer)
  console.log(`Installed ${requestedItems.join(', ')} into ${consumer}`)
} finally {
  server.close()
}
