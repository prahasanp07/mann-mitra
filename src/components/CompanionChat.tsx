'use strict';

import React, { useState, useEffect, useRef } from 'react';
import { StressLevel } from '@/lib/mitra-agent';
import { useTypewriter } from '@/hooks/useTypewriter';
import { StressOrb } from './StressOrb';

interface HistoryEntry {
  timestamp: string;
  primary_emotion: string;
  triggers: string[];
}

function getUserContextSummary(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('mannmitra_history');
    if (!raw) return null;
    const history: HistoryEntry[] = JSON.parse(raw);
    if (!Array.isArray(history) || history.length === 0) return null;
    
    // Get last 3 entries
    const last3 = history.slice(-3);
    const emotions = last3.map(e => e.primary_emotion);
    const allTriggers = last3.flatMap(e => e.triggers || []);
    const uniqueTriggers = Array.from(new Set(allTriggers));
    
    if (emotions.length === 0) return null;
    
    const daysCount = last3.length;
    const uniqueEmotions = Array.from(new Set(emotions));
    const emotionsStr = uniqueEmotions.length > 1
      ? `${uniqueEmotions.slice(0, -1).map(e => `'${e}'`).join(', ')} and '${uniqueEmotions[uniqueEmotions.length - 1]}'`
      : `'${uniqueEmotions[0]}'`;

    const triggersStr = uniqueTriggers.length > 1
      ? `${uniqueTriggers.slice(0, -1).map(t => `'${t}'`).join(', ')} and '${uniqueTriggers[uniqueTriggers.length - 1]}'`
      : uniqueTriggers.map(t => `'${t}'`)[0];

    return `[Context: The student is preparing for JEE Mains. Their last ${daysCount} entries showed ${emotionsStr} triggered by ${triggersStr}. Respond with this context in mind but do not explicitly mention reading their logs.]`;
  } catch (e) {
    console.error('Error reading context summary:', e);
    return null;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  name: 'Arjun' | 'Mitra';
  content: string;
  stressLevel?: StressLevel;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  { text: "My mock test marks dropped, feel so lost...", label: "Mock Test" },
  { text: "Physics backlog is too huge, I'm stressed.", label: "Backlog" },
  { text: "I'm study fatigued and can't focus on rotation mechanics.", label: "Exhaustion" },
  { text: "I haven't slept in two days, my head is heavy.", label: "Sleeplessness" },
];

interface CompanionChatProps {
  stressLevel: StressLevel;
  setStressLevel: (level: StressLevel) => void;
}

export function CompanionChat({ stressLevel, setStressLevel }: CompanionChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      name: 'Mitra',
      content: "Hey Arjun. I know how heavy the prep load is right now, and I'm right here with you. How are you feeling today?",
      stressLevel: 'calm',
      timestamp: new Date(Date.now() - 60000 * 5),
    },
    {
      id: 'history-1',
      role: 'user',
      name: 'Arjun',
      content: "I failed my mock test today, and my physics rotation mechanics backlog is completely crushing me.",
      timestamp: new Date(Date.now() - 60000 * 4),
    },
    {
      id: 'history-2',
      role: 'assistant',
      name: 'Mitra',
      content: "It makes total sense that rotation mechanics feels overwhelming right now, especially after a score drop. You are carrying so much expectation, but one test does not define your future. Let's just focus on taking a slow breath right now.",
      stressLevel: 'stressed',
      timestamp: new Date(Date.now() - 60000 * 3),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { displayedText, isTyping, reset: resetTypewriter } = useTypewriter(streamedText, isStreaming);

  // Auto-scroll to bottom on new messages or typing updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedText, isTyping]);

  // Sync stress level changes and typewriter commits
  useEffect(() => {
    if (!isStreaming && isTyping === false && displayedText.length > 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          name: 'Mitra',
          content: displayedText,
          stressLevel: stressLevel,
          timestamp: new Date(),
        },
      ]);
      resetTypewriter();
      setStreamedText('');
    }
  }, [isStreaming, isTyping, displayedText, stressLevel, resetTypewriter]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      name: 'Arjun',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);
    setStreamedText('');
    resetTypewriter();

    try {
      const history: Array<{ role: string; content: string }> = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Extract context summary from browser's local storage and append as developer message
      const contextSummary = getUserContextSummary();
      if (contextSummary) {
        history.push({
          role: 'developer',
          content: contextSummary,
        });
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: history,
          stressLevel: stressLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('API Request Failed');
      }

      const serverDetectedStress = response.headers.get('X-Detected-Stress-Level') as StressLevel;
      if (serverDetectedStress && ['calm', 'tired', 'stressed', 'overwhelmed'].includes(serverDetectedStress)) {
        setStressLevel(serverDetectedStress);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response stream not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setStreamedText((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setStreamedText('I\'m sorry, I hit a snag connecting to my servers. It makes total sense if you feel frustrated by this. I\'m still right here if you want to write.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  // Dynamic Status Pill Text based on current sentiment
  const getStatusPill = () => {
    if (isStreaming || isTyping) {
      return {
        text: '✍️ Mitra is writing...',
        style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    }
    if (isListening) {
      return {
        text: '🎙️ Listening to Voice Input...',
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
      };
    }
    
    switch (stressLevel) {
      case 'calm':
        return {
          text: '🟢 Listening Intently',
          style: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        };
      case 'tired':
        return {
          text: '💤 Supporting Fatigue Recovery',
          style: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        };
      case 'stressed':
        return {
          text: '⚡ Attuning to Stress Levels',
          style: 'bg-amber-50 text-amber-700 border-amber-100',
        };
      case 'overwhelmed':
        return {
          text: '⚡ Supporting Panic Reset',
          style: 'bg-rose-50 text-rose-700 border-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.08)]',
        };
    }
  };

  const statusPill = getStatusPill();

  const handleMicClick = () => {
    if (isStreaming || isTyping) return;
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate simple voice-to-text injection
      setTimeout(() => {
        setInputValue("I feel exhausted and cannot concentrate on organic chemistry.");
        setIsListening(false);
      }, 3000);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#f4f6fa]">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-between h-full bg-[#f4f6fa] relative">
        {/* Top Header Bar matching Student Dashboard layout */}
        <header className="h-16 border-b border-[#e2e8f0] px-6 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            {/* Dynamic Status Pill */}
            <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${statusPill.style}`}>
              {statusPill.text}
            </div>
          </div>
          
          {/* Top-Right indicators (Notification Bell, Settings, Arjun Avatar) */}
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#e2e8f0] relative">
              {/* Profile image container */}
              <div className="w-full h-full bg-gradient-to-br from-[#1d3557] to-[#457b9d] flex items-center justify-center text-white text-xs font-bold uppercase">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Message Scroll Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' ? (
                /* Mitra (Left-Aligned, Light grey-blue bg, Mitra Bot Avatar) */
                <div className="flex items-start gap-3 max-w-[70%]">
                  {/* Bot Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#e9eff6] flex items-center justify-center shrink-0 border border-[#d0dfef] shadow-sm">
                    <svg className="w-4 h-4 text-[#1d3557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 mb-1 ml-1">Mitra</div>
                    <div className="bg-[#e9eff6] text-[#0f172a] rounded-2xl rounded-tl-none px-4 py-3 border border-[#dce6f0] shadow-sm">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Arjun (Right-Aligned, Crisp Dark Blue Text Blocks) */
                <div className="max-w-[70%] text-right">
                  <div className="text-[10px] font-bold text-gray-500 mb-1 mr-1">Arjun</div>
                  <div className="bg-[#1d3557] text-white rounded-2xl rounded-tr-none px-4 py-3 text-left shadow-md">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing/Streaming placeholder */}
          {(isStreaming || isTyping) && (
            <div className="flex w-full justify-start">
              <div className="flex items-start gap-3 max-w-[70%]">
                <div className="w-8 h-8 rounded-full bg-[#e9eff6] flex items-center justify-center shrink-0 border border-[#d0dfef] shadow-sm">
                  <svg className="w-4 h-4 text-[#1d3557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 mb-1 ml-1">Mitra</div>
                  <div className="bg-[#e9eff6] text-[#0f172a] rounded-2xl rounded-tl-none px-4 py-3 border border-[#dce6f0] shadow-sm">
                    {isStreaming && !displayedText ? (
                      <span className="flex gap-1.5 items-center py-1">
                        <span className="w-1.5 h-1.5 bg-[#1d3557] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#1d3557] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#1d3557] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayedText || streamedText}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area and Chips */}
        <div className="p-6 border-t border-[#e2e8f0] bg-white">
          {/* Quick-Prompt suggestions */}
          {messages.length <= 3 && !isStreaming && !isTyping && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt.text)}
                    className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-gray-600 hover:text-gray-900 px-3.5 py-2 rounded-xl text-xs border border-[#e2e8f0] text-left transition-all duration-150"
                  >
                    <span className="text-[#1d3557] font-semibold mr-1">{prompt.label}:</span>
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Minimalist rounded input bar with microphone and send button */}
          <div className="relative flex items-center border border-[#e2e8f0] rounded-2xl bg-[#f8fafc] p-1.5 transition-all duration-150 focus-within:bg-white focus-within:border-[#1d3557]/45 focus-within:ring-2 focus-within:ring-[#1d3557]/5">
            {/* Microphone icon for voice-to-text */}
            <button
              onClick={handleMicClick}
              disabled={isStreaming || isTyping}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                  : 'text-gray-400 hover:text-[#1d3557] hover:bg-[#f1f5f9]'
              }`}
              title="Voice to text"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell Mitra what's stressing you..."
              disabled={isStreaming || isTyping}
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none text-[#0f172a] placeholder-gray-400 px-3 py-2 focus:outline-none min-h-[38px] max-h-[120px] scrollbar-none"
            />
            
            {/* Send button with arrow icon */}
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isStreaming || isTyping}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                inputValue.trim() && !isStreaming && !isTyping
                  ? 'bg-[#1d3557] text-white hover:bg-[#234676] shadow-sm shadow-[#1d3557]/20'
                  : 'text-gray-300 bg-white/5 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <div className="flex justify-between items-center mt-2.5 px-1 text-[10px] text-gray-400 font-semibold">
            <span>Mitra response is kept to 2-3 sentences to minimize cognitive fatigue.</span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>

      {/* Right panel featuring the Stress Orb and status card styled in light mode */}
      <div className="w-72 border-l border-[#e2e8f0] bg-white flex flex-col justify-start items-center shrink-0 h-full p-6 relative overflow-hidden">
        {/* Soft glow circle behind orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#1d3557]/3 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center w-full mt-4">
          <StressOrb stressLevel={stressLevel} />
          
          {/* Dynamic manual override card */}
          <div className="dashboard-card p-5 w-full mt-6 bg-[#fcfdfe]">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Manual Stress Aura</h4>
            <div className="flex flex-col gap-1.5">
              {(['calm', 'tired', 'stressed', 'overwhelmed'] as StressLevel[]).map((level) => {
                const isActive = stressLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => setStressLevel(level)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg capitalize border text-left transition-all ${
                      isActive
                        ? level === 'calm'
                          ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                          : level === 'tired'
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                          : level === 'stressed'
                          ? 'bg-amber-50 border-amber-200 text-amber-700 font-bold'
                          : 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                        : 'bg-white border-gray-150 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {level === 'calm' ? 'Low (Calm)' : level === 'tired' ? 'Moderate (Tired)' : level === 'stressed' ? 'High (Stressed)' : 'Severe (Overwhelmed)'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CompanionChat;
