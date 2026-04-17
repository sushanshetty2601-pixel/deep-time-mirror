import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  MeshDistortMaterial, 
  PerspectiveCamera, 
  Text, 
  Sphere,
  OrbitControls,
  Environment,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  MapPin, 
  Clock, 
  History, 
  Zap, 
  Search, 
  ArrowRight,
  Globe,
  Trees,
  Wind,
  ThermometerSun,
  Activity,
  AlertCircle
} from 'lucide-react';
import { cn } from './lib/utils';
import { fetchMirrorData, TimePeriod, EnvironmentalInsight, generateVisual } from './services/geminiService';
import ReactMarkdown from 'react-markdown';

// 3D Mirror Component
function TemporalSphere({ period }: { period: TimePeriod }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  const getColor = () => {
    switch(period) {
      case 'PAST': return '#ea580c';
      case 'PRESENT': return '#0ea5e9';
      case 'FUTURE': return '#10b981';
      default: return '#166534';
    }
  };

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={mesh} args={[1, 64, 64]}>
        <MeshDistortMaterial 
          color={getColor()}
          speed={3} 
          distort={0.4} 
          radius={1}
          metalness={0.8}
          roughness={0.2}
          emissive={getColor()}
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
}

export default function App() {
  const [location, setLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [data, setData] = useState<EnvironmentalInsight[]>([]);
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('PRESENT');
  const [visualData, setVisualData] = useState<Record<TimePeriod, string>>({ PAST: '', PRESENT: '', FUTURE: '' });
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGeneratingFirst, setIsGeneratingFirst] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeData = data.find(d => d.period === activePeriod);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!location) return;

    setLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      const result = await fetchMirrorData(location);
      if (result.length > 0) {
        setData(result);
        setLoading(false);
        setIsGeneratingFirst(true);

        // Generate the ACTIVE period visual first for immediate feedback
        const activeInsight = result.find(r => r.period === activePeriod) || result[0];
        const firstUrl = await generateVisual(activeInsight.visualPrompt);
        setVisualData(prev => ({ ...prev, [activeInsight.period]: firstUrl }));
        
        setIsGeneratingFirst(false);
        setIsVisualizing(true);
        setTimeout(() => setIsVisualizing(false), 6000);

        // Generate the rest in background
        result.forEach(async (insight) => {
          if (insight.period !== activeInsight.period) {
            const url = await generateVisual(insight.visualPrompt);
            setVisualData(prev => ({ ...prev, [insight.period]: url }));
          }
        });
      } else {
        setError('The mirror could not focus on that location.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'A temporal anomaly occurred. Please try again.';
      setError(`Lens Error: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getThemeColorClass = (period: TimePeriod) => {
    switch (period) {
      case 'PAST': return 'text-orange-400';
      case 'PRESENT': return 'text-sky-400';
      case 'FUTURE': return 'text-emerald-400';
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-earth-950 text-earth-50 font-sans antialiased overflow-hidden">
      {/* 3D Background Layer */}
      <div className="fixed inset-0 z-0">
        {!hasSearched ? (
           <div 
             className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop')`, opacity: 0.4 }}
           />
        ) : (
          <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <Suspense fallback={null}>
            <TemporalSphere period={activePeriod} />
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
        )}
      </div>

      {/* Cinematic Visual Intro Overlay */}
      <AnimatePresence>
        {isVisualizing && visualData[activePeriod] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${visualData[activePeriod]})` }}
          >
            {/* Visual Tint Overlay - subtle to keep image clear */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col items-center justify-end p-12 lg:p-24 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="space-y-8 max-w-4xl"
              >
                <div className="flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.6em] text-forest-400 font-bold mb-4">
                  <span className="w-12 h-px bg-forest-400/30" />
                  Temporal Synthesis Complete
                  <span className="w-12 h-px bg-forest-400/30" />
                </div>
                <h2 className="text-6xl md:text-9xl font-serif italic text-white leading-none drop-shadow-2xl">
                  {activePeriod === 'PAST' ? 'Witness the Ancient' : activePeriod === 'PRESENT' ? 'State of the World' : 'Dawn of Restoration'}
                </h2>
                <div className="h-0.5 w-full max-w-md bg-white/10 mx-auto rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-forest-400 shadow-[0_0_10px_#4ade80]"
                   />
                </div>
              </motion.div>
            </div>
            
            {/* Artifacts Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Atmosphere */}
      <div className={cn(
        "fixed inset-0 z-[1] transition-opacity duration-1000 pointer-events-none",
        hasSearched ? "bg-black/40 backdrop-blur-sm" : "bg-black/20"
      )} />

      <header className="relative z-20 p-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <Globe className="w-6 h-6 text-forest-400 animate-pulse" />
          </div>
          <h1 className="text-lg font-bold tracking-tighter uppercase whitespace-nowrap">Deep-Time Mirror</h1>
        </div>
        
        {hasSearched && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-4 glass-panel px-6 py-2 rounded-full"
          >
            <MapPin className="w-3 h-3 text-white/40" />
            <span className="text-[10px] font-mono tracking-widest uppercase">{location}</span>
            <button onClick={() => setHasSearched(false)} className="text-[9px] hover:text-forest-400 underline uppercase tracking-tighter">Reset</button>
          </motion.div>
        )}
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-2xl text-center space-y-12"
            >
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.4em] text-forest-400"
                >
                  Earth Day Challenge // 2026
                </motion.div>
                <h2 className="text-5xl md:text-8xl font-serif leading-tight">
                  Behold your land's <span className="italic">soul</span>.
                </h2>
                <p className="text-lg text-white/50 max-w-lg mx-auto font-light leading-relaxed">
                  Enter a location to pierce the veil of time and witness the ecological evolution of your home.
                </p>
              </div>

              <form onSubmit={handleSearch} className="relative group max-w-md mx-auto">
                <div className="absolute inset-0 bg-forest-400/20 blur-2xl group-hover:bg-forest-400/30 transition-all duration-500 rounded-full" />
                <div className="relative flex items-center gap-3 glass-panel p-2 pl-6 rounded-full border-white/20 hover:border-white/40 transition-all shadow-2xl">
                  <Search className="w-5 h-5 text-white/30" />
                  <input 
                    autoFocus
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Search city, forest, or park..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-base placeholder:text-white/20"
                  />
                  <button type="submit" className="bg-white text-black p-3 rounded-full hover:scale-110 active:scale-95 transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (loading || isGeneratingFirst) ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className="text-4xl font-serif italic animate-pulse">
                {loading ? 'Consulting the Archives...' : 'Rendering Temporal Vision...'}
              </div>
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-2 h-2 bg-forest-400 rounded-full shadow-[0_0_10px_#4ade80]"
                  />
                ))}
              </div>
            </motion.div>
          ) : error ? (
            <div className="text-center space-y-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-xl font-medium">{error}</p>
              <button onClick={() => setHasSearched(false)} className="px-8 py-3 glass-panel rounded-full uppercase text-xs tracking-widest hover:bg-white/10 transition-colors">Return to Surface</button>
            </div>
          ) : activeData ? (
            <motion.div 
              key="data"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-full max-w-6xl grid lg:grid-cols-[1fr_2fr_1fr] gap-8 py-12"
            >
              {/* Left Column: Metrics & Recent */}
              <aside className="space-y-6 flex flex-col order-2 lg:order-1">
                <div className="glass-panel p-6 rounded-3xl space-y-6">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-50 flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Recent Pulse
                  </h4>
                  <div className="space-y-6">
                    {activeData.period === 'PRESENT' && activeData.recentEvents?.map((event, i) => (
                      <div key={i} className="relative pl-6 border-l border-white/10 group">
                        <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-sky-500 group-hover:shadow-[0_0_10px_#0ea5e9] transition-all" />
                        <div className="text-[9px] uppercase font-mono opacity-50 mb-1">{event.timeframe}</div>
                        <p className="text-xs leading-relaxed text-white/80">{event.description}</p>
                      </div>
                    ))}
                    {activeData.period !== 'PRESENT' && (
                      <div className="text-xs italic opacity-40">Recent data only available for active Anthropocene mirror.</div>
                    )}
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-50">Local Metrics</h4>
                  {activeData.climateStats.map((stat, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-none">
                      <span className="text-[10px] text-white/60 uppercase">{stat.label}</span>
                      <span className="text-xs font-mono font-bold text-forest-400">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </aside>

              {/* Center Column: Narrative */}
              <article className="glass-panel p-4 lg:p-6 rounded-[3rem] space-y-8 overflow-y-auto custom-scrollbar order-1 lg:order-2 bg-black/60 backdrop-blur-3xl shadow-2xl border-white/10">
                {/* Hero Visual Mirror */}
                {visualData[activePeriod] && (
                  <div className="w-full aspect-video rounded-[2rem] overflow-hidden border border-white/10 group relative">
                    <img 
                      src={visualData[activePeriod]} 
                      alt="Temporal View" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s] ease-linear"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-8 flex items-center gap-3">
                      <div className="w-2 h-2 bg-forest-400 rounded-full animate-ping" />
                      <span className="text-[10px] uppercase font-mono tracking-widest text-white/80">Live Temporal Feed // {activePeriod}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-6 px-4">
                  <div className="flex justify-center flex-wrap gap-2">
                    {(['PAST', 'PRESENT', 'FUTURE'] as TimePeriod[]).map(p => (
                      <button 
                        key={p}
                        onClick={() => {
                          setActivePeriod(p);
                          setIsVisualizing(true);
                          setTimeout(() => setIsVisualizing(false), 5000);
                        }}
                        className={cn(
                          "px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] transition-all",
                          activePeriod === p ? "bg-white text-black scale-105" : "bg-white/5 hover:bg-white/10 text-white/40"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <h2 className="text-5xl md:text-7xl font-serif text-center leading-tight">
                    {activeData.title}
                  </h2>
                </div>

                <div className="prose prose-invert max-w-none text-lg text-white/70 font-light leading-relaxed">
                  <ReactMarkdown>{activeData.narrative}</ReactMarkdown>
                </div>

                {activeData.restorationGoal && (
                  <div className="p-8 bg-emerald-600/10 border border-emerald-500/20 rounded-3xl">
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2">Restoration Directive</p>
                    <p className="text-2xl font-serif italic text-white/90">"{activeData.restorationGoal}"</p>
                  </div>
                )}
              </article>

              {/* Right Column: Species */}
              <aside className="space-y-6 order-3">
                <div className="glass-panel p-8 rounded-3xl space-y-6 h-full">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest opacity-50 flex items-center gap-2">
                    <History className="w-3 h-3" />
                    Ecological Anchor
                  </h4>
                  <div className="space-y-8">
                    {activeData.keySpecies.map((species, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="group flex flex-col gap-2"
                      >
                        <div className="text-xl font-serif italic group-hover:text-forest-400 transition-colors">{species}</div>
                        <div className="w-12 h-1 bg-white/10 group-hover:w-full group-hover:bg-forest-400 transition-all duration-500 rounded-full" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </aside>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <footer className="relative z-20 p-6 flex flex-col md:flex-row justify-between items-center opacity-30 text-[9px] font-mono tracking-widest border-t border-white/5 bg-black/40">
        <div>Proprietary Temporal AI Lens v4.8L // 3D Render Engine Active</div>
        <div className="flex gap-6">
          <span>{new Date().toLocaleDateString()}</span>
          <span>PLANETARY PULSE: NOMINAL</span>
        </div>
      </footer>
    </div>
  );
}
