import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { completeExample } from '../src/docs/components/complete-example';

describe('complete documentation examples', () => {
  it('include the complete Foldkit application lifecycle', () => {
    const code = completeExample({
      componentName: 'Button',
      componentSlug: 'button',
      exampleName: 'Basic',
      viewCode: "return Button.button({ children: ['Continue'] }, h)",
    });

    for (const section of [
      '// MODEL',
      '// MESSAGES / COMMANDS',
      '// INIT',
      '// UPDATE',
      '// SUBSCRIPTIONS',
      '// VIEW — Basic',
      '// RUNTIME',
    ]) {
      assert.match(code, new RegExp(section));
    }
    assert.match(code, /Runtime\.makeApplication/);
    assert.match(code, /import \* as Button from '@\/ui\/button'/);
  });
});
