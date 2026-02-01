
import React, { useState, useEffect } from 'react';
import { LocalMedia } from '../vault/MediaLibrary';

interface PlayerProps {
  media: LocalMedia;
  playlist?: LocalMedia[];
  onNext?: () => void;
  onClose: () => void;
}

export const MediaPlayer: React.FC<PlayerProps> = ({ media, playlist, onNext, onClose }) => {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (media.type === 'audio') {
      const interval = setInterval(() => {
        setLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [media]);

  return (
    <div className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex flex-col p-8 safe-pt safe-pb animate-in zoom-in duration-300 overflow-hidden">
      <div className="flex justify-between items-center mb-10 relative z-10">
        <div className="overflow-hidden">
          <h3 className="text-xl font-black text-white italic truncate w-64 uppercase tracking-tighter">{media.name}</h3>
          <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.4em]">{media.type} Link Hub</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white text-3xl active:scale-90 transition-all border border-white/5">×</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-4xl glass-card rounded-[3.5rem] overflow-hidden border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
          {media.type === 'image' && (
            <img src={media.url} className="w-full h-auto max-h-[65vh] object-contain" alt="Vault Memory" />
          )}
          
          {media.type === 'video' && (
            <video src={media.url} controls autoPlay className="w-full max-h-[65vh] bg-black" />
          )}
          
          {media.type === 'audio' && (
            <div className="p-16 flex flex-col items-center gap-12 relative">
               {/* Beat Signal Visualizer */}
               <div className="relative">
                  <div 
                    className="absolute inset-[-40px] border-2 border-cyan-500/10 rounded-full transition-all duration-100" 
                    style={{ transform: `scale(${1 + level/200})`, opacity: level/100 }}
                  />
                  <div className="w-56 h-56 bg-gradient-to-br from-zinc-900 to-black rounded-[4rem] flex items-center justify-center border border-white/10 relative shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
                    <svg className="w-24 h-24 text-cyan-500 relative z-10" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/></svg>
                  </div>
               </div>
               
               <div className="w-full space-y-8">
                  <audio 
                    src={media.url} 
                    controls 
                    autoPlay 
                    onEnded={onNext}
                    className="w-full max-w-md mx-auto accent-cyan-500 h-10" 
                  />
                  {playlist && playlist.length > 1 && (
                    <div className="text-center">
                       <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Playing Playlist</p>
                       <div className="flex justify-center gap-2 mt-4">
                          {playlist.map((p, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${p.id === media.id ? 'bg-cyan-400' : 'bg-zinc-800'}`} />
                          ))}
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 text-center relative z-10">
         <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.8em]">Hina Media Protocol v2.0</p>
      </div>
    </div>
  );
};
