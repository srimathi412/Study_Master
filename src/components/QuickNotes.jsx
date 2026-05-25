// src/components/QuickNotes.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";

const NOTE_COLORS = [
  { bg:"#fffbeb", border:"#fde68a", dot:"#f59e0b" },
  { bg:"#f5f3ff", border:"#ddd6fe", dot:"#7c3aed" },
  { bg:"#f0f9ff", border:"#bae6fd", dot:"#0ea5e9" },
  { bg:"#f0fdf4", border:"#bbf7d0", dot:"#10b981" },
  { bg:"#fdf2f8", border:"#f9a8d4", dot:"#ec4899" },
];

export default function QuickNotes({ userEmail }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`quicknotes_${userEmail}`);
    if (saved) setNotes(JSON.parse(saved));
  }, [userEmail]);

  const saveNotes = (updated) => {
    localStorage.setItem(`quicknotes_${userEmail}`, JSON.stringify(updated));
    setNotes(updated);
  };

  const handleAdd = () => {
    if (!newNote.trim()) return;
    saveNotes([...notes, { id: Date.now().toString(), text: newNote, colorIdx }]);
    setNewNote("");
    setColorIdx(i => (i + 1) % NOTE_COLORS.length);
  };

  const handleDelete = (id) => saveNotes(notes.filter(n => n.id !== id));

  return (
    <div className="glass-card">
      {/* header */}
      <div style={{ padding:"18px 22px", borderBottom:"1px solid rgba(226,232,240,0.6)",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"Outfit,sans-serif",
          fontSize:15, fontWeight:700, color:"#1e293b" }}>
          <span style={{ padding:6, borderRadius:10, background:"#fef3c7", display:"flex" }}>
            <FiEdit3 size={14} color="#d97706" />
          </span>
          Quick Notes
        </div>
        {notes.length > 0 && (
          <button onClick={() => { if (window.confirm("Delete all notes?")) saveNotes([]); }}
            style={{ fontSize:10, fontWeight:700, color:"#ef4444", background:"none",
              border:"none", cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.06em" }}>
            Clear All
          </button>
        )}
      </div>

      <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:14 }}>
        {/* input */}
        <div style={{ display:"flex", gap:8 }}>
          <input id="note-input" type="text" placeholder="Jot something down…"
            className="input-field" style={{ flex:1 }}
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <motion.button onClick={handleAdd} whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
            style={{ padding:10, background:"linear-gradient(135deg,#f59e0b,#d97706)",
              color:"white", border:"none", borderRadius:12, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 12px rgba(245,158,11,0.35)", flexShrink:0 }}>
            <FiPlus size={17} />
          </motion.button>
        </div>

        {/* color picker */}
        <div style={{ display:"flex", gap:8 }}>
          {NOTE_COLORS.map((c, i) => (
            <button key={i} onClick={() => setColorIdx(i)}
              style={{ width:18, height:18, borderRadius:"50%", background:c.dot, border:"none",
                cursor:"pointer", transition:"transform 0.15s",
                transform: colorIdx === i ? "scale(1.3)" : "scale(1)",
                outline: colorIdx === i ? `2px solid ${c.dot}` : "none",
                outlineOffset: 2 }} />
          ))}
        </div>

        {/* notes list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:220, overflowY:"auto" }}>
          <AnimatePresence>
            {notes.map(note => {
              const c = NOTE_COLORS[note.colorIdx ?? 0];
              return (
                <motion.div key={note.id}
                  initial={{ opacity:0, scale:0.95, y:-4 }}
                  animate={{ opacity:1, scale:1, y:0 }}
                  exit={{ opacity:0, scale:0.9, x:16 }}
                  transition={{ duration:0.2 }}
                  style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                    padding:"10px 12px", borderRadius:12, background:c.bg,
                    border:`1.5px solid ${c.border}`, gap:8 }}
                  className="note-hover-group">
                  <div style={{ display:"flex", alignItems:"flex-start", gap:8, minWidth:0 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:c.dot,
                      marginTop:4, flexShrink:0 }} />
                    <p style={{ fontSize:12, fontWeight:600, color:"#334155", lineHeight:1.5,
                      overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2,
                      WebkitBoxOrient:"vertical" }}>{note.text}</p>
                  </div>
                  <button onClick={() => handleDelete(note.id)}
                    style={{ background:"none", border:"none", cursor:"pointer",
                      color:"#cbd5e1", flexShrink:0, padding:2, borderRadius:6,
                      display:"flex", alignItems:"center", transition:"color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
                    onMouseLeave={e => e.currentTarget.style.color="#cbd5e1"}>
                    <FiTrash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {notes.length === 0 && (
            <div style={{ textAlign:"center", padding:"32px 0",
              border:"2px dashed #e2e8f0", borderRadius:14 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#cbd5e1",
                textTransform:"uppercase", letterSpacing:"0.1em" }}>No notes yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
