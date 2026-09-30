import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithinBudget } from '../lib/ingest-budget.ts';

test('normal body and status preserved', async () => {
  const response = await fetchWithinBudget('https://example.invalid', {}, Date.now()+1000,
    500, async () => new Response('{"ok":true}', {status:201}));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {ok:true});
});
test('expired budget does not call upstream', async () => {
  await assert.rejects(fetchWithinBudget('https://example.invalid', {}, Date.now()-1,
    500, async () => { throw new Error('must not be called'); }), /budget exhausted/);
});
test('timeout covers headers', async () => {
  await assert.rejects(fetchWithinBudget('https://example.invalid', {}, Date.now()+1000,
    25, async (_, {signal}) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), {once:true});
    })), /aborted/);
});
test('timeout also covers stalled body after successful headers', async () => {
  await assert.rejects(fetchWithinBudget('https://example.invalid', {}, Date.now()+1000,
    25, async (_, {signal}) => new Response(new ReadableStream({start(controller) {
      signal.addEventListener('abort', () => controller.error(new Error('body aborted')), {once:true});
    }}))), /body aborted/);
});
test('caller cancellation retained', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(fetchWithinBudget('https://example.invalid', {signal:controller.signal},
    Date.now()+1000, 500, async (_, {signal}) => {
      signal.throwIfAborted(); return new Response('unexpected');
    }));
});
test('HEAD response without body preserved', async () => {
  const response = await fetchWithinBudget('https://example.invalid', {}, Date.now()+1000,
    500, async () => new Response(null, {status:204}));
  assert.equal(response.status, 204);
});
