import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import ts from 'typescript'

import { DESIGN_SYSTEM_EVALUATIONS } from '../src/stylex/composition/evaluations'
import { RECIPE_NAMES, templateById, templates } from '../src/stylex/composition/templates'

const parse = (file: string): ts.SourceFile => ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
const walk = (node: ts.Node, visit: (node: ts.Node) => void): void => {
  visit(node)
  ts.forEachChild(node, (child) => walk(child, visit))
}

describe('Astryx-inspired constrained template system', () => {
  it('has one complete, agent-readable definition for every recipe', () => {
    assert.deepEqual([...new Set(templates.map(({ recipe }) => recipe))].sort(), [...RECIPE_NAMES].sort())
    assert.equal(new Set(templates.map(({ id }) => id)).size, templates.length)
    for (const template of templates) {
      assert.equal(templateById(template.id).id, template.id)
      assert.ok(template.componentsUsed.length > 0)
      assert.ok(template.evaluationTasks.length > 0)
      assert.ok(template.regions.length > 0)
    }
  })

  it('covers every template with real-task evaluation criteria', () => {
    const covered = new Set(DESIGN_SYSTEM_EVALUATIONS.map(({ template }) => template))
    assert.deepEqual([...covered].sort(), templates.map(({ id }) => id).sort())
    assert.ok(DESIGN_SYSTEM_EVALUATIONS.some(({ mode }) => mode === 'static'))
    assert.ok(DESIGN_SYSTEM_EVALUATIONS.some(({ mode }) => mode === 'browser'))
  })

  it('keeps semantic layout and recipe APIs closed to style escape hatches', () => {
    const forbidden = new Set(['class', 'className', 'layoutStyle', 'style', 'styles', 'unsafeClass', 'unsafeStyle', 'xstyle'])
    for (const file of ['src/stylex/composition/semantic-layout.ts', 'src/stylex/composition/recipes.ts']) {
      const ast = parse(file)
      walk(ast, (node) => {
        if (!ts.isPropertySignature(node) || node.name === undefined) return
        const property = node.name.getText(ast).replaceAll(/["']/gu, '')
        assert.equal(forbidden.has(property), false, `${file}: forbidden public escape hatch ${property}`)
      })
    }
  })

  it('migrates the featured dashboard to semantic regions', () => {
    const ast = parse('src/demo/blocks-stylex/featured-page.ts')
    const calls = new Set<string>()
    walk(ast, (node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) calls.add(node.expression.text)
    })
    for (const name of ['dashboardShell', 'metricGrid', 'section', 'tableRegion', 'toolbar']) assert.equal(calls.has(name), true)
  })
})
