'use strict';

import React from 'react';
import Image from 'next/image';
import { StressLevel } from '@/lib/mitra-agent';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stressLevel: StressLevel;
  onLogoClick: () => void;
}

export function Sidebar({ activeTab, setActiveTab, stressLevel, onLogoClick }: SidebarProps) {
  const getStressText = (level: StressLevel) => {
    switch (level) {
      case 'calm': return 'Low';
      case 'tired': return 'Moderate';
      case 'stressed': return 'High';
      case 'overwhelmed': return 'Severe';
    }
  };

  const getStressTextColor = (level: StressLevel) => {
    switch (level) {
      case 'calm': return 'text-emerald-600';
      case 'tired': return 'text-indigo-600';
      case 'stressed': return 'text-amber-600';
      case 'overwhelmed': return 'text-rose-600';
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'journal',
      label: 'AI Journal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'mindfulness',
      label: 'Mindfulness',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'companion',
      label: 'Companion',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 border-r border-[#e2e8f0] bg-[#fcfdfe] flex flex-col justify-between shrink-0 h-full p-4">
      <div className="flex flex-col">
        {/* Brand Header — click to go home */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-[#f1f5f9] w-full text-left hover:opacity-75 transition-opacity cursor-pointer group"
          title="Back to home"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
            <Image src="/logo.png" alt="MannMitra Logo" width={40} height={40} className="object-contain w-full h-full" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#0f172a] leading-none">Mitra</h1>
            <p className="text-[10px] text-gray-500 font-semibold mt-1">
              Stress Level: <span className={`font-bold ${getStressTextColor(stressLevel)}`}>{getStressText(stressLevel)}</span>
            </p>
          </div>
        </button>

        {/* Navigation items resembling the list items exactly */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150 text-left ${isActive
                    ? 'bg-[#234676] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                  }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="space-y-4">
        <button
          onClick={() => setActiveTab('journal')}
          className="w-full py-3 px-4 bg-[#1d3557] hover:bg-[#234676] text-white font-extrabold text-sm rounded-2xl shadow-sm transition-all text-center cursor-pointer active:scale-95"
        >
          Quick Reflection
        </button>

        {/* <div className="border-t border-[#f1f5f9] pt-3 px-2 flex flex-col gap-2">
          <button className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-[#0f172a] w-full text-left py-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help
          </button>
          <button className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-[#0f172a] w-full text-left py-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div> */}
      </div>
    </aside>
  );
}
export default Sidebar;
