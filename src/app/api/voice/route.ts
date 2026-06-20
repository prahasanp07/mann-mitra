import { NextRequest, NextResponse } from 'next/server';
import { MITRA_SYSTEM_PROMPT, detectStressLevel, generateFallbackResponse, StressLevel } from '@/lib/mitra-agent';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const runtime = 'nodejs';

function generateSyntheticChimeWav(): Buffer {
  const sampleRate = 8000;
  const duration = 1.5; // seconds
  const numSamples = sampleRate * duration;
  const headerLength = 44;
  const buffer = Buffer.alloc(headerLength + numSamples);
  
  // RIFF Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples, 4);
  buffer.write('WAVE', 8);
  
  // fmt Subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(1, 22); // channels (mono)
  buffer.writeUInt32LE(sampleRate, 24); // samplerate
  buffer.writeUInt32LE(sampleRate, 28); // byterate
  buffer.writeUInt16LE(1, 32); // blockalign
  buffer.writeUInt16LE(8, 34); // bitspersample
  
  // data Subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples, 40);
  
  // Generate a nice chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let freq = 523;
    if (t > 1.0) freq = 784;
    else if (t > 0.5) freq = 659;
    
    const noteTime = t % 0.5;
    const decay = Math.exp(-6 * noteTime);
    const val = Math.sin(2 * Math.PI * freq * noteTime) * decay;
    
    // 8-bit PCM is unsigned (0 to 255, center is 128)
    const sampleValue = Math.floor(128 + 127 * val);
    buffer.writeUInt8(sampleValue, headerLength + i);
  }
  
  return buffer;
}

function synthesizeSpeech(text: string): Buffer {
  // Strip trigger tokens from TTS output to prevent SAPI5 from reading them out loud
  const cleanText = text
    .replace(/\[TRIGGER_BREATHING\]/g, '')
    .replace(/\[TRIGGER_NSDR\]/g, '')
    .replace(/"/g, "'")
    .replace(/`/g, "''")
    .replace(/[\r\n]/g, " ")
    .trim();

  if (process.platform === 'win32') {
    const tempFile = path.join(os.tmpdir(), `mitra_voice_${Date.now()}.wav`);
    try {
      const psCommand = `
        Add-Type -AssemblyName System.Speech;
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $synth.SetOutputToWaveFile("${tempFile.replace(/\\/g, '\\\\')}");
        $synth.Speak("${cleanText}");
        $synth.Dispose();
      `;
      
      execSync(`powershell -Command "${psCommand.replace(/\n/g, ' ')}"`, { stdio: 'ignore' });
      
      if (fs.existsSync(tempFile)) {
        const buffer = fs.readFileSync(tempFile);
        fs.unlinkSync(tempFile);
        return buffer;
      }
    } catch (e) {
      console.error("Local SAPI5 TTS failed:", e);
      if (fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch (_) {}
      }
    }
  }
  
  // Non-Windows or SAPI5 failure fallback (synthetic chime notes)
  return generateSyntheticChimeWav();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const clientText = (formData.get('text') as string) || '';
    const clientStressLevel = (formData.get('stressLevel') as StressLevel) || 'calm';
    const username = (formData.get('username') as string) || 'Arjun';
    const exam = (formData.get('exam') as string) || 'JEE Mains';

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio payload is required' }, { status: 400 });
    }

    // Save/process incoming raw audio payload to a local temporary path
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const inputTempFile = path.join(os.tmpdir(), `mitra_input_${Date.now()}.webm`);
    fs.writeFileSync(inputTempFile, audioBuffer);
    console.log(`Saved raw audio payload (${audioBuffer.length} bytes) to ${inputTempFile}`);

    // Clean up incoming temp audio file asynchronously
    setTimeout(() => {
      try { fs.unlinkSync(inputTempFile); } catch (_) {}
    }, 10000);

    // Transcription / Speech-to-Text resolution
    const latestMessage = clientText.trim() || 'Tell me how to relax';
    const detectedStress = detectStressLevel(latestMessage, clientStressLevel);

    // Generate Mitra's text response using local fallback logic
    let textResponse = generateFallbackResponse(latestMessage, detectedStress);

    // Personalize using context
    if (detectedStress === 'overwhelmed') {
      textResponse += ` Arjun, please take a step back from the books. Your peace is worth more than any exam score.`;
    } else if (detectedStress === 'tired') {
      textResponse += ` Your sleep debt is high, ${username}. Priority rest is study strategy. Let's do an NSDR rest.`;
    } else if (detectedStress === 'stressed') {
      textResponse += ` Let's practice some Physiological Sigh breathing right now.`;
    }

    // Query LLM API if Key is present, similar to chat endpoint
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    const apiBase = process.env.OPENAI_API_BASE || (process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1');
    const model = process.env.LLM_MODEL || (process.env.GROQ_API_KEY ? 'llama3-8b-8192' : 'gpt-4o-mini');

    if (apiKey) {
      try {
        const stressInstruction = `\n[Current Student Stress Context: The student is feeling "${detectedStress}". Adapt your tone to be highly supportive, calm, and brief. Return a max of 2 short sentences.]`;
        const response = await fetch(`${apiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: MITRA_SYSTEM_PROMPT + stressInstruction },
              { role: 'user', content: latestMessage }
            ],
            stream: false,
            temperature: 0.7,
            max_tokens: 80,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const llmText = data.choices?.[0]?.message?.content || '';
          if (llmText.trim()) {
            textResponse = llmText;
          }
        }
      } catch (err) {
        console.error('LLM fetch failed inside voice route, using fallback', err);
      }
    }

    // Text-to-Speech synthesis
    const wavBuffer = synthesizeSpeech(textResponse);

    // Return binary WAV stream response
    return new Response(new Uint8Array(wavBuffer), {
      headers: {
        'Content-Type': 'audio/wav',
        'X-User-Transcript': encodeURIComponent(latestMessage),
        'X-Mitra-Reply': encodeURIComponent(textResponse),
        'X-Detected-Stress-Level': detectedStress,
      },
    });
  } catch (error) {
    console.error('Voice route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
