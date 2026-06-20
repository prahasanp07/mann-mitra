'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 relative overflow-hidden bg-[#07050a] text-gray-200">
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

      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl" style={{ animationDelay: '2s' }} />

      <main className="relative z-10 max-w-2xl text-center flex flex-col items-center">
        {/* Badge */}
        <div className="px-4 py-1.5 rounded-full border border-violet-800/40 bg-violet-950/20 backdrop-blur-md mb-6">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
            India's First Empathetic Aspirant Companion
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-400 leading-tight">
          Find calm in the chaos of high-stakes prep
        </h1>

        {/* Description */}
        <p className="text-base text-gray-400 max-w-lg mb-10 leading-relaxed font-medium">
          Whether you're struggling with a physics backlog, low mock test scores, or mental fatigue preparing for JEE, NEET, or UPSC—Mitra is here to hold space, validate your stress, and support you.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={handleBeginChatClick}
            className="px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-600/35 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Begin Chat with Mitra
          </button>
          <a
            href="https://github.com"
            target="_blank"
            className="px-6 py-4 rounded-2xl font-semibold text-sm bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200"
          >
            Read Methodology
          </a>
        </div>

        {/* Trust banner */}
        <div className="mt-16 pt-8 border-t border-white/5 w-full flex items-center justify-center gap-8 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
          <span>Tailored for JEE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span>NEET</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span>UPSC Aspirants</span>
        </div>
      </main>

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
