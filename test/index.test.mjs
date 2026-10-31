import { beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createElement } from 'react';
import { setup, click, input, key } from './helpers.mjs';
import { InlineEdit } from '../dist/index.js';
let ui;
beforeEach(async () => (ui = await setup()));
afterEach(async () => ui.cleanup());
test('invalid edit stays open, cancel restores, and valid save commits', async () => {
  const values = [];
  await ui.render(
    createElement(InlineEdit, {
      defaultValue: 'Original',
      validate: (value) => (value ? '' : 'Required'),
      onChange: (value) => values.push(value),
    }),
  );
  await click(ui.container.querySelector('button'));
  await input(ui.container.querySelector('input'), '');
  await act(async () => {
    ui.container
      .querySelector('form')
      .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
  });
  assert.match(ui.container.querySelector('[role="alert"]').textContent, /Required/);
  await key(ui.container.querySelector('input'), 'Escape');
  assert.equal(ui.container.querySelector('button').textContent, 'Original');
  await click(ui.container.querySelector('button'));
  await input(ui.container.querySelector('input'), 'Changed');
  await act(async () => {
    ui.container
      .querySelector('form')
      .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
  });
  assert.deepEqual(values, ['Changed']);
});
