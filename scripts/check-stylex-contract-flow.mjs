import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import ts from 'typescript'

const projectPath = resolve('tsconfig.json')
const configFile = ts.readConfigFile(projectPath, ts.sys.readFile)
if (configFile.error !== undefined) {
  throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
}

const parsed = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  resolve('.'),
  undefined,
  projectPath,
)
const program = ts.createProgram(parsed.fileNames, parsed.options)
const checker = program.getTypeChecker()
const componentNames = new Set(
  readdirSync('src/ui')
    .filter(file => file.endsWith('.ts'))
    .map(file => file.replace(/\.ts$/u, '')),
)

const isStyleContractName = name =>
  name === 'layoutStyle' || name.endsWith('LayoutStyle')

const sourceFiles = program
  .getSourceFiles()
  .filter(sourceFile => {
    const path = sourceFile.fileName.replaceAll('\\', '/')
    const fileName = path.slice(path.lastIndexOf('/') + 1).replace(/\.ts$/u, '')
    return path.includes('/src/stylex/') && componentNames.has(fileName)
  })

const location = (sourceFile, node) => {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
  return `${sourceFile.fileName.replaceAll('\\', '/')}:${position.line + 1}:${position.character + 1}`
}

const functionName = node => {
  if (node.name !== undefined && ts.isIdentifier(node.name)) return node.name.text
  if (
    (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
    ts.isVariableDeclaration(node.parent) &&
    ts.isIdentifier(node.parent.name)
  ) {
    return node.parent.name.text
  }
  return '<anonymous>'
}

const isExportedFunction = node => {
  if (ts.isFunctionDeclaration(node)) {
    return ts.getModifiers(node)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false
  }
  if (
    (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
    ts.isVariableDeclaration(node.parent)
  ) {
    const statement = node.parent.parent.parent
    return ts.isVariableStatement(statement) &&
      (ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false)
  }
  return false
}

const styleProperties = parameter => {
  const type = checker.getTypeAtLocation(parameter)
  return checker.getPropertiesOfType(type).filter(symbol => {
    if (!isStyleContractName(symbol.name)) return false
    return symbol.declarations?.some(declaration =>
      ts.isPropertySignature(declaration) &&
      declaration.type?.getText().includes('ComponentLayoutStyle'),
    ) ?? false
  })
}

const directCallArgument = (call, descendant) =>
  call.arguments.findIndex(argument =>
    descendant.getStart() >= argument.getStart() && descendant.getEnd() <= argument.getEnd(),
  )

const adapterCall = access => {
  let current = access.parent
  while (current !== undefined) {
    if (ts.isCallExpression(current)) {
      const called = current.expression
      if (ts.isIdentifier(called) && (called.text === 'className' || called.text === 'cn')) {
        return current
      }
    }
    if (ts.isFunctionLike(current)) return undefined
    current = current.parent
  }
  return undefined
}

const forwardedCall = (access, propertyName) => {
  let forwardedName = propertyName
  let current = access.parent
  while (current !== undefined) {
    if (ts.isPropertyAssignment(current)) {
      forwardedName = ts.isIdentifier(current.name) || ts.isStringLiteral(current.name)
        ? current.name.text
        : propertyName
    }
    if (ts.isCallExpression(current)) {
      const argumentIndex = directCallArgument(current, access)
      if (argumentIndex < 0) return undefined
      const signature = checker.getResolvedSignature(current)
      const targetParameter = signature?.parameters[argumentIndex]
      if (targetParameter === undefined) return undefined
      const declaration = targetParameter.valueDeclaration ?? targetParameter.declarations?.[0]
      if (declaration === undefined) return undefined
      const targetType = checker.getTypeOfSymbolAtLocation(targetParameter, declaration)
      const targetProperty = checker.getPropertyOfType(targetType, forwardedName)
      return targetProperty === undefined ? undefined : current
    }
    if (ts.isFunctionLike(current)) return undefined
    current = current.parent
  }
  return undefined
}

const wholeParameterForwarded = (body, parameter, propertyName) => {
  let forwarded = false
  const visit = node => {
    if (forwarded) return
    const isParameterReference = ts.isIdentifier(node) &&
      node.text === parameter.name.text &&
      node !== parameter.name
    if (isParameterReference) {
      let current = node.parent
      while (current !== undefined && !ts.isFunctionLike(current)) {
        if (ts.isCallExpression(current)) {
          const argumentIndex = directCallArgument(current, node)
          if (argumentIndex >= 0) {
            const signature = checker.getResolvedSignature(current)
            const targetParameter = signature?.parameters[argumentIndex]
            const declaration = targetParameter?.valueDeclaration ?? targetParameter?.declarations?.[0]
            if (targetParameter !== undefined && declaration !== undefined) {
              const targetType = checker.getTypeOfSymbolAtLocation(targetParameter, declaration)
              if (checker.getPropertyOfType(targetType, propertyName) !== undefined) {
                forwarded = true
                return
              }
            }
          }
        }
        current = current.parent
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(body)
  return forwarded
}

const errors = []
let checkedFunctions = 0
let checkedProperties = 0
let materializedProperties = 0
let forwardedProperties = 0

for (const sourceFile of sourceFiles) {
  const visit = node => {
    if (!ts.isFunctionLike(node) || node.body === undefined || !isExportedFunction(node)) {
      ts.forEachChild(node, visit)
      return
    }

    for (const parameter of node.parameters) {
      if (!ts.isIdentifier(parameter.name)) continue
      const properties = styleProperties(parameter)
      if (properties.length === 0) continue
      checkedFunctions += 1

      for (const property of properties) {
        checkedProperties += 1
        const accesses = []
        const findAccesses = candidate => {
          if (
            ts.isPropertyAccessExpression(candidate) &&
            ts.isIdentifier(candidate.expression) &&
            candidate.expression.text === parameter.name.text &&
            candidate.name.text === property.name
          ) {
            accesses.push(candidate)
          }
          ts.forEachChild(candidate, findAccesses)
        }
        findAccesses(node.body)

        const materialized = accesses.flatMap(access => {
          const call = adapterCall(access)
          return call === undefined ? [] : [{ access, call }]
        })
        const forwarded = accesses.flatMap(access => {
          if (adapterCall(access) !== undefined) return []
          const call = forwardedCall(access, property.name)
          return call === undefined ? [] : [{ access, call }]
        })

        const wholeForwarded = wholeParameterForwarded(node.body, parameter, property.name)
        if (materialized.length === 0 && forwarded.length === 0 && !wholeForwarded) {
          errors.push(
            `${location(sourceFile, parameter)} ${functionName(node)} declares ${property.name} but does not materialize or forward it`,
          )
          continue
        }

        for (const { access, call } of materialized) {
          materializedProperties += 1
          const argumentIndex = directCallArgument(call, access)
          if (argumentIndex !== call.arguments.length - 1) {
            errors.push(
              `${location(sourceFile, access)} ${functionName(node)} must merge ${property.name} last in ${call.expression.getText(sourceFile)}(...)`,
            )
          }
        }
        forwardedProperties += forwarded.length + (wholeForwarded ? 1 : 0)
      }
    }

    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
}

if (errors.length > 0) {
  console.error(`StyleX contract-flow check failed (${errors.length}):\n${errors.map(error => `- ${error}`).join('\n')}`)
  process.exitCode = 1
} else {
  console.log(JSON.stringify({
    checkedFiles: sourceFiles.length,
    checkedFunctions,
    checkedProperties,
    forwardedProperties,
    materializedProperties,
  }))
}

