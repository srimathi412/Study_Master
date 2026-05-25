// src/components/KanbanBoard.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiCheckCircle, FiClock, FiCalendar, FiTag, FiCheck } from "react-icons/fi";

const PRIORITY = {
  High:   { bg:"#fee2e2", color:"#dc2626" },
  Medium: { bg:"#fef3c7", color:"#d97706" },
  Low:    { bg:"#d1fae5", color:"#059669" },
};

const COLUMNS = [
  {
    id: "todo",
    title: "To Do",
    filter: t => !t.completed && t.priority !== "High",
    accent: "#6366f1",
    softBg: "#eef2ff",
    dot: "#6366f1",
  },
  {
    id: "high",
    title: "High Priority",
    filter: t => !t.completed && t.priority === "High",
    accent: "#ef4444",
    softBg: "#fff1f2",
    dot: "#ef4444",
  },
  {
    id: "done",
    title: "Completed",
    filter: t => t.completed,
    accent: "#10b981",
    softBg: "#f0fdf4",
    dot: "#10b981",
  },
];

function KanbanCard({ task, onToggle, onDelete }) {
  const p = PRIORITY[task.priority] || PRIORITY.Medium;
  const dateStr = task.dueDate || task.date;
  const isOverdue = dateStr && !task.completed && new Date(dateStr) < new Date();

  return (
    <motion.div layout
      initial={{ opacity:0, scale:0.94 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.9 }}
      transition={{ duration:0.25 }}
      whileHover={{ y:-3, boxShadow:"0 8px 28px rgba(99,102,241,0.13)" }}
      style={{ background:"white", borderRadius:14,
        border:"1.5px solid rgba(226,232,240,0.9)",
        boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
        overflow:"hidden", cursor:"default",
        transition:"border-color 0.2s" }}
      className="kanban-card-hover">

      <div style={{ padding:"14px 16px" }}>
        {/* top row: priority + actions */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
            background:p.bg, color:p.color, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            {task.priority || "Medium"}
          </span>
          <div style={{ display:"flex", gap:4 }} className="kanban-actions">
            <button onClick={() => onToggle(task._id)}
              style={{ padding:5, borderRadius:7, border:"none", cursor:"pointer",
                background: task.completed ? "#d1fae5" : "#f8fafc",
                color: task.completed ? "#059669" : "#94a3b8",
                display:"flex", alignItems:"center", transition:"all 0.15s" }}
              onMouseEnter={e => { if (!task.completed) { e.currentTarget.style.background="#eef2ff"; e.currentTarget.style.color="#6366f1"; }}}
              onMouseLeave={e => { if (!task.completed) { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.color="#94a3b8"; }}}>
              {task.completed ? <FiCheck size={13} strokeWidth={3}/> : <FiCheckCircle size={13}/>}
            </button>
            <button onClick={() => { if (window.confirm("Delete this task?")) onDelete(task._id); }}
              style={{ padding:5, borderRadius:7, border:"none", cursor:"pointer",
                background:"#f8fafc", color:"#94a3b8", display:"flex", alignItems:"center",
                transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.color="#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.color="#94a3b8"; }}>
              <FiTrash2 size={13}/>
            </button>
          </div>
        </div>

        {/* title */}
        <h4 style={{ fontSize:13, fontWeight:700, color: task.completed ? "#94a3b8" : "#1e293b",
          textDecoration: task.completed ? "line-through" : "none",
          lineHeight:1.45, marginBottom: task.description ? 6 : 10 }}>
          {task.title}
        </h4>

        {/* description */}
        {task.description && (
          <p style={{ fontSize:11, color:"#94a3b8", lineHeight:1.5, marginBottom:10,
            overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {task.description}
          </p>
        )}

        {/* footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          paddingTop:10, borderTop:"1px solid #f8fafc" }}>
          <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, fontWeight:600,
            color:"#6366f1", background:"#eef2ff", padding:"2px 8px", borderRadius:99 }}>
            <FiTag size={9}/> {task.subject || "General"}
          </span>
          {dateStr && (
            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, fontWeight:600,
              color: isOverdue ? "#dc2626" : "#64748b",
              background: isOverdue ? "#fee2e2" : "#f8fafc",
              padding:"2px 8px", borderRadius:99 }}>
              <FiCalendar size={9}/>
              {new Date(dateStr).toLocaleDateString(undefined, { month:"short", day:"numeric" })}
            </span>
          )}
        </div>
      </div>

      {/* accent bottom line */}
      {task.priority === "High" && !task.completed && (
        <div style={{ height:2, background:"linear-gradient(90deg,#ef4444,#f97316)" }} />
      )}
    </motion.div>
  );
}

export default function KanbanBoard({ tasks, onToggle, onDelete }) {
  return (
    <>
      <style>{`
        .kanban-actions { opacity: 0; transition: opacity 0.15s; }
        .kanban-card-hover:hover .kanban-actions { opacity: 1; }
      `}</style>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(col.filter);
          return (
            <div key={col.id} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {/* column header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"10px 14px", borderRadius:12,
                background:col.softBg, border:`1.5px solid ${col.accent}22` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:col.dot,
                    boxShadow:`0 0 6px ${col.dot}66` }} />
                  <span style={{ fontFamily:"Outfit,sans-serif", fontSize:14, fontWeight:800,
                    color:"#1e293b" }}>{col.title}</span>
                </div>
                <span style={{ fontSize:11, fontWeight:800, padding:"2px 9px", borderRadius:99,
                  background:"white", color:col.accent,
                  border:`1.5px solid ${col.accent}33` }}>
                  {colTasks.length}
                </span>
              </div>

              {/* cards */}
              <div style={{ display:"flex", flexDirection:"column", gap:10,
                minHeight:360, padding:"4px 2px" }}>
                <AnimatePresence>
                  {colTasks.map(task => (
                    <KanbanCard key={task._id} task={task}
                      onToggle={onToggle} onDelete={onDelete} />
                  ))}
                </AnimatePresence>

                {colTasks.length === 0 && (
                  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                    border:`2px dashed ${col.accent}33`, borderRadius:14, minHeight:120,
                    padding:24 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:`${col.accent}88`,
                      textTransform:"uppercase", letterSpacing:"0.08em", textAlign:"center" }}>
                      No tasks here
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
