const test = require('node:test');
const assert = require('node:assert/strict');
const { createSessionCookieValue, parseSessionCookieValue } = require('../api/auth/_session');

test('creates and validates a signed session cookie payload', () => {
  const user = { id: '123', username: 'Tester' };
  const cookieValue = createSessionCookieValue(user, { secret: 'test-secret' });

  assert.ok(cookieValue);
  const parsed = parseSessionCookieValue(cookieValue, { secret: 'test-secret' });
  assert.deepEqual(parsed?.user, user);
});
