import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 relative overflow-hidden bg-[#07050a] text-gray-200">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <main className="relative z-10 max-w-2xl text-center flex flex-col items-center">
        {/* Badge */}
        <div className="px-4 py-1.5 rounded-full border border-violet-800/40 bg-violet-950/20 backdrop-blur-md mb-6 animate-float">
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
          <Link
            href="/companion"
            className="px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-600/35 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Begin Chat with Mitra
          </Link>
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
    </div>
  );
}

