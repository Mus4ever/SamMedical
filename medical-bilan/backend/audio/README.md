# Audio files (TTS notification)

This folder holds the pre-generated audio files that Twilio plays when calling a patient. The MP3s themselves are **gitignored** — generate them locally.

## What goes here

- `bilan_ready_ar.mp3` — Arabic/Darija notification voice message

## How to generate

(Layer 6 will add `scripts/generate-audio.js` to do this automatically.)

For now, two free options:

### Option A — ElevenLabs (best quality, free 10k chars/month)

1. Sign up at https://elevenlabs.io
2. Pick a voice that supports Arabic
3. Paste the message text (Darija pronounciation):
   > السلام عليكم. نتيجة التحاليل ديالك جاهزة. دخل لحسابك على الموقع باش تشوفها. شكرا
4. Generate, download as MP3, save here as `bilan_ready_ar.mp3`

### Option B — Microsoft Edge TTS (completely free, no API key)

```bash
pip install edge-tts
edge-tts --voice "ar-DZ-IsmaelNeural" \
  --text "السلام عليكم. نتيجة التحاليل ديالك جاهزة. دخل لحسابك على الموقع باش تشوفها. شكرا" \
  --write-media bilan_ready_ar.mp3
```

Available Arabic voices: `ar-DZ-IsmaelNeural` (Algerian male), `ar-DZ-AminaNeural` (Algerian female), `ar-EG-SalmaNeural`, etc. Run `edge-tts --list-voices | grep ar-` to see all.

### Option C — Twilio's built-in `<Say>` (zero file needed)

If you skip generating an MP3 entirely, the backend can fall back to Twilio's Polly TTS via `<Say voice="Polly.Zeina" language="arb">...</Say>`. Modern Standard Arabic only — sounds more formal but works out of the box.

## Serving

The Express app serves this folder at `/audio/<filename>` so Twilio can fetch it via `APP_PUBLIC_URL/audio/bilan_ready_ar.mp3`.
