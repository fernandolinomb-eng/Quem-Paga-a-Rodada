
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Beer, 
  Settings as SettingsIcon, 
  History as HistoryIcon, 
  Plus, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  X,
  Phone,
  Info,
  Heart,
  Copy,
  ExternalLink,
  Award,
  Coffee
} from 'lucide-react';
import { Participant, DrawHistory, AppSettings, AppScreen } from './types';
import { COLORS } from './constants';
import BubbleBackground from './components/BubbleBackground';
import { generateFunnyCallout } from './services/geminiService';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.HOME);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [history, setHistory] = useState<DrawHistory[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    avoidRepeats: false,
    notifyAll: false,
    animationsEnabled: true,
    soundEnabled: true,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<Participant | null>(null);
  const [funnyMessage, setFunnyMessage] = useState("");
  const [showDonationInvite, setShowDonationInvite] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("+258");

  // --- Persistence ---
  useEffect(() => {
    const savedParticipants = localStorage.getItem('beer_participants');
    const savedHistory = localStorage.getItem('beer_history');
    const savedSettings = localStorage.getItem('beer_settings');
    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => { localStorage.setItem('beer_participants', JSON.stringify(participants)); }, [participants]);
  useEffect(() => { localStorage.setItem('beer_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('beer_settings', JSON.stringify(settings)); }, [settings]);

  // --- Handlers ---
  const addParticipant = () => {
    if (!newName.trim() || newPhone.length < 9) return;
    const newEntry: Participant = { 
      id: crypto.randomUUID(), 
      name: newName, 
      phoneNumber: newPhone, 
      timesPaid: 0 
    };
    setParticipants([...participants, newEntry]);
    setNewName(""); 
    setNewPhone("+258"); 
    setIsAddModalOpen(false);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const performDraw = async () => {
    if (participants.length < 2) {
      alert("Txé! Precisas de pelo menos 2 parceiros para abrir uma gelada! 🍻");
      return;
    }
    setIsDrawing(true);
    setDrawResult(null);
    setFunnyMessage("");
    setShowDonationInvite(false);

    let eligible = [...participants];
    if (settings.avoidRepeats && history.length > 0) {
      const lastPayerId = history[0].participantId;
      if (eligible.length > 1) {
        eligible = eligible.filter(p => p.id !== lastPayerId);
      }
    }

    setTimeout(async () => {
      const winner = eligible[Math.floor(Math.random() * eligible.length)];
      setDrawResult(winner);
      setIsDrawing(false);

      const newHistoryEntry: DrawHistory = { 
        id: crypto.randomUUID(), 
        participantId: winner.id, 
        participantName: winner.name, 
        timestamp: Date.now() 
      };
      setHistory([newHistoryEntry, ...history]);
      
      setParticipants(prev => prev.map(p => 
        p.id === winner.id ? { ...p, timesPaid: p.timesPaid + 1 } : p
      ));

      const msg = await generateFunnyCallout(winner.name);
      setFunnyMessage(msg);

      // Trigger donation invite after a short delay
      setTimeout(() => {
        setShowDonationInvite(true);
      }, 3000);
    }, 2500);
  };

  const shareOnWhatsApp = (target: Participant | 'all') => {
    if (!drawResult) return;
    const baseMessage = funnyMessage || `🍺 *QUEM PAGA A RODADA?* 🍺\n\nHoje quem abre a carteira é o(a) *${drawResult.name}*! \n\nPrepara o kumbu! 💸🇲🇿`;
    const encodedMsg = encodeURIComponent(baseMessage);
    if (target === 'all') {
      window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
    } else {
      window.open(`https://wa.me/${target.phoneNumber.replace(/\+/g, '')}?text=${encodedMsg}`, '_blank');
    }
  };

  const copyMpesa = () => {
    navigator.clipboard.writeText("846607677");
    alert("Número M-Pesa de Fernando Mabuie copiado! Txé, valeu pela rodada! 🍻");
  };

  const NavButton = ({ icon, label, active, onClick }: any) => (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1 transition-all min-w-[64px] ${active ? 'text-amber-600 scale-110' : 'text-gray-400'}`}
    >
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-[#FFF9F0]">
      <BubbleBackground />

      {/* FLOATING TOP DONATION BANNER */}
      {showDonationInvite && drawResult && (
        <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-down">
          <div className="bg-[#E1261C] text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1" onClick={() => window.location.href = "tel:*150*1*1*846607677#"}>
              <div className="bg-white/20 p-2 rounded-xl">
                <Heart className="animate-pulse text-white fill-white" size={20} />
              </div>
              <div className="cursor-pointer">
                <p className="font-black text-sm uppercase italic tracking-tighter leading-tight">Manda uma "duas" ao dev! 🍺</p>
                <p className="text-[10px] text-white/70 font-bold">Fernando • 846607677</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="tel:*150*1*1*846607677#" 
                className="bg-white text-[#E1261C] px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
              >
                Pagar <ExternalLink size={10} />
              </a>
              <button onClick={() => setShowDonationInvite(false)} className="p-1 text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 beer-gradient rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
            <Beer className="text-white w-6 h-6" />
          </div>
          <h1 className="font-extrabold text-xl text-[#2D1B08] tracking-tight">Quem Paga? 🇲🇿</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setScreen(AppScreen.ABOUT)} className="p-2 rounded-full hover:bg-amber-50 transition-colors">
            <Heart className="w-5 h-5 text-red-500" />
          </button>
          <button onClick={() => setScreen(AppScreen.SETTINGS)} className="p-2 rounded-full hover:bg-amber-50 transition-colors">
            <SettingsIcon className="w-6 h-6 text-amber-600" />
          </button>
        </div>
      </header>

      <main className="relative z-10 p-5 max-w-lg mx-auto">
        
        {/* HOME SCREEN */}
        {screen === AppScreen.HOME && (
          <div className="space-y-10 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">Pronto para a rodada?</h2>
              <p className="text-gray-500 font-medium">Sorteia quem paga a gelada hoje!</p>
            </div>

            <div className="relative aspect-square max-w-[300px] mx-auto flex items-center justify-center">
               <div className={`absolute inset-0 rounded-full border-8 border-dashed border-amber-200 ${isDrawing ? 'animate-spin' : 'animate-spin-slow'}`} />
               <button 
                disabled={isDrawing || participants.length < 2}
                onClick={performDraw}
                className="relative z-10 w-48 h-48 rounded-full beer-gradient shadow-2xl shadow-amber-400/50 flex flex-col items-center justify-center text-white transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
               >
                 {isDrawing ? (
                   <div className="flex flex-col items-center">
                     <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                     <span className="font-bold uppercase tracking-widest text-xs">A Agitar...</span>
                   </div>
                 ) : (
                   <><Beer size={48} className="mb-2" /><span className="font-extrabold text-lg text-center leading-tight uppercase tracking-tighter">SORTEAR<br/>RODADA 🍻</span></>
                 )}
               </button>
            </div>

            {drawResult && !isDrawing && (
              <div className="space-y-4">
                <div className="bg-white border-2 border-amber-500 rounded-[40px] p-8 shadow-2xl animate-bounce-in text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 text-amber-600 rounded-full"><Award size={48} /></div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-amber-600 tracking-[0.2em] mb-1">O Sorteado é:</h3>
                    <p className="text-4xl font-black text-gray-900 tracking-tight">{drawResult.name}</p>
                  </div>
                  {funnyMessage && <p className="text-gray-600 italic px-4 font-bold text-lg leading-tight">"{funnyMessage}"</p>}
                  <div className="grid grid-cols-1 gap-3 pt-4">
                    <button onClick={() => shareOnWhatsApp(drawResult)} className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-black py-4 rounded-2xl shadow-lg shadow-green-200 hover:brightness-105 transition-all uppercase text-sm"><Share2 size={20} />Enviar ao Sorteado</button>
                    <button onClick={() => shareOnWhatsApp('all')} className="flex items-center justify-center gap-2 border-2 border-amber-500 text-amber-600 font-black py-3 rounded-2xl hover:bg-amber-50 transition-all uppercase text-sm">Partilhar no Grupo</button>
                  </div>
                </div>
              </div>
            )}

            {!isDrawing && !drawResult && (
              <div className="bg-amber-50 rounded-[32px] p-5 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 beer-gradient text-white rounded-2xl flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">No bar agora</p>
                        <p className="font-black text-amber-900 text-xl">{participants.length} Amigos</p>
                    </div>
                </div>
                <button onClick={() => setScreen(AppScreen.PARTICIPANTS)} className="text-amber-600 font-bold text-sm underline px-2">Ver Todos</button>
              </div>
            )}
          </div>
        )}

        {/* PARTICIPANTS SCREEN */}
        {screen === AppScreen.PARTICIPANTS && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Amigos do Txillar</h2>
              <button onClick={() => setIsAddModalOpen(true)} className="w-12 h-12 beer-gradient text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200"><Plus size={28} /></button>
            </div>
            <div className="grid gap-4">
                {participants.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-[24px] shadow-sm border border-amber-50 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-2xl italic">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-lg">{p.name}</h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-400 tracking-tight">{p.phoneNumber}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right px-3 border-r border-amber-50">
                          <p className="text-[10px] uppercase font-black text-amber-500 tracking-widest">Pagou</p>
                          <p className="font-black text-gray-800 text-xl italic">{p.timesPaid}x</p>
                       </div>
                       <button onClick={() => removeParticipant(p.id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
                    </div>
                  </div>
                ))}
                {participants.length === 0 && <div className="text-center py-20 opacity-20"><Beer size={64} className="mx-auto mb-4" /><p className="font-black uppercase">Vazio...</p></div>}
            </div>
          </div>
        )}

        {/* HISTORY SCREEN */}
        {screen === AppScreen.HISTORY && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Histórico de Rodadas</h2>
              <button onClick={() => { if(confirm("Limpar tudo?")) setHistory([]) }} className="text-amber-600 text-xs font-black uppercase tracking-widest flex items-center gap-1"><Trash2 size={16} /> Limpar</button>
            </div>
            <div className="space-y-3">
              {history.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-l-4 border-amber-400 shadow-sm">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.participantName} pagou!</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString('pt-MZ')} às {new Date(item.timestamp).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-center text-gray-400 pt-10 font-black italic uppercase text-sm">Nenhuma rodada registada ainda.</p>}
            </div>
          </div>
        )}

        {/* ABOUT SCREEN */}
        {screen === AppScreen.ABOUT && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-black text-gray-800">Sobre o Projecto</h2>
            
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-amber-100 space-y-6 text-center">
              <div className="w-20 h-20 beer-gradient rounded-[28px] flex items-center justify-center mx-auto shadow-lg shadow-amber-100">
                <Beer className="text-white w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Quem Paga a Rodada?</h3>
                <p className="text-gray-500 mt-4 leading-relaxed font-medium text-sm">
                  Este aplicativo foi criado para celebrar as tertúlias moçambicanas. O objetivo é decidir de forma justa e divertida quem paga a próxima gelada na mesa!
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-amber-100 flex items-center gap-5">
              <div className="w-16 h-16 bg-amber-900 rounded-2xl flex items-center justify-center text-white font-black italic text-xl shadow-lg">FM</div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Produtor do App</p>
                <p className="text-xl font-black text-gray-900 uppercase tracking-tight">Fernando Mabuie</p>
                <p className="text-xs font-bold text-gray-400 italic">"TAMBÉM ACEITO UMA RODADA! 🍺"</p>
              </div>
            </div>

            {/* M-PESA DONATION SECTION */}
            <div className="bg-[#E1261C] rounded-[40px] p-8 shadow-2xl text-white space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Heart size={120} fill="white" /></div>
               <div className="relative z-10">
                  <h4 className="font-black text-2xl uppercase tracking-tighter italic">Paga uma Rodada ao Dev!</h4>
                  <p className="text-white/80 font-medium text-sm">Gostaste do mambo? Oferece uma gelada via M-Pesa para manter o projecto vivo!</p>
                  
                  <div className="mt-8 bg-black/20 rounded-[24px] p-6 border border-white/20 backdrop-blur-md">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase font-black text-white/50 tracking-widest">Número M-Pesa</span>
                        <span className="text-[10px] uppercase font-black text-white/50 tracking-widest">Titular</span>
                     </div>
                     <div className="flex justify-between items-end">
                        <p className="text-3xl font-black tracking-tighter">846607677</p>
                        <p className="text-sm font-black uppercase">Fernando Mabuie</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button onClick={copyMpesa} className="bg-white text-[#E1261C] font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest"><Copy size={18} /> Copiar</button>
                    <a href="tel:*150*1*1*846607677#" className="bg-black/40 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/30 active:scale-95 transition-all uppercase text-xs tracking-widest"><ExternalLink size={18} /> Enviar</a>
                  </div>
               </div>
            </div>
            
            <div className="text-center opacity-30 pb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Maputo • Moçambique • 2025</p>
            </div>
          </div>
        )}

        {/* SETTINGS SCREEN */}
        {screen === AppScreen.SETTINGS && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <button onClick={() => setScreen(AppScreen.HOME)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
              <h2 className="text-2xl font-black text-gray-800">Configurações</h2>
            </div>
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-amber-50 space-y-8">
              <div className="flex items-center justify-between">
                <div><p className="font-bold text-gray-900">Evitar repetições</p><p className="text-xs font-bold text-gray-400">Não sortear quem pagou a última</p></div>
                <button onClick={() => setSettings({...settings, avoidRepeats: !settings.avoidRepeats})} className={`w-14 h-7 rounded-full transition-colors relative ${settings.avoidRepeats ? 'bg-amber-500' : 'bg-gray-200'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.avoidRepeats ? 'left-8' : 'left-1'}`} /></button>
              </div>
              <div className="flex items-center justify-between">
                <div><p className="font-bold text-gray-900">Animações de Espuma</p><p className="text-xs font-bold text-gray-400">Activar efeitos visuais</p></div>
                <button onClick={() => setSettings({...settings, animationsEnabled: !settings.animationsEnabled})} className={`w-14 h-7 rounded-full transition-colors relative ${settings.animationsEnabled ? 'bg-amber-500' : 'bg-gray-200'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.animationsEnabled ? 'left-8' : 'left-1'}`} /></button>
              </div>
            </div>
          </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-50 px-2 py-4 flex justify-around items-center z-50 shadow-[0_-10px_30px_rgba(242,169,0,0.05)]">
        <NavButton icon={<Beer />} label="Sorteio" active={screen === AppScreen.HOME} onClick={() => setScreen(AppScreen.HOME)} />
        <NavButton icon={<Users />} label="Amigos" active={screen === AppScreen.PARTICIPANTS} onClick={() => setScreen(AppScreen.PARTICIPANTS)} />
        <NavButton icon={<HistoryIcon />} label="Memórias" active={screen === AppScreen.HISTORY} onClick={() => setScreen(AppScreen.HISTORY)} />
        <NavButton icon={<Info />} label="Sobre" active={screen === AppScreen.ABOUT} onClick={() => setScreen(AppScreen.ABOUT)} />
      </nav>

      {/* MODAL NOVO AMIGO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[48px] sm:rounded-[48px] p-10 space-y-8 animate-slide-up">
             <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-gray-900 tracking-tight">Novo Parceiro</h3><button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-300"><X size={28} /></button></div>
             <div className="space-y-6">
                <div><label className="text-[10px] font-black uppercase text-amber-600 ml-4 mb-2 block tracking-widest">Nome do Indivíduo</label><input value={newName} onChange={(e) => setNewName(e.target.value)} type="text" placeholder="Ex: Txandinho" className="w-full bg-amber-50 border-2 border-amber-100 rounded-3xl px-6 py-5 focus:outline-none focus:border-amber-400 font-bold" /></div>
                <div><label className="text-[10px] font-black uppercase text-amber-600 ml-4 mb-2 block tracking-widest">WhatsApp (+258...)</label><input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} type="tel" placeholder="+258" className="w-full bg-amber-50 border-2 border-amber-100 rounded-3xl px-6 py-5 focus:outline-none focus:border-amber-400 font-bold" /></div>
             </div>
             <button onClick={addParticipant} className="w-full beer-gradient text-white font-black py-5 rounded-3xl shadow-xl shadow-amber-200 uppercase tracking-widest text-lg active:scale-95 transition-all">Registar no Bar 🍻</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        
        @keyframes slide-down { from { transform: translateY(-120%); } to { transform: translateY(0); } }
        .animate-slide-down { animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1); }

        @keyframes bounce-in { 0% { transform: scale(0.9); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
        
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
