// src/pages/Progress.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { FiTrendingUp, FiActivity, FiCalendar, FiBarChart2, FiCheckCircle, FiClock } from "react-icons/fi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor:"#1e293b", padding:10, cornerRadius:8 } },
  scales: {
    x: { grid: { display:false }, ticks: { color:"#94a3b8", font:{ size:11, weight:"600" } } },
    y: { grid: { color:"#f1f5f9" }, ticks: { color:"#94a3b8", font:{ size:11 } }, beginAtZero:true },
  },
};

const RANGE_OPTS = ["This Week","This Month","All Time"];

export default function Progress() {
  const { user } = useAuth();
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange]   = useState("This Week");

  useEffect(() => {
    if (user) getTasks().then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  /* ── derived stats ── */
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending   = total - completed;
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100);
  const highPri   = tasks.filter(t => t.priority === "High").length;
  const streak    = parseInt(localStorage.getItem(`study_streak_${user?.email}`) || localStorage.getItem("study_streak") || "0");
  const sessions  = parseInt(localStorage.getItem("pomodoro_count") || "0");
  const focusMins = Math.round(parseInt(localStorage.getItem("pomodoro_total_secs") || "0") / 60);

  /* ── subject breakdown ── */
  const bySubject = tasks.reduce((acc, t) => {
    const s = t.subject || "General";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  /* ── priority breakdown ── */
  const byPriority = { High:0, Medium:0, Low:0 };
  tasks.forEach(t => { byPriority[t.priority || "Medium"]++; });

  /* ── weekly task creation ── */
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weekCounts = days.map((_, i) => {
    const dayIdx = (i + 1) % 7;
    return tasks.filter(t => {
      const d = new Date(t.createdAt || t.date);
      return !isNaN(d) && d.getDay() === dayIdx;
    }).length;
  });

  /* ── completion by subject ── */
  const completedBySubject = Object.keys(bySubject).reduce((acc, s) => {
    acc[s] = tasks.filter(t => (t.subject || "General") === s && t.completed).length;
    return acc;
  }, {});

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ width:36, height:36, border:"3px solid #e0e7ff", borderTopColor:"#6366f1",
        borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24, paddingBottom:48 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
            <span style={{ fontSize:11, fontWeight:600, color:"#94a3b8" }}>Workspace</span>
            <span style={{ fontSize:11, color:"#cbd5e1" }}>›</span>
            <span style={{ fontSize:11, fontWeight:700, color:"#6366f1" }}>Analytics</span>
          </div>
          <h1 style={{ fontFamily:"Outfit,sans-serif", fontSize:28, fontWeight:800, color:"#1e293b", lineHeight:1 }}>
            Learning Analytics
          </h1>
          <p style={{ fontSize:13, color:"#94a3b8", marginTop:6, fontWeight:500 }}>
            Track your academic growth and productivity performance.
          </p>
        </div>

        {/* range filter */}
        <div style={{ display:"flex", gap:6, background:"rgba(255,255,255,0.9)",
          border:"1.5px solid #e2e8f0", borderRadius:12, padding:4 }}>
          {RANGE_OPTS.map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding:"6px 14px", borderRadius:9, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:700, transition:"all 0.2s",
                background: range===r ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "transparent",
                color: range===r ? "white" : "#64748b",
                boxShadow: range===r ? "0 2px 8px rgba(99,102,241,0.3)" : "none" }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW CARDS ─────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14 }}>
        {[
          { icon:<FiCheckCircle size={18}/>, label:"Completed",    val:completed, color:"#10b981", bg:"linear-gradient(135deg,#10b981,#059669)" },
          { icon:<FiActivity size={18}/>,    label:"Total Tasks",  val:total,     color:"#6366f1", bg:"linear-gradient(135deg,#6366f1,#4f46e5)" },
          { icon:<FiClock size={18}/>,       label:"Pending",      val:pending,   color:"#f59e0b", bg:"linear-gradient(135deg,#f59e0b,#d97706)" },
          { icon:<FiBarChart2 size={18}/>,   label:"Progress",     val:`${progress}%`, color:"#7c3aed", bg:"linear-gradient(135deg,#7c3aed,#6d28d9)" },
          { icon:<FiTrendingUp size={18}/>,  label:"Focus Sessions",val:sessions, color:"#0ea5e9", bg:"linear-gradient(135deg,#0ea5e9,#0284c7)" },
          { icon:<FiCalendar size={18}/>,    label:"Day Streak",   val:streak,    color:"#ec4899", bg:"linear-gradient(135deg,#ec4899,#db2777)" },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y:-3 }}
            style={{ background:"rgba(255,255,255,0.9)", borderRadius:16,
              border:"1.5px solid rgba(226,232,240,0.8)", padding:"18px 16px",
              boxShadow:"0 2px 8px rgba(0,0,0,0.04)", transition:"all 0.2s" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:s.bg,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"white", marginBottom:12, boxShadow:`0 4px 10px ${s.color}44` }}>
              {s.icon}
            </div>
            <p style={{ fontSize:22, fontWeight:800, fontFamily:"Outfit,sans-serif",
              color:"#1e293b", lineHeight:1 }}>{s.val}</p>
            <p style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
              letterSpacing:"0.07em", marginTop:4 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── EFFICIENCY HERO ────────────────────────────── */}
      <div style={{ borderRadius:20, overflow:"hidden",
        background:"linear-gradient(135deg,#4338ca,#6d28d9,#7c3aed)",
        padding:"32px 36px", color:"white", position:"relative",
        boxShadow:"0 8px 32px rgba(99,102,241,0.3)" }}>
        <div className="float-blob" style={{ position:"absolute", top:-30, right:-30, width:160, height:160,
          borderRadius:"50%", background:"rgba(255,255,255,0.08)", filter:"blur(30px)", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.65)",
              textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Efficiency Score</p>
            <div style={{ fontFamily:"Outfit,sans-serif", fontSize:72, fontWeight:900,
              lineHeight:1, color:"white" }}>{progress}%</div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.7)", marginTop:8 }}>
              {completed} of {total} tasks completed
            </p>
          </div>
          <div style={{ flex:1, maxWidth:300 }}>
            <div style={{ height:8, background:"rgba(255,255,255,0.2)", borderRadius:99, overflow:"hidden", marginBottom:12 }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${progress}%` }}
                transition={{ duration:1.2, ease:"easeOut" }}
                style={{ height:"100%", background:"white", borderRadius:99 }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11,
              color:"rgba(255,255,255,0.6)", fontWeight:600 }}>
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
            <div style={{ marginTop:16, display:"flex", gap:16, flexWrap:"wrap" }}>
              {[
                { label:"Focus Time", val:`${focusMins}m` },
                { label:"High Priority", val:highPri },
                { label:"Streak", val:`${streak}d` },
              ].map(s => (
                <div key={s.label} style={{ background:"rgba(255,255,255,0.15)", padding:"6px 12px",
                  borderRadius:10, fontSize:12, fontWeight:700 }}>
                  <span style={{ color:"rgba(255,255,255,0.65)" }}>{s.label}: </span>
                  <span style={{ color:"white" }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW ─────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }} className="lg-grid">

        {/* weekly activity */}
        <div style={{ background:"rgba(255,255,255,0.9)", borderRadius:20,
          border:"1.5px solid rgba(226,232,240,0.8)", padding:"24px",
          boxShadow:"0 4px 16px rgba(99,102,241,0.06)" }}>
          <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:800,
            color:"#1e293b", marginBottom:20 }}>Weekly Activity</h3>
          {total > 0 ? (
            <div style={{ height:180 }}>
              <Bar data={{
                labels: days,
                datasets:[{ label:"Tasks", data:weekCounts,
                  backgroundColor:"rgba(99,102,241,0.8)", borderRadius:8,
                  hoverBackgroundColor:"#6366f1" }]
              }} options={CHART_OPTS} />
            </div>
          ) : <EmptyChart msg="Create tasks to see weekly activity" />}
        </div>

        {/* completion status */}
        <div style={{ background:"rgba(255,255,255,0.9)", borderRadius:20,
          border:"1.5px solid rgba(226,232,240,0.8)", padding:"24px",
          boxShadow:"0 4px 16px rgba(99,102,241,0.06)",
          display:"flex", flexDirection:"column", alignItems:"center" }}>
          <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:800,
            color:"#1e293b", marginBottom:20, alignSelf:"flex-start" }}>Completion Status</h3>
          {total > 0 ? (
            <>
              <div style={{ height:160, width:160, position:"relative" }}>
                <Doughnut data={{
                  labels:["Completed","Pending"],
                  datasets:[{ data:[completed, pending],
                    backgroundColor:["#10b981","#e0e7ff"], borderWidth:0, hoverOffset:4 }]
                }} options={{ cutout:"78%", plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:"#1e293b" } } }} />
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"Outfit,sans-serif", fontSize:28, fontWeight:800, color:"#1e293b" }}>
                    {progress}%
                  </span>
                  <span style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
                    letterSpacing:"0.07em" }}>done</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:20, marginTop:16 }}>
                {[{ label:"Completed", val:completed, color:"#10b981" },
                  { label:"Pending",   val:pending,   color:"#c7d2fe" }].map(s => (
                  <div key={s.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:s.color }} />
                    <span style={{ fontSize:11, fontWeight:600, color:"#64748b" }}>{s.label}: {s.val}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyChart msg="Complete tasks to see status" />}
        </div>
      </div>

      {/* ── SUBJECT BREAKDOWN ──────────────────────────── */}
      {Object.keys(bySubject).length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.9)", borderRadius:20,
          border:"1.5px solid rgba(226,232,240,0.8)", padding:"24px",
          boxShadow:"0 4px 16px rgba(99,102,241,0.06)" }}>
          <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:800,
            color:"#1e293b", marginBottom:20 }}>Tasks by Subject</h3>
          <div style={{ height:200 }}>
            <Bar data={{
              labels: Object.keys(bySubject),
              datasets:[
                { label:"Total",     data:Object.values(bySubject),
                  backgroundColor:"rgba(99,102,241,0.2)", borderRadius:8 },
                { label:"Completed", data:Object.keys(bySubject).map(s => completedBySubject[s]||0),
                  backgroundColor:"rgba(99,102,241,0.85)", borderRadius:8 },
              ]
            }} options={{ ...CHART_OPTS, plugins:{ ...CHART_OPTS.plugins,
              legend:{ display:true, labels:{ color:"#64748b", font:{ size:11, weight:"600" } } } } }} />
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ────────────────────────────────── */}
      {total === 0 && (
        <div style={{ textAlign:"center", padding:"64px 24px",
          background:"rgba(255,255,255,0.7)", borderRadius:20,
          border:"2px dashed #e0e7ff" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
          <p style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:20, color:"#334155", marginBottom:8 }}>
            No analytics yet
          </p>
          <p style={{ fontSize:14, color:"#94a3b8", maxWidth:320, margin:"0 auto" }}>
            Complete tasks and focus sessions to unlock your productivity insights.
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyChart({ msg }) {
  return (
    <div style={{ height:160, display:"flex", alignItems:"center", justifyContent:"center",
      border:"2px dashed #e0e7ff", borderRadius:14 }}>
      <p style={{ fontSize:12, fontWeight:600, color:"#94a3b8", textAlign:"center" }}>{msg}</p>
    </div>
  );
}
