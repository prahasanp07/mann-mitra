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
    const username = localStorage.getItem('mannmitra_username') || 'Arjun';
    const exam = localStorage.getItem('mannmitra_exam') || 'JEE Mains';
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

    return `[Context: Student Name is ${username}. The student is preparing for ${exam}. Their last ${daysCount} entries showed ${emotionsStr} triggered by ${triggersStr}. Respond with this context in mind but do not explicitly mention reading their logs.]`;
  } catch (e) {
    console.error('Error reading context summary:', e);
    return null;
  }
}

function cleanContent(text: string): string {
  if (!text) return '';
  return text.replace(/\[TRIGGER_BREATHING\]/g, '').replace(/\[TRIGGER_NSDR\]/g, '').trim();
}

export function BreathingPacerWidget() {
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // 0 to 16000 ms

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => (prev + 50) % 16000);
    }, 50);
    return () => clearInterval(interval);
  }, [isActive]);

  const phaseDuration = 4000;
  const phaseIndex = Math.floor(elapsedTime / phaseDuration); // 0, 1, 2, 3
  const phaseTime = elapsedTime % phaseDuration; // 0 to 3999

  let scale = 0.75;
  let phaseText = '';
  let phaseColor = 'from-teal-400 to-emerald-500 shadow-emerald-200';
  let instruction = '';

  if (phaseIndex === 0) {
    // Inhale
    scale = 0.75 + 0.5 * (phaseTime / phaseDuration);
    phaseText = 'Inhale';
    phaseColor = 'from-teal-400 to-emerald-500 shadow-emerald-200/50';
    instruction = 'Breathe in slowly through your nose...';
  } else if (phaseIndex === 1) {
    // Hold-In
    scale = 1.25;
    phaseText = 'Hold';
    phaseColor = 'from-[#457b9d] to-[#1d3557] shadow-blue-200/50';
    instruction = 'Hold your breath and feel the fullness...';
  } else if (phaseIndex === 2) {
    // Exhale
    scale = 1.25 - 0.5 * (phaseTime / phaseDuration);
    phaseText = 'Exhale';
    phaseColor = 'from-amber-400 to-rose-500 shadow-rose-200/50';
    instruction = 'Release gently through your mouth...';
  } else {
    // Hold-Out
    scale = 0.75;
    phaseText = 'Hold';
    phaseColor = 'from-slate-400 to-slate-500 shadow-slate-200/50';
    instruction = 'Hold empty before the next breath...';
  }

  const secondsLeft = Math.ceil((phaseDuration - phaseTime) / 1000);

  const handleToggle = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setElapsedTime(0);
    }
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm max-w-sm mt-3 flex flex-col items-center select-none w-full">
      <div className="flex items-center gap-2 mb-3 w-full">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deep Focus Breathing</span>
      </div>
      
      {/* Pacer Outer Container */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-4">
        {/* Outer guide ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1d3557]/10" />
        
        {/* Inner breathing circle */}
        <div
          className={`absolute rounded-full bg-gradient-to-br ${phaseColor} flex flex-col items-center justify-center text-white font-bold transition-all duration-[75ms] ease-out shadow-[0_10px_25px_-5px_rgba(29,53,87,0.15)]`}
          style={{
            width: '120px',
            height: '120px',
            transform: `scale(${isActive ? scale : 0.83})`,
          }}
        >
          <span className="text-base tracking-widest uppercase font-extrabold">{isActive ? phaseText : 'READY'}</span>
          {isActive && <span className="text-[10px] font-bold tracking-wider opacity-85 mt-0.5">{secondsLeft}s</span>}
        </div>
      </div>

      <div className="flex gap-1.5 mb-3 mt-1">
        {['Inhale', 'Hold (In)', 'Exhale', 'Hold (Out)'].map((pName, idx) => {
          const isCurrent = isActive && phaseIndex === idx;
          return (
            <span
              key={idx}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 ${
                isCurrent
                  ? 'bg-[#1d3557] text-white'
                  : 'bg-slate-50 text-slate-400 border border-slate-100'
              }`}
            >
              {pName}
            </span>
          );
        })}
      </div>
      
      <p className="text-xs font-medium text-slate-600 text-center min-h-[32px] px-4 leading-relaxed">
        {isActive ? instruction : 'Click start to begin the 4-4-4-4 box breathing cycle to calm your nervous system.'}
      </p>
      
      <button
        onClick={handleToggle}
        className={`mt-3 px-5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
          isActive
            ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100'
            : 'bg-[#1d3557] text-white hover:bg-[#234676] shadow-sm shadow-[#1d3557]/20'
        }`}
      >
        {isActive ? 'Pause' : 'Start Pacer'}
      </button>
    </div>
  );
}

export function NSDRPlayerWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // 0 to 600 seconds
  const [pulse, setPulse] = useState(72);

  // Time tracker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= 600) {
          setIsPlaying(false);
          return 600;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Pulse fluctuation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPulse(() => {
        return Math.floor(Math.random() * 5) + 70; // 70 to 74
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm max-w-sm mt-3 flex flex-col w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1d3557] animate-pulse" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">NSDR Rest Protocol</span>
        </div>
        
        {/* Live Pulse Pill */}
        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all">
          <span className={`w-1.5 h-1.5 rounded-full bg-rose-500 ${isPlaying ? 'animate-ping' : ''}`} />
          <span>🔴 Live Pulse: {isPlaying ? pulse : '72'} BPM</span>
        </div>
      </div>

      {/* Description text */}
      <p className="text-xs text-slate-500 leading-relaxed mb-4">
        Your current data suggests high stress levels and a significant sleep deficit. This 10-minute Non-Sleep Deep Rest (NSDR) audio guide will help reduce cortisol, activate your parasympathetic nervous system, and reset your mind.
      </p>

      {/* Wave animation */}
      <div className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center mb-4">
        <style>{`
          @keyframes wave-flow {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .wave-animated {
            animation: wave-flow 3s linear infinite;
          }
        `}</style>
        {isPlaying ? (
          <svg viewBox="0 0 100 20" className="w-[200%] h-full absolute left-0 text-[#1d3557]/15 fill-current wave-animated">
            <path d="M 0 10 C 12.5 5, 12.5 15, 25 10 C 37.5 5, 37.5 15, 50 10 C 62.5 5, 62.5 15, 75 10 C 87.5 5, 87.5 15, 100 10 L 100 20 L 0 20 Z" />
            <path d="M 0 12 C 15 8, 15 16, 30 12 C 45 8, 45 16, 60 12 C 75 8, 75 16, 90 12 L 90 20 L 0 20 Z" className="opacity-60" />
          </svg>
        ) : (
          <span className="text-xs font-semibold text-slate-400">Audio session paused</span>
        )}
      </div>

      {/* Player Controls & Slider */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-[#1d3557] hover:bg-[#234676] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#1d3557]/20 transition-all active:scale-95"
        >
          {isPlaying ? (
            /* Pause Icon */
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            /* Play Icon */
            <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Slider and Timers */}
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="range"
            min="0"
            max="600"
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1d3557] focus:outline-none"
          />
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>10:00</span>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [username, setUsername] = useState('Arjun');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('mannmitra_username');
      if (storedName) {
        setUsername(storedName);
        setMessages((prev) => 
          prev.map((msg) => {
            const updatedContent = msg.content.replace(/Arjun/g, storedName);
            const updatedName = msg.name === 'Arjun' ? (storedName as any) : msg.name;
            return {
              ...msg,
              content: updatedContent,
              name: updatedName,
            };
          })
        );
      }
    }
  }, []);

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

    const normalizedText = text.toLowerCase();
    const highRiskKeywords = [
      'give up', 
      'suicide', 
      'cannot live', 
      'end everything', 
      'kill myself', 
      'ending my life', 
      'want to die', 
      'self-harm', 
      'self harm', 
      'hang myself', 
      'slit my wrist', 
      'no point living', 
      'better off dead'
    ];
    const isHighRisk = highRiskKeywords.some(keyword => normalizedText.includes(keyword));

    if (isHighRisk) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        name: username as any,
        content: text,
        timestamp: new Date(),
      };
      const safetyReply: Message = {
        id: `safety-${Date.now()}`,
        role: 'assistant',
        name: 'Mitra',
        content: `${username}, I am right here with you, but I want to make sure you get the best human care possible right now. Please lean on these dedicated guides.`,
        stressLevel: 'overwhelmed',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage, safetyReply]);
      setInputValue('');
      setShowSafetyModal(true);
      setStressLevel('overwhelmed');
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      name: username as any,
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
              <div className="w-full h-full bg-gradient-to-br from-[#1d3557] to-[#457b9d] flex items-center justify-center text-white text-xs font-bold uppercase animate-fade-in">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Message Scroll Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((message) => {
            const hasBreathing = message.content.includes('[TRIGGER_BREATHING]');
            const hasNSDR = message.content.includes('[TRIGGER_NSDR]');
            const displayContent = cleanContent(message.content);

            return (
              <div
                key={message.id}
                className={`flex w-full flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
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
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayContent}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Arjun (Right-Aligned, Crisp Dark Blue Text Blocks) */
                    <div className="max-w-[70%] text-right">
                      <div className="text-[10px] font-bold text-gray-500 mb-1 mr-1">{message.name}</div>
                      <div className="bg-[#1d3557] text-white rounded-2xl rounded-tr-none px-4 py-3 text-left shadow-md">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayContent}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Widgets render below the assistant's response bubble */}
                {message.role === 'assistant' && (hasBreathing || hasNSDR) && (
                  <div className="ml-11 flex flex-col gap-2">
                    {hasBreathing && <BreathingPacerWidget />}
                    {hasNSDR && <NSDRPlayerWidget />}
                  </div>
                )}
              </div>
            );
          })}

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
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{cleanContent(displayedText || streamedText)}</p>
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

      {/* High-contrast Safety Support Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slide-up {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 0.25s ease-out forwards;
            }
            .animate-slide-up {
              animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="bg-slate-900 text-white rounded-3xl border border-rose-500 max-w-md w-full overflow-hidden shadow-[0_20px_50px_rgba(244,63,94,0.3)] animate-slide-up">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-extrabold text-base tracking-wide">Emergency Support Available</h3>
              </div>
              <button 
                onClick={() => setShowSafetyModal(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {username}, you do not have to carry this heavy load alone. Professional, completely confidential human support is available 24/7. Please reach out to these dedicated student helplines right now:
              </p>

              <div className="space-y-3 pt-2">
                {/* Vandrevala Foundation */}
                <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-1 hover:border-rose-500/30 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Vandrevala Foundation</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">24/7 Active</span>
                  </div>
                  <a 
                    href="tel:+919999666555" 
                    className="text-lg font-black text-white hover:text-rose-500 flex items-center gap-2 transition-all mt-1"
                  >
                    <svg className="w-5 h-5 text-rose-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    +91 9999 666 555
                  </a>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Free Counseling & Crisis Care</span>
                    <a href="https://www.vandrevalafoundation.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-rose-400 font-semibold">vandrevalafoundation.com</a>
                  </div>
                </div>

                {/* AASRA */}
                <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-1 hover:border-rose-500/30 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">AASRA Helpline</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">24/7 Support</span>
                  </div>
                  <a 
                    href="tel:+919820466726" 
                    className="text-lg font-black text-white hover:text-rose-500 flex items-center gap-2 transition-all mt-1"
                  >
                    <svg className="w-5 h-5 text-rose-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    +91 98204 66726
                  </a>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Confidential Suicide Prevention</span>
                    <a href="https://www.aasra.info" target="_blank" rel="noopener noreferrer" className="hover:underline text-rose-400 font-semibold">aasra.info</a>
                  </div>
                </div>
                
                {/* Gov Support */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-300">
                    <span>Tele MANAS Support:</span>
                    <a href="tel:14416" className="text-rose-400 hover:underline">14416</a>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-300">
                    <span>KIRAN Govt Support:</span>
                    <a href="tel:18005990019" className="text-rose-400 hover:underline">1800-599-0019</a>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => setShowSafetyModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold transition-all hover:text-white"
                >
                  I understand, close guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CompanionChat;
