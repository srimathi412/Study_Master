// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiList, FiCheckCircle, FiClock, FiBarChart2,
  FiArrowRight, FiPlus, FiTrendingUp, FiZap,
  FiTarget, FiCalendar, FiActivity, FiBookOpen,
  FiAlertCircle, FiStar
} from "react-icons/fi";
import QuickNotes from "../components/QuickNotes";
import MotivationalCard from "../components/MotivationalCard";

/* ── animation variants ─────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.22,1,0.36,1] } }
};

/* ── animated counter ───────────────────────────────── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const numVal = parseInt(String(value)) || 0;
  useEffect(() => {
    if (numVal === 0) { setDisplay(0); return; }
    let cur = 0;
    const step = Math.max(1, Math.ceil(numVal / 25));
    const t = setInterval(() => {
      cur = Math.min(cur + step, numVal);
      setDisplay(cur);
      if (cur >= numVal) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, [numVal]);
  return <span>{typeof value === "string" && value.includes("%") ? `${display}%` : display}</span>;
}

/* ── circular progress ring ─────────────────────────── */
function ProgressRing({ percent, size = 100, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.9)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" className="progress-ring-circle" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize="15" fontWeight="700" fontFamily="Inter,sans-serif">
        {percent}%
      </text>
    </svg>
  );
}

/* ── stat card ──────────────────────────────────────── */
function StatCard({ icon, label, value, colorKey, barPercent = 0, trend }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
      className="glass-card p-6 cursor-default">
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div className={`stat-icon-${colorKey}`}
          style={{ padding:10, borderRadius:14, color:"white", display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 4px 12px rgba(0,0,0,0.15)` }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{ fontSize:11, fontWeight:700, display:"flex", alignItems:"center", gap:3,
            color: trend >= 0 ? "#10b981" : "#f43f5e" }}>
            <FiTrendingUp size={11} style={{ transform: trend < 0 ? "rotate(180deg)" : "none" }} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>
        {label}
      </p>
      <p style={{ fontSize:28, fontWeight:800, fontFamily:"Outfit,sans-serif", color:"#1e293b", marginBottom:12 }}>
        <AnimatedNumber value={value} />
      </p>
      <div style={{ height:5, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
        <motion.div initial={{ width:0 }} animate={{ width:`${barPercent}%` }}
          transition={{ duration:1, delay:0.3, ease:"easeOut" }}
          className={`stat-bar-${colorKey}`}
          style={{ height:"100%", borderRadius:99 }} />
      </div>
    </motion.div>
  );
}

/* ── priority badge ─────────────────────────────────── */
function PriorityBadge({ priority }) {
  const styles = {
    High:   { background:"#fee2e2", color:"#dc2626" },
    Medium: { background:"#fef3c7", color:"#d97706" },
    Low:    { background:"#d1fae5", color:"#059669" },
  };
  const s = styles[priority] || styles.Medium;
  return (
    <span className="badge" style={s}>{priority || "Medium"}</span>
  );
}

/* ── empty state ────────────────────────────────────── */
function EmptyTasks() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"48px 24px", gap:16 }}>
      <div style={{ position:"relative" }}>
        <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#e0e7ff,#ede9fe)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <FiBookOpen size={28} color="#6366f1" />
        </div>
        <div style={{ position:"absolute", top:-4, right:-4, width:22, height:22, background:"#f59e0b",
          borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <FiPlus size={13} color="white" />
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, color:"#334155", fontSize:17, marginBottom:4 }}>
          No tasks yet
        </p>
        <p style={{ fontSize:13, color:"#94a3b8" }}>Create your first task to get started</p>
      </div>
      <Link to="/tasks/new" className="btn-primary" style={{ marginTop:8 }}>
        <FiPlus size={15} /> Create First Task
      </Link>
    </div>
  );
}

/* ── weekly bar chart ───────────────────────────────── */
function WeeklyChart({ tasks }) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const today = new Date().getDay(); // 0=Sun
  const counts = days.map((_, i) => {
    const dayIdx = (i + 1) % 7;
    return tasks.filter(t => {
      const d = new Date(t.createdAt || t.date);
      return !isNaN(d) && d.getDay() === dayIdx;
    }).length;
  });
  const max = Math.max(...counts, 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:96, width:"100%" }}>
      {days.map((day, i) => {
        const pct = Math.max((counts[i] / max) * 100, 6);
        const isToday = (i + 1) % 7 === today;
        return (
          <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, height:"100%" }}>
            <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end" }}>
              <motion.div
                initial={{ height:0 }} animate={{ height:`${pct}%` }}
                transition={{ duration:0.7, delay:i*0.07, ease:"easeOut" }}
                style={{
                  width:"100%", borderRadius:"6px 6px 0 0", minHeight:6,
                  background: isToday ? "linear-gradient(180deg,#7c3aed,#6366f1)" : "#e0e7ff",
                  boxShadow: isToday ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                  cursor:"pointer", transition:"background 0.2s"
                }}
                title={`${counts[i]} tasks`}
              />
            </div>
            <span style={{ fontSize:10, fontWeight:600, color: isToday ? "#6366f1" : "#94a3b8" }}>{day}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── upcoming deadlines ─────────────────────────────── */
function UpcomingDeadlines({ tasks }) {
  const upcoming = tasks
    .filter(t => !t.completed && (t.dueDate || t.date))
    .sort((a,b) => new Date(a.dueDate||a.date) - new Date(b.dueDate||b.date))
    .slice(0, 4);

  const daysLeft = (ds) => {
    const diff = Math.ceil((new Date(ds) - new Date()) / 86400000);
    if (diff < 0)  return { label:"Overdue",   bg:"#fee2e2", color:"#dc2626" };
    if (diff === 0) return { label:"Today",    bg:"#fef3c7", color:"#d97706" };
    if (diff === 1) return { label:"Tomorrow", bg:"#fef3c7", color:"#d97706" };
    return { label:`${diff}d left`, bg:"#f1f5f9", color:"#64748b" };
  };

  if (upcoming.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"28px 0", color:"#94a3b8", fontSize:13, fontWeight:500 }}>
        No upcoming deadlines 🎉
      </div>
    );
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {upcoming.map(task => {
        const dl = daysLeft(task.dueDate || task.date);
        return (
          <motion.div key={task._id} whileHover={{ x:3 }} transition={{ duration:0.15 }}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"10px 12px", borderRadius:12, background:"rgba(248,250,252,0.9)",
              border:"1.5px solid #e2e8f0", transition:"all 0.2s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#818cf8", flexShrink:0 }} />
              <p style={{ fontSize:13, fontWeight:600, color:"#334155", overflow:"hidden",
                textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.title}</p>
            </div>
            <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8,
              background:dl.bg, color:dl.color, flexShrink:0, marginLeft:8 }}>{dl.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── streak dots ────────────────────────────────────── */
function StreakDots({ streak }) {
  const filled = Math.min(streak % 7 || (streak > 0 ? 7 : 0), 7);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      {Array.from({length:7},(_,i) => (
        <motion.div key={i}
          initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ delay:i*0.05, type:"spring", stiffness:300 }}
          style={{ width:10, height:10, borderRadius:"50%",
            background: i < filled ? "#fbbf24" : "rgba(255,255,255,0.25)",
            boxShadow: i < filled ? "0 0 6px rgba(251,191,36,0.6)" : "none" }} />
      ))}
      <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.8)", marginLeft:4 }}>
        {streak} day streak
      </span>
    </div>
  );
}

/* ── main export ────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const data = await getTasks();
          setTasks(data);
          
          const streakKey = `study_streak_${user.email}`;
          const lastKey = `last_study_day_${user.email}`;
          
          // Migrate old global keys to user-specific keys if they exist
          if (!localStorage.getItem(streakKey) && localStorage.getItem("study_streak")) {
            localStorage.setItem(streakKey, localStorage.getItem("study_streak"));
            localStorage.removeItem("study_streak");
          }
          if (!localStorage.getItem(lastKey) && localStorage.getItem("last_study_day")) {
            localStorage.setItem(lastKey, localStorage.getItem("last_study_day"));
            localStorage.removeItem("last_study_day");
          }
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayStr = today.toDateString();
          
          const last = localStorage.getItem(lastKey);
          if (last) {
            const lastDate = new Date(last);
            lastDate.setHours(0, 0, 0, 0);
            
            const diffTime = today.getTime() - lastDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              const s = parseInt(localStorage.getItem(streakKey) || "0");
              localStorage.setItem(streakKey, s + 1);
              localStorage.setItem(lastKey, todayStr);
            } else if (diffDays > 1) {
              localStorage.setItem(streakKey, 1);
              localStorage.setItem(lastKey, todayStr);
            }
            // If diffDays === 0, they already logged in today, do nothing.
          } else {
            localStorage.setItem(streakKey, 1);
            localStorage.setItem(lastKey, todayStr);
          }
        } catch(e) { console.error(e); }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending   = total - completed;
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100);
  const highPri   = tasks.filter(t => t.priority === "High" && !t.completed).length;
  const streak    = parseInt(localStorage.getItem(`study_streak_${user?.email}`) || localStorage.getItem("study_streak") || "0");

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      minHeight:"60vh", gap:16 }}>
      <div style={{ width:40, height:40, border:"4px solid #e0e7ff", borderTopColor:"#6366f1",
        borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ fontSize:13, color:"#94a3b8", fontWeight:600 }}>Loading your dashboard…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      style={{ display:"flex", flexDirection:"column", gap:24, paddingBottom:48 }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="hero-gradient"
        style={{ borderRadius:24, padding:"36px 40px", color:"white", position:"relative",
          overflow:"hidden", boxShadow:"0 8px 40px rgba(99,102,241,0.35)" }}>

        {/* blobs */}
        <div className="float-blob" style={{ position:"absolute", top:-40, right:-40, width:200, height:200,
          borderRadius:"50%", background:"rgba(255,255,255,0.08)", filter:"blur(40px)", pointerEvents:"none" }} />
        <div className="float-blob2" style={{ position:"absolute", bottom:-30, left:"40%", width:150, height:150,
          borderRadius:"50%", background:"rgba(255,255,255,0.06)", filter:"blur(30px)", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:24, flexWrap:"wrap" }}>
          <div style={{ maxWidth:560 }}>
            {/* streak */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)",
              backdropFilter:"blur(8px)", padding:"6px 14px", borderRadius:99,
              border:"1px solid rgba(255,255,255,0.2)", marginBottom:16 }}>
              <FiZap size={12} color="#fbbf24" />
              <StreakDots streak={streak} />
            </div>

            <h1 style={{ fontFamily:"Outfit,sans-serif", fontSize:32, fontWeight:800, marginBottom:10, lineHeight:1.2 }}>
              Welcome back, {user?.name?.split(" ")[0] || "Scholar"}! 👋
            </h1>
            <p style={{ color:"rgba(255,255,255,0.8)", fontSize:15, marginBottom:24, lineHeight:1.6 }}>
              {completed > 0
                ? `You've crushed ${completed} task${completed > 1 ? "s" : ""} — keep the momentum going!`
                : "Ready to conquer today? Let's get started!"}
            </p>

            {/* quick stat chips */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:24 }}>
              {[
                { icon:<FiTarget size={12}/>, label:"Today's Goal", val:"4 hrs" },
                { icon:<FiActivity size={12}/>, label:"Weekly Progress", val:`${progress}%` },
                { icon:<FiAlertCircle size={12}/>, label:"High Priority", val:highPri },
              ].map(s => (
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:6,
                  background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
                  padding:"6px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.2)",
                  fontSize:12, fontWeight:600 }}>
                  {s.icon}
                  <span style={{ color:"rgba(255,255,255,0.7)" }}>{s.label}:</span>
                  <span style={{ color:"white", fontWeight:800 }}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
              <Link to="/tasks/new" style={{ display:"inline-flex", alignItems:"center", gap:8,
                background:"white", color:"#6366f1", padding:"10px 20px", borderRadius:12,
                fontWeight:700, fontSize:14, textDecoration:"none",
                boxShadow:"0 4px 16px rgba(0,0,0,0.15)", transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.15)"; }}>
                <FiPlus size={15} /> New Task
              </Link>
              <Link to="/pomodoro" style={{ display:"inline-flex", alignItems:"center", gap:8,
                background:"rgba(255,255,255,0.18)", color:"white", padding:"10px 20px", borderRadius:12,
                fontWeight:700, fontSize:14, textDecoration:"none",
                border:"1.5px solid rgba(255,255,255,0.3)", backdropFilter:"blur(8px)", transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.28)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.18)"; e.currentTarget.style.transform="none"; }}>
                <FiClock size={15} /> Start Focus Timer
              </Link>
            </div>
          </div>

          {/* progress ring */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, flexShrink:0 }}>
            <ProgressRing percent={progress} size={110} stroke={9} />
            <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.7)" }}>Overall Progress</p>
          </div>
        </div>
      </motion.div>

      {/* ── STATS ────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
        <StatCard icon={<FiList size={19}/>}        label="Total Tasks" value={total}          colorKey="indigo"  barPercent={total > 0 ? 100 : 0} />
        <StatCard icon={<FiCheckCircle size={19}/>} label="Completed"   value={completed}      colorKey="emerald" barPercent={progress} />
        <StatCard icon={<FiClock size={19}/>}       label="Pending"     value={pending}        colorKey="amber"   barPercent={total > 0 ? Math.round((pending / total) * 100) : 0} />
        <StatCard icon={<FiBarChart2 size={19}/>}   label="Progress"    value={`${progress}%`} colorKey="rose"    barPercent={progress} />
      </div>

      {/* ── MAIN GRID ────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:24 }}
        className="lg-grid">

        {/* LEFT col */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* Current Tasks */}
          <motion.div variants={fadeUp} className="glass-card">
            <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(226,232,240,0.6)",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div className="section-title">
                <span style={{ padding:6, borderRadius:10, background:"#e0e7ff", display:"flex" }}>
                  <FiBookOpen size={15} color="#6366f1" />
                </span>
                Current Tasks
              </div>
              <Link to="/tasks" style={{ fontSize:12, fontWeight:700, color:"#6366f1",
                textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
                View All <FiArrowRight size={12} />
              </Link>
            </div>
            <div style={{ padding:"20px 24px" }}>
              {tasks.length > 0 ? (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <AnimatePresence>
                    {tasks.slice(0,5).map((task,i) => (
                      <motion.div key={task._id}
                        initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay:i*0.05 }}
                        className="task-row">
                        <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
                          <div style={{ padding:8, borderRadius:10, flexShrink:0,
                            background: task.completed ? "#d1fae5" : "#e0e7ff",
                            color: task.completed ? "#059669" : "#6366f1" }}>
                            {task.completed ? <FiCheckCircle size={14}/> : <FiClock size={14}/>}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:600, color: task.completed ? "#94a3b8" : "#1e293b",
                              textDecoration: task.completed ? "line-through" : "none",
                              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {task.title}
                            </p>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:2 }}>
                              <span style={{ fontSize:10, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                                {task.subject || "General"}
                              </span>
                              {(task.dueDate || task.date) && (
                                <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:10, color:"#94a3b8" }}>
                                  <FiCalendar size={9}/>
                                  {new Date(task.dueDate||task.date).toLocaleDateString(undefined,{month:"short",day:"numeric"})}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <PriorityBadge priority={task.priority} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : <EmptyTasks />}
            </div>
          </motion.div>

          {/* Weekly Chart */}
          <motion.div variants={fadeUp} className="glass-card">
            <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(226,232,240,0.6)",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div className="section-title">
                <span style={{ padding:6, borderRadius:10, background:"#ede9fe", display:"flex" }}>
                  <FiBarChart2 size={15} color="#7c3aed" />
                </span>
                Weekly Productivity
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:"#64748b", background:"#f1f5f9",
                padding:"4px 10px", borderRadius:8 }}>This Week</span>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <WeeklyChart tasks={tasks} />
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                marginTop:16, paddingTop:16, borderTop:"1px solid #f1f5f9" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#7c3aed)" }} />
                  <span style={{ fontSize:11, fontWeight:600, color:"#64748b" }}>Today</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:"#e0e7ff" }} />
                  <span style={{ fontSize:11, fontWeight:600, color:"#64748b" }}>Other days</span>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:"#6366f1" }}>{total} total tasks</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT col */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <motion.div variants={fadeUp}><MotivationalCard /></motion.div>

          {/* Upcoming Deadlines */}
          <motion.div variants={fadeUp} className="glass-card">
            <div style={{ padding:"18px 22px", borderBottom:"1px solid rgba(226,232,240,0.6)",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div className="section-title" style={{ fontSize:14 }}>
                <span style={{ padding:6, borderRadius:10, background:"#fee2e2", display:"flex" }}>
                  <FiCalendar size={14} color="#ef4444" />
                </span>
                Upcoming Deadlines
              </div>
              <span className="badge" style={{ background:"#fee2e2", color:"#dc2626" }}>
                {tasks.filter(t => !t.completed && (t.dueDate||t.date)).length}
              </span>
            </div>
            <div style={{ padding:"18px 22px" }}>
              <UpcomingDeadlines tasks={tasks} />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}><QuickNotes userEmail={user?.email} /></motion.div>
        </div>
      </div>

      {/* ── BOTTOM SUMMARY ───────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16 }}>
        {[
          { icon:<FiStar size={18}/>,       label:"Tasks Completed",  val:completed,                                          cls:"summary-violet"  },
          { icon:<FiAlertCircle size={18}/>, label:"High Priority",    val:highPri,                                            cls:"summary-amber"   },
          { icon:<FiTrendingUp size={18}/>,  label:"Completion Rate",  val:`${progress}%`,                                     cls:"summary-emerald" },
        ].map(s => (
          <motion.div key={s.label} variants={fadeUp} whileHover={{ y:-3 }} transition={{ duration:0.2 }}
            className={`glass-card ${s.cls}`}
            style={{ padding:"20px 22px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ padding:12, borderRadius:14, background:"rgba(255,255,255,0.25)",
              color:"white", display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 12px rgba(0,0,0,0.15)" }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.75)",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>{s.label}</p>
              <p style={{ fontSize:26, fontWeight:800, fontFamily:"Outfit,sans-serif", color:"white" }}>
                <AnimatedNumber value={s.val} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}
