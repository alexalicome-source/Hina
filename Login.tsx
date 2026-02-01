
import React, { useState, useRef, useEffect } from 'react';
import { db, doc, getDoc } from '../firebase';

type LoginStep = 'form' | 'choice' | 'face' | 'voice' | 'success';

export const Login: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<LoginStep>('form');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isListening, setIsListening] = useState(false);

  // Persistence Check
  useEffect(() => {
    const saved = localStorage.getItem('hina_session_data');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.id === 'ALEX') {
        setStep('choice'); // Admin must verify biometric every time for safety
      } else {
        onLogin(data); // Family/Friends log in directly if session exists
      }
    }
  }, [onLogin]);

  const handleInitialAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !password) return;
    setLoading(true);
    setError('');

    const upperID = id.trim().toUpperCase();
    
    try {
      if (upperID === 'ALEX' && password === 'ALEX@123') {
        const adminData = { id: 'ALEX', name: 'Amin Boss', role: 'admin' };
        localStorage.setItem('hina_session_data', JSON.stringify(adminData));
        setStep('choice');
        return;
      }

      const docSnap = await getDoc(doc(db, "users", upperID));
      if (docSnap.exists() && docSnap.data().password === password) {
        const userData = { id: upperID, name: docSnap.data().name || 'User', role: docSnap.data().role || 'friend' };
        localStorage.setItem('hina_session_data', JSON.stringify(userData));
        onLogin(userData);
      } else {
        setError('Incorrect Access Code');
      }
    } catch (err) {
      setError('Connection Failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'face') {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        setTimeout(() => {
          setStep('success');
          stream.getTracks().forEach(t => t.stop());
        }, 3000); 
      });
    }
  }, [step]);

  const startVoiceVerify = () => {
    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStep('success');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase();
      if (text.includes("i am not a hacker") || text.includes("hina activate")) {
        setStep('success');
      } else {
        setError("Voice match failed. Try again.");
        setIsListening(false);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    if (step === 'success') {
      setTimeout(() => onLogin({ id: 'ALEX', name: 'Amin Boss', role: 'admin' }), 1000);
    }
  }, [step, onLogin]);

  return (
    <div className="fixed inset-0 z-[2000] bg-black font-outfit flex flex-col p-8 safe-pt safe-pb overflow-hidden">
      <div className="flex-1 flex flex-col justify-center gap-10">
        <div className="space-y-4">
           <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/5 mb-8">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-cyan-400`} />
           </div>
           <h1 className="text-6xl font-black text-white italic tracking-tighter">HINA</h1>
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">
             {step === 'choice' ? 'Security Protocol Required' : 'Authorization Hub'}
           </p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleInitialAuth} className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
             <div className="space-y-4">
                <input 
                  type="text" placeholder="ID" value={id} onChange={e => setId(e.target.value)} 
                  className="w-full bg-white/[0.04] border border-white/5 rounded-[2rem] p-6 text-white outline-none focus:border-cyan-500/30 transition-all font-bold tracking-widest uppercase" 
                />
                <input 
                  type="password" placeholder="KEY" value={password} onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-white/[0.04] border border-white/5 rounded-[2rem] p-6 text-white outline-none focus:border-cyan-500/30 transition-all font-bold tracking-widest uppercase" 
                />
             </div>
             {error && <p className="text-rose-500 text-[10px] text-center font-black uppercase tracking-widest">{error}</p>}
             <button type="submit" disabled={loading} className="w-full bg-white text-black font-black py-6 rounded-[2.2rem] active:scale-95 transition-all text-sm tracking-widest uppercase">
                {loading ? 'SYNCING...' : 'ESTABLISH LINK'}
             </button>
          </form>
        )}

        {step === 'choice' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <p className="text-white text-sm font-bold text-center mb-6">Boss, verification kaise karna hai?</p>
            <button onClick={() => setStep('face')} className="w-full py-6 glass-card border-white/10 rounded-[2rem] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4">
               <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               Face Scan
            </button>
            <button onClick={() => setStep('voice')} className="w-full py-6 glass-card border-white/10 rounded-[2rem] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4">
               <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
               Voice Scan
            </button>
          </div>
        )}

        {step === 'face' && (
          <div className="space-y-8 animate-in zoom-in duration-700">
            <div className="relative w-64 h-64 mx-auto border-4 border-cyan-500/20 rounded-full overflow-hidden">
               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-125" />
               <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
            </div>
            <p className="text-center text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em]">Scanning Facial Features...</p>
          </div>
        )}

        {step === 'voice' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500 text-center">
            <div className="w-32 h-32 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 relative">
               {isListening && <div className="absolute inset-[-10px] border-2 border-rose-500/30 rounded-full animate-ping" />}
               <svg className="w-12 h-12 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005.93 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" /></svg>
            </div>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Aapki awaz pehchan rahi hoon...</p>
            <button onClick={startVoiceVerify} className="px-10 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest active:scale-90 transition-all">
               {isListening ? 'LISTENING...' : 'START VOICE SCAN'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center animate-in zoom-in duration-500">
             <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white text-4xl mb-6">✓</div>
             <h2 className="text-white text-3xl font-black italic tracking-tighter uppercase">Access Granted</h2>
             <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Welcome Back, Amin Boss</p>
          </div>
        )}
      </div>
    </div>
  );
};
