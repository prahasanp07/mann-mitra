'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { CompanionChat } from '@/components/CompanionChat';
import { StressLevel } from '@/lib/mitra-agent';

type Tab = 'dashboard' | 'journal' | 'insights' | 'mindfulness' | 'companion';

export default function CompanionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('companion');
  const [stressLevel, setStressLevel] = useState<StressLevel>('stressed');

  // Focus Timer States (Mindfulness tab)
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerType, setTimerType] = useState<'study' | 'shortBreak' | 'longBreak'>('study');

  // Journal Entry State
  const [journalText, setJournalText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // User State
  const [username, setUsername] = useState('Arjun');
  const [exam, setExam] = useState('JEE Mains');

  // Mindfulness & Neurobiological Features State
  const [mindfulnessTab, setMindfulnessTab] = useState<'timer' | 'sigh' | 'panoramic'>('timer');
  const [sighActive, setSighActive] = useState(false);
  const [sighTime, setSighTime] = useState(0);

  const [showNSDRModal, setShowNSDRModal] = useState(false);
  const [nsdrTimeLeft, setNsdrTimeLeft] = useState(600);
  const [nsdrActive, setNsdrActive] = useState(false);

  const [showPanoramicModal, setShowPanoramicModal] = useState(false);

  // Physiological Sigh Timer
  useEffect(() => {
    if (!sighActive) return;
    const interval = setInterval(() => {
      setSighTime((prev) => (prev + 50) % 9000);
    }, 50);
    return () => clearInterval(interval);
  }, [sighActive]);

  // NSDR Timer
  useEffect(() => {
    if (!nsdrActive) return;
    const interval = setInterval(() => {
      setNsdrTimeLeft((prev) => {
        if (prev <= 0) {
          setNsdrActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nsdrActive]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('mannmitra_username');
      const storedExam = localStorage.getItem('mannmitra_exam');
      if (storedName) setUsername(storedName);
      if (storedExam) setExam(storedExam);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  // Initialize local storage mock history for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('mannmitra_history');
      if (!existing) {
        const initialHistory = [
          {
            timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
            primary_emotion: 'High Anxiety',
            triggers: ['Physics Mock Tests', 'Syllabus Backlog']
          },
          {
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            primary_emotion: 'High Anxiety',
            triggers: ['Physics Mock Tests', 'Sleep Debt']
          },
          {
            timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
            primary_emotion: 'Exhaustion',
            triggers: ['Sleep Debt', 'Rotation Mechanics']
          }
        ];
        localStorage.setItem('mannmitra_history', JSON.stringify(initialHistory));
      }
    }
  }, []);

  // Sync Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds((prev) => prev - 1);
        } else if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            setTimerActive(false);
            alert(`Timer complete! Take a moment to check in with Mitra.`);
            handleResetTimer();
          } else {
            setTimerMinutes((prev) => prev - 1);
            setTimerSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerMinutes, timerSeconds]);

  const handleResetTimer = () => {
    setTimerActive(false);
    if (timerType === 'study') setTimerMinutes(25);
    else if (timerType === 'shortBreak') setTimerMinutes(5);
    else setTimerMinutes(15);
    setTimerSeconds(0);
  };

  const handleSetTimerType = (type: 'study' | 'shortBreak' | 'longBreak') => {
    setTimerType(type);
    setTimerActive(false);
    setTimerSeconds(0);
    if (type === 'study') setTimerMinutes(25);
    else if (type === 'shortBreak') setTimerMinutes(5);
    else setTimerMinutes(15);
  };

  // Reset all state and go back to the landing page
  const handleGoHome = () => {
    setActiveTab('companion');
    setStressLevel('stressed');
    setTimerMinutes(25);
    setTimerSeconds(0);
    setTimerActive(false);
    setTimerType('study');
    setJournalText('');
    setIsSaved(false);
    setMindfulnessTab('timer');
    setSighActive(false);
    setSighTime(0);
    setShowNSDRModal(false);
    setNsdrTimeLeft(600);
    setNsdrActive(false);
    setShowPanoramicModal(false);
    router.push('/');
  };

  // Helper values for Stress Gauge in Dashboard
  const getStressDetails = (level: StressLevel) => {
    switch (level) {
      case 'calm':
        return { percentage: 25, label: 'Low', description: 'Your stress level is currently low. Keep maintaining this focus rhythm.', observation: 'Your heart rate is steady. You are in a prime position to tackle critical concepts.' };
      case 'tired':
        return { percentage: 50, label: 'Moderate', description: 'Your energy levels are dipping. Mitra recommends a brief break.', observation: 'Mindful breaks are slightly below target. Rest your eyes for a few minutes.' };
      case 'stressed':
        return { percentage: 68, label: 'Elevated', description: 'Stress levels are climbing due to backlog guilt. Breathe.', observation: 'Your heart rate is slightly elevated. Consider a short 5-minute walk.' };
      case 'overwhelmed':
        return { percentage: 90, label: 'Severe', description: 'High anxiety detected. Mitra suggests pausing all mock test prep.', observation: 'High cognitive overload detected. Let us perform a panic reset exercise.' };
    }
  };

  const stressInfo = getStressDetails(stressLevel);

  // Dynamic Mitra quote for dashboard based on stress state
  const getMitraQuote = (level: StressLevel) => {
    switch (level) {
      case 'calm': return `One block at a time, ${username}. You're building a solid baseline. Enjoy the flow of coding or math today.`;
      case 'tired': return `It's okay to feel fatigued, ${username}. Sleep is structural prep—not wasted time. Let's wrap up soon.`;
      case 'stressed': return `Rotation mechanics or backlogs might feel heavy, ${username}, but your efforts are compounding. Breathe, we have this.`;
      case 'overwhelmed': return `Stop the timer, ${username}. Nothing is more urgent than your safety and peace. Take a long exhale, I am right here.`;
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f6fa] text-[#0f172a] overflow-hidden font-sans">
      {/* Dynamic Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as Tab)} stressLevel={stressLevel} onLogoClick={handleGoHome} />

      {/* Main Dashboard Pages */}
      <main className="flex-1 h-full overflow-hidden flex flex-col bg-[#f4f6fa]">
        
        {/* COMPANION TAB - Conversational interface */}
        {activeTab === 'companion' && (
          <CompanionChat stressLevel={stressLevel} setStressLevel={setStressLevel} />
        )}

        {/* DASHBOARD TAB - Matches Student Dashboard.png */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
            {/* Header Area */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200/60">
              <div>
                <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">{getGreeting()}, {username}.</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">Let's find your focus today. Your {exam} prep is on track.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#1d3557] flex items-center justify-center text-white font-bold text-sm">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Top row widget grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Stress Level Meter Card (3/5 wide) */}
              <div className="dashboard-card p-6 md:col-span-3 flex items-center justify-between bg-white">
                <div className="flex items-center gap-6">
                  {/* Circular progress meter */}
                  <div className="relative w-36 h-36 flex items-center justify-center rounded-full border border-gray-100 bg-[#f8fafc]">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                      <circle cx="50" cy="50" r="40" stroke="#1d3557" strokeWidth="8" fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * stressInfo.percentage) / 100}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-[#0f172a]">{stressInfo.percentage}%</span>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{stressInfo.label}</p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="max-w-[200px]">
                    <h3 className="text-lg font-bold text-[#0f172a]">Stress Level</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-medium">
                      Currently <span className="font-bold text-[#1d3557]">{stressInfo.label}</span>. {stressInfo.description}
                    </p>
                  </div>
                </div>

                {/* Observation pill */}
                <div className="bg-[#f0fdf4] border border-emerald-100 rounded-2xl p-4 max-w-[200px]">
                  <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase block mb-1">ℹ️ Observation</span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    {stressInfo.observation}
                  </p>
                </div>
              </div>

              {/* Mitra's Note Card (2/5 wide, Dark blue) */}
              <div className="dashboard-card p-6 md:col-span-2 bg-[#234676] text-white flex flex-col justify-between relative overflow-hidden shadow-lg">
                <div className="absolute top-2 right-4 text-white/5 text-8xl font-serif select-none">”</div>
                <div className="relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold tracking-wider uppercase opacity-75">Mitra's Note</h3>
                  <p className="text-sm italic font-medium mt-3 leading-relaxed">
                    "{getMitraQuote(stressLevel)}"
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 relative z-10 text-[10px] font-bold opacity-80 uppercase tracking-widest">
                  <span>Emotional Pulse: {stressLevel}</span>
                  <svg className="w-4 h-4 text-rose-400 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Row grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Progress Widget */}
              <div className="dashboard-card p-6 bg-white space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="font-extrabold text-[#0f172a]">Daily Progress</h3>
                  <span className="text-xs font-bold text-gray-500">4/6 Blocks</span>
                </div>
                
                <div className="space-y-4">
                  {/* Study Progress bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1">
                      <span>Study Blocks (JEE)</span>
                      <span>66%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1d3557] rounded-full" style={{ width: '66%' }} />
                    </div>
                  </div>

                  {/* Mindfulness break bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1">
                      <span>Mindfulness Breaks</span>
                      <span>50%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-2">
                  <div className="bg-[#f8fafc] border border-gray-100 p-3 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Study</span>
                    <span className="text-xl font-extrabold text-[#0f172a] mt-0.5 block">4.5h</span>
                  </div>
                  <div className="bg-[#f8fafc] border border-gray-100 p-3 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Focus Score</span>
                    <span className="text-xl font-extrabold text-[#0f172a] mt-0.5 block">88%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="dashboard-card p-6 bg-white space-y-4">
                <h3 className="font-extrabold text-[#0f172a] pb-2 border-b border-gray-100">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3.5">
                  <button onClick={() => setActiveTab('journal')} className="p-4 rounded-2xl bg-[#f8fafc] border border-gray-150 text-left hover:bg-[#1d3557]/5 hover:border-[#1d3557]/20 transition-all flex gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 self-start">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-gray-800 block">Start Journaling</span>
                      <span className="text-[10px] text-gray-500 mt-0.5 block">Voice or text</span>
                    </div>
                  </button>

                  <button onClick={() => setActiveTab('mindfulness')} className="p-4 rounded-2xl bg-[#f8fafc] border border-gray-150 text-left hover:bg-emerald-50 hover:border-emerald-200 transition-all flex gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 self-start">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-gray-800 block">5-min Breathing</span>
                      <span className="text-[10px] text-gray-500 mt-0.5 block">Center yourself</span>
                    </div>
                  </button>

                  <button onClick={() => setActiveTab('insights')} className="p-4 rounded-2xl bg-[#f8fafc] border border-gray-150 text-left hover:bg-indigo-50 hover:border-indigo-200 transition-all flex gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 self-start">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-gray-800 block">View Insights</span>
                      <span className="text-[10px] text-gray-500 mt-0.5 block">Weekly trends</span>
                    </div>
                  </button>

                  <button onClick={() => setActiveTab('mindfulness')} className="p-4 rounded-2xl bg-[#f8fafc] border border-gray-150 text-left hover:bg-amber-50 hover:border-amber-200 transition-all flex gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 self-start">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-gray-800 block">Sleep Schedule</span>
                      <span className="text-[10px] text-gray-500 mt-0.5 block">Optimize rest</span>
                    </div>
                  </button>

                  <button onClick={() => setShowPanoramicModal(true)} className="p-4 rounded-2xl bg-[#f8fafc] border border-gray-150 text-left hover:bg-violet-50 hover:border-violet-200 transition-all flex gap-3">
                    <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 self-start">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-gray-800 block">Panoramic Vision</span>
                      <span className="text-[10px] text-gray-500 mt-0.5 block">Peripheral dilation</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom full width Yesterday's Insight card */}
            <div className="dashboard-card p-6 bg-white flex justify-between items-center border-l-4 border-l-[#1d3557]">
              <div className="max-w-[70%]">
                <div className="flex gap-4 items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded border">Yesterday's Insight</span>
                  <span className="text-[9px] font-bold text-gray-400">May 24, 2026</span>
                </div>
                <h4 className="text-lg font-bold text-[#0f172a] mt-3">"Focus was better in the morning, but physics rotation felt overwhelming..."</h4>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Mitra responded: "You've categorized your struggle. Let's tackle rotation in smaller 20-minute chunks tomorrow."
                </p>
              </div>
              <button onClick={() => setActiveTab('companion')} className="px-5 py-3.5 bg-[#234676] hover:bg-[#1d3557] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
                Continue Conversation
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* JOURNAL TAB - Matches AI Journaling Flow.png */}
        {activeTab === 'journal' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Main entry area */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-start items-center">
              <div className="max-w-xl w-full space-y-6">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[9px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Flow State Active
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">What's on your mind today?</h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium">How was your Mock Test? Take your time to reflect.</p>
                </div>

                {/* Journal Editor Box */}
                <div className="dashboard-card bg-white p-6 min-h-[380px] flex flex-col justify-between border-gray-200">
                  <textarea
                    value={journalText}
                    onChange={(e) => {
                      setJournalText(e.target.value);
                      setIsSaved(false);
                    }}
                    placeholder="Start typing your thoughts here... Mitra is listening."
                    className="w-full h-[280px] bg-transparent text-sm text-[#0f172a] placeholder-gray-400 resize-none focus:outline-none leading-relaxed font-medium"
                  />
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {isSaved ? '✅ Entry saved automatically' : '✏️ Draft saved locally'}
                    </span>
                    <button
                      onClick={() => {
                        if (journalText.trim()) {
                          const textLower = journalText.toLowerCase();
                          const triggers: string[] = [];
                          
                          if (textLower.includes('test') || textLower.includes('marks') || textLower.includes('score')) {
                            triggers.push('Physics Mock Tests');
                          }
                          if (textLower.includes('backlog') || textLower.includes('syllabus') || textLower.includes('physics') || textLower.includes('rotation')) {
                            triggers.push('Syllabus Backlog');
                          }
                          if (textLower.includes('sleep') || textLower.includes('tired') || textLower.includes('exhaust')) {
                            triggers.push('Sleep Debt');
                          }
                          if (triggers.length === 0) {
                            triggers.push('Daily Prep Load');
                          }

                          let primary_emotion = 'Mild Stress';
                          if (textLower.includes('anxiety') || textLower.includes('panic') || textLower.includes('scared') || textLower.includes('stressed')) {
                            primary_emotion = 'High Anxiety';
                          } else if (textLower.includes('tired') || textLower.includes('sleepy') || textLower.includes('fatigue')) {
                            primary_emotion = 'Exhaustion';
                          } else if (textLower.includes('happy') || textLower.includes('good') || textLower.includes('better')) {
                            primary_emotion = 'Calm Focus';
                          }

                          const newEntry = {
                            timestamp: new Date().toISOString(),
                            primary_emotion,
                            triggers
                          };

                          try {
                            const raw = localStorage.getItem('mannmitra_history');
                            const history = raw ? JSON.parse(raw) : [];
                            history.push(newEntry);
                            localStorage.setItem('mannmitra_history', JSON.stringify(history));
                          } catch (e) {
                            console.error('Local storage write failed:', e);
                          }

                          setIsSaved(true);
                          setJournalText('');
                          alert('Reflection added to AI Journal history.');
                        }
                      }}
                      disabled={!journalText.trim()}
                      className="px-5 py-2.5 bg-[#1d3557] hover:bg-[#234676] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Save Journal Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar panel - Reflective Prompts */}
            <div className="w-72 border-l border-[#e2e8f0] bg-white p-6 flex flex-col justify-between h-full relative z-10 shrink-0">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-gray-700 pb-2 border-b border-gray-100">
                  <svg className="w-5 h-5 text-[#1d3557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="font-extrabold text-sm text-[#0f172a]">Reflective Prompts</h3>
                </div>

                {/* Prompt List */}
                <div className="space-y-4">
                  <div className="bg-[#f8fafc] border border-gray-150 p-4 rounded-2xl">
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">
                      "If you could change one thing about today's preparation, what would it be?"
                    </p>
                    <span className="inline-block mt-2 text-[8px] font-bold uppercase tracking-wider bg-gray-200/50 text-gray-500 border px-1.5 py-0.5 rounded">
                      SELa-GR3u xe
                    </span>
                  </div>

                  <div className="bg-[#f8fafc] border border-gray-150 p-4 rounded-2xl">
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">
                      "Describe a moment today where you felt truly capable or focused."
                    </p>
                    <span className="inline-block mt-2 text-[8px] font-bold uppercase tracking-wider bg-gray-200/50 text-gray-500 border px-1.5 py-0.5 rounded">
                      C3NaiDENCE
                    </span>
                  </div>

                  <div className="bg-[#f8fafc] border border-gray-150 p-4 rounded-2xl">
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">
                      "What's one thing you're looking forward to doing after your finals?"
                    </p>
                    <span className="inline-block mt-2 text-[8px] font-bold uppercase tracking-wider bg-gray-200/50 text-gray-500 border px-1.5 py-0.5 rounded">
                      MANIaESxdNG
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quote visual card */}
              <div className="dashboard-card p-4 bg-gradient-to-br from-[#1d3557]/80 to-[#234676] text-white border-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 text-center py-2">
                  <p className="text-xs italic font-medium leading-relaxed">
                    "Quiet the mind, and the soul will speak."
                  </p>
                  <span className="text-[9px] font-bold opacity-75 uppercase tracking-wider block mt-2">
                    — Ma Jaya Sati Bhagavati
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSIGHTS TAB - Visual progress graphs */}
        {activeTab === 'insights' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
            <h2 className="text-2xl font-extrabold text-[#0f172a] pb-2 border-b border-gray-200">Aspirant Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="dashboard-card p-6 bg-white space-y-4">
                <h3 className="font-extrabold text-sm text-[#0f172a]">Weekly Focus Hours</h3>
                <div className="h-48 flex items-end justify-between gap-2 pt-6">
                  {[2.5, 4, 3.5, 5, 4.5, 6, 4.5].map((hours, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-[#1d3557]/15 hover:bg-[#1d3557]/30 transition-all rounded-t-lg relative" style={{ height: `${(hours / 7) * 100}%` }}>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-500">{hours}h</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-card p-6 bg-white space-y-4">
                <h3 className="font-extrabold text-sm text-[#0f172a]">Stress State Distribution</h3>
                <div className="space-y-3 pt-4">
                  {[
                    { label: 'Calm State', val: '40%', color: 'bg-emerald-600' },
                    { label: 'Tired State', val: '30%', color: 'bg-indigo-600' },
                    { label: 'Stressed State', val: '20%', color: 'bg-amber-600' },
                    { label: 'Overwhelmed State', val: '10%', color: 'bg-rose-600' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">{item.label}</span>
                      <div className="flex-1 mx-4 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: item.val }} />
                      </div>
                      <span className="text-xs font-extrabold text-[#0f172a]">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Deep Focus Moment (NSDR Card) */}
            <div className="dashboard-card p-6 bg-white border-l-4 border-l-[#1d3557] flex flex-col md:flex-row justify-between items-center gap-6 mt-6 shadow-sm">
              <div className="space-y-2 max-w-[70%] text-left">
                <div className="flex gap-4 items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded border border-indigo-150">Recommended Recovery</span>
                  <span className="text-[9px] font-bold text-gray-400">Dr. Huberman Protocol</span>
                </div>
                <h4 className="text-lg font-bold text-[#0f172a] mt-3">Deep Focus Moment (NSDR)</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  A 10-minute Non-Sleep Deep Rest cycle designed to drop stress, restore neural plasticity, and clear brain fog. Perfect for resetting during intense exam prep sessions.
                </p>
              </div>
              <button 
                onClick={() => {
                  setNsdrTimeLeft(600);
                  setShowNSDRModal(true);
                  setNsdrActive(true);
                }}
                className="w-full md:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4 text-indigo-400 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start Session
              </button>
            </div>
          </div>
        )}

        {/* MINDFULNESS TAB - Breathing timer */}
        {activeTab === 'mindfulness' && (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start bg-slate-50/50">
            <div className="my-auto flex flex-col items-center w-full max-w-md py-6">
              {/* Toggle tabs */}
              <div className="flex bg-white/75 border border-gray-200/60 p-1.5 rounded-2xl mb-6 shadow-sm select-none">
                <button
                  onClick={() => setMindfulnessTab('timer')}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mindfulnessTab === 'timer' 
                      ? 'bg-[#1d3557] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-slate-900'
                  }`}
                >
                  Study Timer & Box Breathing
                </button>
                <button
                  onClick={() => setMindfulnessTab('sigh')}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mindfulnessTab === 'sigh' 
                      ? 'bg-[#1d3557] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-slate-900'
                  }`}
                >
                  Physiological Sigh Pacer
                </button>
                <button
                  onClick={() => setMindfulnessTab('panoramic')}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    mindfulnessTab === 'panoramic' 
                      ? 'bg-[#1d3557] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-slate-900'
                  }`}
                >
                  Panoramic Vision
                </button>
              </div>

              {mindfulnessTab === 'timer' ? (
                <div className="dashboard-card p-8 rounded-3xl flex flex-col items-center max-w-md w-full relative overflow-hidden shadow-xl bg-white animate-slide-up">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
                  
                  <h2 className="text-xl font-extrabold text-[#0f172a] mb-2 mt-2">Mindful Breathing</h2>
                  <p className="text-xs text-gray-500 mb-6 text-center">
                    Box breathing: 4s inhale, 4s hold, 4s exhale, 4s empty. Calms anxiety.
                  </p>

                {/* Segmented Timer Selector */}
                <div className="flex bg-gray-50 border border-gray-200 p-1 rounded-xl w-full mb-8">
                  {(['study', 'shortBreak', 'longBreak'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSetTimerType(type)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all duration-355 ${
                        timerType === type
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold'
                          : 'text-gray-400 border border-transparent hover:text-gray-600'
                      }`}
                    >
                      {type === 'study' ? 'Box Breathing (4s)' : type === 'shortBreak' ? 'Short Break (5m)' : 'Long Break (15m)'}
                    </button>
                  ))}
                </div>

                {/* Circular Timer Representation */}
                <div className="relative w-52 h-52 flex items-center justify-center rounded-full border border-gray-100 bg-[#f8fafc] shadow-md mb-8">
                  <div className="absolute inset-2 rounded-full border border-dashed border-emerald-500/20 animate-[spin_180s_linear_infinite]" />
                  
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-[#0f172a] font-mono tracking-tight animate-fade-in">
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                      {timerActive ? 'Exercise Active' : 'Paused'}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setTimerActive(!timerActive)}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
                      timerActive
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/10'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {timerActive ? 'Pause' : 'Start Focus'}
                  </button>
                  <button
                    onClick={handleResetTimer}
                    className="px-6 py-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all text-sm font-semibold active:scale-95 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : mindfulnessTab === 'sigh' ? (
              /* Physiological Sigh Pacer */
              <div className="dashboard-card p-8 rounded-3xl flex flex-col items-center max-w-md w-full relative overflow-hidden shadow-xl bg-white animate-slide-up">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500" />
                
                <h2 className="text-xl font-extrabold text-[#0f172a] mb-2 mt-2">Physiological Sigh</h2>
                <p className="text-xs text-gray-500 mb-6 text-center leading-relaxed">
                  Two quick inhales followed by a long, slow exhale. The fastest way to trigger your parasympathetic nervous system.
                </p>

                {/* Visual circle pacer */}
                <div className="relative w-52 h-52 flex items-center justify-center mb-8 select-none">
                  {/* Outer boundary guide */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-teal-500/10" />
                  
                  <div
                    className={`absolute rounded-full bg-gradient-to-br ${
                      sighActive
                        ? (sighTime % 9000 < 2000 
                            ? 'from-teal-400 to-emerald-500 shadow-emerald-200/50' 
                            : sighTime % 9000 < 3000 
                            ? 'from-indigo-400 to-blue-500 shadow-blue-200/50' 
                            : 'from-rose-500 to-amber-500 shadow-rose-200/50')
                        : 'from-slate-400 to-slate-500 shadow-slate-200/50'
                    } flex flex-col items-center justify-center text-white font-bold transition-all duration-[75ms] ease-out shadow-lg`}
                    style={{
                      width: '140px',
                      height: '140px',
                      transform: `scale(${
                        !sighActive 
                          ? 0.5 
                          : (sighTime % 9000 < 2000 
                              ? 0.5 + 0.3 * ((sighTime % 9000) / 2000) 
                              : sighTime % 9000 < 3000 
                              ? 0.8 + 0.2 * (((sighTime % 9000) - 2000) / 1000) 
                              : 1.0 - 0.5 * (((sighTime % 9000) - 3000) / 6000))
                      })`,
                    }}
                  >
                    <span className="text-sm tracking-widest uppercase font-extrabold">
                      {!sighActive 
                        ? 'READY' 
                        : (sighTime % 9000 < 2000 
                            ? 'Inhale 1' 
                            : sighTime % 9000 < 3000 
                            ? 'Inhale 2' 
                            : 'Sigh Out')}
                    </span>
                    {sighActive && (
                      <span className="text-[10px] font-bold tracking-wider opacity-85 mt-1">
                        {sighTime % 9000 < 2000 
                          ? `${Math.ceil((2000 - (sighTime % 9000)) / 1000)}s` 
                          : sighTime % 9000 < 3000 
                          ? `${Math.ceil((3000 - (sighTime % 9000)) / 1000)}s` 
                          : `${Math.ceil((9000 - (sighTime % 9000)) / 1000)}s`}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-600 text-center min-h-[36px] px-6 leading-relaxed mb-6">
                  {!sighActive 
                    ? 'Click start to begin the 2-step inhale and slow exhale pacer.' 
                    : (sighTime % 9000 < 2000 
                        ? 'Inhale deeply through your nose...' 
                        : sighTime % 9000 < 3000 
                        ? 'Take a second, sharp inhale to fill the lungs!' 
                        : 'Let out a slow, long sigh through your mouth...')}
                </p>

                {/* Controls */}
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => {
                      setSighActive(!sighActive);
                      if (!sighActive) setSighTime(0);
                    }}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
                      sighActive
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/10'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {sighActive ? 'Pause Pacer' : 'Start Pacer'}
                  </button>
                </div>
              </div>
            ) : mindfulnessTab === 'panoramic' ? (
              /* Panoramic Vision Exercise */
              <div className="dashboard-card p-8 rounded-3xl flex flex-col items-center max-w-md w-full relative overflow-hidden shadow-xl bg-white animate-slide-up">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
                <style>{`
                  @keyframes expand-ring-card {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(60); opacity: 0; }
                  }
                  .panoramic-ring-card {
                    animation: expand-ring-card 6s cubic-bezier(0.1, 0.8, 0.25, 1) infinite;
                    transform-origin: center;
                  }
                `}</style>

                <h2 className="text-xl font-extrabold text-[#0f172a] mb-2 mt-2">Panoramic Vision</h2>
                <p className="text-xs text-gray-500 mb-6 text-center leading-relaxed">
                  Stare at the central red dot. Without moving your eyes, let your awareness expand outward with each ring to activate peripheral vision and reduce tunnel stress.
                </p>

                {/* Central focal point + expanding rings */}
                <div className="relative w-52 h-52 flex items-center justify-center mb-8 select-none overflow-hidden rounded-full bg-slate-950/5">
                  {/* Rippling peripheral rings */}
                  <div className="absolute w-3 h-3 rounded-full border border-violet-500/50 panoramic-ring-card" style={{ animationDelay: '0s' }} />
                  <div className="absolute w-3 h-3 rounded-full border border-violet-500/35 panoramic-ring-card" style={{ animationDelay: '1.5s' }} />
                  <div className="absolute w-3 h-3 rounded-full border border-violet-500/20 panoramic-ring-card" style={{ animationDelay: '3s' }} />
                  <div className="absolute w-3 h-3 rounded-full border border-violet-500/10 panoramic-ring-card" style={{ animationDelay: '4.5s' }} />

                  {/* Central dot */}
                  <div className="absolute w-4 h-4 rounded-full bg-rose-500/30 animate-ping" />
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
                </div>

                <p className="text-xs font-semibold text-slate-600 text-center min-h-[36px] px-6 leading-relaxed mb-6">
                  Keep your gaze fixed on the red dot. Let the rings pull your awareness to the outermost edges of your screen.
                </p>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setShowPanoramicModal(true)}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 active:scale-95 cursor-pointer bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20"
                  >
                    Open Full-Screen Mode
                  </button>
                </div>
              </div>
            ) : null}
            </div>
          </div>
        )}
      </main>

      {/* NSDR Modal Player */}
      {showNSDRModal && (
        <div className="fixed inset-0 bg-slate-955/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none overflow-hidden">
          <style>{`
            @keyframes wave-bounce {
              0%, 100% { transform: scaleY(0.3); }
              50% { transform: scaleY(1.3); }
            }
            .audio-bar {
              animation: wave-bounce 1.2s ease-in-out infinite;
              transform-origin: bottom;
            }
          `}</style>
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden text-center animate-slide-up flex flex-col gap-5">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                NSDR Session Active
              </span>
              <button
                onClick={() => {
                  setNsdrActive(false);
                  setShowNSDRModal(false);
                }}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Non-Sleep Deep Rest</h3>
              <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed max-w-xs mx-auto">
                A 10-minute deep relaxation protocol designed to restore synaptic baseline and reduce overall fatigue.
              </p>
            </div>

            {/* Countdown timer */}
            <div className="font-mono text-5xl font-black tracking-tight text-white my-2">
              {Math.floor(nsdrTimeLeft / 60)}:{String(nsdrTimeLeft % 60).padStart(2, '0')}
            </div>

            {/* Scrubber / Progress Bar */}
            <div className="w-full flex flex-col gap-1.5 px-2">
              <input
                type="range"
                min="0"
                max="600"
                value={600 - nsdrTimeLeft}
                onChange={(e) => {
                  setNsdrTimeLeft(600 - Number(e.target.value));
                }}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono">
                <span>{Math.floor((600 - nsdrTimeLeft) / 60)}:{String((600 - nsdrTimeLeft) % 60).padStart(2, '0')}</span>
                <span>10:00</span>
              </div>
            </div>

            {/* Smooth CSS audio equalizer animation */}
            <div className="flex items-end justify-center gap-1.5 h-16 my-2">
              {[...Array(14)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 bg-indigo-500 rounded-full transition-all duration-300 ${
                    nsdrActive ? 'audio-bar' : ''
                  }`}
                  style={{
                    height: '40px',
                    animationDelay: `${i * 0.08}s`,
                    transform: !nsdrActive ? 'scaleY(0.25)' : undefined
                  }}
                />
              ))}
            </div>

            {/* Play/Pause controls */}
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setNsdrActive(!nsdrActive)}
                className={`flex-1 py-3.5 rounded-xl font-bold text-xs shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
                  nsdrActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/10'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
              >
                {nsdrActive ? 'Pause Session' : 'Resume Session'}
              </button>
              <button
                onClick={() => {
                  setNsdrActive(false);
                  setShowNSDRModal(false);
                }}
                className="px-6 py-3.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold active:scale-95 cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panoramic Vision Modal */}
      {showPanoramicModal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in select-none overflow-hidden">
          <style>{`
            @keyframes expand-ring {
              0% { transform: scale(1); opacity: 0.8; }
              100% { transform: scale(300); opacity: 0; }
            }
            .panoramic-ring {
              animation: expand-ring 6s cubic-bezier(0.1, 0.8, 0.25, 1) infinite;
              transform-origin: center;
            }
          `}</style>
          
          <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full space-y-12">
            {/* Top description */}
            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl font-extrabold tracking-tight text-white">Panoramic Vision</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Stare directly at the central red dot. Without moving your eyes, let your visual awareness dilate and follow the rings rippling out to the borders of the viewport.
              </p>
            </div>

            {/* Central focus point and expanding peripheral rings */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Concentric rings rippling outward */}
              <div className="absolute w-2.5 h-2.5 rounded-full border border-violet-500/40 panoramic-ring" style={{ animationDelay: '0s' }} />
              <div className="absolute w-2.5 h-2.5 rounded-full border border-violet-500/30 panoramic-ring" style={{ animationDelay: '1.5s' }} />
              <div className="absolute w-2.5 h-2.5 rounded-full border border-violet-500/20 panoramic-ring" style={{ animationDelay: '3s' }} />
              <div className="absolute w-2.5 h-2.5 rounded-full border border-violet-500/10 panoramic-ring" style={{ animationDelay: '4.5s' }} />

              {/* Central dot */}
              <div className="absolute w-4 h-4 rounded-full bg-rose-500/30 animate-ping" />
              <div className="absolute w-3.5 h-3.5 rounded-full bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
            </div>

            {/* Bottom dismiss button */}
            <div className="relative z-10 w-full max-w-xs pt-4">
              <button
                onClick={() => setShowPanoramicModal(false)}
                className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-bold transition-all hover:text-white active:scale-95 cursor-pointer"
              >
                End Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
