import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { RuleTester } from 'eslint'

import { findStylesheets, createCssAudit } from '../lib/strict/css.js'
import { defensiveAutoFillNotFit } from '../rules/defensive-auto-fill-not-fit.js'
import { defensiveBackgroundRepeat } from '../rules/defensive-background-repeat.js'
import { defensiveBgImageFallback } from '../rules/defensive-bg-image-fallback.js'
import { defensiveCssVarFallback } from '../rules/defensive-css-var-fallback.js'
import { defensiveFlexMinSize } from '../rules/defensive-flex-min-size.js'
import { defensiveHoverMedia } from '../rules/defensive-hover-media.js'
import { defensiveImageObjectFit } from '../rules/defensive-image-object-fit.js'
import { defensiveInputFontSize } from '../rules/defensive-input-font-size.js'
import { defensiveNoSpaceBetweenWrap } from '../rules/defensive-no-space-between-wrap.js'
import { defensiveOverscrollContain } from '../rules/defensive-overscroll-contain.js'
import { defensivePreferMinSize } from '../rules/defensive-prefer-min-size.js'
import { defensivePreferOverflowAuto } from '../rules/defensive-prefer-overflow-auto.js'
import { defensiveStickyGridAlign } from '../rules/defensive-sticky-grid-align.js'

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
})

tester.run(
  'crease/defensive-prefer-overflow-auto',
  defensivePreferOverflowAuto,
  {
    valid: [
      `h.div([h.Class('overflow-auto')])`,
      `h.div([h.Class('overflow-x-hidden overflow-y-auto')])`,
      `Comp({ class: 'overflow-auto' })`,
      {
        code: `h.div([h.Class('overflow-scroll')])`,
        options: [{ allow: ['overflow-scroll'] }],
      },
      `import * as sx from '@stylexjs/stylex'
     const s = sx.create({ root: { overflow: 'auto' } })`,
    ],
    invalid: [
      {
        code: `h.div([h.Class('flex overflow-scroll')])`,
        errors: [{ messageId: 'overflowScroll' }],
      },
      {
        code: `Comp({ class: 'overflow-y-scroll' })`,
        errors: [{ messageId: 'overflowScroll' }],
      },
      {
        code: `import * as sx from '@stylexjs/stylex'
       const s = sx.create({ root: { overflow: 'scroll' } })`,
        errors: [{ messageId: 'overflowScroll' }],
      },
      {
        code: `import * as sx from '@stylexjs/stylex'
       const s = sx.create({ root: { overflowY: 'scroll' } })`,
        errors: [{ messageId: 'overflowScroll' }],
      },
      {
        code: `import { Style } from '@pleat/core'
       const s = Style.make({ overflowX: 'scroll' })`,
        errors: [{ messageId: 'overflowScroll' }],
      },
    ],
  },
)

tester.run(
  'crease/defensive-no-space-between-wrap',
  defensiveNoSpaceBetweenWrap,
  {
    valid: [
      `h.div([h.Class('flex justify-between')])`,
      `h.div([h.Class('flex flex-wrap gap-2')])`,
      `h.div([h.Class('flex justify-between flex-nowrap')])`,
      `import * as sx from '@stylexjs/stylex'
     const s = sx.create({ root: { justifyContent: 'space-between' } })`,
    ],
    invalid: [
      {
        code: `h.div([h.Class('flex justify-between flex-wrap')])`,
        errors: [{ messageId: 'spaceBetweenWrap' }],
      },
      {
        code: `Comp({ class: cn('justify-between', 'flex-wrap') })`,
        errors: [{ messageId: 'spaceBetweenWrap' }],
      },
      {
        code: `import * as sx from '@stylexjs/stylex'
       const s = sx.create({ root: { justifyContent: 'space-between', flexWrap: 'wrap' } })`,
        errors: [{ messageId: 'spaceBetweenWrap' }],
      },
    ],
  },
)

tester.run('crease/defensive-auto-fill-not-fit', defensiveAutoFillNotFit, {
  valid: [
    `h.div([h.Class('grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))]')])`,
    `import * as sx from '@stylexjs/stylex'
     const s = sx.create({ root: { gridTemplateColumns: 'repeat(auto-fill, minmax(10px, 1fr))' } })`,
  ],
  invalid: [
    {
      code: `h.div([h.Class('grid-cols-[repeat(auto-fit,minmax(100px,1fr))]')])`,
      errors: [{ messageId: 'autoFit' }],
    },
    {
      code: `import * as sx from '@stylexjs/stylex'
       const s = sx.create({ root: { gridTemplateColumns: 'repeat(auto-fit, minmax(10px, 1fr))' } })`,
      errors: [{ messageId: 'autoFit' }],
    },
  ],
})

tester.run('crease/defensive-hover-media', defensiveHoverMedia, {
  valid: [
    `h.div([h.Class('hover:bg-red-500')])`,
    `import * as sx from '@stylexjs/stylex'
     const s = sx.create({ root: { color: { '@media (hover: hover)': { ':hover': 'red' } } } })`,
    `import * as sx from '@stylexjs/stylex'
     const s = sx.create({ root: { color: 'red' } })`,
  ],
  invalid: [
    {
      code: `import * as sx from '@stylexjs/stylex'
       const s = sx.create({ root: { color: { default: 'blue', ':hover': 'red' } } })`,
      errors: [{ messageId: 'hoverMedia' }],
    },
    {
      code: `import { Style } from '@pleat/core'
       const s = Style.make({ color: { ':hover': 'red' } })`,
      errors: [{ messageId: 'hoverMedia' }],
    },
    {
      code: `h.div([h.Class('[@supports(display:grid)]:hover:bg-red-500')])`,
      errors: [{ messageId: 'hoverMedia' }],
    },
  ],
})

tester.run('crease/defensive-bg-image-fallback', defensiveBgImageFallback, {
  valid: [
    `h.div([h.Class('bg-[url(hero.png)] bg-blue-500')])`,
    `import * as sx from '@stylexjs/stylex'
     const s = sx.create({ root: { backgroundImage: 'url(hero.png)', backgroundColor: 'blue' } })`,
    `h.div([h.Class('bg-blue-500')])`,
  ],
  invalid: [
    {
      code: `h.div([h.Class('bg-[url(hero.png)]')])`,
      errors: [{ messageId: 'bgImageFallback' }],
    },
    {
      code: `import * as sx from '@stylexjs/stylex'
       const s = sx.create({ root: { backgroundImage: 'url(hero.png)' } })`,
      errors: [{ messageId: 'bgImageFallback' }],
    },
  ],
})

tester.run('crease/defensive-background-repeat', defensiveBackgroundRepeat, {
  valid: [
    `h.div([h.Class('bg-[url(hero.png)] bg-no-repeat bg-blue-500')])`,
    `import * as sx from '@stylexjs/stylex'
     const s = sx.create({ root: { backgroundImage: 'url(x)', backgroundRepeat: 'no-repeat' } })`,
  ],
  invalid: [
    {
      code: `h.div([h.Class('bg-[url(hero.png)] bg-blue-500')])`,
      errors: [{ messageId: 'backgroundRepeat' }],
    },
    {
      code: `import * as sx from '@stylexjs/stylex'
       const s = sx.create({ root: { background: 'url(tile.png) center' } })`,
      errors: [{ messageId: 'backgroundRepeat' }],
    },
  ],
})

tester.run('crease/defensive-css-var-fallback', defensiveCssVarFallback, {
  valid: [
    `h.div([h.Class('top-[var(--undefined-x,1px)]')])`,
    `const s = { '--local-y': '2px' }
     h.div([h.Class('top-[var(--local-y)]')])`,
    {
      code: `h.div([h.Class('top-[var(--allowed-z)]')])`,
      options: [{ allow: ['--allowed-z'] }],
    },
    `import * as sx from '@stylexjs/stylex'
     const s = sx.create({ root: { top: 'var(--undefined-x, 0)' } })`,
  ],
  invalid: [
    {
      code: `h.div([h.Class('top-[var(--undefined-qq)]')])`,
      errors: [{ messageId: 'cssVarFallback' }],
    },
    {
      code: `import * as sx from '@stylexjs/stylex'
       const s = sx.create({ root: { top: 'var(--undefined-qq)' } })`,
      errors: [{ messageId: 'cssVarFallback' }],
    },
    {
      code: `const s = { '--declared-x': '2px' }
       h.div([h.Class('top-[var(--declared-x)]')])`,
      options: [{ allowTokens: false }],
      errors: [{ messageId: 'cssVarFallback' }],
    },
  ],
})

tester.run('crease/defensive-flex-min-size', defensiveFlexMinSize, {
  valid: [
    `h.div([h.Class('flex')], [h.div([h.Class('truncate min-w-0')])])`,
    `h.div([h.Class('block')], [h.div([h.Class('truncate')])])`,
    `h.div([h.Class('flex')], [h.div([h.Class('min-w-0 overflow-hidden')])])`,
    `h.div([h.Class('truncate')])`,
  ],
  invalid: [
    {
      code: `h.div([h.Class('flex')], [h.div([h.Class('truncate')])])`,
      errors: [{ messageId: 'flexMinSize' }],
    },
    {
      code: `h.div([h.Class('grid grid-cols-2')], [h.span([h.Class('overflow-hidden')])])`,
      errors: [{ messageId: 'flexMinSize' }],
    },
    {
      code: `h.div([h.Class('flex')], [h.div([h.Class('line-clamp-2')])])`,
      errors: [{ messageId: 'flexMinSize' }],
    },
  ],
})

tester.run('crease/defensive-image-object-fit', defensiveImageObjectFit, {
  valid: [
    `h.img([h.Class('size-8 object-cover')])`,
    `h.img([h.Class('w-8 h-8 object-contain')])`,
    `h.img([h.Class('rounded-full')])`,
    `h.div([h.Class('w-8 h-8')])`,
  ],
  invalid: [
    {
      code: `h.img([h.Class('w-8 h-8')])`,
      errors: [{ messageId: 'imageObjectFit' }],
    },
    {
      code: `Avatar({ class: 'w-12 h-12' })`,
      errors: [{ messageId: 'imageObjectFit' }],
    },
    {
      code: `h.img([h.Class('h-16')])`,
      errors: [{ messageId: 'imageObjectFit' }],
    },
  ],
})

tester.run('crease/defensive-input-font-size', defensiveInputFontSize, {
  valid: [
    `h.input([h.Class('text-base')])`,
    `h.input([h.Class('text-lg px-3')])`,
    `h.input([h.Class('text-[16px]')])`,
    `h.div([h.Class('text-sm')])`,
  ],
  invalid: [
    {
      code: `h.input([h.Class('text-sm')])`,
      errors: [{ messageId: 'inputFontSize' }],
    },
    {
      code: `Input({ class: 'text-xs' })`,
      errors: [{ messageId: 'inputFontSize' }],
    },
    {
      code: `h.textarea([h.Class('text-[12px]')])`,
      errors: [{ messageId: 'inputFontSize' }],
    },
    {
      code: `h.select([h.Class('text-[0.75rem]')])`,
      errors: [{ messageId: 'inputFontSize' }],
    },
  ],
})

tester.run('crease/defensive-sticky-grid-align', defensiveStickyGridAlign, {
  valid: [
    `h.div([h.Class('grid')], [h.div([h.Class('sticky self-start')])])`,
    `h.div([h.Class('flex')], [h.div([h.Class('sticky')])])`,
    `h.div([h.Class('grid items-start')], [h.div([h.Class('sticky')])])`,
    `import * as sx from '@stylexjs/stylex'
     const s = sx.create({ inner: { position: 'sticky' } })
     h.div([h.Class('x')], [h.div([], [h.div()])])`,
  ],
  invalid: [
    {
      code: `h.div([h.Class('grid grid-cols-2')], [h.div([h.Class('sticky top-0')])])`,
      errors: [{ messageId: 'stickyGrid' }],
    },
  ],
})

tester.run('crease/defensive-overscroll-contain', defensiveOverscrollContain, {
  valid: [
    `Dialog({ class: 'p-4' })
     h.div([h.Class('overflow-y-auto overscroll-contain')])`,
    `h.div([h.Class('overflow-y-auto')])`,
    `Dialog({ class: 'x' })
     h.div([h.Class('p-2')])`,
  ],
  invalid: [
    {
      code: `Drawer({ class: 'h-full' }, [h.div([h.Class('overflow-y-auto')])])`,
      errors: [{ messageId: 'overscrollContain' }],
    },
    {
      code: `Popover({ class: 'x' }, [h.div([], [h.div([h.Class('overflow-auto')])])])`,
      errors: [{ messageId: 'overscrollContain' }],
    },
  ],
})

tester.run('crease/defensive-prefer-min-size', defensivePreferMinSize, {
  valid: [
    `h.div([h.Class('w-8 h-8')])`,
    `h.div([h.Class('size-8')])`,
    `h.div([h.Class('h-full w-1/2')])`,
    `h.div([h.Class('min-h-[40px]')])`,
    {
      code: `h.div([h.Class('h-[40px]')])`,
      options: [{ allow: ['h-\\[40px\\]'] }],
    },
  ],
  invalid: [
    {
      code: `h.div([h.Class('h-[40px]')])`,
      errors: [{ messageId: 'preferMinSize' }],
    },
    {
      code: `h.div([h.Class('w-[20rem] p-4')])`,
      errors: [{ messageId: 'preferMinSize' }],
    },
    {
      code: `import * as sx from '@stylexjs/stylex'
       const s = sx.create({ root: { height: '40px' } })`,
      errors: [{ messageId: 'preferMinSize' }],
    },
  ],
})

/* -- stylesheet-audit defensive checks ------------------------------------ */

const project = files => {
  const root = mkdtempSync(path.join(tmpdir(), 'creaseui-defcss-'))
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    writeFileSync(path.join(root, name), text)
  }
  return root
}

const relative = (root, file) =>
  path.relative(root, file).split(path.sep).join('/')

const audit = (files, options = {}) => {
  const root = project(files)
  const run = createCssAudit({
    isOwned: file => (options.owned ?? []).includes(relative(root, file)),
    rootDir: root,
  })
  for (const file of findStylesheets(root)) run.auditFile(file)
  rmSync(root, { force: true, recursive: true })
  return run.findings.map(finding => finding.message)
}

test('defensive css audit: scrollbar-gutter on page root', () => {
  const hits = audit({
    'src/styles.css':
      'html { overflow-y: auto; background: var(--background); }',
  })
  assert.ok(
    hits.some(message => message.includes('defensive-scrollbar-gutter')),
    hits.join(' | '),
  )
  assert.deepEqual(
    audit({
      'src/styles.css':
        'html { overflow-y: auto; scrollbar-gutter: stable; background: var(--background); }',
    }).filter(m => m.includes('defensive-')),
    [],
  )
  assert.deepEqual(
    audit({
      'src/styles.css':
        'body { overflow-y: scroll; scrollbar-gutter: stable; }',
    }).filter(m => m.includes('defensive-scrollbar-gutter')),
    [],
  )
})

test('defensive css audit: owned rules', () => {
  const owned = { owned: ['src/design/chart.css'], roots: new Set(['chart']) }
  const hits = audit(
    {
      'src/design/chart.css': [
        '.chart { overflow-y: scroll; }',
        '.chart:hover { opacity: 0.9; }',
        '.chart { background-image: url(tile.png); }',
        '.chart { width: var(--never-defined-zz); }',
        '.chart { grid-template-columns: repeat(auto-fit, minmax(10px, 1fr)); }',
      ].join('\n'),
    },
    owned,
  )
  for (const tag of [
    'defensive-prefer-overflow-auto',
    'defensive-hover-media',
    'defensive-background-repeat',
    'defensive-css-var-fallback',
    'defensive-auto-fill-not-fit',
  ])
    assert.ok(
      hits.some(message => message.includes(tag)),
      `missing ${tag}: ${hits.join(' | ')}`,
    )
  /* declared token reads and guarded hover stay clean */
  const clean = audit(
    {
      'src/styles.css': ':root { --chart-gap: 2px; }',
      'src/design/chart.css':
        '.chart { gap: var(--chart-gap); }\n@media (hover: hover) { .chart:hover { opacity: 0.9; } }\n.chart { overflow-y: auto; }',
    },
    owned,
  )
  assert.deepEqual(
    clean.filter(m => m.includes('defensive-')),
    [],
    clean.join(' | '),
  )
})
