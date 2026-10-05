import React from 'react';

export default function AmbientBackground({ isDark }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Mesh Canvas in Light Mode */}
      {!isDark && (
        <div className="absolute inset-0 mesh-gradient-canvas opacity-85" />
      )}

      {/* Subtle Dot Grid Pattern */}
      <div className="absolute inset-0 bg-dot-grid opacity-60" />

      {/* Dynamic Ambient Gradient Orbs */}
      {/* Top Cyan / Sky orb */}
      <div
        className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[130px] transform-gpu transition-all duration-700 ${
          isDark ? 'bg-cyan-600/12' : 'bg-cyan-300/35'
        }`}
      />
      {/* Top-Right Violet / Indigo orb */}
      <div
        className={`absolute -top-20 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] transform-gpu transition-all duration-700 ${
          isDark ? 'bg-violet-600/12' : 'bg-indigo-300/30'
        }`}
      />
      {/* Mid-page Rose / Fuchsia orb */}
      <div
        className={`absolute top-[35%] -left-40 w-[500px] h-[500px] rounded-full blur-[120px] transform-gpu transition-all duration-700 ${
          isDark ? 'bg-rose-500/10' : 'bg-rose-200/30'
        }`}
      />
      {/* Mid-page Emerald / Teal orb */}
      <div
        className={`absolute top-[55%] -right-40 w-[550px] h-[550px] rounded-full blur-[130px] transform-gpu transition-all duration-700 ${
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-200/25'
        }`}
      />
      {/* Bottom Indigo / Sky orb */}
      <div
        className={`absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full blur-[140px] transform-gpu transition-all duration-700 ${
          isDark ? 'bg-indigo-600/12' : 'bg-sky-200/35'
        }`}
      />
    </div>
  );
}
