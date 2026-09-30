import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatFileSize,
  acceptsFile,
  validateFiles,
  init,
  update,
  Message,
  fileInputSelector,
} from '../src/lib/file-input.ts';

const fakeFile = (name: string, size = 0, type = ''): File =>
  ({ name, size, type }) as File;

test('formats byte sizes like astryx', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(5 * 1024 * 1024), '5.0 MB');
});

test('acceptsFile matches extensions and mime families', () => {
  const pdf = fakeFile('r.pdf', 1, 'application/pdf');
  assert.equal(acceptsFile(pdf, '.pdf,.docx'), true);
  assert.equal(acceptsFile(fakeFile('a.png'), '.pdf,.docx'), false);
  assert.equal(acceptsFile(fakeFile('a.png', 1, 'image/png'), 'image/*'), true);
});

test('validateFiles reports accept, size, and count errors separately', () => {
  const files = [
    fakeFile('a.pdf', 100, 'application/pdf'),
    fakeFile('b.exe', 9 * 1024 * 1024, 'application/x-msdownload'),
  ];
  const result = validateFiles(files, {
    accept: '.pdf',
    maxSize: 1024,
    maxFiles: 3,
    isMultiple: true,
  });
  assert.equal(result.valid.length, 1);
  assert.equal(result.errors.length, 1);
  const single = validateFiles(files, { isMultiple: false });
  assert.equal(single.valid.length, 1);
});

test('update forwards ClearRequested as Cleared and clears validation errors', () => {
  const model = init({ id: 'docs', accept: '.pdf' });
  assert.equal(fileInputSelector(model), '#docs-dropzone-input');
  const next = update(model, Message.ClearRequested());
  assert.equal(next.outMessage?._tag, 'Cleared');
  const trigger = update(model, Message.TriggerClicked());
  assert.equal((trigger.commands ?? []).length, 1);
});
