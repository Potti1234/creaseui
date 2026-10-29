import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { inertHtml } from 'foldkit/html'
import type { Html } from 'foldkit/html'

import { renderButton } from '../src/lib/button.ts'
import { button as buttonPleat } from '../src/pleat/button.ts'
import { button as buttonTailwind } from '../src/ui/button.ts'

const attrs = (html: Html): Record<string, string> =>
  (html as { data?: { attrs?: Record<string, string> } })?.data?.attrs ?? {}

const disclosureProps = {
  children: ['More'],
  ariaExpanded: true,
  ariaControls: 'nav-panel',
  ariaHasPopup: 'menu' as const,
}

describe('button behavior props', () => {
  it('renderButton emits aria-expanded, aria-controls and aria-haspopup', () => {
    const html = renderButton(disclosureProps, [], inertHtml)
    assert.equal(attrs(html)['aria-expanded'], 'true')
    assert.equal(attrs(html)['aria-controls'], 'nav-panel')
    assert.equal(attrs(html)['aria-haspopup'], 'menu')
  })

  it('renderButton omits the attributes when the props are absent', () => {
    const html = renderButton({ children: ['More'] }, [], inertHtml)
    assert.equal(attrs(html)['aria-expanded'], undefined)
    assert.equal(attrs(html)['aria-controls'], undefined)
    assert.equal(attrs(html)['aria-haspopup'], undefined)
  })

  for (const [renderer, button] of [
    ['tailwind', buttonTailwind],
    ['pleat', buttonPleat],
  ] as const) {
    it(`${renderer}: renders the named aria props`, () => {
      const html = button(disclosureProps, inertHtml)
      assert.equal(attrs(html)['aria-expanded'], 'true')
      assert.equal(attrs(html)['aria-controls'], 'nav-panel')
      assert.equal(attrs(html)['aria-haspopup'], 'menu')
    })
  }

  it('stylex: button extends ButtonBehaviorProps and delegates to renderButton', () => {
    const source = readFileSync('src/stylex/button.ts', 'utf8')
    // ButtonProps extends the shared behavior props, so the named aria props
    // arrive without a renderer change; renderButton renders them.
    assert.match(
      source,
      /extends ButtonBehaviorProps<Msg>|ButtonBehaviorProps<Msg> &/u,
    )
    assert.match(source, /renderButton\(\s*props,/u)
  })
})
