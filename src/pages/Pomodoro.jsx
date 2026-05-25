// src/pages/Pomodoro.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX,
  Music, Flame, Clock, Trophy, Calendar, Maximize2, Minimize2,
  Plus, RefreshCw, AlertCircle, Sparkles, ChevronRight, Check,
  Target, TrendingUp, BarChart2, Star, ShieldAlert, Award
} from "lucide-react";
import confetti from "canvas-confetti";
import { getTasks, updateTask } from "../utils/api";
import { useAuth } from "../context/AuthContext";

/* ── PRESETS & MODES ─────────────────────────────────── */
const PRESETS = [
  { id: "classic", label: "Classic (25/5)", focus: 25, break: 5, longBreak: 15 },
  { id: "extended", label: "Extended (50/10)", focus: 50, break: 10, longBreak: 20 },
  { id: "deep", label: "Deep Work (90/20)", focus: 90, break: 20, longBreak: 30 }
];

const MODES = [
  { id: "focus", label: "Focus Session", mins: 25, color: "#7c3aed", glow: "rgba(124,58,237,0.45)", bg: "linear-gradient(135deg, #4338ca, #7c3aed)" },
  { id: "short", label: "Short Break", mins: 5, color: "#10b981", glow: "rgba(16,185,129,0.45)", bg: "linear-gradient(135deg, #059669, #10b981)" },
  { id: "long", label: "Long Break", mins: 15, color: "#0ea5e9", glow: "rgba(14,165,233,0.45)", bg: "linear-gradient(135deg, #0284c7, #0ea5e9)" }
];

/* ── AUDIO SOUNDTRACKS & ALARMS ──────────────────────── */
const MUSIC_TRACKS = [
  { id: "lofi", name: "Deep Focus Lofi", artist: "Study Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "rain", name: "Gentle Rainstorm", artist: "Nature Sounds", url: "https://www.soundjay.com/nature/sounds/rain-07.mp3" },
  { id: "forest", name: "Forest Ambient", artist: "Nature Sounds", url: "https://www.soundjay.com/nature/sounds/forest-birds-01.mp3" },
  { id: "waves", name: "Ocean Waves", artist: "Nature Sounds", url: "https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3" },
  { id: "white", name: "Deep White Noise", artist: "Ambient Noise", url: "https://www.soundjay.com/nature/sounds/wind-01.mp3" }
];

const ALARM_SOUNDS = [
  { id: "chime", name: "Magic Chime", url: "https://www.soundjay.com/misc/sounds/magic-chime-01.mp3" },
  { id: "bell", name: "Classic Bell", url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" },
  { id: "watch", name: "Digital Watch", url: "https://www.soundjay.com/buttons/sounds/button-10.mp3" },
  { id: "success", name: "Fanfare Success", url: "https://www.soundjay.com/misc/sounds/fail-trumpet-01.mp3" }
];

const MOTIVATIONAL_QUOTES = [
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Roy T. Bennett" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "You don't have to be perfect to be amazing.", author: "Unknown" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" }
];

/* ── TIMER RING COMPONENT ────────────────────────────── */
function TimerRing({ progress, color, glow, isActive, size = 260 }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <svg width={size} height={size} style={{ filter: isActive ? `drop-shadow(0 0 20px ${glow})` : "none", transition: "filter 0.5s ease" }} className="relative z-10">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="url(#timerGradient)" strokeWidth={stroke}
        strokeDasharray={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
      <defs>
        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Pomodoro() {
  const { user } = useAuth();

  /* ── TIMER STATE ───────────────────────────────────── */
  const [activePreset, setActivePreset] = useState("classic");
  const [modeIdx, setModeIdx] = useState(0);
  const [remainingSecs, setRemainingSecs] = useState(MODES[0].mins * 60);
  const [totalDuration, setTotalDuration] = useState(MODES[0].mins * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessions, setSessions] = useState(() => parseInt(localStorage.getItem("pomodoro_count") || "0"));
  const [totalSecs, setTotalSecs] = useState(() => parseInt(localStorage.getItem("pomodoro_total_secs") || "0"));

  /* ── ALARM STATE ───────────────────────────────────── */
  const [selectedAlarm, setSelectedAlarm] = useState("chime");
  const [alarmVolume, setAlarmVolume] = useState(0.7);
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

  /* ── BACKGROUND MUSIC STATE ────────────────────────── */
  const [selectedMusic, setSelectedMusic] = useState("lofi");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const [isMusicLooping, setIsMusicLooping] = useState(true);
  const [musicProgress, setMusicProgress] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);

  /* ── CELEBRATION & QUOTES ─────────────────────────── */
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("pomodoro_history") || "[]"));

  /* ── PRODUCTIVITY TASKS ────────────────────────────── */
  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState("");

  /* ── REFS ──────────────────────────────────────────── */
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioMusicRef = useRef(null);
  const audioAlarmRef = useRef(null);

  const mode = MODES[modeIdx];
  const elapsed = totalDuration - remainingSecs;
  const progressPercent = totalDuration === 0 ? 0 : (elapsed / totalDuration) * 100;

  /* ── INITIAL TASKS LOAD ────────────────────────────── */
  const loadTasks = useCallback(async () => {
    if (user) {
      try {
        const d = await getTasks();
        setTasks(d.filter(t => !t.completed));
      } catch (err) {
        console.error("Failed to load tasks", err);
      }
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* ── QUOTE ROTATOR ─────────────────────────────────── */
  const rotateQuote = () => {
    setCurrentQuoteIdx(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  /* ── MUSIC AUDIO INITIALIZATION ────────────────────── */
  useEffect(() => {
    const currentTrack = MUSIC_TRACKS.find(t => t.id === selectedMusic);
    if (!audioMusicRef.current) {
      audioMusicRef.current = new Audio(currentTrack.url);
    } else {
      audioMusicRef.current.src = currentTrack.url;
    }
    audioMusicRef.current.loop = isMusicLooping;
    audioMusicRef.current.volume = musicVolume;

    // Track state listeners
    const onTimeUpdate = () => {
      if (audioMusicRef.current) {
        setMusicProgress(audioMusicRef.current.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      if (audioMusicRef.current) {
        setMusicDuration(audioMusicRef.current.duration);
      }
    };
    const onEnded = () => {
      if (!isMusicLooping) {
        playNextTrack();
      }
    };

    audioMusicRef.current.addEventListener("timeupdate", onTimeUpdate);
    audioMusicRef.current.addEventListener("loadedmetadata", onLoadedMetadata);
    audioMusicRef.current.addEventListener("ended", onEnded);

    if (isMusicPlaying) {
      audioMusicRef.current.play().catch(e => console.log("Music play blocked by browser autoplay constraints", e));
    }

    return () => {
      if (audioMusicRef.current) {
        audioMusicRef.current.removeEventListener("timeupdate", onTimeUpdate);
        audioMusicRef.current.removeEventListener("loadedmetadata", onLoadedMetadata);
        audioMusicRef.current.removeEventListener("ended", onEnded);
      }
    };
  }, [selectedMusic]);

  /* ── MUSIC CONTROLS ────────────────────────────────── */
  const toggleMusic = () => {
    if (!audioMusicRef.current) return;
    if (isMusicPlaying) {
      audioMusicRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioMusicRef.current.play().catch(e => console.log(e));
      setIsMusicPlaying(true);
    }
  };

  const playNextTrack = () => {
    const currentIndex = MUSIC_TRACKS.findIndex(t => t.id === selectedMusic);
    const nextIndex = (currentIndex + 1) % MUSIC_TRACKS.length;
    setSelectedMusic(MUSIC_TRACKS[nextIndex].id);
    setIsMusicPlaying(true);
  };

  const handleMusicVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
    if (audioMusicRef.current) {
      audioMusicRef.current.volume = val;
    }
  };

  const handleMusicSeek = (e) => {
    const val = parseFloat(e.target.value);
    setMusicProgress(val);
    if (audioMusicRef.current) {
      audioMusicRef.current.currentTime = val;
    }
  };

  const toggleMusicLoop = () => {
    setIsMusicLooping(prev => {
      const newVal = !prev;
      if (audioMusicRef.current) {
        audioMusicRef.current.loop = newVal;
      }
      return newVal;
    });
  };

  /* ── ALARM SYSTEM ──────────────────────────────────── */
  const triggerAlarm = () => {
    if (isAlarmMuted) return;
    setIsAlarmRinging(true);
    const alarmTrack = ALARM_SOUNDS.find(a => a.id === selectedAlarm);
    if (!audioAlarmRef.current) {
      audioAlarmRef.current = new Audio(alarmTrack.url);
    } else {
      audioAlarmRef.current.src = alarmTrack.url;
    }
    audioAlarmRef.current.loop = true;
    audioAlarmRef.current.volume = alarmVolume;
    audioAlarmRef.current.play().catch(e => console.log("Alarm blocked", e));
  };

  const dismissAlarm = () => {
    setIsAlarmRinging(false);
    if (audioAlarmRef.current) {
      audioAlarmRef.current.pause();
      audioAlarmRef.current.currentTime = 0;
    }
  };

  const snoozeAlarm = () => {
    dismissAlarm();
    // Start a short 5 min timer as snooze
    setIsActive(false);
    setRemainingSecs(5 * 60);
    setTotalDuration(5 * 60);
    setIsActive(true);
  };

  const testAlarmSound = () => {
    const alarmTrack = ALARM_SOUNDS.find(a => a.id === selectedAlarm);
    const tempAudio = new Audio(alarmTrack.url);
    tempAudio.volume = alarmVolume;
    tempAudio.play().catch(e => console.log(e));
    setTimeout(() => {
      tempAudio.pause();
    }, 3000);
  };

  const handleAlarmVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setAlarmVolume(val);
    if (audioAlarmRef.current) {
      audioAlarmRef.current.volume = val;
    }
  };

  /* ── TIMER COUNTER EXECUTION (TAB BACKGROUND SAFE) ── */
  const handleComplete = () => {
    setIsActive(false);
    triggerAlarm();
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    setShowCelebration(true);

    if (modeIdx === 0) {
      // Focus session completed successfully
      const newSessionCount = sessions + 1;
      setSessions(newSessionCount);
      localStorage.setItem("pomodoro_count", newSessionCount);

      // Append to local history list
      const historyItem = {
        id: Date.now().toString(),
        mode: mode.label,
        duration: mode.mins,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      };
      const updatedHistory = [historyItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("pomodoro_history", JSON.stringify(updatedHistory));
    }

    // Switch mode automatically
    const nextIdx = modeIdx === 0 ? 1 : 0;
    switchMode(nextIdx);
  };

  useEffect(() => {
    if (!isActive) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      return;
    }

    // Calculate actual targeted time remaining based on timestamps to guarantee background-tab accuracy
    startTimeRef.current = Date.now() - (totalDuration - remainingSecs) * 1000;

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, totalDuration - elapsed);

      // Live update focus hours back to totalSecs
      if (modeIdx === 0) {
        setTotalSecs(prev => {
          const newVal = prev + 1;
          localStorage.setItem("pomodoro_total_secs", newVal);
          return newVal;
        });
      }

      setRemainingSecs(remaining);

      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        handleComplete();
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isActive, totalDuration, modeIdx]);

  /* ── TIMER CONTROLS ────────────────────────────────── */
  const toggleTimer = () => {
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setRemainingSecs(totalDuration);
  };

  const skipTimer = () => {
    setIsActive(false);
    const nextIdx = modeIdx === 0 ? 1 : 0;
    switchMode(nextIdx);
  };

  const switchMode = (idx) => {
    setIsActive(false);
    setModeIdx(idx);
    const selectedPreset = PRESETS.find(p => p.id === activePreset);
    let mins = MODES[idx].mins;

    if (selectedPreset) {
      if (idx === 0) mins = selectedPreset.focus;
      else if (idx === 1) mins = selectedPreset.break;
      else mins = selectedPreset.longBreak;
    }

    setRemainingSecs(mins * 60);
    setTotalDuration(mins * 60);
  };

  const applyPreset = (presetId) => {
    setActivePreset(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    let mins = preset.focus;
    if (modeIdx === 1) mins = preset.break;
    else if (modeIdx === 2) mins = preset.longBreak;

    setRemainingSecs(mins * 60);
    setTotalDuration(mins * 60);
    setIsActive(false);
  };

  /* ── KEYBOARD SHORTCUTS ────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        toggleTimer();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetTimer();
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        skipTimer();
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, remainingSecs, totalDuration, modeIdx, activePreset]);

  /* ── INTERACTIVE TASK CHECKING ─────────────────────── */
  const handleToggleTaskCompletion = async (taskId) => {
    confetti({ particleCount: 60, spread: 50, origin: { x: 0.8, y: 0.6 } });
    try {
      await updateTask(taskId, { completed: true });
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  /* ── DISPLAY TIME FORMAT ───────────────────────────── */
  const formatTime = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const streak = parseInt(localStorage.getItem(`study_streak_${user?.email}`) || localStorage.getItem("study_streak") || "0");
  const focusMins = Math.round(totalSecs / 60);
  const focusHrs = (focusMins / 60).toFixed(1);
  const weeklyScore = Math.min(100, Math.round((sessions * 15) + (focusMins * 0.4) + (streak * 6)));

  return (
    <div className="relative min-h-[90vh] py-4 select-none overflow-x-hidden">
      
      {/* ── BACKGROUND GLOW BLOBS ────────────────────────── */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-2000" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col gap-6">
        
        {/* ── TOP HEADER & ANALYTICS BAR ─────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-400">Workspace</span>
              <span className="text-slate-300">›</span>
              <span className="text-xs font-bold text-violet-600">Focus Hub</span>
            </div>
            <h1 className="font-outfit text-3xl font-extrabold text-slate-800 tracking-tight">Focus Chamber</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Deep work presets, automated ambient audio, and responsive task tracking.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(true)}
              className="glass-card flex items-center gap-2 px-4 py-2 text-xs font-bold text-violet-600 border border-violet-100 hover:border-violet-300 hover:bg-violet-50/50 rounded-xl transition duration-200"
            >
              <Maximize2 size={13} /> Fullscreen Focus
            </button>
            <div className="flex items-center gap-1.5 px-3.5 py-2 glass-card bg-amber-50/70 border-amber-100 text-amber-600 text-xs font-extrabold rounded-xl">
              <Flame size={14} className="fill-current animate-bounce" /> {streak} Day Streak
            </div>
          </div>
        </div>

        {/* ── STATS CARDS ────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Sessions Done", val: sessions, icon: <Trophy size={20} />, col: "violet", trend: "+2 sessions" },
            { label: "Total Focus Hours", val: `${focusHrs} hrs`, icon: <Clock size={20} />, col: "indigo", trend: "Active time" },
            { label: "Study Streak", val: `${streak} days`, icon: <Flame size={20} />, col: "amber", trend: "Consecutive" },
            { label: "Weekly Focus Score", val: `${weeklyScore}%`, icon: <TrendingUp size={20} />, col: "emerald", trend: "Optimal study" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-5 cursor-default relative overflow-hidden group"
            >
              <div className="absolute -right-3 -top-3 w-16 h-16 bg-slate-50 rounded-full scale-0 group-hover:scale-100 transition-all duration-300 ease-out" />
              <div className="flex items-start justify-between relative z-10">
                <div className={`p-2.5 rounded-xl text-white stat-icon-${stat.col} shadow-lg shadow-violet-100`}>
                  {stat.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.trend}</span>
              </div>
              <div className="mt-4 relative z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="font-outfit text-2xl font-black text-slate-800 mt-1">{stat.val}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── MAIN WORKSPACE ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: TIMER & CONTROLS */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* TIMER CARD */}
            <motion.div
              animate={{ background: isAlarmRinging ? "linear-gradient(135deg, #fee2e2, #fecaca)" : mode.bg }}
              transition={{ duration: 0.6 }}
              className="relative p-6 sm:p-10 rounded-[32px] text-white shadow-2xl overflow-hidden flex flex-col items-center justify-center border border-white/10"
              style={{ boxShadow: `0 24px 60px ${mode.glow}` }}
            >
              
              {/* Card Blobs */}
              <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-white/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute bottom-[-30px] left-[-30px] w-48 h-48 bg-white/5 rounded-full blur-[45px] pointer-events-none" />

              {/* Presets Slider */}
              <div className="relative z-20 flex gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 mb-8 max-w-full overflow-x-auto">
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition duration-200 whitespace-nowrap cursor-pointer ${
                      activePreset === p.id ? "bg-white text-slate-800 shadow-lg" : "text-white hover:bg-white/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Mode Pills */}
              <div className="relative z-20 flex gap-1.5 bg-black/10 p-1 rounded-xl mb-8">
                {MODES.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => switchMode(i)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition duration-200 ${
                      modeIdx === i ? "bg-white/20 text-white shadow-inner" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Center Ring & Time */}
              <div className="relative w-72 h-72 flex items-center justify-center mb-8">
                <TimerRing progress={progressPercent} color={mode.color} glow={mode.glow} isActive={isActive} size={260} />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <span className="font-outfit text-6xl font-black text-white tracking-tighter leading-none filter drop-shadow-md">
                    {formatTime(remainingSecs)}
                  </span>
                  
                  {isAlarmRinging ? (
                    <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-xs font-black text-rose-500 uppercase tracking-widest mt-3 bg-white px-3 py-1 rounded-full shadow-lg">
                      Time's Up! 🔔
                    </motion.span>
                  ) : (
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-3 bg-black/15 px-3 py-1 rounded-full">
                      {isActive ? "Running" : "Paused"}
                    </span>
                  )}
                </div>
              </div>

              {/* Controls Panel */}
              <div className="relative z-20 flex items-center gap-5">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={resetTimer}
                  className="w-12 h-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 flex items-center justify-center transition duration-150 cursor-pointer shadow-lg backdrop-blur-md"
                  title="Reset (R)"
                >
                  <RotateCcw size={18} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTimer}
                  className="w-20 h-20 rounded-full bg-white text-slate-800 flex items-center justify-center transition duration-200 cursor-pointer shadow-xl"
                  style={{ color: mode.color }}
                  title="Play / Pause (Space)"
                >
                  {isActive ? <Pause size={30} className="fill-current" /> : <Play size={30} className="fill-current translate-x-0.5" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={skipTimer}
                  className="w-12 h-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 flex items-center justify-center transition duration-150 cursor-pointer shadow-lg backdrop-blur-md"
                  title="Skip (S)"
                >
                  <SkipForward size={18} />
                </motion.button>
              </div>

              {/* Shortcut Hints */}
              <div className="relative z-20 flex gap-6 text-[10px] font-bold text-white/50 uppercase tracking-widest mt-8">
                <span>[Space] Start/Pause</span>
                <span>[R] Reset</span>
                <span>[F] Fullscreen</span>
              </div>
            </motion.div>

            {/* ALARM SYSTEM CONTROLLER */}
            <div className="glass-card p-6 border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-outfit text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-50 text-rose-500"><Volume2 size={15} /></span>
                  Audible Alarm Settings
                </h3>
                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wider">Sound Active</span>
              </div>

              {isAlarmRinging && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-black">Alarm ringing continuously... Dismiss or Snooze.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={dismissAlarm}
                      className="px-4 py-1.5 bg-rose-600 text-white hover:bg-rose-700 text-xs font-black rounded-xl shadow cursor-pointer transition duration-150"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={snoozeAlarm}
                      className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-900 text-xs font-black rounded-xl cursor-pointer transition duration-150"
                    >
                      Snooze 5m
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Alarm Melody</label>
                  <select
                    value={selectedAlarm}
                    onChange={(e) => setSelectedAlarm(e.target.value)}
                    className="w-100 w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    {ALARM_SOUNDS.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    onClick={testAlarmSound}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Volume2 size={13} /> Test Ringing (3s)
                  </button>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 mt-2 bg-slate-50 p-3 rounded-xl">
                <button
                  onClick={() => setIsAlarmMuted(!isAlarmMuted)}
                  className={`text-slate-500 hover:text-violet-600 transition ${isAlarmMuted ? "text-rose-500 hover:text-rose-600" : ""}`}
                >
                  {isAlarmMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={alarmVolume}
                  onChange={handleAlarmVolumeChange}
                  disabled={isAlarmMuted}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{Math.round(alarmVolume * 100)}%</span>
              </div>
            </div>

            {/* BACKGROUND STUDY MUSIC PLAYER */}
            <div className="glass-card p-6 border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-outfit text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-violet-50 text-violet-500"><Music size={15} /></span>
                  Study Room Music Player
                </h3>
                <span className="text-[10px] font-extrabold text-violet-600 bg-violet-50 px-2 py-0.5 rounded uppercase tracking-wider">Playable Beats</span>
              </div>

              {/* Music selector button row */}
              <div className="flex gap-2 flex-wrap">
                {MUSIC_TRACKS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedMusic(t.id);
                      setIsMusicPlaying(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer ${
                      selectedMusic === t.id
                        ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-100"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {/* Playback Controls & Progress bar */}
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">{MUSIC_TRACKS.find(t => t.id === selectedMusic)?.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{MUSIC_TRACKS.find(t => t.id === selectedMusic)?.artist}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleMusicLoop}
                      className={`text-slate-400 hover:text-slate-700 transition ${isMusicLooping ? "text-violet-600 hover:text-violet-700 font-black" : ""}`}
                      title="Loop Track"
                    >
                      <RefreshCw size={14} className={isMusicLooping ? "animate-spin-slow" : ""} />
                    </button>
                    <button
                      onClick={toggleMusic}
                      className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 transition cursor-pointer"
                    >
                      {isMusicPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="translate-x-0.5" />}
                    </button>
                    <button
                      onClick={playNextTrack}
                      className="text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      title="Next Track"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress bar seek slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 w-8">{Math.floor(musicProgress / 60)}:{String(Math.floor(musicProgress % 60)).padStart(2, "0")}</span>
                  <input
                    type="range"
                    min="0"
                    max={musicDuration || 100}
                    value={musicProgress}
                    onChange={handleMusicSeek}
                    className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <span className="text-[9px] font-bold text-slate-400 w-8 text-right">
                    {musicDuration ? `${Math.floor(musicDuration / 60)}:${String(Math.floor(musicDuration % 60)).padStart(2, "0")}` : "0:00"}
                  </span>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-2 mt-1">
                  <Volume2 size={13} className="text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={handleMusicVolumeChange}
                    className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{Math.round(musicVolume * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: PRODUCTIVITY PANEL */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* MOTIVATIONAL QUOTE CARD */}
            <motion.div
              whileHover={{ y: -2 }}
              className="glass-card p-6 border-l-4 border-l-violet-600 bg-gradient-to-br from-violet-50/40 to-indigo-50/20 shadow-md relative overflow-hidden"
            >
              <div className="absolute right-3 bottom-0 text-7xl font-bold text-slate-200/25 pointer-events-none font-serif">“</div>
              <div className="flex justify-between items-start gap-4 mb-2 relative z-10">
                <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Motivational Mindset</span>
                <button
                  onClick={rotateQuote}
                  className="text-slate-400 hover:text-violet-600 cursor-pointer transition p-1 hover:bg-slate-100 rounded-lg"
                  title="New Quote"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
              <p className="font-outfit text-sm font-bold text-slate-700 italic relative z-10">
                "{MOTIVATIONAL_QUOTES[currentQuoteIdx].text}"
              </p>
              <p className="text-[10px] font-extrabold text-slate-400 mt-2 block text-right">— {MOTIVATIONAL_QUOTES[currentQuoteIdx].author}</p>
            </motion.div>

            {/* PROGRESS AND TARGET GOAL */}
            <div className="glass-card p-6 border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-outfit text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Target size={15} className="text-violet-600" /> Daily Target Progress
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Goal is 4 focus hours per day</p>
                </div>
                <span className="text-xs font-extrabold text-slate-700">{Math.round((focusMins / 240) * 100)}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (focusMins / 240) * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Completed: {focusMins} mins</span>
                <span>Target: 240 mins (4h)</span>
              </div>
            </div>

            {/* INTERACTIVE TODAY'S TASKS */}
            <div className="glass-card p-6 border border-slate-100 flex flex-col gap-4">
              <h3 className="font-outfit text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Check size={16} className="text-violet-600" /> Tasks to Crush Today</span>
                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">{tasks.length} pending</span>
              </h3>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {tasks.length > 0 ? (
                  tasks.slice(0, 5).map(t => (
                    <motion.div
                      key={t._id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-100 rounded-xl hover:bg-slate-50 transition duration-150 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleTaskCompletion(t._id)}
                          className="w-4.5 h-4.5 border-2 border-slate-300 hover:border-violet-600 rounded flex items-center justify-center cursor-pointer transition text-transparent hover:text-violet-600 bg-white"
                        >
                          <Check size={12} className="stroke-[3]" />
                        </button>
                        <span className="text-xs font-bold text-slate-700 truncate group-hover:text-slate-900 transition">{t.title}</span>
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-400 bg-white border border-slate-150 px-2 py-0.5 rounded">{t.subject || "General"}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs font-bold">
                    🎉 Excellent! All tasks completed today.
                  </div>
                )}
              </div>
            </div>

            {/* STREAK & FOCUS CALENDAR WEEK */}
            <div className="glass-card p-6 border border-slate-100 flex flex-col gap-4">
              <h3 className="font-outfit text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Calendar size={15} className="text-violet-600" /> Focus Streak Calendar
              </h3>
              
              <div className="grid grid-cols-7 gap-2 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
                  const todayIdx = (new Date().getDay() + 6) % 7; // Convert 0=Sun to 6=Sun
                  const isActiveStreak = idx <= todayIdx && streak > 0;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">{day}</span>
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border transition duration-200 ${
                          idx === todayIdx
                            ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-100 relative"
                            : isActiveStreak
                            ? "bg-violet-50 border-violet-200 text-violet-600"
                            : "bg-slate-50 border-slate-100 text-slate-400"
                        }`}
                      >
                        {idx === todayIdx && <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />}
                        {isActiveStreak ? <Flame size={12} className="fill-current" /> : idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MINI ANALYTICS BAR CHART */}
            <div className="glass-card p-6 border border-slate-100 flex flex-col gap-4">
              <h3 className="font-outfit text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <BarChart2 size={15} className="text-violet-600" /> Mini Focus Activity
              </h3>

              <div className="flex items-end justify-between h-20 pt-4 gap-3 bg-slate-50/50 p-4 rounded-2xl">
                {[15, 30, 25, 45, 60].map((val, idx) => {
                  const max = 60;
                  const pct = (val / max) * 100;
                  const isToday = idx === 4;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full relative group flex justify-center items-end h-full">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${pct}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                          className={`w-full max-w-[16px] rounded-t-md cursor-pointer ${
                            isToday ? "bg-gradient-to-t from-violet-600 to-indigo-500 shadow-md shadow-violet-100" : "bg-slate-200 group-hover:bg-slate-300"
                          }`}
                          title={`${val} mins`}
                        />
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-400">D-{4 - idx}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SESSION COMPLETION HISTORY */}
            <div className="glass-card p-6 border border-slate-100 flex flex-col gap-4">
              <h3 className="font-outfit text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Clock size={15} className="text-violet-600" /> Focus History
              </h3>

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {history.length > 0 ? (
                  history.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow shadow-violet-200" />
                        <span className="text-xs font-bold text-slate-700">{item.mode}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{item.duration} mins · {item.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs font-bold">
                    No sessions completed today yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SESSION COMPLETE CELEBRATION MODAL ──────────────── */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-slate-100 flex flex-col items-center gap-4 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-28 h-28 bg-violet-50 rounded-full blur-xl pointer-events-none" />
              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center text-3xl shadow-md border border-violet-100">
                ⭐
              </div>
              <h3 className="font-outfit text-2xl font-black text-slate-800 mt-2">Magnificent Focus, {user?.name?.split(" ")[0]}!</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm">
                You successfully crushed a {modeIdx === 1 ? MODES[0].mins : MODES[1].mins} minute focus session! Your brain has leveled up. Keep the streak hot!
              </p>
              
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-lg shadow-violet-100 transition mt-4"
              >
                Let's Keep Going
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FULLSCREEN DEEP FOCUS MODE OVERLAY ─────────────── */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#0f0e1a] z-[120] overflow-y-auto flex flex-col items-center justify-center p-6 sm:p-10 select-none text-white"
          >
            {/* Absolute ambient light blobs */}
            <div className="absolute top-[10%] left-[20%] w-[35rem] h-[35rem] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[20%] w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

            {/* Exit button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition duration-150 flex items-center gap-1.5 cursor-pointer shadow backdrop-blur-md"
            >
              <Minimize2 size={13} /> Exit Fullscreen (Esc)
            </button>

            {/* Centered Timer Card */}
            <motion.div
              animate={{ background: isAlarmRinging ? "linear-gradient(135deg, #742a2a, #991b1b)" : "rgba(255, 255, 255, 0.03)" }}
              className="relative p-10 rounded-[36px] w-full max-w-xl text-center border border-white/5 flex flex-col items-center shadow-2xl backdrop-blur-2xl"
              style={{ boxShadow: "0 30px 100px rgba(0,0,0,0.6)" }}
            >
              {/* Presets and Mode Labels */}
              <div className="flex gap-2.5 bg-white/5 p-1 rounded-xl mb-10 border border-white/5">
                {MODES.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => switchMode(i)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition ${
                      modeIdx === i ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Huge Timer Ring */}
              <div className="relative w-80 h-80 flex items-center justify-center mb-10">
                <TimerRing progress={progressPercent} color={mode.color} glow={mode.glow} isActive={isActive} size={300} />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <span className="font-outfit text-7xl font-black text-white tracking-tighter filter drop-shadow-md leading-none">
                    {formatTime(remainingSecs)}
                  </span>
                  
                  {isAlarmRinging ? (
                    <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-xs font-black text-rose-500 uppercase tracking-widest mt-4 bg-white px-3.5 py-1 rounded-full shadow-lg">
                      Time's Up! 🔔
                    </motion.span>
                  ) : (
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest mt-4 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      {isActive ? "Running" : "Paused"}
                    </span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <button
                  onClick={resetTimer}
                  className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition cursor-pointer backdrop-blur shadow"
                  title="Reset (R)"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={toggleTimer}
                  className="w-20 h-20 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-2xl hover:scale-105 transition duration-200 cursor-pointer"
                  style={{ color: mode.color }}
                  title="Play / Pause (Space)"
                >
                  {isActive ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current translate-x-0.5" />}
                </button>

                <button
                  onClick={skipTimer}
                  className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition cursor-pointer backdrop-blur shadow"
                  title="Skip (S)"
                >
                  <SkipForward size={18} />
                </button>
              </div>

              {/* Small music widget overlay */}
              <div className="mt-10 bg-white/5 p-4 border border-white/5 rounded-2xl w-full max-w-sm flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Study beats</span>
                  <span className="text-xs font-bold text-white/80 block truncate max-w-[150px]">{MUSIC_TRACKS.find(t => t.id === selectedMusic)?.name}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMusic}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    {isMusicPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                  </button>
                  <button
                    onClick={playNextTrack}
                    className="text-white/60 hover:text-white transition cursor-pointer"
                  >
                    <SkipForward size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
