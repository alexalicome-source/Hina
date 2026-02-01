
import React, { useState, useEffect, useRef } from 'react';
import { db, collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from '../../firebase';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newRole, setNewRole] = useState<'friend' | 'family'>('friend');
  
  // Face Identification logic
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Fetch failed", e); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const faceData = canvasRef.current.toDataURL('image/jpeg', 0.8);
    
    // Update Boss face data
    await updateDoc(doc(db, "users", "ALEX"), { faceData });
    alert("Boss! Your identity has been verified and registered.");
    stopCamera();
    fetchUsers();
  };

  const startCamera = async () => {
    setIsCapturing(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const stopCamera = () => {
    setIsCapturing(false);
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newKey) return;
    const upperId = newId.toUpperCase();
    await setDoc(doc(db, "users", upperId), { 
      name: newName || upperId, password: newKey, role: newRole, online: false 
    });
    setNewId(''); setNewKey(''); setNewName('');
    fetchUsers();
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/98 backdrop-blur-3xl flex flex-col p-8 safe-pt animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Admin Core</h2>
           <p className="text-[8px] text-cyan-400 font-black uppercase tracking-[0.4em]">Face ID & Identity Hub</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-white text-3xl">×</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scroll pb-24">
        {/* Face ID Section */}
        <div className="glass-card p-8 rounded-[3rem] border-white/10">
          <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-6 text-center">Face Identification Protocol</p>
          <div className="relative aspect-video bg-zinc-950 rounded-[2rem] overflow-hidden mb-6 border border-white/5">
             {isCapturing ? (
               <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-40">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-[8px] font-black uppercase tracking-widest">Camera Offline</p>
               </div>
             )}
             <canvas ref={canvasRef} className="hidden" />
          </div>
          <button 
            onClick={isCapturing ? captureFace : startCamera} 
            className={`w-full py-5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all active:scale-95 ${isCapturing ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'bg-white/5 text-white border border-white/10'}`}>
            {isCapturing ? 'Capture Identity' : 'Initiate Face Scan'}
          </button>
        </div>

        {/* Existing Add User Form */}
        <form onSubmit={addUser} className="glass-card p-8 rounded-[3rem] space-y-5 border-white/10">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Register Identity</p>
          <div className="grid grid-cols-2 gap-4">
            <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="ID" className="w-full bg-white/5 p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-cyan-500/20" />
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" className="w-full bg-white/5 p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-cyan-500/20" />
          </div>
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Access Key" className="w-full bg-white/5 p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-cyan-500/20" />
          <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-2xl active:scale-95 transition-all text-xs tracking-widest uppercase">Add User</button>
        </form>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Authorized Links</p>
          {users.map(u => (
            <div key={u.id} className="glass-card p-6 rounded-[2.5rem] flex justify-between items-center group transition-all border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center">
                  {u.faceData ? <img src={u.faceData} className="w-full h-full object-cover" /> : <span className="text-white text-[10px] font-bold">{u.name[0]}</span>}
                </div>
                <div>
                  <p className="text-white font-black text-sm">{u.name || u.id}</p>
                  <p className="text-[9px] text-zinc-600 uppercase font-black">{u.role} | {u.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
