/**
 * Twilio client (voice calls + SMS).
 *
 * Lazy-initialized — won't crash the server if Twilio creds
 * aren't set (useful when running earlier layers).
 */

const twilio = require('twilio');
const config = require('./env');

let client = null;

const getTwilio = () => {
  if (!client) {
    if (!config.twilio.sid || !config.twilio.token) {
      throw new Error(
        'Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env'
      );
    }
    client = twilio(config.twilio.sid, config.twilio.token);
  }
  return client;
};

module.exports = { getTwilio };
