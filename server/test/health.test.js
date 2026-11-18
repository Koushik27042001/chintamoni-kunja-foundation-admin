const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHealthCheck } = require('../src/controllers/healthController');

const env = { JWT_SECRET: 'test', RAZORPAY_KEY_ID: 'test', RAZORPAY_KEY_SECRET: 'test', OPENAI_API_KEY: 'test' };
const connection = { readyState: 1, db: { command: async () => ({ ok: 1 }) } };
const getModel = () => ({ findOne: () => ({ maxTimeMS: () => ({ lean: () => ({ exec: async () => null }) }) }) });
function run(options = {}) {
  return createHealthCheck({ connection, env, getModel, ...options })();
}

test('all 18 features return 200 when reads and configuration pass, including empty collections', async () => {
  const res = await run();
  assert.equal(res.statusCode, 200);
  assert.equal(Object.keys(res.features).length, 18);
  assert.ok(Object.values(res.features).every(feature => feature.statusCode === 200));
});

test('disconnected database reports all features down without querying models', async () => {
  const res = await run({ connection: { readyState: 0 }, getModel: () => { throw new Error('Must not query'); } });
  assert.equal(res.statusCode, 503);
  assert.ok(Object.values(res.features).every(feature => feature.statusCode === 503));
});

test('missing configuration reports only affected features down and does not leak secrets', async () => {
  const res = await run({ env: {} });
  assert.equal(res.statusCode, 503);
  for (const name of ['auth', 'payment', 'ai']) assert.equal(res.features[name].statusCode, 503);
  assert.equal(res.features.books.statusCode, 200);
  assert.ok(!JSON.stringify(res).includes('JWT_SECRET'));
});

test('failed collection read affects its dependent features without leaking driver errors', async () => {
  const res = await run({ getModel: name => {
    if (name === 'Book') throw new Error('private database details');
    return getModel();
  } });
  assert.equal(res.statusCode, 503);
  assert.equal(res.features.books.statusCode, 503);
  assert.equal(res.features.batches.statusCode, 503);
  assert.equal(res.features.contact.statusCode, 200);
  assert.ok(!JSON.stringify(res).includes('private database details'));
});

test('stalled database ping times out and returns 503', async () => {
  const res = await run({ timeoutMs: 10, connection: { readyState: 1, db: { command: () => new Promise(() => {}) } } });
  assert.equal(res.statusCode, 503);
  assert.equal(res.database.statusCode, 503);
});

test('stalled collection read times out independently', async () => {
  const res = await run({ timeoutMs: 10, getModel: () => ({ findOne: () => ({ maxTimeMS: () => ({ lean: () => ({ exec: () => new Promise(() => {}) }) }) }) }) });
  assert.equal(res.statusCode, 503);
  assert.equal(res.database.statusCode, 200);
});
