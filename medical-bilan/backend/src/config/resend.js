/**
 * Resend email client.
 *
 * Lazy-initialized — won't crash if not configured yet.
 * Free tier: 3,000 emails/month, 100/day.
 */

const { Resend } = require('resend');
const config = require('./env');

let client = null;

const getResend = () => {
  if (!client) {
    if (!config.resend.apiKey) {
      throw new Error(
        'Resend not configured. Set RESEND_API_KEY in .env'
      );
    }
    client = new Resend(config.resend.apiKey);
  }
  return client;
};

module.exports = { getResend };
