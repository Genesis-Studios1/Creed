let websiteMessages = 0;
let botReportedMessages = null;

function getBaselineMessages() {
  const fromEnv = parseInt(process.env.DISCORD_MESSAGES_SENT || '0', 10);
  return Number.isFinite(fromEnv) ? fromEnv : 0;
}

function incrementWebsiteMessage() {
  websiteMessages += 1;
  return getTotalMessages();
}

function setBotReportedMessages(count) {
  const parsed = parseInt(count, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    botReportedMessages = parsed;
  }
  return getTotalMessages();
}

function getTotalMessages() {
  const baseline = getBaselineMessages();
  const botCount = botReportedMessages !== null ? botReportedMessages : baseline;
  return Math.max(botCount, baseline) + websiteMessages;
}

module.exports = {
  incrementWebsiteMessage,
  setBotReportedMessages,
  getTotalMessages,
  getBaselineMessages
};
