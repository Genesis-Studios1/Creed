const test = require('node:test');
const assert = require('node:assert/strict');
const { generateCreedReplyWithMeta } = require('../ai/chatService');

test('returns a fallback reply with metadata when no AI provider is configured', async () => {
  const result = await generateCreedReplyWithMeta({ messages: [{ role: 'user', content: 'hello there' }] });
  assert.match(result.reply, /hello|hey|creed/i);
  assert.equal(result.usedFallback, true);
  assert.equal(result.provider, 'none');
});
