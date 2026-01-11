import React, { useEffect, useRef, useState } from 'react';
import { Play, Radio, Zap, Shield, Cpu, ChevronRight, Target, Menu, X, ArrowUp, Youtube, Linkedin, Twitter, Github, Instagram, ExternalLink, Mail, FileText, Lock } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  // Background Animation: Data Streams
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const columns = Math.floor(w / 40);
    const drops: number[] = [];
    const dropSpeed: number[] = [];
    
    for(let i = 0; i < columns; i++) {
        drops[i] = Math.random() * h;
        dropSpeed[i] = 1 + Math.random() * 3;
    }

    const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const draw = () => {
        // Fade effect
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; // Slate 900 with alpha
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#06b6d4'; // Cyan 500
        
        for (let i = 0; i < drops.length; i++) {
            // Draw a rect instead of text for "data stream" look
            const x = i * 40;
            const y = drops[i];
            
            // Randomized height of the stream chunk
            const chunkHeight = Math.random() * 40;
            
            ctx.globalAlpha = 0.1 + Math.random() * 0.4;
            ctx.fillRect(x, y, 2, chunkHeight);
            
            drops[i] -= dropSpeed[i]; // Move UP
            
            if (drops[i] < -50) {
                drops[i] = h + Math.random() * 50;
                dropSpeed[i] = 1 + Math.random() * 2;
            }
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    };
    
    const anim = requestAnimationFrame(draw);
    return () => {
        cancelAnimationFrame(anim);
        window.removeEventListener('resize', resize);
    };
  }, []);

  // Back to top scroll handler
  useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > 300) {
            setShowBackToTop(true);
        } else {
            setShowBackToTop(false);
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-cyan-500/30 overflow-x-hidden font-sans">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-4 md:py-6 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border-b border-slate-800 transition-all duration-300">
        <div className="flex items-center gap-3">
            <div className="relative group">
                <div className="absolute inset-0 bg-cyan-500 rounded-lg blur opacity-40 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-slate-900 rounded-lg border border-cyan-500/50 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-cyan-400" />
                </div>
            </div>
            <span className="font-display font-bold text-lg md:text-xl tracking-wider text-white">SPECTRUM CITY</span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-sm text-slate-400 font-semibold tracking-wide">
            <a href="#about" className="hover:text-cyan-400 transition-colors py-2 relative group">
                SIMULATION
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
            </a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors py-2 relative group">
                PROTOCOLS
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
            </a>
            <a href="#mission" className="hover:text-cyan-400 transition-colors py-2 relative group">
                MISSION
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
            </a>
        </div>

        <button 
            onClick={onStart}
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-display font-bold px-6 py-2 rounded transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-0.5"
            aria-label="Launch Game"
        >
            <Play className="w-4 h-4 fill-current" />
            <span>LAUNCH</span>
        </button>

        {/* Mobile Hamburger */}
        <button 
            className="md:hidden text-white p-2 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
        >
            {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/98 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col items-center gap-8 animate-fade-in">
             <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-xl font-display font-bold text-slate-300 hover:text-cyan-400">SIMULATION</a>
             <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-xl font-display font-bold text-slate-300 hover:text-cyan-400">PROTOCOLS</a>
             <a href="#mission" onClick={() => setIsMenuOpen(false)} className="text-xl font-display font-bold text-slate-300 hover:text-cyan-400">MISSION</a>
             <button 
                onClick={() => { setIsMenuOpen(false); onStart(); }}
                className="w-full max-w-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold px-6 py-4 rounded transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
                LAUNCH SIMULATION
            </button>
            <div className="flex gap-6 mt-8">
                <a href="https://x.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400" aria-label="Twitter"><Twitter className="w-6 h-6"/></a>
                <a href="https://github.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400" aria-label="GitHub"><Github className="w-6 h-6"/></a>
                <a href="https://linkedin.com/in/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400" aria-label="LinkedIn"><Linkedin className="w-6 h-6"/></a>
            </div>
        </div>
      )}

      {/* Hero Section */}
      <header id="about" className="relative z-10 min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md mb-8 animate-bounce-slow">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-cyan-300 text-xs font-mono tracking-widest">SYSTEM V.2.0.4 ONLINE</span>
            </div>

            <h1 className="font-display text-4xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight">
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-xl">BUILD THE</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-cyan-400 animate-pulse-slow drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">
                    INVISIBLE WEB
                </span>
            </h1>

            <p className="text-base md:text-xl text-slate-400 mb-10 mx-auto leading-relaxed max-w-2xl font-light">
                Optimize the future. Strategically deploy 5G infrastructure in a procedurally generated isometric metropolis. <span className="text-cyan-400 font-semibold">Maximum coverage is the only metric that matters.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a 
                    href="game.html"
                    onClick={(e) => { e.preventDefault(); onStart(); }}
                    className="group relative w-full sm:w-auto overflow-hidden rounded-lg bg-white px-8 py-4 text-slate-900 font-bold transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                    <span className="relative flex items-center justify-center gap-3">
                        <Play className="w-5 h-5 fill-slate-900" /> PLAY NOW
                    </span>
                </a>
                <a href="#how-it-works" className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase">
                    Learn Protocol <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 md:py-32 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 scroll-mt-20">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16 md:mb-20">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">OPTIMIZATION PROTOCOLS</h2>
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: Target, title: "1. ANALYZE", desc: "Scan the urban grid. Identify population density centers and potential signal obstructions like skyscrapers." },
                    { icon: Cpu, title: "2. DEPLOY", desc: "Strategically place high-frequency 5G towers. Manage your limited budget to maximize efficiency." },
                    { icon: Zap, title: "3. ACTIVATE", desc: "Power on the network. Watch real-time raycasting visualization as signals bounce and cover the streets." }
                ].map((card, idx) => (
                    <div key={idx} className="group relative p-0.5 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 hover:from-cyan-500 hover:to-cyan-900 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(6,182,212,0.2)]">
                        <div className="relative h-full bg-slate-900 p-8 rounded-[15px] flex flex-col items-center text-center overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors"></div>
                            
                            <div className="relative w-16 h-16 bg-slate-800 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 flex items-center justify-center mb-6 border border-slate-700 group-hover:border-cyan-500/50 shadow-lg">
                                <card.icon className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h3 className="font-display text-xl font-bold mb-4 text-white group-hover:text-cyan-300 transition-colors">{card.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-300">
                                {card.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* The Story */}
      <section id="mission" className="relative z-10 py-24 bg-slate-900 border-t border-slate-800 scroll-mt-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
                <div className="inline-block px-3 py-1 mb-6 border border-cyan-500 text-cyan-500 font-mono text-xs tracking-widest uppercase bg-cyan-950/30">
                    Classified Briefing
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 leading-tight">
                    THE YEAR IS 2050.<br/>
                    <span className="text-slate-500">CONNECTIVITY IS OXYGEN.</span>
                </h2>
                <p className="text-slate-400 mb-6 leading-relaxed">
                    You have been appointed as the Chief Network Architect for <span className="text-white font-bold">Spectrum Corp</span>. The city is growing faster than our infrastructure can handle. Skyscrapers block old signals. The streets are going dark.
                </p>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Your mission is critical: Retrofit the aging metropolis with state-of-the-art 5G nodes. Ensure 100% uptime. Failure results in a total system blackout.
                </p>
            </div>
            <div className="md:w-1/2 w-full relative group">
                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-6 rounded-lg font-mono text-xs text-cyan-400 leading-loose shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                    <p className="typewriter">> INITIALIZING_SEQUENCE...</p>
                    <p className="typewriter delay-100">> LOADING_ASSETS: [||||||||||] 100%</p>
                    <p className="typewriter delay-200">> ESTABLISHING_UPLINK...</p>
                    <p className="text-white typewriter delay-300">> WELCOME_USER_01</p>
                    <p className="animate-pulse">> WAITING_FOR_INPUT_</p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 bg-slate-950 text-center border-t border-slate-900">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-cyan-500/10 rounded flex items-center justify-center border border-cyan-500/20">
                         <Cpu className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-left">
                        <span className="block font-display font-bold text-white tracking-widest text-sm">SPECTRUM CITY</span>
                        <span className="block text-[10px] text-slate-500">POWERED BY VICKYIITP</span>
                    </div>
                </div>

                <div className="flex gap-6">
                    <a href="https://youtube.com/@vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 hover:scale-110 transition-all" aria-label="YouTube"><Youtube className="w-5 h-5" /></a>
                    <a href="https://linkedin.com/in/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 hover:scale-110 transition-all" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
                    <a href="https://x.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:scale-110 transition-all" aria-label="X (Twitter)"><Twitter className="w-5 h-5" /></a>
                    <a href="https://github.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:scale-110 transition-all" aria-label="GitHub"><Github className="w-5 h-5" /></a>
                    <a href="https://instagram.com/vickyiitp" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 hover:scale-110 transition-all" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 border-t border-slate-900 pt-8 text-sm">
                <div className="text-left">
                    <h4 className="font-bold text-white mb-4">CONTACT</h4>
                    <a href="mailto:themvaplatform@gmail.com" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-2 transition-colors">
                        <Mail className="w-4 h-4" /> themvaplatform@gmail.com
                    </a>
                    <a href="https://vickyiitp.tech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
                        <ExternalLink className="w-4 h-4" /> vickyiitp.tech
                    </a>
                </div>
                <div className="text-left">
                     <h4 className="font-bold text-white mb-4">LEGAL</h4>
                     <div className="flex flex-col gap-2 items-start">
                        <button onClick={() => setActiveModal('terms')} className="text-slate-400 hover:text-cyan-400 flex items-center gap-2 transition-colors">
                             <FileText className="w-3 h-3" /> Terms of Service
                        </button>
                        <button onClick={() => setActiveModal('privacy')} className="text-slate-400 hover:text-cyan-400 flex items-center gap-2 transition-colors">
                             <Lock className="w-3 h-3" /> Privacy Policy
                        </button>
                     </div>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-slate-600 mb-2">&copy; 2025 Vickyiitp. All Rights Reserved.</p>
                </div>
            </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg transition-all duration-300 z-50 ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display text-xl font-bold text-white">
                        {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                    </h3>
                    <button onClick={closeModal} className="text-slate-400 hover:text-white"><X /></button>
                </div>
                <div className="prose prose-invert prose-sm text-slate-400">
                    {activeModal === 'terms' ? (
                        <>
                            <p>Welcome to Spectrum City. By accessing this simulation, you agree to these terms.</p>
                            <ul className="list-disc pl-4 space-y-2">
                                <li><strong>Usage:</strong> This game is for educational and entertainment purposes.</li>
                                <li><strong>Intellectual Property:</strong> All assets are owned by Vicky Kumar.</li>
                                <li><strong>Disclaimer:</strong> No actual 5G towers are deployed.</li>
                            </ul>
                        </>
                    ) : (
                        <>
                            <p>Your privacy is important to us.</p>
                            <ul className="list-disc pl-4 space-y-2">
                                <li><strong>Data Collection:</strong> We do not collect personal data.</li>
                                <li><strong>Cookies:</strong> Local storage is used to save game preferences.</li>
                                <li><strong>Third Party:</strong> We use Google Gemini API for procedural generation.</li>
                            </ul>
                        </>
                    )}
                </div>
                <button onClick={closeModal} className="mt-6 w-full bg-slate-800 hover:bg-slate-700 py-2 rounded text-white font-bold transition-colors">
                    Close
                </button>
            </div>
        </div>
      )}
    </div>
  );
};