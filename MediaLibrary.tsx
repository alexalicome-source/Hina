
import React, { useState, useRef } from 'react';
import { AdminPanel } from '../admin/AdminPanel';
import { db, deleteDoc, doc } from '../../firebase';
import { ChatWindow } from '../ChatWindow';

export interface LocalMedia { id: string; name: string; url: string; type: 'audio' | 'image' | 'video' | 'file'; date: string; folder?: string; }
export interface Folder { id: string; name: string; files: LocalMedia[]; }

interface CenterProps {
  folders: Folder[];
  currentUser: any;
  usersList: any[];
  onUploadFile: (data: Partial<LocalMedia>) => void;
  onClose: () => void;
  onSelectFile?: (file: LocalMedia) => void;
  onInitiateCall: (targetId: string, type: 'audio' | 'video') => void;
}

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

export const MediaLibrary: React.FC<CenterProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'contacts' | 'private'>('vault');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [chatUser, setChatUser] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deleteFile = async (fileId: string) => {
    if (confirm("Boss, mita doon ye file?")) {
      try {
        await deleteDoc(doc(db, "users", props.currentUser.id, "vault", fileId));
      } catch (e) { console.error(e); }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Hard limit check for Firestore document size (1MB property limit)
    // Base64 adds ~33% overhead, so 750KB file becomes ~1MB
    if (file.size > 750000 && !file.type.startsWith('image/')) {
      alert("Boss, file size limit 750KB hai taaki Hina isse save kar sake.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      let dataUrl = reader.result as string;
      
      // Robust type detection for Audio & Video
      let type: 'audio' | 'image' | 'video' | 'file' = 'file';
      const mime = file.type.toLowerCase();
      if (mime.includes('image')) type = 'image';
      else if (mime.includes('audio') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) type = 'audio';
      else if (mime.includes('video') || file.name.endsWith('.mp4')) type = 'video';

      if (type === 'image') {
        dataUrl = await compressImage(dataUrl);
      }

      // Automatically place in 'Song' folder if it's audio and no folder is selected
      const targetFolder = selectedFolderId || (type === 'audio' ? 'Song' : (activeTab === 'private' ? 'Private' : 'Unsorted'));

      props.onUploadFile({ 
        name: file.name, 
        url: dataUrl, 
        type, 
        folder: targetFolder
      });
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const isAdmin = props.currentUser.role === 'admin';

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col safe-pt font-outfit animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
      <div className="px-8 py-8 flex justify-between items-center relative z-10">
        <div>
           <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Hina Center</h2>
           <div className="flex gap-6 mt-4">
              <button onClick={() => {setActiveTab('vault'); setSelectedFolderId(null);}} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'vault' ? 'text-cyan-400' : 'text-zinc-600'}`}>Vault</button>
              <button onClick={() => setActiveTab('contacts')} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'contacts' ? 'text-cyan-400' : 'text-zinc-600'}`}>Contacts</button>
              {isAdmin && <button onClick={() => {setActiveTab('private'); setSelectedFolderId(null);}} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'private' ? 'text-rose-500' : 'text-zinc-600'}`}>Secure</button>}
           </div>
        </div>
        <div className="flex gap-3">
           {isAdmin && <button onClick={() => setShowAdmin(true)} className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-cyan-400 border-cyan-500/20 font-black">A</button>}
           <button onClick={props.onClose} className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-white text-2xl">×</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-32 custom-scroll">
        {(activeTab === 'vault' || activeTab === 'private') && (
          !selectedFolderId ? (
            <div className="grid grid-cols-2 gap-5 animate-in fade-in duration-500">
              {props.folders
                .filter(f => activeTab === 'private' ? f.name === 'Private' : f.name !== 'Private')
                .map(f => (
                <div key={f.id} onClick={() => setSelectedFolderId(f.id)} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-95 transition-all border-white/5">
                  <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center border border-white/5 ${f.name === 'Song' ? 'bg-cyan-500/10 text-cyan-400' : f.name === 'Private' ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-900 text-zinc-500'}`}>
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      {f.name === 'Song' ? <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/> : f.name === 'Private' ? <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/> : <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/>}
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white truncate w-32">{f.name}</p>
                    <p className="text-[10px] text-zinc-600 font-black uppercase mt-1">{f.files.length} Items</p>
                  </div>
                </div>
              ))}
              {activeTab === 'private' && props.folders.filter(f => f.name === 'Private').length === 0 && (
                <div onClick={() => setSelectedFolderId('Private')} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-4 active:scale-95 transition-all border-white/5">
                  <div className="w-20 h-20 rounded-[1.8rem] flex items-center justify-center border border-white/5 bg-rose-500/5 text-zinc-800">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                  </div>
                  <p className="text-xs font-bold text-zinc-600">Create Secure Folder</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
                <button onClick={() => setSelectedFolderId(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-cyan-400 tracking-widest">← Back</button>
                <h3 className={`font-black text-xs uppercase tracking-widest ${selectedFolderId === 'Private' ? 'text-rose-500' : 'text-white'}`}>{selectedFolderId}</h3>
                <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2 bg-white text-black text-[9px] font-black uppercase rounded-full tracking-widest">Upload</button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="audio/*,video/*,image/*" />
              <div className="grid grid-cols-1 gap-4">
                {props.folders.find(f => f.id === selectedFolderId)?.files.map(file => (
                  <div key={file.id} className="glass-card p-5 rounded-[2rem] flex items-center gap-5 group border-white/5 active:bg-white/5 transition-all">
                    <div onClick={() => props.onSelectFile?.(file)} className="w-16 h-16 bg-black rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer border border-white/5">
                      {file.type === 'image' ? <img src={file.url} className="w-full h-full object-cover" /> : 
                       file.type === 'audio' ? <span className="text-2xl">🎵</span> : 
                       file.type === 'video' ? <span className="text-2xl">🎬</span> : <span className="text-2xl">📄</span>}
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => props.onSelectFile?.(file)}>
                      <p className="text-sm font-bold text-white truncate">{file.name}</p>
                      <p className="text-[9px] text-zinc-600 uppercase font-black">{file.type} • {new Date(file.date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteFile(file.id)} className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             {props.usersList.map(user => (
               <div key={user.id} className="glass-card p-6 rounded-[2.5rem] flex flex-col gap-6 border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-bold border border-white/5">{user.name[0]}</div>
                       <div><p className="text-white font-black text-sm">{user.name}</p><p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">{user.role}</p></div>
                    </div>
                    <button onClick={() => window.open(`https://www.google.com/maps?q=${user.location?.lat || 0},${user.location?.lng || 0}`, '_blank')} className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-500/20 active:scale-90 transition-all">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                     <button onClick={() => props.onInitiateCall(user.id, 'audio')} className="h-12 glass-card rounded-2xl flex items-center justify-center text-zinc-400 hover:text-cyan-400 transition-all">Call</button>
                     <button onClick={() => props.onInitiateCall(user.id, 'video')} className="h-12 glass-card rounded-2xl flex items-center justify-center text-zinc-400 hover:text-cyan-400 transition-all">Video</button>
                     <button onClick={() => setChatUser(user)} className="h-12 glass-card rounded-2xl flex items-center justify-center text-zinc-400 hover:text-cyan-400 transition-all">Chat</button>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {chatUser && <ChatWindow user={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
};
