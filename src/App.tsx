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
  AlertCircle,
  ArrowLeft,
  PlayCircle,
  Telescope,
  Cloud,
  TreePine,
  Hourglass,
  Heart,
  Target,
  Minus,
  Navigation
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from './lib/utils';
import { 
  fetchMirrorData, 
  TimePeriod, 
  EnvironmentalInsight, 
  generateVisual,
  fetchPerformanceReview,
  PerformanceReview
} from './services/geminiService';
import ReactMarkdown from 'react-markdown';

type AppView = 'SELECT' | 'MIRROR' | 'REVIEW';

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

// Gaia Observatory Component
function GaiaObservatory({ data, period }: { data: EnvironmentalInsight, period: TimePeriod }) {
  const getHealthScore = (p: TimePeriod) => {
    switch(p) {
      case 'PAST': return 98;
      case 'PRESENT': return 42;
      case 'FUTURE': return 85;
      default: return 50;
    }
  };

  const score = getHealthScore(period);
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel p-8 rounded-[2rem] border-white/5 bg-black/40 h-full flex flex-col gap-8"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[10px] font-mono tracking-[0.3em] text-emerald-400 uppercase mb-2">Gaia Observatory</h3>
          <h2 className="text-3xl font-serif italic text-white/90">Temporal Health Profile</h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-mono text-white/30 tracking-widest">STABILITY INDEX</span>
          <span className={cn(
            "text-2xl font-mono",
            score > 80 ? "text-emerald-400" : score > 50 ? "text-yellow-400" : "text-red-400"
          )}>{score}%</span>
        </div>
      </div>

      {/* Health Meter */}
      <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn(
            "h-full shadow-[0_0_15px_rgba(0,0,0,0.5)]",
            score > 80 ? "bg-emerald-500" : score > 50 ? "bg-yellow-500" : "bg-red-500"
          )}
        />
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        {data.climateStats.map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="text-[9px] font-mono text-white/40 uppercase mb-1 tracking-tighter">{stat.label}</div>
            <div className="text-lg font-mono text-white/90 leading-none">{stat.value}</div>
          </div>
        ))}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[9px] font-mono text-white/40 uppercase mb-1 tracking-tighter">Biosphere Status</div>
          <div className="text-lg font-mono text-white/90 leading-none">
            {period === 'PAST' ? 'PRISTINE' : period === 'PRESENT' ? 'VULNERABLE' : 'RECOVERING'}
          </div>
        </div>
      </div>

      {/* Restoration Protocols */}
      <div className="flex-1 space-y-4">
        <h4 className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase border-b border-white/10 pb-2">Restoration Protocols</h4>
        <div className="space-y-3">
          {[
            { icon: Trees, label: "Reforestation Protocol", active: period === 'FUTURE' },
            { icon: Zap, label: "Clean Energy Transition", active: period === 'FUTURE' || period === 'PRESENT' },
            { icon: Wind, label: "Emission Capture", active: period === 'FUTURE' }
          ].map((protocol, i) => (
            <div key={i} className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500",
              protocol.active ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/5 text-white/30"
            )}>
              <protocol.icon className="w-5 h-5" />
              <span className="text-xs font-medium tracking-wide">{protocol.label}</span>
              {protocol.active && <Activity className="w-3 h-3 ml-auto animate-pulse" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-forest-900/20 border border-forest-500/10 rounded-2xl">
        <p className="text-[10px] text-white/40 italic leading-relaxed">
          "The observatory calculates stability based on the presence of Keystone species and historical carbon baselines."
        </p>
      </div>
    </motion.div>
  );
}

function PerformanceReviewView({ review, onReset }: { review: PerformanceReview, onReset: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-6xl space-y-8 py-12"
    >
      {/* Earth's Response Layer */}
      <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-black/60 flex flex-col md:flex-row gap-12 items-center">
        <div className="relative w-48 h-48 lg:w-64 lg:h-64 flex-shrink-0">
          <div className="absolute inset-0 bg-forest-500/20 blur-3xl rounded-full" />
          <motion.img 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2074&auto=format&fit=crop" 
            alt="Earth"
            className="w-full h-full object-cover rounded-full border-2 border-white/10 relative z-10"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex-1 space-y-6">
          <div className="text-[10px] uppercase tracking-[0.4em] text-forest-400 font-bold mb-2 flex items-center gap-2">
            <span className="w-6 h-px bg-forest-400" />
            Earth's Response
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-white drop-shadow-lg leading-tight">
            I see your habits... <br />
            and I'm concerned.
          </h2>
          <p className="text-white/40 font-light leading-relaxed max-w-2xl italic">
            "{review.overallAssessment}"
          </p>
          
          <div className="flex flex-wrap gap-3">
             {review.statusTags.map((tag, i) => (
                <div key={i} className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest flex items-center gap-2",
                  tag.type === 'warning' ? "bg-orange-500/10 border border-orange-500/30 text-orange-400" :
                  tag.type === 'success' ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" :
                  "bg-white/5 border border-white/10 text-white/50"
                 )}>
                  {tag.type === 'warning' ? <AlertCircle className="w-3 h-3" /> : tag.type === 'success' ? <Activity className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                  {tag.label}
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Planet Score */}
        <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-black/40 flex items-center gap-10">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
              <motion.circle 
                cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={440}
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * review.planetaryScore) / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-forest-400"
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-5xl font-serif">{review.planetaryScore}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">/100</div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">Planet Score</h4>
            <p className="text-sm text-white/60 leading-relaxed font-light">
              You're doing better than {review.percentile}% of humans. <br />
              <span className="text-forest-400 italic">Keep going. The future responds to you.</span>
            </p>
            <button className="text-[10px] font-bold tracking-widest uppercase text-white/40 flex items-center gap-2 hover:text-white transition-colors">
              View Full Breakdown <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Timeline Impact */}
        <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-black/40 space-y-8">
           <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">Your Timeline Impact</h4>
           <div className="flex justify-between items-center relative">
             <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2" />
             
             <div className="relative z-10 text-center space-y-4">
               <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                 <Trees className="w-5 h-5 text-white/30" />
               </div>
               <div className="space-y-1">
                 <div className="text-[9px] uppercase font-bold tracking-widest">Past</div>
                 <div className="text-[10px] text-white/30 max-w-[80px] mx-auto italic leading-tight">Minimal human impact</div>
               </div>
             </div>

             <div className="relative z-10 text-center space-y-4">
               <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                 <Navigation className="w-5 h-5 text-white/30" />
               </div>
               <div className="space-y-1">
                 <div className="text-[9px] uppercase font-bold tracking-widest">Present</div>
                 <div className="text-[10px] text-white/30 max-w-[80px] mx-auto italic leading-tight">Moderate ecological stress</div>
               </div>
             </div>

             <div className="relative z-10 text-center space-y-4">
               <div className="w-12 h-12 rounded-full bg-forest-400/20 border border-forest-400/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                 <Globe className="w-5 h-5 text-forest-400" />
               </div>
               <div className="space-y-1">
                 <div className="text-[9px] uppercase font-bold tracking-widest text-forest-400">Future (Based on You)</div>
                 <div className="text-[10px] text-forest-400/50 max-w-[80px] mx-auto italic leading-tight">Recoverable future if you act consistently</div>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Improvement Tips */}
        <div className="space-y-6">
          <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold px-6">What you can improve in 7 days</h4>
          <div className="space-y-4">
            {review.pip.map((tip, i) => (
              <div key={i} className="glass-panel p-6 rounded-3xl border-white/5 bg-black/30 flex items-center gap-6 group hover:bg-white/5 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:bg-forest-400/10 group-hover:text-forest-400 group-hover:border-forest-400/20 transition-all">
                  {i === 0 ? <Zap className="w-5 h-5" /> : i === 1 ? <Navigation className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                </div>
                <div className="flex-1 space-y-1">
                  <h5 className="text-sm font-bold tracking-tight">{tip.title}</h5>
                  <p className="text-xs text-white/40 italic">{tip.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-forest-400 tracking-wider whitespace-nowrap mb-1">
                    {tip.savingMetric}
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/20 ml-auto group-hover:translate-x-1 group-hover:text-forest-400 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart Area */}
        <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-black/40 flex flex-col items-center">
           <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold self-start mb-10">Your Top Impact Areas</h4>
           <div className="w-full h-64">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={review.radarData}>
                 <PolarGrid stroke="#ffffff10" />
                 <PolarAngleAxis dataKey="subject" stroke="#ffffff40" fontSize={10} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                 <Radar
                   name="Gaia"
                   dataKey="value"
                   stroke="#4ade80"
                   fill="#4ade80"
                   fillOpacity={0.2}
                 />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* CTA Layer */}
      <div className="glass-panel relative rounded-[3rem] overflow-hidden group">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s]" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-earth-950 via-earth-950/60 to-transparent" />
        <div className="relative z-10 p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-serif italic text-white leading-tight">
              The future isn't fixed. <br />
              <span className="text-forest-400">It responds to what you do next.</span>
            </h3>
            <p className="text-white/40 text-sm font-light italic max-w-md leading-relaxed">
              Every choice you make becomes a thread in Earth's story. Be the reason the next chapter is better.
            </p>
          </div>
          <button 
            onClick={onReset}
            className="group px-10 py-5 bg-forest-500 hover:bg-forest-400 text-black rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center gap-4 shadow-2xl transition-all"
          >
            Improve My Score <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="grid md:grid-cols-3 gap-8 py-10 border-t border-white/5">
         {[
           { icon: Activity, label: "Run Another Audit", desc: "Audit a different set of habits" },
           { icon: Clock, label: "See Full Timeline", desc: "Explore your impact across time" },
           { icon: Heart, label: "Share Your Impact", desc: "Inspire others to act" }
         ].map((item, i) => (
           <div key={i} className="flex items-center gap-6 group cursor-pointer hover:bg-white/5 p-6 rounded-3xl transition-all">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-forest-400 transition-colors">
                 <item.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.label}</div>
                <div className="text-[10px] text-white/30 italic">{item.desc}</div>
              </div>
           </div>
         ))}
      </div>
    </motion.div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('SELECT');
  const [location, setLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [data, setData] = useState<EnvironmentalInsight[]>([]);
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('PRESENT');
  const [visualData, setVisualData] = useState<Record<TimePeriod, string>>({ PAST: '', PRESENT: '', FUTURE: '' });
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState<PerformanceReview | null>(null);
  const [habits, setHabits] = useState('');
  const [isGeneratingFirst, setIsGeneratingFirst] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringReview, setIsHoveringReview] = useState(false);

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
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        setError('The Mirror is cooling down (Free Quota Limit). Please wait 60 seconds and try again.');
      } else {
        setError(`Lens Error: ${errorMessage || 'A temporal anomaly occurred.'}`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habits) return;

    setReviewLoading(true);
    setError(null);
    try {
      const review = await fetchPerformanceReview(habits);
      setReviewData(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The Earth could not be reached for your review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const resetAll = () => {
    setActiveView('SELECT');
    setHasSearched(false);
    setData([]);
    setReviewData(null);
    setHabits('');
    setError(null);
  };

  const getCursorClass = () => {
    if (isHoveringReview) return 'cursor-radiant';
    if (activeView === 'MIRROR') return 'cursor-mirror-special';
    return 'cursor-earth-base';
  };

  return (
    <div className={cn(
      "min-h-screen relative flex flex-col bg-earth-950 text-earth-50 font-sans antialiased overflow-hidden transition-all duration-300",
      getCursorClass()
    )}>
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop')`, 
            opacity: activeView === 'SELECT' ? 0.6 : 0.3 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/40 to-transparent" />
        <div className="absolute inset-0 mist opacity-40 mix-blend-screen" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
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

      <header className="relative z-30 flex items-center justify-between p-8 px-12">
        <div className="flex items-center gap-4 cursor-pointer" onClick={resetAll}>
          <div className="w-10 h-10 bg-forest-400/20 rounded-full flex items-center justify-center border border-forest-400/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
            <Globe className="w-6 h-6 text-forest-400" />
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-glow">Deep-Time Mirror</h1>
        </div>

        <nav className="hidden lg:flex items-center gap-12 text-[11px] font-bold tracking-[0.3em] uppercase text-white/50">
          <button onClick={resetAll} className="hover:text-forest-400 transition-colors">Home</button>
          <button onClick={() => setActiveView('MIRROR')} className="hover:text-forest-400 transition-colors">Observatory</button>
          <button onClick={() => setActiveView('REVIEW')} className="hover:text-forest-400 transition-colors">Earth's Review</button>
          <button className="hover:text-forest-400 transition-colors opacity-50 cursor-not-allowed">Timeline</button>
          <button className="hover:text-forest-400 transition-colors opacity-50 cursor-not-allowed">About</button>
        </nav>

        <div className="flex items-center gap-6">
          {activeView !== 'SELECT' ? (
            <button 
              onClick={resetAll}
              className="px-6 py-2 border border-white/5 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all"
            >
              Back to Portal
            </button>
          ) : (
            <button 
              onClick={() => setActiveView('REVIEW')}
              className="px-6 py-2 border border-forest-400/30 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-forest-400/10 transition-all shadow-[0_0_15px_rgba(74,222,128,0.1)]"
            >
              Start the Audit
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {activeView === 'SELECT' ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-20 py-24 pb-40"
            >
              {/* Hero Section */}
              <div className="max-w-4xl space-y-10 px-4 md:px-12">
                <div className="flex items-center gap-4 text-forest-400 font-mono text-[10px] tracking-[0.5em] uppercase">
                  <div className="w-8 h-px bg-forest-400/30" />
                  <span>AI • Earth Auditor</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-serif tracking-tight leading-[1.05] drop-shadow-2xl">
                  See Earth. <br />
                  Understand Time. <br />
                  <span className="text-forest-400 italic">Shape the Future.</span>
                </h2>
                <div className="space-y-6 max-w-xl">
                  <p className="text-xl text-white/40 font-light leading-relaxed">
                    Deep-Time Mirror lets you explore any place on Earth across time — from ancient past to possible futures. Audit its health. Restore its story.
                  </p>
                  <p className="text-forest-400/60 font-serif italic text-lg tracking-wide border-l border-forest-400/30 pl-4">
                    "Your land remembers everything."
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-12 pt-4">
                  <div className="relative group cursor-pointer" onClick={() => setActiveView('MIRROR')}>
                    <div className="absolute inset-0 bg-forest-400/20 blur-3xl animate-pulse rounded-full" />
                    <motion.div 
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: 360
                      }}
                      transition={{ 
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                      }}
                      className="w-20 h-20 rounded-full border-2 border-white/10 overflow-hidden relative z-10 shadow-[0_0_40px_rgba(74,222,128,0.2)]"
                    >
                      <img src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2074&auto=format&fit=crop" className="w-full h-full object-cover scale-150" />
                    </motion.div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-8">
                      <button 
                        onClick={() => setActiveView('REVIEW')}
                        className="group px-10 py-5 bg-forest-500 text-black rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center gap-4 hover:bg-forest-400 transition-all shadow-[0_0_50px_rgba(34,197,94,0.4)]"
                      >
                        Start the Audit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* Live Credibility Strip */}
                    <div className="flex gap-8 text-[9px] font-bold tracking-[0.3em] uppercase text-white/20 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-forest-400">12,547</span> locations explored
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-forest-400">3.2M</span> trees restored
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-forest-400">1.7M</span> kg CO₂ impact
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interaction Hint */}
                <div className="pt-8">
                  <motion.div 
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex flex-col items-center w-fit text-[9px] font-bold tracking-[0.4em] uppercase text-white/20"
                  >
                    <span>Scroll to explore</span>
                    <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent mt-2" />
                  </motion.div>
                </div>

                {/* Explorer Avatars */}
                <div className="pt-10 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-earth-950 overflow-hidden bg-earth-900">
                        <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="Explorer" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] font-bold tracking-widest uppercase text-white/30">
                    <span className="text-white">12,547 explorers</span> auditing Earth together
                  </div>
                </div>
              </div>

              {/* Portal Grid */}
              <div className="grid lg:grid-cols-2 gap-12 px-4 md:px-12">
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="group relative h-[520px] rounded-[3rem] overflow-hidden glass-card cursor-default"
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-[4s]" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/20 to-transparent" />
                  <div className="absolute inset-0 p-12 flex flex-col justify-end gap-6">
                    <Telescope className="w-10 h-10 text-forest-400 opacity-60" />
                    <h3 className="text-5xl font-serif italic text-white leading-tight">The Deep-Time <br />Mirror</h3>
                    <p className="text-sm text-white/40 max-w-xs font-light leading-relaxed font-mono">Pierce the veil of time to witness your location's ancient past and restored future.</p>
                    <button 
                      onClick={() => setActiveView('MIRROR')}
                      className="group/btn text-[11px] font-bold tracking-widest uppercase text-forest-400 flex items-center gap-3 mt-4"
                    >
                      Enter Observatory <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </motion.div>

                <motion.div 
                  onHoverStart={() => setIsHoveringReview(true)}
                  onHoverEnd={() => setIsHoveringReview(false)}
                  whileHover={{ y: -10 }}
                  className="group relative h-[520px] rounded-[3rem] overflow-hidden glass-card border-forest-400/20 hover:border-forest-400/50 shadow-2xl hover:shadow-forest-500/20 transition-all"
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-[4s]" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/20 to-transparent" />
                  <div className="absolute inset-0 p-12 flex flex-col justify-end gap-6 text-left">
                    <div className="w-12 h-12 rounded-full bg-forest-400/20 flex items-center justify-center border border-forest-400/30">
                      <Activity className="w-6 h-6 text-forest-400" />
                    </div>
                    <h3 className="text-5xl font-serif italic text-white leading-tight">The Earth's <br />Review</h3>
                    <p className="text-sm text-white/40 max-w-sm font-light italic leading-relaxed">"I'm not asking for much. Just... stop lighting me on fire, okay?" — Earth, probably.</p>
                    <button 
                      onClick={() => setActiveView('REVIEW')}
                      className="group/btn text-[11px] font-bold tracking-widest uppercase text-forest-400 flex items-center gap-3 mt-4"
                    >
                      Check Your Planet Score <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </div>
                  {/* Radiant Border Glow */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-forest-400/0 group-hover:border-forest-400/50 rounded-[3rem] transition-all duration-700" />
                </motion.div>
              </div>

              {/* Eco Stats Dashboard */}
              <div className="mx-4 md:mx-12 glass-panel rounded-[2rem] p-12 grid grid-cols-2 lg:grid-cols-4 gap-12 border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-forest-500">
                    <Leaf className="w-5 h-5" />
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Locations Audited</div>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <div className="text-4xl font-serif">24,318</div>
                    <div className="text-[10px] text-forest-400 font-bold tracking-widest">+156</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sky-500">
                    <Cloud className="w-5 h-5" />
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">CO₂ Avoided</div>
                  </div>
                  <div className="text-4xl font-serif">1.78M <span className="text-lg opacity-40 font-mono">Tons</span></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-500">
                    <TreePine className="w-5 h-5" />
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Trees That Matter</div>
                  </div>
                  <div className="text-4xl font-serif">3.2M <span className="text-lg opacity-40 font-mono">+</span></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-teal-400">
                    <Activity className="w-5 h-5" />
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Ecosystems Restored</div>
                  </div>
                  <div className="text-4xl font-serif">742</div>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="mx-4 md:mx-12 glass-panel rounded-[2.5rem] p-12 border-white/5 bg-black/40">
                 <div className="grid lg:grid-cols-3 gap-12">
                   {[
                     { step: "01", icon: MapPin, title: "Choose a Location", desc: "Pick any place on Earth you care about." },
                     { step: "02", icon: Hourglass, title: "See Through Time", desc: "Explore its past, present, and future." },
                     { step: "03", icon: Leaf, title: "Get Your Earth Audit", desc: "Receive your planet score and restoration insights." }
                   ].map((item, idx) => (
                     <div key={idx} className="flex gap-6 items-start">
                       <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-forest-500/10 border border-forest-500/20 flex flex-col items-center justify-center relative">
                         <item.icon className="w-6 h-6 text-forest-400" />
                         <span className="absolute -top-2 -left-2 w-6 h-6 bg-forest-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">{item.step}</span>
                       </div>
                       <div className="space-y-3">
                         <h4 className="text-xl font-serif italic text-white">{item.title}</h4>
                         <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              <footer className="px-12 flex justify-between items-center text-xs font-bold tracking-widest uppercase text-white/20 py-8 border-t border-white/5 mt-10">
                <div className="flex items-center gap-2">
                  Made with <Heart className="w-4 h-4 text-red-500/50" /> for a living planet.
                </div>
                <div>© 2024 Deep-Time Mirror. All Archive Rights Reserved.</div>
                <div className="flex gap-8">
                  <button className="hover:text-white transition-colors">Instagram</button>
                  <a href="https://x.com/shetty_sus41758" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
                  <a href="https://github.com/sushanshetty2601-pixel/deep-time-mirror" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                </div>
              </footer>
            </motion.div>
          ) : activeView === 'MIRROR' ? (
            <motion.div 
              key="mirror-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {!hasSearched ? (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-2xl text-center space-y-12"
            >
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.4em] text-forest-400"
                >
                  Earth Day Challenge // 2026
                </motion.div>
                <h2 className="text-5xl md:text-8xl font-serif leading-[0.95] tracking-tight">
                  Behold your land's <span className="italic">soul</span>.
                </h2>
                <div className="space-y-4 max-w-lg mx-auto">
                  <p className="text-lg text-white/50 font-light leading-relaxed">
                    Enter a location to pierce the veil of time and witness the ecological evolution of your home.
                  </p>
                  <p className="text-forest-400/60 font-serif italic text-base tracking-widest uppercase">
                    "What your land was… and what it could become."
                  </p>
                </div>
              </div>

              {/* Strategic Toggle */}
              <div className="flex justify-center">
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-full">
                  <button 
                    onClick={() => setActiveView('MIRROR')}
                    className="flex items-center gap-2 px-6 py-2 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <Globe className="w-3 h-3 text-forest-400" /> Explore by Location
                  </button>
                  <button 
                    onClick={() => setActiveView('REVIEW')}
                    className="flex items-center gap-2 px-6 py-2 text-white/40 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <Target className="w-3 h-3" /> Audit My Impact
                  </button>
                </div>
              </div>

              <div className="space-y-10">
                {/* Floating Orb Focal Point */}
                <div className="relative group mx-auto w-fit">
                  <div className="absolute inset-0 bg-forest-400/20 blur-3xl animate-pulse rounded-full" />
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: 360
                    }}
                    transition={{ 
                      y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                    }}
                    className="w-24 h-24 rounded-full border-2 border-white/10 overflow-hidden relative z-10 shadow-[0_0_40px_rgba(74,222,128,0.2)]"
                  >
                    <img src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2074&auto=format&fit=crop" className="w-full h-full object-cover scale-150" />
                  </motion.div>
                </div>

                <div className="space-y-6">
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
                        className="flex-1 bg-transparent border-none focus:outline-none text-base placeholder:text-white/20 text-white"
                      />
                      <button type="submit" className="bg-white text-black p-3 rounded-full hover:scale-110 active:scale-95 transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>

                  {/* Live Credibility Strip */}
                  <div className="flex justify-center gap-8 text-[9px] font-bold tracking-[0.3em] uppercase text-white/20 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-forest-400">12,547</span> locations explored
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-forest-400">3.2M</span> trees restored
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-forest-400">1.7M</span> kg CO₂ impact
                    </div>
                  </div>
                </div>

                {/* Interaction Hint */}
                <motion.div 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex flex-col items-center text-[9px] font-bold tracking-[0.4em] uppercase text-white/20"
                >
                  <span>Enter to see your land through time</span>
                  <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent mt-2" />
                </motion.div>
              </div>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-[98vw] grid lg:grid-cols-12 gap-8 py-8"
            >
              {/* LEFT SIDE: Deep-Time Mirror (The Vision) */}
              <div className="lg:col-span-7 space-y-8 h-[75vh] flex flex-col">
                <div className="flex flex-wrap gap-3 mb-4">
                  {(['PAST', 'PRESENT', 'FUTURE'] as TimePeriod[]).map(p => (
                    <button 
                      key={p}
                      onClick={() => {
                        setActivePeriod(p);
                        setIsVisualizing(true);
                        setTimeout(() => setIsVisualizing(false), 5000);
                      }}
                      className={cn(
                        "px-8 py-2 rounded-full text-[10px] uppercase font-bold tracking-[0.3em] transition-all border",
                        activePeriod === p ? "bg-white text-black border-white scale-105" : "bg-white/5 hover:bg-white/10 text-white/40 border-white/5"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar glass-panel p-8 rounded-[3rem] border-white/10 space-y-8 bg-black/40 backdrop-blur-xl">
                  {visualData[activePeriod] && (
                    <div className="w-full aspect-video rounded-[2rem] overflow-hidden border border-white/10 relative group">
                      <img 
                        src={visualData[activePeriod]} 
                        alt="Temporal Feed" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[12s] ease-linear"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-8 flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                        <span className="text-[10px] uppercase font-mono tracking-widest text-white/80">Active Mirror // {activePeriod}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <h2 className="text-5xl md:text-7xl font-serif leading-[0.95] tracking-tight">
                      {activeData.title}
                    </h2>
                    <div className="prose prose-invert max-w-none text-xl text-white/70 font-light leading-relaxed">
                      <ReactMarkdown>{activeData.narrative}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Gaia Observatory (The Data & Soul) */}
              <div className="lg:col-span-5 h-[75vh]">
                <GaiaObservatory data={activeData} period={activePeriod} />
              </div>
            </motion.div>
          ) : null}
          </motion.div>
          ) : (
            <motion.div 
              key="review-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center py-12"
            >
              {!reviewData ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-xl glass-panel p-12 rounded-[3rem] border-white/10 bg-black/40 space-y-8 shadow-2xl"
                >
                  <div className="space-y-4 text-center">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Target className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-4xl font-serif italic text-white tracking-tight">The Earth's Review</h2>
                    <p className="text-white/40 font-light text-lg italic leading-relaxed">"I already have the data, but I'd like to hear it from you."</p>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-10">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-2">
                         <label className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">Confess your habits</label>
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       </div>
                      <textarea 
                        value={habits}
                        onChange={(e) => setHabits(e.target.value)}
                        placeholder="e.g. My computer is never off, I forget to recycle, but I walk to the grocery store..."
                        className="w-full h-48 bg-black/40 border border-white/5 rounded-[2.5rem] p-10 text-base font-light tracking-wide outline-none focus:border-emerald-500/30 transition-all resize-none shadow-2xl glass-panel placeholder:text-white/10"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={reviewLoading || !habits}
                      className="group w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-bold uppercase tracking-[0.3em] text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                    >
                      {reviewLoading ? (
                        <>
                          <Activity className="w-5 h-5 animate-spin" />
                          Auditing Lifecycle...
                        </>
                      ) : (
                        <>
                          Submit for Auditing
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                  {error && <p className="text-red-400 text-xs text-center font-mono">{error}</p>}
                </motion.div>
              ) : (
                <PerformanceReviewView review={reviewData} onReset={resetAll} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {activeView === 'MIRROR' && hasSearched && !loading && (
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-6xl mx-auto mt-32 mb-20 px-6 text-center"
          >
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto mb-12" />
            <h3 className="text-3xl md:text-5xl font-serif italic mb-8 opacity-90">Reflection: The Mirror's Choice</h3>
            <p className="max-w-2xl mx-auto text-lg text-white/60 font-light leading-relaxed">
              The history shown here is not just data—it is a map of our choices. To see the 'Past' is to remember what was lost, 
              and to see the 'Restored Future' is to recognize what is still possible if we act during this critical decade. 
            </p>
          </motion.section>
        )}
      </main>

      <footer className="relative z-20 py-12 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">
          <div className="space-y-1">
            <div className="text-white/40 tracking-[0.4em]">Proprietary Temporal AI Lens v4.8L</div>
            <div>3D Render Engine Active</div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="text-white/40 tracking-[0.4em]">Made by sushanshetty2601</div>
            <div className="flex items-center justify-center gap-2">
              For Earth Day Challenge <Heart className="w-3 h-3 text-emerald-500" />
            </div>
          </div>

          <div className="md:text-right space-y-1">
            <div className="text-white/40 tracking-[0.4em]">Planetary Pulse: Nominal</div>
            <div>Last Updated: 21 Apr 2026</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
