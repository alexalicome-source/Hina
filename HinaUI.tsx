
import React, { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';

interface HinaUIProps {
  isActivated: boolean; status: string; onToggle: () => void;
  hinaResponse: string; onToggleLibrary: () => void; onLogout: () => void;
  videoRef: React.RefObject<HTMLVideoElement>; user: any;
  micLevel: number; isCameraActive?: boolean; onCameraToggle?: () => void;
  personality: 'hina' | 'alex'; mood: 'happy' | 'angry' | 'jealous';
  onCloseMedia: () => void;
}

export const HinaUI: React.FC<HinaUIProps> = ({ 
  isActivated, status, onToggle, hinaResponse, onToggleLibrary, onLogout, videoRef, user, micLevel,
  isCameraActive, onCameraToggle, personality, mood, onCloseMedia
}) => {
  const [showChat, setShowChat] = useState(false);
  const displayName = user.id === 'ALEX' ? 'Amin Boss' : user.name;
  
  const visualLevel = Math.min(100, micLevel * 1000);

  return (
    <div className={`relative w-full h-screen flex flex-col overflow-hidden font-outfit safe-pt safe-pb transition-all duration-700 bg-black`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Personality-based Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[180px] transition-all duration-1000 
          ${personality === 'alex' ? 'bg-orange-600/15' : 'bg-cyan-500/10'} 
          ${isActivated ? 'opacity-100 scale-125' : 'opacity-0 scale-75'}`} />
      </div>

      <div className="relative z-50 flex items-center justify-between px-8 py-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 glass-card px-5 py-3 rounded-2xl border-white/5">
            <div className={`w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white font-black text-xs transition-all ${personality === 'alex' ? 'bg-orange-500' : 'bg-zinc-900'}`}>{personality === 'alex' ? 'A' : displayName[0]}</div>
            <div className="flex flex-col">
              <span className={`text-[7px] uppercase font-black tracking-[0.2em] ${personality === 'alex' ? 'text-orange-400' : 'text-zinc-500'}`}>
                {personality === 'alex' ? 'ALEX PROTECTOR' : 'HINA PARTNER'}
              </span>
              <span className="text-xs font-bold text-white uppercase">{personality === 'alex' ? 'Bhai Mode' : displayName}</span>
            </div>
          </div>
          <button onClick={onLogout} className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-zinc-500 active:text-rose-500 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={onCameraToggle} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${isCameraActive ? (personality === 'alex' ? 'text-orange-400' : 'text-cyan-400') : 'bg-white/5 text-zinc-500 border-white/5'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" /></svg>
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-10 relative z-10">
        <div className={`w-full text-center transition-all duration-1000 mb-12 ${isActivated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-40'}`}>
          <p className="text-xl md:text-2xl font-light text-white leading-snug tracking-tight italic max-w-sm mx-auto">
            {isActivated ? hinaResponse : (personality === 'alex' ? "Bhai ready hai..." : "Main taiyaar hoon, Boss...")}
          </p>
        </div>

        <div className="relative">
          {/* Personality-themed Core */}
          <button 
            onClick={onToggle} 
            className={`relative z-20 w-64 h-64 rounded-full flex items-center justify-center transition-all duration-700 active:scale-95 overflow-hidden border-2 ${isActivated ? (personality === 'alex' ? 'border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.1)]' : 'border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)]') : 'border-transparent shadow-none'}`}>
             <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${isCameraActive ? 'opacity-100' : 'opacity-0 scale-150 blur-3xl'}`}>
               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-50 contrast-125" />
             </div>
             
             {!isCameraActive && (
               <div className={`relative w-28 h-28 liquid-core flex items-center justify-center transition-all duration-700 ${isActivated ? (personality === 'alex' ? 'bg-orange-500/15 shadow-[0_0_30px_rgba(249,115,22,0.2)]' : 'bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]') : 'bg-white/5'}`}>
                  {isActivated ? (
                    <div className="flex items-center gap-1.5 h-12">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-2 rounded-full transition-all duration-100 ${personality === 'alex' ? 'bg-orange-400' : 'bg-cyan-400'}`} style={{ height: `${30 + (Math.random() * visualLevel)}%` }} />
                      ))}
                    </div>
                  ) : <div className="w-2 h-2 rounded-full bg-white/20" />}
               </div>
             )}
          </button>
        </div>
      </div>

      <div className="relative z-50 px-8 pb-10">
        <div className="glass-card rounded-[3rem] p-5 flex items-center justify-between border-white/10 shadow-xl">
          <button onClick={onToggleLibrary} className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 text-zinc-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isActivated ? (personality === 'alex' ? 'bg-orange-400' : 'bg-cyan-400') : 'bg-zinc-800'}`} />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">{isActivated ? 'Active' : 'Standby'}</span>
             </div>
             <p className="text-[7px] text-zinc-600 mt-1 font-black uppercase tracking-[0.4em]">{status}</p>
          </div>

          <button onClick={() => setShowChat(true)} className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 text-zinc-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </button>
        </div>
      </div>

      {showChat && <ChatWindow user={user} onClose={() => setShowChat(false)} />}
    </div>
  );
};
