import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { build } from 'vite'
import type * as OverlayBehaviors from './fixtures/overlay-behaviors'

declare global {
  interface Window {
    OverlayBehaviors: typeof OverlayBehaviors
  }
}

test.describe.configure({ mode: 'default' })

let script: string

test.beforeAll(async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      lib: {
        name: 'OverlayBehaviors',
        entry: resolve('e2e/fixtures/overlay-behaviors.ts'),
        formats: ['iife'],
      },
    },
  })
  const bundle = Array.isArray(result) ? result[0] : result
  if (bundle === undefined || !('output' in bundle)) {
    throw new Error('Expected one browser bundle')
  }
  const chunk = bundle.output.find(entry => entry.type === 'chunk')
  if (chunk === undefined) throw new Error('Missing browser bundle')
  script = chunk.code
})

test('position follows a virtual anchor and live options in a native top layer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 480, height: 360 })
  await page.setContent(`
    <div style="overflow:hidden; height: 5px; transform: translateX(10px)">
      <div id="panel" style="inset:auto;padding:0;border:0;width:100px;height:50px;background:white"
           data-side="original" dir="rtl"></div>
    </div>
    <button id="move">Move the anchor</button>
    <button id="stop">Release position</button>
  `)
  await page.addScriptTag({ content: script })
  await page.evaluate(() => {
    const { Layer, Position } = window.OverlayBehaviors
    const panel = document.querySelector<HTMLElement>('#panel')!
    const close = Layer.bindLayer(panel, {
      topLayer: true,
      dismissOnOutsidePress: false,
      onDismiss: () => {},
    })
    const point = { x: 240, y: 10 }
    let side: 'top' | 'start' = 'top'
    let arrow: HTMLElement | undefined
    const stop = Position.position(
      () => ({
        getBoundingClientRect: () => ({ ...point, width: 0, height: 0 }),
      }),
      panel,
      () => ({ side, align: 'center', sideOffset: 8, arrow: () => arrow }),
    )
    document.querySelector('#move')!.addEventListener('click', () => {
      point.y = 120
      side = 'start'
      arrow = document.createElement('span')
      arrow.id = 'arrow'
      arrow.style.cssText = 'display:block; width: 10px; height: 10px;'
      panel.append(arrow)
    })
    document.querySelector('#stop')!.addEventListener('click', () => {
      stop()
      close()
    })
  })

  const panel = page.locator('#panel')
  await expect(panel).toHaveAttribute('data-side', 'bottom')
  await expect(panel).toHaveCSS('top', '18px')
  await expect(panel).toHaveCSS('left', '190px')
  await expect(page.locator('#panel:popover-open')).toBeVisible()
  await page.getByRole('button', { name: 'Move the anchor' }).click()
  await expect(panel).toHaveAttribute('data-side', 'right')
  await expect(panel).toHaveCSS('left', '248px')
  await expect(panel).toHaveCSS('top', '95px')
  await expect(panel).toHaveAttribute('data-align', 'center')
  await expect(page.locator('#arrow')).toHaveAttribute('data-side', 'right')
  await expect(panel).toHaveCSS('--arrow-y', '20px')
  await expect(panel).toHaveCSS('--available-width', '224px')
  await expect(panel).toHaveCSS('--transform-origin', 'left 25px')
  await page.getByRole('button', { name: 'Release position' }).click()
  await expect(panel).toHaveAttribute('data-side', 'original')
  await expect(page.locator('#panel[popover], #arrow[data-side]')).toHaveCount(
    0,
  )
})

test('layers route Escape, persistent presses, outside modal clicks and blur', async ({
  page,
}) => {
  await page.setContent(`
    <button id="outside">Outside</button>
    <button id="persistent">Persistent</button>
    <div id="outer"><button>Parent content</button><button id="trigger">Inner trigger</button></div>
    <div id="inner"><button>Child content</button></div>
    <output></output>
  `)
  await page.addScriptTag({ content: script })
  await page.evaluate(() => {
    const { Layer } = window.OverlayBehaviors
    const outer = document.querySelector<HTMLElement>('#outer')!
    const inner = document.querySelector<HTMLElement>('#inner')!
    const trigger = document.querySelector<HTMLElement>('#trigger')!
    const persistent = document.querySelector<HTMLElement>('#persistent')!
    const output = document.querySelector('output')!
    const append = (event: string) => {
      output.value += `${event};`
    }
    let closeInner = () => {}
    const openInner = () => {
      closeInner()
      closeInner = Layer.bindLayer(inner, {
        closeOnBlur: true,
        modal: true,
        contains: target => trigger.contains(target),
        onDismiss: reason => {
          append(`inner:${reason}`)
          closeInner()
        },
      })
    }
    const closeOuter = Layer.bindLayer(outer, {
      onDismiss: reason => {
        append(`outer:${reason}`)
        closeOuter()
      },
    })
    Layer.bindPersistentLayer(persistent)
    persistent.addEventListener('click', () => append('persistent'))
    document
      .querySelector('#outside')!
      .addEventListener('click', () => append('outside'))
    trigger.addEventListener('click', openInner)
    openInner()
  })

  const output = page.locator('output')
  const trigger = page.getByRole('button', { name: 'Inner trigger' })
  await trigger.click()
  await expect(output).toHaveText('')
  await page.getByRole('button', { name: 'Persistent' }).click()
  await expect(output).toHaveText('persistent;')
  await page.keyboard.press('Escape')
  await expect(output).toHaveText('persistent;inner:escape-key;')
  await trigger.click()
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect(output).toHaveText(
    'persistent;inner:escape-key;inner:window-blur;',
  )
  await trigger.click()
  const outside = page.getByRole('button', { name: 'Outside' })
  await outside.click()
  const dismissed =
    'persistent;inner:escape-key;inner:window-blur;inner:outside-press;outer:outside-press;'
  await expect(output).toHaveText(dismissed)
  await outside.click()
  await expect(output).toHaveText(`${dismissed}outside;`)
})

test('an iframe layer distinguishes inside and outside presses', async ({
  page,
}) => {
  await page.setContent('<iframe></iframe><output></output>')
  await page.addScriptTag({ content: script })
  await page.evaluate(() => {
    const doc = document.querySelector('iframe')!.contentDocument!
    doc.body.innerHTML =
      '<div id="layer"><button>Inside</button></div><button>Outside</button>'
    const output = document.querySelector('output')!
    window.OverlayBehaviors.Layer.bindLayer(
      doc.querySelector<HTMLElement>('#layer')!,
      { onDismiss: reason => (output.value += reason) },
    )
  })

  const frame = page.frameLocator('iframe')
  await frame.getByRole('button', { name: 'Inside' }).click()
  await expect(page.locator('output')).toHaveText('')
  await frame.getByRole('button', { name: 'Outside' }).click()
  await expect(page.locator('output')).toHaveText('outside-press')
})
