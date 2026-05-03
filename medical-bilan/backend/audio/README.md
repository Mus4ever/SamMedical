# Audio files (TTS notification)

This folder holds the pre-generated MP3 that Twilio plays when calling a patient.
The MP3s are **gitignored** — generate them locally.

## Generate via ElevenLabs (recommended)

1. Sign up free at https://elevenlabs.io (10,000 chars/month, no credit card needed)
2. Settings → Profile → copy your API key
3. Add to `backend/.env`:
   ```env
   ELEVENLABS_API_KEY=your_key_here
   ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB    # default: "Adam" multilingual
   ```
4. Run:
   ```bash
   cd backend
   npm run generate-audio
   ```
5. The script writes `backend/audio/bilan_ready_darija.mp3` (~30-50 KB).
6. Test it: open the file in any audio player. If you don't like the voice, swap `ELEVENLABS_VOICE_ID` and re-run.

### Custom text
```bash
npm run generate-audio -- --text "السلام عليكم..."
```

### Custom voice
```bash
npm run generate-audio -- --voice EXAVITQu4vr4xnSDxMaL    # "Sarah"
```

Browse voices: https://elevenlabs.io/app/voice-library
Filter by "Multilingual" to find ones that support Arabic/Darija well.

## Alternative: Microsoft Edge TTS (no API key needed)

```bash
pip install edge-tts
edge-tts --voice "ar-DZ-IsmaelNeural" \
  --text "السلام عليكم. نتيجة التحاليل ديالك جاهزة. دخل لحسابك على الموقع باش تشوفها. شكرا" \
  --write-media bilan_ready_darija.mp3
```

Algerian voices: `ar-DZ-IsmaelNeural` (male), `ar-DZ-AminaNeural` (female).

## Alternative: Twilio's built-in `<Say>` (zero file needed)

If you can't generate an MP3, swap the TwiML in `backend/src/controllers/notification.controller.js`:
```xml
<Response>
  <Say voice="Polly.Zeina" language="arb">رسالتك هنا</Say>
</Response>
```
Polly speaks Modern Standard Arabic (sounds formal, not Darija) but works out of the box with Twilio.
