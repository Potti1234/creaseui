import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { foldkitApplication } from '../src/docs/components/pages/authored-page';

describe('complete documentation examples', () => {
  it('include the complete Foldkit application lifecycle', () => {
    const code = foldkitApplication({
      title: 'Button — Basic',
      imports: "import * as Button from '@/ui/button'",
      model: 'export const Model = S.Struct({})',
      messages: "export const Message = S.Union([m('NoOp')])",
      init: 'export const init = () => [{}, []] as const',
      update: 'export const update = (model: Model) => [model, []] as const',
      view: "export const view = (_model, h) => ({ title: 'Button', body: Button.button({ children: ['Continue'] }, h) })",
    });

    for (const section of ['// MODEL', '// MESSAGES', '// INIT', '// UPDATE', '// SUBSCRIPTIONS', '// VIEW', '// RUNTIME']) {
      assert.match(code, new RegExp(section));
    }
    assert.match(code, /Runtime\.makeApplication/);
    assert.match(code, /import \* as Button from '@\/ui\/button'/);
  });
});
