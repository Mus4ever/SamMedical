#!/usr/bin/env node
/**
 * Generate the "bilan ready" voice notification MP3 via ElevenLabs.
 *
 * Usage:
 *   npm run generate-audio
 *   npm run generate-audio -- --text "Custom text" --voice VOICE_ID
 *
 * Requires ELEVENLABS_API_KEY in your .env.
 *
 * Free tier: 10,000 characters / month. The default message is ~120 chars,
 * so you can regenerate ~80 times per month.
 *
 * To list available voices: https://elevenlabs.io/app/voice-library
 * Recommended voices for Arabic/Darija:
 *   - "Adam"  pNInz6obpgDQGcFmaJgB  (multilingual, natural)
 *   - "Sarah" EXAVITQu4vr4xnSDxMaL  (multilingual, female)
 *   - "Bill"  pqHfZKP75CvOlQylNhV4  (multilingual, warm)
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/env');

// Default Darija text — adapt as you like
const DEFAULT_TEXT = 'السلام عليكم. نتيجة التحاليل ديالك جاهزة. دخل لحسابك على الموقع باش تشوفها. شكرا.';

// Parse command-line args
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
};
const text     = getArg('--text')  || DEFAULT_TEXT;
const voiceId  = getArg('--voice') || config.elevenlabs.voiceId;
const modelId  = getArg('--model') || config.elevenlabs.modelId;
const outFile  = path.join(__dirname, '..', '..', 'audio', config.audio.filename);

if (!config.elevenlabs.apiKey) {
  console.error('\n❌ ELEVENLABS_API_KEY missing in .env');
  console.error('   Sign up free at https://elevenlabs.io and copy your API key from Settings.\n');
  process.exit(1);
}

console.log('\n🎙️  ElevenLabs audio generation');
console.log(`   Voice ID: ${voiceId}`);
console.log(`   Model:    ${modelId}`);
console.log(`   Text:     "${text}"`);
console.log(`   Output:   ${outFile}\n`);

const main = async () => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': config.elevenlabs.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`\n❌ ElevenLabs API error (HTTP ${res.status}):`);
    console.error(`   ${errText}\n`);
    if (res.status === 401) {
      console.error('   → Check your ELEVENLABS_API_KEY is correct.\n');
    }
    if (res.status === 402) {
      console.error('   → This voice requires a paid plan. Switch to a default (premade) voice in .env:');
      console.error('     ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB     # Adam (default, free)');
      console.error('     ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL     # Sarah (default, free)');
      console.error('     ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb     # George (default, free)');
      console.error('   Or skip ElevenLabs entirely and use free Microsoft Edge TTS:');
      console.error('     pip install edge-tts');
      console.error('     edge-tts --voice "ar-DZ-IsmaelNeural" --text "..." --write-media audio/bilan_ready_darija.mp3\n');
    }
    if (res.status === 422) {
      console.error('   → Voice or model may not support this text/language.\n');
    }
    process.exit(1);
  }

  // Ensure audio dir exists
  const audioDir = path.dirname(outFile);
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  // Stream MP3 to disk
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outFile, buffer);

  const sizeKb = (buffer.length / 1024).toFixed(1);
  console.log(`✅ Wrote ${sizeKb} KB to ${outFile}`);
  console.log(`   Test it locally:  open  ${outFile}`);
  console.log(`   Twilio will fetch it from: \${APP_PUBLIC_URL}/audio/${config.audio.filename}\n`);
};

main().catch((err) => {
  console.error('\n❌ Generation failed:', err.message);
  process.exit(1);
});
