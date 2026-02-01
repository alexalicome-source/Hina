
import React, { useState, useEffect } from 'react';

interface CallingProps {
  type: 'audio' | 'video';
  targetName: string;
  callerRole: 'admin' | 'friend' | 'family';
  incoming: boolean;
  onEnd: () => void;
  onAccept: () => void;
}

export const CallingSystem: React.FC<CallingProps> = ({ type, targetName, callerRole, incoming, onEnd, onAccept }) => {
  const [timer, setTimer] = useState(20);
  const isAdminCall = callerRole === 'admin';

  useEffect(() => {
    if (incoming && isAdminCall && timer > 0) {
      const countdown = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
    
    if (incoming && isAdminCall && timer === 0) {
      // Auto pick after 20 seconds for Admin calls
      onAccept();
    }
  }, [incoming, isAdminCall, timer, onAccept]);

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-between p-12 safe-pt safe-pb animate-in fade-in duration-500">
      <div className="text-center mt-20">
        <div className="relative mb-12">
          <div className="w-32 h-32 bg-zinc-900 rounded-full mx-auto flex items-center justify-center border border-white/10 overflow-hidden">
            <span className="text-4xl font-black text-white">{targetName[0]?.toUpperCase()}</span>
          </div>
          <div className="absolute inset-[-20px] rounded-full border border-cyan-500/10 animate-ping" />
        </div>
        
        <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase">{targetName}</h2>
        <div className="flex flex-col items-center gap-2">
           <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${incoming ? 'text-rose-500' : 'text-cyan-400'}`}>
             {incoming ? (isAdminCall ? 'ADMIN OVERRIDE CALL' : 'Incoming Signal...') : 'Establishing Link...'}
           </p>
           {incoming && isAdminCall && (
             <p className="text-xs text-zinc-500 font-bold">Auto-Connect in: <span className="text-white">{timer}s</span></p>
           )}
        </div>
      </div>

      <div className="flex gap-12 mb-20">
        <button onClick={onEnd} className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(225,29,72,0.2)] active:scale-90 transition-all">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
        </button>

        {incoming && (
          <button onClick={onAccept} className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(16,185,129,0.2)] active:scale-90 transition-all">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
          </button>
        )}
      </div>

      <p className="text-[9px] text-zinc-800 font-black uppercase tracking-[0.8em]">Ghost Protocol Active</p>
    </div>
  );
};
