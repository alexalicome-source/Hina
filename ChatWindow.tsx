
import React, { useState, useEffect, useRef } from 'react';
import { db, collection, addDoc, onSnapshot, query, orderBy } from '../firebase';

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 800;
      if (width > height) {
        if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
      } else {
        if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
  });
};

export const ChatWindow: React.FC<{ user: any, onClose: () => void }> = ({ user, onClose }) => {
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, `users/${user.id}/chats`), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => doc.data()));
    });
  }, [user]);

  const send = async (fileData?: { url: string, type: string, name: string }) => {
    if (!msg && !fileData) return;
    try {
      await addDoc(collection(db, `users/${user.id}/chats`), {
        sender: user.name,
        text: msg,
        file: fileData || null,
        timestamp: new Date().toISOString()
      });
      setMsg('');
    } catch (e: any) {
      if (e.message.includes('longer than 1048487 bytes')) {
        alert("Boss, ye file bahut badi hai. Hina isse process nahi kar payegi.");
      } else {
        console.error("Chat send error:", e);
      }
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000 && !file.type.startsWith('image/')) {
      alert("Boss, audio/video size limit 800KB hai.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      let url = reader.result as string;
      const type = file.type.split('/')[0];
      
      if (type === 'image') {
        url = await compressImage(url);
      }
      
      await send({ url, type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col font-outfit safe-pt safe-pb animate-in slide-in-from-right duration-300">
      <div className="px-8 py-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 font-bold">H</div>
          <div><h2 className="text-sm font-bold text-white tracking-tight">Hina AI Partner</h2><p className="text-[8px] text-zinc-500 uppercase font-black">Secure Link Established</p></div>
        </div>
        <button onClick={onClose} className="text-white text-3xl">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {history.map((h, i) => (
          <div key={i} className={`flex flex-col ${h.sender === user.name ? 'items-end' : 'items-start'}`}>
            <div className={`p-5 rounded-[2rem] text-sm max-w-[85%] ${h.sender === user.name ? 'bg-white text-black rounded-tr-none' : 'bg-zinc-900 text-zinc-300 rounded-tl-none'}`}>
              {h.file && (
                <div className="mb-3 rounded-2xl overflow-hidden border border-black/5">
                  {h.file.type === 'image' && <img src={h.file.url} className="w-full h-auto" />}
                  {h.file.type === 'video' && <video src={h.file.url} controls className="w-full" />}
                  {h.file.type === 'audio' && <audio src={h.file.url} controls className="w-full" />}
                </div>
              )}
              {h.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-zinc-950/50 backdrop-blur-xl border-t border-white/5">
        <div className="flex gap-4 items-center">
          <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 active:scale-90 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} />
          <input 
            type="text" value={msg} onChange={e => setMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} 
            placeholder="Kahiye Boss..." className="flex-1 bg-white/5 border border-white/5 rounded-[2rem] px-8 py-4 text-white text-sm outline-none focus:border-cyan-500/20" 
          />
          <button onClick={() => send()} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black active:scale-90 transition-all">
            <svg className="w-5 h-5 rotate-45" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
