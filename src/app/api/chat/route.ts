import { NextRequest, NextResponse } from 'next/server';
import { MITRA_SYSTEM_PROMPT, detectStressLevel, generateFallbackResponse, StressLevel } from '@/lib/mitra-agent';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages, stressLevel: clientStressLevel } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content || '';
    
    // Dynamically detect stress level from user's input, falling back to client reported stress level if not clear
    const detectedStress = detectStressLevel(latestMessage, clientStressLevel || 'calm');

    // Retrieve API key settings
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    const apiBase = process.env.OPENAI_API_BASE || (process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1');
    const model = process.env.LLM_MODEL || (process.env.GROQ_API_KEY ? 'llama3-8b-8192' : 'gpt-4o-mini');

    // Setup headers including detected stress level to inform client UI
    const responseHeaders = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Detected-Stress-Level': detectedStress,
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    if (apiKey) {
      // Configure prompt instructions with stress level context
      const stressInstruction = `\n[Current Student Stress Context: The student is feeling "${detectedStress}". Adapt your tone to be highly supportive and validating of this specific state.]`;
      
      const systemMessage = {
        role: 'system',
        content: MITRA_SYSTEM_PROMPT + stressInstruction,
      };

      const requestMessages = [
        systemMessage,
        ...messages.map((m: any) => ({
          role: m.role === 'developer' ? 'system' : m.role,
          content: m.content,
        })),
      ];

      const response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: requestMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LLM API Error:', errorText);
        throw new Error('LLM API Error');
      }

      // Proxy the stream from LLM API to the client
      const rawStream = response.body;
      if (!rawStream) {
        throw new Error('No response body from LLM');
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const reader = rawStream.getReader();
      
      const clientStream = new ReadableStream({
        async start(controller) {
          let buffer = '';
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              
              // Keep the last partial line in the buffer
              buffer = lines.pop() || '';

              for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine) continue;
                if (cleanLine === 'data: [DONE]') continue;

                if (cleanLine.startsWith('data: ')) {
                  try {
                    const jsonStr = cleanLine.slice(6);
                    const parsed = JSON.parse(jsonStr);
                    const token = parsed.choices?.[0]?.delta?.content || '';
                    if (token) {
                      controller.enqueue(encoder.encode(token));
                    }
                  } catch (err) {
                    // Ignore malformed JSON chunks
                  }
                }
              }
            }
            
            // Flush remaining buffer if any
            if (buffer && buffer.startsWith('data: ')) {
              try {
                const jsonStr = buffer.slice(6);
                const parsed = JSON.parse(jsonStr);
                const token = parsed.choices?.[0]?.delta?.content || '';
                if (token) {
                  controller.enqueue(encoder.encode(token));
                }
              } catch (e) {}
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
            reader.releaseLock();
          }
        },
      });

      return new Response(clientStream, { headers: responseHeaders });
    } else {
      // Fallback: Smart local response generator streamed character-by-character
      const developerMessage = messages.find((m: any) => m.role === 'developer');
      const contextText = developerMessage ? developerMessage.content : '';

      let textResponse = generateFallbackResponse(latestMessage, detectedStress);
      
      // Personalize fallback response using the injected user context summary
      if (contextText) {
        const nameMatch = contextText.match(/Student Name is ([^.]+)\./);
        const username = nameMatch ? nameMatch[1] : 'Arjun';

        if (contextText.includes('High Anxiety')) {
          textResponse += " I know mock tests and backlog anxiety are pulling you down, but let's work on them in small intervals today.";
        } else if (contextText.includes('Exhaustion')) {
          textResponse += ` The sleep debt is compounding, ${username}. Please shut the books and prioritize your rest tonight.`;
        }
      }

      const encoder = new TextEncoder();
      
      const simulatedStream = new ReadableStream({
        async start(controller) {
          // Stream character-by-character to client with a tiny pacing delay
          for (let i = 0; i < textResponse.length; i++) {
            controller.enqueue(encoder.encode(textResponse[i]));
            // Wait 15ms per character to create a natural, streaming typewriter effect
            await new Promise((resolve) => setTimeout(resolve, 15));
          }
          controller.close();
        },
      });

      return new Response(simulatedStream, { headers: responseHeaders });
    }
  } catch (error: any) {
    console.error('API Chat Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
