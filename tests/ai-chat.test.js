const assert = require('assert');
const { buildFallbackReply } = require('../ai/chatService');

const cases = [
  {
    name: 'returns command help for help requests',
    input: 'help me with creed bot',
    expected: /command|commands/i
  },
  {
    name: 'returns a friendly greeting for casual messages',
    input: 'hello there',
    expected: /hello|hey|creed/i
  }
];

for (const testCase of cases) {
  const reply = buildFallbackReply(testCase.input);
  assert.match(reply, testCase.expected, `${testCase.name} failed`);
}

console.log('AI fallback chat tests passed');
