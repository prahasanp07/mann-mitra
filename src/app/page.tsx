'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [exam, setExam] = useState('JEE Mains');
  const [stressor, setStressor] = useState('Syllabus Backlog');
  const router = useRouter();

  const handleBeginChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    localStorage.setItem('mannmitra_username', name.trim());
    localStorage.setItem('mannmitra_exam', exam);
    localStorage.setItem('mannmitra_stressor', stressor);

    // Initialize history based on their exam/stressor
    const initialHistory = [
      {
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        primary_emotion: 'High Anxiety',
        triggers: [stressor, `${exam} Syllabus`]
      },
      {
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        primary_emotion: 'Exhaustion',
        triggers: ['Sleep Debt', stressor]
      },
      {
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        primary_emotion: 'High Anxiety',
        triggers: [stressor, 'Exam Pressure']
      }
    ];
    localStorage.setItem('mannmitra_history', JSON.stringify(initialHistory));

    router.push('/companion');
  };

  return (
    <div className="min-h-screen bg-slate-50/30 text-slate-800 font-sans selection:bg-[#1d3557]/10 relative">
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
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(to bottom, #0f172a, #334155);
        }
      `}</style>

      {/* Navigation Header */}
      <header className="w-full bg-white/70 backdrop-blur-md border-b border-slate-200/50 fixed top-0 left-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1d3557] flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.192-1.229 4 4 0 00-4-4 3.997 3.997 0 00-1.229.192L7.246 4.668A7.996 7.996 0 0110 4c4.418 0 8 3.582 8 8zm-8 4a3.997 3.997 0 001.229-.192l1.524 1.525A7.996 7.996 0 0110 20c-4.418 0-8-3.582-8-8 0-.993.241-1.929.668-2.754l1.524 1.525a3.997 3.997 0 00-.192 1.229 4 4 0 004 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-extrabold text-lg text-[#0f172a] tracking-tight">MannMitra</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-[#1d3557] transition-all">Features</a>
            <a href="#reality" className="hover:text-[#1d3557] transition-all">Science</a>
            <a href="#about" className="hover:text-[#1d3557] transition-all">Resources</a>
          </nav>

          <button
            onClick={handleBeginChatClick}
            className="px-5 py-2.5 rounded-xl bg-[#1d3557] hover:bg-[#234676] text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-6 space-y-6 text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Exams are hard.<br />You don't have to face them alone.
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-lg leading-relaxed font-medium">
            MannMitra is your AI-powered companion that turns study stress into steady focus. Track your mood, journal your thoughts, and get personalized insights to beat burnout.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleBeginChatClick}
              className="px-6 py-3.5 rounded-xl font-bold text-xs bg-[#1d3557] hover:bg-[#234676] text-white shadow-md shadow-[#1d3557]/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Start Your Journey
            </button>
            <button
              onClick={handleBeginChatClick}
              className="px-6 py-3.5 rounded-xl font-bold text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all flex items-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch how it works
            </button>
          </div>
        </div>

        <div className="md:col-span-6 relative flex justify-center">
          {/* Main Visual Image container with generated visual asset */}
          <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200">
            <Image
              src="/hero-student.png"
              alt="Indian student studying with tablet screen"
              fill
              priority
              className="object-cover"
            />
            {/* Soft gradient mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            
            {/* Floating Card Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mitra's Note</span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">"Take a deep breath. You're doing great."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Reality Section */}
      <section id="reality" className="py-20 bg-slate-100/50 border-y border-slate-200/20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 tracking-widest uppercase">
            The Reality
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Feeling the pressure of JEE, NEET, or UPSC?
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
            Preparing for India's toughest competitive exams isn't just a mental challenge—it's an emotional marathon. Most trackers only care about how many hours you study. They miss the late-night anxiety, the crushing weight of mock tests, and the quiet signs of burnout. MannMitra sees the student behind the score.
          </p>

          {/* Three reality cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:border-[#1d3557]/15 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Unseen Burnout</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Pushes past study boundaries without realizing mental limits until exhaustion blocks learning pathways.</p>
            </div>

            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:border-[#1d3557]/15 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cognitive Overload</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Endless named reactions and physics backlogs cluttering memory, leading to test panic and scoring dips.</p>
            </div>

            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:border-[#1d3557]/15 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Isolation Stress</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Carrying the expectations of family and peers alone, without a safe space to vent anxiety without judgment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Designed for Your Focus Section */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Designed for Your Focus</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto font-medium">
            Sophisticated tools that prioritize your mental well-being alongside your academic goals.
          </p>
        </div>

        {/* Feature widgets grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Card 1: AI Journal (2/3 width) */}
          <div className="bg-[#1d3557] text-white p-8 rounded-3xl md:col-span-2 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-6 right-6 text-white/10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">AI-Powered Journaling</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-sm leading-relaxed font-medium">
                "More than just words. Mitra listens to your journal entries and provides real-time empathetic reflections."
              </p>
            </div>
            <div className="pt-6">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/10">Voice & Text Reflection</span>
            </div>
          </div>

          {/* Card 2: Insights */}
          <div className="bg-emerald-50 text-emerald-950 p-8 rounded-3xl shadow-md flex flex-col justify-between min-h-[220px] border border-emerald-100">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 12l3-3 3 3 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold">Stress Trigger Insights</h3>
              <p className="text-xs text-emerald-800/80 mt-2 leading-relaxed font-medium">
                Visualize your patterns. Understand exactly what's causing your burnout—whether it's mock tests or late-night sessions.
              </p>
            </div>
            <div className="pt-4">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-600/10 text-emerald-700 px-3 py-1 rounded-full border border-emerald-600/20">Aspirant Analytics</span>
            </div>
          </div>

          {/* Card 3: Adaptive Relief */}
          <div className="bg-amber-50/70 text-amber-950 p-8 rounded-3xl shadow-md flex flex-col justify-between min-h-[220px] border border-amber-200/40">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-700 flex items-center justify-center mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3" />
                </svg>
              </div>
              <h3 className="text-sm font-bold">Adaptive Relief</h3>
              <p className="text-xs text-amber-800/85 mt-2 leading-relaxed font-medium">
                Personalized breathing exercises and focus timers dynamically adjusted based on your current anxiety and stress aura.
              </p>
            </div>
            <div className="pt-4">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-600/10 text-amber-700 px-3 py-1 rounded-full border border-amber-600/20">Mindfulness Tools</span>
            </div>
          </div>

          {/* Card 4: 10-Minute Reset (2/3 width) */}
          <div className="bg-slate-900 border border-slate-800 text-white p-8 rounded-3xl md:col-span-2 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Premium Wave graphics background */}
            <div className="absolute inset-0 opacity-15">
              <svg viewBox="0 0 100 20" className="w-[200%] h-full text-white fill-current animate-pulse-slow">
                <path d="M 0 10 C 12.5 5, 12.5 15, 25 10 C 37.5 5, 37.5 15, 50 10 C 62.5 5, 62.5 15, 75 10 C 87.5 5, 87.5 15, 100 10 L 100 20 L 0 20 Z" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-extrabold tracking-tight">The 10-Minute Reset</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-sm leading-relaxed font-medium">
                Ground calm instantly. Access simulated heart-rate-guided NSDR (Non-Sleep Deep Rest) audio sessions to recharge cognitive bandwidth.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/10">NSDR Rest Protocol</span>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Focus, Human Feeling Section */}
      <section id="about" className="py-20 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Academic Focus,<br />Human Feeling.
          </h2>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
            Our GenAI approach isn't about just productivity hacks. We utilize Large Language Models trained on therapeutic principles to provide a supportive, steady companion during your toughest months of preparation. It's about building resilience, not just clearing a syllabus.
          </p>
          
          {/* Security badge */}
          <div className="flex items-center gap-3 bg-[#e9eff6]/50 border border-[#d0dfef]/40 p-4 rounded-2xl max-w-md">
            <div className="w-8 h-8 rounded-lg bg-[#1d3557] text-white flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-bold text-[#1d3557] block">Private & Secure</span>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Your journals and data are fully encrypted locally on your browser.</p>
            </div>
          </div>
        </div>

        {/* Chat UI mockup layout illustration */}
        <div className="space-y-4 bg-slate-100/60 border border-slate-200/50 p-6 rounded-[28px] shadow-sm max-w-md mx-auto">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-[#1d3557] text-white rounded-2xl rounded-tr-none px-4 py-3 text-left shadow-sm max-w-[85%]">
              <p className="text-xs leading-relaxed font-medium">
                I'm feeling really anxious about the UPSC prelims. I haven't finished my revision yet.
              </p>
            </div>
          </div>

          {/* Assistant message */}
          <div className="flex justify-start items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#e9eff6] flex items-center justify-center shrink-0 border border-[#d0dfef]">
              <svg className="w-3.5 h-3.5 text-[#1d3557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-[#e9eff6] text-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-left border border-[#dce6f0] shadow-sm max-w-[85%]">
              <p className="text-xs leading-relaxed font-medium">
                It's completely normal to feel this way. Remember, progress isn't just about finishing the syllabus, it's about the steady effort you've put in today. Shall we try a 5-minute grounding exercise?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Block */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#1d3557] to-[#234676] text-white rounded-3xl p-12 text-center shadow-xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 blur-3xl" />
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to find your focus?</h2>
          <p className="text-sm text-slate-350 max-w-md mt-3 leading-relaxed font-medium opacity-85">
            Join thousands of students who are reclaiming their peace of mind while pursuing their dreams.
          </p>
          <button
            onClick={handleBeginChatClick}
            className="mt-6 px-8 py-3.5 rounded-xl font-bold text-xs bg-indigo-400 hover:bg-indigo-300 text-[#1d3557] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md shadow-[#1d3557]/30"
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/50 py-10 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left space-y-1.5">
            <span className="font-extrabold text-base text-[#0f172a] block">MannMitra</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              © 2026 MannMitra. Your digital sanctuary for academic focus.
            </p>
          </div>

          <div className="flex gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-[#1d3557] transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-[#1d3557] transition-all">Terms of Service</a>
            <a href="#" className="hover:text-[#1d3557] transition-all">Crisis Support</a>
            <a href="#" className="hover:text-[#1d3557] transition-all">Contact Us</a>
          </div>
        </div>
      </footer>

      {/* Onboarding Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0f0b1a]/95 border border-violet-500/30 rounded-3xl max-w-md w-full p-8 shadow-[0_20px_50px_rgba(139,92,246,0.25)] text-left animate-slide-up relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-violet-600/10 blur-2xl" />
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Set Up Your Mitra Profile</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">What is your name?</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun"
                  className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Which exam are you preparing for?</label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  className="w-full bg-[#110e1c] border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="JEE Mains">JEE Mains</option>
                  <option value="JEE Advanced">JEE Advanced</option>
                  <option value="NEET">NEET</option>
                  <option value="UPSC CSE">UPSC CSE</option>
                  <option value="Other Competitive Exam">Other Competitive Exam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">What is currently your biggest stressor?</label>
                <select
                  value={stressor}
                  onChange={(e) => setStressor(e.target.value)}
                  className="w-full bg-[#110e1c] border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="Syllabus Backlog">Syllabus Backlog</option>
                  <option value="Sleep Deprivation">Sleep Deprivation</option>
                  <option value="Low Test Marks">Low Test Marks</option>
                  <option value="Procrastination">Procrastination</option>
                  <option value="General Prep Anxiety">General Prep Anxiety</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-violet-600/35 transition-all duration-200 hover:shadow-violet-600/50 active:scale-[0.98] cursor-pointer mt-2"
              >
                Proceed to Chat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
