// src/pages/Tasks.jsx
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks, addTask, updateTask, deleteTask } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FiPlus, FiSearch, FiList, FiGrid, FiTrash2,
  FiCheckCircle, FiClock, FiFileText, FiX,
  FiChevronDown, FiCalendar, FiTag, FiAlignLeft,
  FiFilter, FiAlertCircle, FiCheck
} from "react-icons/fi";
import KanbanBoard from "../components/KanbanBoard";
import CustomSelect from "../components/UI/CustomSelect";
import CalendarPicker from "../components/UI/CalendarPicker";

/* ─── stagger variants ───────────────────────────────── */
const listContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const listItem = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] } }
};

/* ─── priority config ────────────────────────────────── */
const PRIORITY = {
  High:   { bg:"#fee2e2", color:"#dc2626", dot:"#ef4444" },
  Medium: { bg:"#fef3c7", color:"#d97706", dot:"#f59e0b" },
  Low:    { bg:"#d1fae5", color:"#059669", dot:"#10b981" },
};

const SUBJECTS = ["Math","Physics","Chemistry","Biology","Computer Science","History","English","Economics","Other"];

const SUBJECT_OPTIONS = [
  { value: "",                  label: "General" },
  { value: "Math",              label: "Math" },
  { value: "Physics",           label: "Physics" },
  { value: "Chemistry",         label: "Chemistry" },
  { value: "Biology",           label: "Biology" },
  { value: "Computer Science",  label: "Computer Science" },
  { value: "History",           label: "History" },
  { value: "English",           label: "English" },
  { value: "Economics",         label: "Economics" },
  { value: "Other",             label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "Low",    label: "Low",    bg: "#f0fdf4", color: "#059669", dot: "#10b981" },
  { value: "Medium", label: "Medium", bg: "#fefce8", color: "#d97706", dot: "#f59e0b" },
  { value: "High",   label: "High",   bg: "#fff1f2", color: "#dc2626", dot: "#ef4444" },
];

/* ─── inline task creation modal ─────────────────────── */
function TaskModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title:"", description:"", subject:"", dueDate:"", priority:"Medium" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Task title is required."); return; }
    setLoading(true);
    try {
      await onSave({ ...form, completed: false, createdAt: new Date().toISOString() });
      onClose();
    } catch { setError("Failed to create task. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)",
        backdropFilter:"blur(6px)", zIndex:50, display:"flex",
        alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ scale:0.93, opacity:0, y:20 }}
        animate={{ scale:1, opacity:1, y:0 }}
        exit={{ scale:0.93, opacity:0, y:20 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
        style={{ background:"white", borderRadius:20, width:"100%", maxWidth:520,
          boxShadow:"0 24px 64px rgba(99,102,241,0.18), 0 4px 16px rgba(0,0,0,0.1)",
          overflow:"visible" }}>

        {/* modal header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f1f5f9",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:"white", borderRadius:"20px 20px 0 0" }}>
          <div>
            <h2 style={{ fontFamily:"Outfit,sans-serif", fontSize:18, fontWeight:800, color:"#1e293b" }}>
              Create New Task
            </h2>
            <p style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Add a task to your academic workflow</p>
          </div>
          <button onClick={onClose}
            style={{ padding:8, borderRadius:10, border:"none", background:"#f8fafc",
              cursor:"pointer", color:"#64748b", display:"flex" }}>
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:"20px 24px 24px",
          background:"white", borderRadius:"0 0 20px 20px" }}>
          {error && (
            <div style={{ background:"#fee2e2", border:"1px solid #fecaca", borderRadius:10,
              padding:"10px 14px", marginBottom:16, fontSize:13, color:"#dc2626", fontWeight:600 }}>
              {error}
            </div>
          )}

          {/* title */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase",
              letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
              <FiTag size={11} color="#6366f1" /> Task Title *
            </label>
            <input ref={titleRef} type="text" placeholder="e.g., Complete Calculus Assignment"
              value={form.title} onChange={e => set("title", e.target.value)}
              style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                border:"1.5px solid #e2e8f0", fontSize:14, fontWeight:600,
                color:"#1e293b", outline:"none", fontFamily:"Inter,sans-serif",
                transition:"border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor="#818cf8"}
              onBlur={e => e.target.style.borderColor="#e2e8f0"}
            />
          </div>

          {/* description */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase",
              letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
              <FiAlignLeft size={11} color="#6366f1" /> Description
            </label>
            <textarea placeholder="Add details about this task..." rows={2}
              value={form.description} onChange={e => set("description", e.target.value)}
              style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                border:"1.5px solid #e2e8f0", fontSize:13, fontWeight:500,
                color:"#334155", outline:"none", resize:"none", fontFamily:"Inter,sans-serif",
                transition:"border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor="#818cf8"}
              onBlur={e => e.target.style.borderColor="#e2e8f0"}
            />
          </div>

          {/* row: subject + due date + priority */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:24 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
                letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Subject</label>
              <CustomSelect
                value={form.subject}
                onChange={v => set("subject", v)}
                options={SUBJECT_OPTIONS}
                placeholder="General"
                icon={<FiTag size={11} />}
              />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
                letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Due Date</label>
              <CalendarPicker
                value={form.dueDate}
                onChange={v => set("dueDate", v)}
                placeholder="Pick a date"
              />
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
                letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Priority</label>
              <CustomSelect
                value={form.priority}
                onChange={v => set("priority", v)}
                options={PRIORITY_OPTIONS}
                placeholder="Medium"
              />
            </div>
          </div>

          {/* submit */}
          <button type="submit" disabled={loading}
            style={{ width:"100%", padding:"13px", borderRadius:13,
              background:"linear-gradient(135deg,#6366f1,#7c3aed)",
              color:"white", fontWeight:700, fontSize:14, border:"none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow:"0 4px 16px rgba(99,102,241,0.35)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"all 0.2s", opacity: loading ? 0.7 : 1 }}>
            {loading
              ? <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)",
                  borderTopColor:"white", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
              : <><FiPlus size={16} /> Create Task</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── task card (list view) ──────────────────────────── */
function TaskCard({ task, onToggle, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const p = PRIORITY[task.priority] || PRIORITY.Medium;
  const dateStr = task.dueDate || task.date;
  const isOverdue = dateStr && !task.completed && new Date(dateStr) < new Date();

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    setDeleting(true);
    await onDelete(task._id);
  };

  return (
    <motion.div variants={listItem} layout
      style={{ background:"rgba(255,255,255,0.9)", borderRadius:16,
        border:"1.5px solid rgba(226,232,240,0.8)",
        boxShadow:"0 2px 8px rgba(99,102,241,0.05)",
        transition:"all 0.2s ease", overflow:"hidden",
        opacity: deleting ? 0.5 : 1 }}
      whileHover={{ y:-2, boxShadow:"0 6px 24px rgba(99,102,241,0.12)", borderColor:"#c7d2fe" }}>

      <div style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px" }}>

        {/* checkbox */}
        <motion.button
          whileTap={{ scale:0.85 }}
          onClick={() => onToggle(task._id)}
          style={{ width:28, height:28, borderRadius:8, border:"none", cursor:"pointer",
            flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
            background: task.completed ? "#d1fae5" : "white",
            boxShadow: task.completed ? "none" : "inset 0 0 0 2px #cbd5e1",
            transition:"all 0.2s" }}>
          <AnimatePresence mode="wait">
            {task.completed
              ? <motion.div key="check" initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}>
                  <FiCheck size={14} color="#059669" strokeWidth={3} />
                </motion.div>
              : <motion.div key="empty" initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                  style={{ width:10, height:10, borderRadius:3, background:"#e2e8f0" }} />}
          </AnimatePresence>
        </motion.button>

        {/* content */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:6 }}>
            <h3 style={{ fontSize:14, fontWeight:700, color: task.completed ? "#94a3b8" : "#1e293b",
              textDecoration: task.completed ? "line-through" : "none",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:320 }}>
              {task.title}
            </h3>
            {/* priority badge */}
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
              background:p.bg, color:p.color, textTransform:"uppercase", letterSpacing:"0.06em",
              flexShrink:0 }}>
              {task.priority || "Medium"}
            </span>
          </div>

          {task.description && (
            <p style={{ fontSize:12, color:"#64748b", marginBottom:8, lineHeight:1.5,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:400 }}>
              {task.description}
            </p>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            {/* subject */}
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600,
              color:"#6366f1", background:"#eef2ff", padding:"3px 9px", borderRadius:99 }}>
              <FiTag size={9} /> {task.subject || "General"}
            </span>
            {/* due date */}
            {dateStr && (
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600,
                color: isOverdue ? "#dc2626" : "#64748b",
                background: isOverdue ? "#fee2e2" : "#f8fafc",
                padding:"3px 9px", borderRadius:99 }}>
                <FiCalendar size={9} />
                {isOverdue ? "Overdue · " : ""}
                {new Date(dateStr).toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" })}
              </span>
            )}
          </div>
        </div>

        {/* delete */}
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
          onClick={handleDelete}
          style={{ padding:8, borderRadius:10, border:"none", cursor:"pointer",
            background:"transparent", color:"#cbd5e1", flexShrink:0,
            display:"flex", alignItems:"center", transition:"all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.color="#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#cbd5e1"; }}>
          <FiTrash2 size={15} />
        </motion.button>
      </div>

      {/* bottom accent line for high priority */}
      {task.priority === "High" && !task.completed && (
        <div style={{ height:2, background:"linear-gradient(90deg,#ef4444,#f97316)", opacity:0.6 }} />
      )}
    </motion.div>
  );
}

/* ─── empty state ────────────────────────────────────── */
function EmptyState({ onAdd }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"72px 24px", gap:20,
        background:"rgba(255,255,255,0.7)", borderRadius:20,
        border:"2px dashed #e0e7ff", textAlign:"center" }}>

      {/* illustration */}
      <div style={{ position:"relative" }}>
        <div style={{ width:80, height:80, borderRadius:24,
          background:"linear-gradient(135deg,#e0e7ff,#ede9fe)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <FiList size={32} color="#6366f1" />
        </div>
        <motion.div animate={{ y:[0,-6,0] }} transition={{ repeat:Infinity, duration:2.5, ease:"easeInOut" }}
          style={{ position:"absolute", top:-8, right:-8, width:28, height:28,
            background:"linear-gradient(135deg,#f59e0b,#d97706)", borderRadius:"50%",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 12px rgba(245,158,11,0.4)" }}>
          <FiPlus size={14} color="white" />
        </motion.div>
      </div>

      <div>
        <p style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:20, color:"#334155", marginBottom:6 }}>
          No tasks yet 📚
        </p>
        <p style={{ fontSize:14, color:"#94a3b8", lineHeight:1.6, maxWidth:300 }}>
          Start organizing your academic goals by creating your first task.
        </p>
      </div>

      <motion.button onClick={onAdd} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
        style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px",
          background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"white",
          fontWeight:700, fontSize:14, borderRadius:13, border:"none", cursor:"pointer",
          boxShadow:"0 4px 16px rgba(99,102,241,0.35)", marginTop:4 }}>
        <FiPlus size={16} /> Create First Task
      </motion.button>
    </motion.div>
  );
}

/* ─── filter pills ───────────────────────────────────── */
const FILTERS = [
  { key:"all",       label:"All"          },
  { key:"today",     label:"Today"        },
  { key:"upcoming",  label:"Upcoming"     },
  { key:"completed", label:"Completed"    },
  { key:"high",      label:"High Priority"},
];

/* ─── main page ──────────────────────────────────────── */
export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState("list");
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [sort, setSort]         = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const load = async () => {
    try { const d = await getTasks(); setTasks(d); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) load(); }, [user]);

  /* ── filtering ── */
  const today = new Date(); today.setHours(0,0,0,0);

  const filtered = tasks
    .filter(t => {
      const q = search.toLowerCase();
      if (q && !t.title.toLowerCase().includes(q) &&
          !(t.subject||"").toLowerCase().includes(q) &&
          !(t.description||"").toLowerCase().includes(q)) return false;

      const due = t.dueDate || t.date;
      const dueDate = due ? new Date(due) : null;
      if (dueDate) dueDate.setHours(0,0,0,0);

      if (filter === "completed") return t.completed;
      if (filter === "high")      return t.priority === "High" && !t.completed;
      if (filter === "today")     return dueDate && dueDate.getTime() === today.getTime() && !t.completed;
      if (filter === "upcoming")  return dueDate && dueDate > today && !t.completed;
      return true;
    })
    .sort((a, b) => {
      if (sort === "newest")   return new Date(b.createdAt||0) - new Date(a.createdAt||0);
      if (sort === "oldest")   return new Date(a.createdAt||0) - new Date(b.createdAt||0);
      if (sort === "priority") {
        const order = { High:0, Medium:1, Low:2 };
        return (order[a.priority]??1) - (order[b.priority]??1);
      }
      if (sort === "dueDate") {
        const da = a.dueDate||a.date, db = b.dueDate||b.date;
        if (!da && !db) return 0; if (!da) return 1; if (!db) return -1;
        return new Date(da) - new Date(db);
      }
      return 0;
    });

  /* ── actions ── */
  const handleAdd = async (data) => {
    await addTask(data);
    await load();
  };

  const handleToggle = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    const next = !task.completed;
    await updateTask(id, { completed: next });
    await load();
    if (next) confetti({ particleCount:90, spread:65, origin:{ y:0.7 },
      colors:["#6366f1","#a855f7","#10b981"] });
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    await load();
  };

  const downloadPDF = () => {
    if (!tasks.length) return;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(99,102,241);
    doc.text("StudyMaster – Task Roadmap", 14, 18);
    doc.setFontSize(10); doc.setTextColor(100,116,139);
    doc.text(`Exported on ${new Date().toLocaleDateString()}`, 14, 26);
    autoTable(doc, {
      startY:32,
      head:[["Title","Subject","Priority","Due Date","Status"]],
      body: tasks.map(t => [
        t.title, t.subject||"General", t.priority||"Medium",
        (t.dueDate||t.date) ? new Date(t.dueDate||t.date).toLocaleDateString() : "—",
        t.completed ? "Completed" : "Pending"
      ]),
      headStyles:{ fillColor:[99,102,241] },
      alternateRowStyles:{ fillColor:[248,250,252] },
    });
    doc.save("study-tasks.pdf");
  };

  /* ── counts for filter pills ── */
  const counts = {
    all:       tasks.length,
    today:     tasks.filter(t => { const d=t.dueDate||t.date; if(!d||t.completed) return false; const dd=new Date(d); dd.setHours(0,0,0,0); return dd.getTime()===today.getTime(); }).length,
    upcoming:  tasks.filter(t => { const d=t.dueDate||t.date; if(!d||t.completed) return false; const dd=new Date(d); dd.setHours(0,0,0,0); return dd>today; }).length,
    completed: tasks.filter(t => t.completed).length,
    high:      tasks.filter(t => t.priority==="High" && !t.completed).length,
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
      <div style={{ width:36, height:36, border:"3px solid #e0e7ff", borderTopColor:"#6366f1",
        borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display:"flex", flexDirection:"column", gap:24, paddingBottom:48 }}>

        {/* ── PAGE HEADER ──────────────────────────────── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          flexWrap:"wrap", gap:16 }}>
          <div>
            {/* breadcrumb */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <span style={{ fontSize:11, fontWeight:600, color:"#94a3b8" }}>Workspace</span>
              <span style={{ fontSize:11, color:"#cbd5e1" }}>›</span>
              <span style={{ fontSize:11, fontWeight:700, color:"#6366f1" }}>My Tasks</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <h1 style={{ fontFamily:"Outfit,sans-serif", fontSize:28, fontWeight:800,
                color:"#1e293b", lineHeight:1 }}>
                My Study Tasks
              </h1>
              <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:99,
                background:"linear-gradient(135deg,#eef2ff,#ede9fe)", color:"#6366f1",
                border:"1px solid #c7d2fe" }}>
                {tasks.length} tasks
              </span>
            </div>
            <p style={{ fontSize:13, color:"#94a3b8", marginTop:6, fontWeight:500 }}>
              Organize, prioritize, and complete your academic workflow.
            </p>
          </div>

          {/* action buttons */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* view toggle */}
            <div style={{ display:"flex", background:"rgba(255,255,255,0.9)", border:"1.5px solid #e2e8f0",
              borderRadius:12, padding:3, gap:2 }}>
              {[
                { v:"list",   icon:<FiList size={16}/> },
                { v:"kanban", icon:<FiGrid size={16}/> },
              ].map(({ v, icon }) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding:"7px 10px", borderRadius:9, border:"none", cursor:"pointer",
                    background: view===v ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "transparent",
                    color: view===v ? "white" : "#94a3b8",
                    boxShadow: view===v ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
                    transition:"all 0.2s", display:"flex", alignItems:"center" }}>
                  {icon}
                </button>
              ))}
            </div>

            {/* export */}
            <button onClick={downloadPDF}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 16px",
                background:"white", border:"1.5px solid #e2e8f0", borderRadius:12,
                fontSize:13, fontWeight:600, color:"#475569", cursor:"pointer",
                transition:"all 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#c7d2fe"; e.currentTarget.style.color="#6366f1"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#475569"; }}>
              <FiFileText size={14} /> Export PDF
            </button>

            {/* add task */}
            <motion.button onClick={() => setShowModal(true)}
              whileHover={{ scale:1.03, boxShadow:"0 6px 20px rgba(99,102,241,0.45)" }}
              whileTap={{ scale:0.97 }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px",
                background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"white",
                fontWeight:700, fontSize:14, borderRadius:13, border:"none", cursor:"pointer",
                boxShadow:"0 4px 14px rgba(99,102,241,0.35)", transition:"box-shadow 0.2s" }}>
              <FiPlus size={16} /> Add Task
            </motion.button>
          </div>
        </div>

        {/* ── TOOLBAR ──────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* search + sort row */}
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {/* search */}
            <div style={{ flex:1, minWidth:220, position:"relative" }}>
              <FiSearch style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                color: searchFocused ? "#6366f1" : "#94a3b8", transition:"color 0.2s" }} size={15} />
              <input type="text" placeholder="Search by title, subject, or description…"
                value={search} onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{ width:"100%", padding:"11px 14px 11px 40px",
                  background: searchFocused ? "white" : "rgba(255,255,255,0.8)",
                  border: searchFocused ? "1.5px solid #818cf8" : "1.5px solid #e2e8f0",
                  borderRadius:13, fontSize:13, fontWeight:500, color:"#1e293b",
                  outline:"none", transition:"all 0.2s",
                  boxShadow: searchFocused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                  fontFamily:"Inter,sans-serif" }}
              />
              {search && (
                <button onClick={() => setSearch("")}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer", color:"#94a3b8",
                    display:"flex", padding:2 }}>
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* sort */}
            <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
              <FiFilter size={13} style={{ position:"absolute", left:12, color:"#94a3b8", pointerEvents:"none" }} />
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ padding:"11px 36px 11px 32px", background:"rgba(255,255,255,0.9)",
                  border:"1.5px solid #e2e8f0", borderRadius:13, fontSize:13, fontWeight:600,
                  color:"#475569", outline:"none", cursor:"pointer", appearance:"none",
                  fontFamily:"Inter,sans-serif" }}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">By Priority</option>
                <option value="dueDate">By Due Date</option>
              </select>
              <FiChevronDown size={13} style={{ position:"absolute", right:12, color:"#94a3b8", pointerEvents:"none" }} />
            </div>
          </div>

          {/* filter pills */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {FILTERS.map(f => (
              <motion.button key={f.key} onClick={() => setFilter(f.key)}
                whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                style={{ display:"flex", alignItems:"center", gap:6,
                  padding:"6px 14px", borderRadius:99, cursor:"pointer",
                  fontSize:12, fontWeight:700, transition:"all 0.2s",
                  background: filter===f.key ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "rgba(255,255,255,0.9)",
                  color: filter===f.key ? "white" : "#64748b",
                  boxShadow: filter===f.key ? "0 3px 10px rgba(99,102,241,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
                  border: filter===f.key ? "1.5px solid transparent" : "1.5px solid #e2e8f0" }}>
                {f.label}
                {counts[f.key] > 0 && (
                  <span style={{ fontSize:10, fontWeight:800, padding:"1px 6px", borderRadius:99,
                    background: filter===f.key ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                    color: filter===f.key ? "white" : "#64748b" }}>
                    {counts[f.key]}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── TASK LIST / KANBAN ────────────────────────── */}
        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div key="list"
              initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:16 }} transition={{ duration:0.25 }}>
              {filtered.length > 0 ? (
                <motion.div variants={listContainer} initial="hidden" animate="show"
                  style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {filtered.map(task => (
                    <TaskCard key={task._id} task={task}
                      onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </motion.div>
              ) : (
                tasks.length === 0
                  ? <EmptyState onAdd={() => setShowModal(true)} />
                  : (
                    <div style={{ textAlign:"center", padding:"56px 24px",
                      background:"rgba(255,255,255,0.7)", borderRadius:20,
                      border:"2px dashed #e0e7ff" }}>
                      <FiSearch size={32} color="#c7d2fe" style={{ margin:"0 auto 12px" }} />
                      <p style={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:17, color:"#334155" }}>
                        No matching tasks
                      </p>
                      <p style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>
                        Try adjusting your search or filter.
                      </p>
                    </div>
                  )
              )}
            </motion.div>
          ) : (
            <motion.div key="kanban"
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              exit={{ opacity:0 }} transition={{ duration:0.25 }}>
              <KanbanBoard tasks={filtered} onToggle={handleToggle} onDelete={handleDelete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <TaskModal onClose={() => setShowModal(false)} onSave={handleAdd} />
        )}
      </AnimatePresence>
    </>
  );
}
