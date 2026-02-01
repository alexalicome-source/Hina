
import React, { useRef, useState, useEffect } from 'react';

interface BrowserProps {
  url: string;
  onClose: () => void;
}

export const HinaBrowser: React.FC<BrowserProps> = ({ url, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentUrl, setCurrentUrl] = useState(url);

  const restrictedSites = ['youtube.com', 'whatsapp.com', 'google.com', 'facebook.com', 'instagram.com', 'netflix.com', 'maps.google.com'];
  const isRestricted = restrictedSites.some(site => currentUrl.toLowerCase().includes(site));

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  const openExternally = () => {
    window.open(currentUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[1500] bg-black p-4 flex flex-col font-outfit animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-center px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Hina Core Browser</p>
            <p className="text-xs text-white font-bold truncate w-48">{currentUrl}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white text-3xl">×</button>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] overflow-hidden relative border-[8px] border-zinc-950 shadow-2xl">
        {isRestricted ? (
          <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-white font-black text-2xl mb-4 italic tracking-tight uppercase">Bypass Protocol Required</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-10 max-w-md">Boss, ye website frame security protection use karti hai. Main isse aapke main browser mein turant open kar deti hoon!</p>
            <button onClick={openExternally} className="px-10 py-5 bg-white text-black font-black rounded-2xl active:scale-95 transition-all text-xs tracking-[0.2em] uppercase">Open In Full Browser</button>
          </div>
        ) : (
          <iframe 
            ref={iframeRef} 
            src={currentUrl} 
            className="w-full h-full border-none bg-white" 
            title="Hina Browser" 
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  );
};
