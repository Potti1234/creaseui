import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import ts from 'typescript'

const file = 'src/demo/blocks-stylex/featured-page.ts'
const source = readFileSync(file, 'utf8')
const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

const walk = (node: ts.Node, visit: (candidate: ts.Node) => void): void => {
  visit(node)
  ts.forEachChild(node, (child) => walk(child, visit))
}

describe('featured StyleX blocks composition', () => {
  it('renders exactly the five official featured block identifiers in order', () => {
    const names = [...source.matchAll(/name: '(dashboard-01|sidebar-07|sidebar-03|login-03|login-04)'/gu)].map((match) => match[1])
    assert.deepEqual(names, ['dashboard-01', 'sidebar-07', 'sidebar-03', 'login-03', 'login-04'])
  })

  it('adds five Astryx-inspired constrained dashboard identifiers in order', () => {
    const names = [...source.matchAll(/name: '(astryx-[^']+)'/gu)].map((match) => match[1])
    assert.deepEqual(names, ['astryx-executive-summary', 'astryx-cohort-funnel', 'astryx-project-status', 'astryx-service-monitoring', 'astryx-incident-console'])
  })

  it('adds a real Apache ECharts analytics dashboard block', () => {
    assert.match(source, /name: 'chart-analytics-dashboard'/u)
    assert.match(source, /chartAnalyticsDashboard\(/u)
  })

  it('contains no page-local styling or raw layout element escape hatch', () => {
    const forbiddenCalls: string[] = []
    const forbiddenBuilders = new Set(['article', 'aside', 'div', 'footer', 'header', 'li', 'main', 'nav', 'ol', 'section', 'ul', 'Class', 'Style'])

    walk(ast, (node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        assert.notEqual(node.moduleSpecifier.text, '@stylexjs/stylex')
      }
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'h' &&
        forbiddenBuilders.has(node.expression.name.text)
      ) {
        forbiddenCalls.push(node.expression.getText(ast))
      }
    })

    assert.deepEqual(forbiddenCalls, [])
    assert.doesNotMatch(source, /\b(?:className|layoutStyle|stylex\.create|cn)\b/u)
  })

  it('uses all five closed composition primitives', () => {
    for (const primitive of ['box', 'grid', 'inline', 'stack', 'text']) {
      assert.match(source, new RegExp(`\\b${primitive}\\s*\\(`, 'u'))
    }
  })

  it('uses the finite icon adapter instead of unconstrained SVG classes', () => {
    assert.match(source, /from '@\/stylex\/composition\/icon'/u)
    assert.doesNotMatch(source, /from '@\/lib\/icon'/u)

    const iconSource = readFileSync('src/stylex/composition/icon.ts', 'utf8')
    const iconProps = iconSource.slice(
      iconSource.indexOf('export type IconProps'),
      iconSource.indexOf('export const icon'),
    )
    assert.match(iconSource, /size\?: 'sm' \| 'md'/u)
    assert.doesNotMatch(iconProps, /class\??:|layoutStyle|StaticStyles|StyleXStyles/u)
  })
})
