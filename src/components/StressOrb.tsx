'use strict';

import React from 'react';
import { StressLevel } from '@/lib/mitra-agent';

interface StressOrbProps {
  stressLevel: StressLevel;
}

export function StressOrb({ stressLevel }: StressOrbProps) {
  // Define color mappings and descriptors for the stress states
  const config = {
    calm: {
      gradient: 'from-calm-start to-calm-end',
      glow: 'shadow-[0_0_50px_20px_rgba(16,185,129,0.25)]',
      textColor: 'text-teal-400',
      bgColor: 'bg-teal-950/30',
      borderColor: 'border-teal-800/40',
      label: 'Calm & Steady',
      tagline: 'Grounded and receptive. Ready for focus.',
    },
    tired: {
      gradient: 'from-tired-start to-tired-end',
      glow: 'shadow-[0_0_50px_20px_rgba(139,92,246,0.25)]',
      textColor: 'text-indigo-400',
      bgColor: 'bg-indigo-950/30',
      borderColor: 'border-indigo-800/40',
      label: 'Exhausted & Drained',
      tagline: 'Energy reserves low. Mitra recommends rest.',
    },
    stressed: {
      gradient: 'from-stressed-start to-stressed-end',
      glow: 'shadow-[0_0_50px_20px_rgba(249,115,22,0.25)]',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/30',
      borderColor: 'border-amber-800/40',
      label: 'Stressed & Anxious',
      tagline: 'Exam tension mounting. Pacing down topics.',
    },
    overwhelmed: {
      gradient: 'from-overwhelmed-start to-overwhelmed-end',
      glow: 'shadow-[0_0_50px_20px_rgba(244,63,94,0.3)]',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-950/30',
      borderColor: 'border-rose-800/40',
      label: 'Severely Overwhelmed',
      tagline: 'Exhaustion peaked. Mitra is holding space.',
    },
  };

  const current = config[stressLevel];

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex items-center justify-center w-48 h-48 mb-6">
        {/* Background glow layer */}
        <div 
          className={`absolute inset-4 rounded-full bg-gradient-to-tr ${current.gradient} opacity-40 blur-2xl animate-pulse-slow transition-all duration-1000`}
        />
        
        {/* Animated orb body */}
        <div 
          className={`relative w-36 h-36 rounded-full bg-gradient-to-tr ${current.gradient} ${current.glow} animate-float animate-orb-glow transition-all duration-1000 border border-white/10`}
          style={{
            boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.15)',
          }}
        >
          {/* Glass glare effect inside the orb */}
          <div className="absolute top-2 left-6 w-16 h-8 bg-white/20 rounded-full blur-[2px] transform -rotate-12" />
          <div className="absolute bottom-4 right-8 w-6 h-6 bg-white/10 rounded-full blur-[1px]" />
        </div>
      </div>
      
      {/* Status Details */}
      <div className={`px-4 py-2 rounded-full border ${current.borderColor} ${current.bgColor} backdrop-blur-md mb-2 transition-all duration-1000`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${current.textColor} transition-all duration-1000`}>
          Aura: {current.label}
        </span>
      </div>
      
      <p className="text-sm text-gray-400 max-w-xs transition-all duration-1000">
        {current.tagline}
      </p>
    </div>
  );
}
export default StressOrb;
