import { RuleTester } from 'eslint'
import tseslint from 'typescript-eslint'
import { afterAll, describe, it } from 'vitest'

import plugin from '../../tooling/eslint-plugin-crease-tasks/index.js'

RuleTester.afterAll = afterAll
RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } })
const header = "import { button } from '@/ui/button'\n"

tester.run('one-primary-action', plugin.rules['one-primary-action'], {
  valid: [
    { name: 'one primary and secondaries', code: `${header}button({ intent: 'primary', children: ['Create'] }, h); button({ children: ['Cancel'] }, h)` },
    { name: 'no intent means secondary', code: `${header}button({ children: ['A'] }, h); button({ children: ['B'] }, h)` },
    { name: 'another module\'s button is not ours', code: "import { button } from 'somewhere-else'\nbutton({ intent: 'primary' }); button({ intent: 'primary' })" },
  ],
  invalid: [
    {
      name: 'two primaries in one file',
      code: `${header}button({ intent: 'primary', children: ['Create'] }, h)\nbutton({ intent: 'primary', children: ['Save'] }, h)`,
      errors: [{ messageId: 'second', data: { line: '2' }, line: 3 }],
    },
    {
      name: 'a renamed import and a conditional intent',
      code: "import { button as action } from '@/ui/button'\naction({ intent: 'primary', children: ['A'] }, h)\naction({ intent: isMain ? 'primary' : 'secondary', children: ['B'] }, h)",
      errors: [{ messageId: 'second', line: 3 }],
    },
    {
      name: 'buttonLink counts too',
      code: "import { button, buttonLink } from '@/ui/button'\nbutton({ intent: 'primary', children: ['A'] }, h)\nbuttonLink({ intent: 'primary', href: '/new', children: ['B'] })",
      errors: [{ messageId: 'second', line: 3 }],
    },
  ],
})
