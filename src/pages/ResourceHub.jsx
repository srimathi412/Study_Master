// src/pages/ResourceHub.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus, FiLink, FiFileText, FiTrash2, FiSearch,
  FiFolder, FiExternalLink, FiX, FiStar, FiBookOpen,
  FiChevronDown, FiCheck
} from "react-icons/fi";

const TYPES = [
  { id:"link",  label:"Link",  icon:<FiLink size={14}/>,     bg:"#eff6ff", color:"#3b82f6" },
  { id:"note",  label:"Note",  icon:<FiBookOpen size={14}/>, bg:"#fffbeb", color:"#d97706" },
  { id:"pdf",   label:"PDF",   icon:<FiFileText size={14}/>, bg:"#fff1f2", color:"#ef4444" },
  { id:"video", label:"Video", icon:<span style={{fontSize:13}}>🎬</span>, bg:"#f5f3ff", color:"#7c3aed" },
];

const FILTERS = ["All","Links","Notes","PDFs","Videos","Favorites"];

const SUBJECTS = ["General","Math","Physics","Chemistry","Biology","Computer Science","History","English","Economics","Other"];

/* ── add resource modal ─────────────────────────────── */
function AddModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title:"", url:"", type:"link", category:"General", subject:"" });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p => ({ ...p, [k]:v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave({ ...form, id:Date.now().toString(), date:new Date().toISOString(), favorite:false });
    setSaving(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.5)",
        backdropFilter:"blur(8px)", zIndex:60, display:"flex",
        alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.93, y:20 }} animate={{ scale:1, y:0 }}
        exit={{ scale:0.93, y:20 }} transition={{ duration:0.28, ease:[0.22,1,0.36,1] }}
        style={{ background:"white", borderRadius:20, width:"100%", maxWidth:480,
          boxShadow:"0 24px 64px rgba(99,102,241,0.2)", overflow:"hidden" }}>

        <div style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", padding:"20px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontFamily:"Outfit,sans-serif", fontSize:18, fontWeight:800, color:"white" }}>
              Add Resource
            </h2>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>
              Save a study material to your library
            </p>
          </div>
          <button onClick={onClose} style={{ padding:8, borderRadius:10, border:"none",
            background:"rgba(255,255,255,0.15)", cursor:"pointer", color:"white", display:"flex" }}>
            <FiX size={16}/>
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding:"24px" }}>
          {/* type selector */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
              letterSpacing:"0.07em", display:"block", marginBottom:8 }}>Type</label>
            <div style={{ display:"flex", gap:8 }}>
              {TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => set("type", t.id)}
                  style={{ flex:1, padding:"8px 6px", borderRadius:10, border:"none", cursor:"pointer",
                    background: form.type===t.id ? t.bg : "#f8fafc",
                    color: form.type===t.id ? t.color : "#94a3b8",
                    fontWeight:700, fontSize:11, transition:"all 0.15s",
                    border: form.type===t.id ? `1.5px solid ${t.color}44` : "1.5px solid transparent",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* title */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
              letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g., Advanced Calculus Notes" required
              style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                border:"1.5px solid #e2e8f0", fontSize:13, fontWeight:600,
                color:"#1e293b", outline:"none", fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#818cf8"}
              onBlur={e => e.target.style.borderColor="#e2e8f0"} />
          </div>

          {/* url */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
              letterSpacing:"0.07em", display:"block", marginBottom:6 }}>
              {form.type === "note" ? "Note Content" : "URL / Link"}
            </label>
            {form.type === "note" ? (
              <textarea value={form.url} onChange={e => set("url", e.target.value)}
                placeholder="Write your note here…" rows={3}
                style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                  border:"1.5px solid #e2e8f0", fontSize:13, fontWeight:500,
                  color:"#334155", outline:"none", resize:"none",
                  fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
                onFocus={e => e.target.style.borderColor="#818cf8"}
                onBlur={e => e.target.style.borderColor="#e2e8f0"} />
            ) : (
              <input value={form.url} onChange={e => set("url", e.target.value)}
                placeholder="https://…"
                style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                  border:"1.5px solid #e2e8f0", fontSize:13, fontWeight:500,
                  color:"#334155", outline:"none", fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
                onFocus={e => e.target.style.borderColor="#818cf8"}
                onBlur={e => e.target.style.borderColor="#e2e8f0"} />
            )}
          </div>

          {/* subject + category */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
                letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Subject</label>
              <select value={form.subject} onChange={e => set("subject", e.target.value)}
                style={{ width:"100%", padding:"9px 12px", borderRadius:10,
                  border:"1.5px solid #e2e8f0", fontSize:12, fontWeight:600,
                  color:"#334155", outline:"none", background:"white", cursor:"pointer" }}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
                letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Category</label>
              <input value={form.category} onChange={e => set("category", e.target.value)}
                placeholder="e.g., Reference"
                style={{ width:"100%", padding:"9px 12px", borderRadius:10,
                  border:"1.5px solid #e2e8f0", fontSize:12, fontWeight:600,
                  color:"#334155", outline:"none", fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
                onFocus={e => e.target.style.borderColor="#818cf8"}
                onBlur={e => e.target.style.borderColor="#e2e8f0"} />
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button type="button" onClick={onClose}
              style={{ flex:1, padding:"11px", borderRadius:12, border:"1.5px solid #e2e8f0",
                background:"white", color:"#64748b", fontWeight:600, fontSize:13, cursor:"pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex:2, padding:"11px", borderRadius:12, border:"none",
                background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"white",
                fontWeight:700, fontSize:13, cursor:"pointer",
                boxShadow:"0 4px 14px rgba(99,102,241,0.35)",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving
                ? <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)",
                    borderTopColor:"white", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                : <><FiPlus size={14}/> Save Resource</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── resource card ──────────────────────────────────── */
function ResourceCard({ resource, onDelete, onToggleFav }) {
  const t = TYPES.find(t => t.id === resource.type) || TYPES[0];
  return (
    <motion.div layout initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.9 }} whileHover={{ y:-3 }}
      style={{ background:"rgba(255,255,255,0.92)", borderRadius:18,
        border:"1.5px solid rgba(226,232,240,0.8)",
        boxShadow:"0 2px 8px rgba(99,102,241,0.05)",
        transition:"border-color 0.2s, box-shadow 0.2s",
        display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* top accent */}
      <div style={{ height:3, background:`linear-gradient(90deg,${t.color},${t.color}88)` }} />

      <div style={{ padding:"18px 18px 16px", flex:1, display:"flex", flexDirection:"column" }}>
        {/* header row */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ padding:10, borderRadius:12, background:t.bg, color:t.color,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            {t.icon}
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => onToggleFav(resource.id)}
              style={{ padding:6, borderRadius:8, border:"none", cursor:"pointer",
                background: resource.favorite ? "#fef3c7" : "#f8fafc",
                color: resource.favorite ? "#d97706" : "#cbd5e1",
                display:"flex", transition:"all 0.15s" }}
              onMouseEnter={e => { if (!resource.favorite) e.currentTarget.style.color="#d97706"; }}
              onMouseLeave={e => { if (!resource.favorite) e.currentTarget.style.color="#cbd5e1"; }}>
              <FiStar size={13} fill={resource.favorite ? "currentColor" : "none"} />
            </button>
            <button onClick={() => { if (window.confirm("Delete this resource?")) onDelete(resource.id); }}
              style={{ padding:6, borderRadius:8, border:"none", cursor:"pointer",
                background:"#f8fafc", color:"#cbd5e1", display:"flex", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.color="#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.color="#cbd5e1"; }}>
              <FiTrash2 size={13}/>
            </button>
          </div>
        </div>

        <h3 style={{ fontSize:14, fontWeight:700, color:"#1e293b", marginBottom:6,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {resource.title}
        </h3>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:700, color:t.color, background:t.bg,
            padding:"2px 8px", borderRadius:99, textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {resource.type}
          </span>
          {resource.subject && resource.subject !== "General" && (
            <span style={{ fontSize:10, fontWeight:700, color:"#6366f1", background:"#eef2ff",
              padding:"2px 8px", borderRadius:99 }}>
              {resource.subject}
            </span>
          )}
        </div>

        {resource.type === "note" && resource.url && (
          <p style={{ fontSize:12, color:"#64748b", lineHeight:1.5, flex:1,
            overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {resource.url}
          </p>
        )}

        {resource.type !== "note" && resource.url && (
          <p style={{ fontSize:11, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis",
            whiteSpace:"nowrap", flex:1 }}>
            {resource.url}
          </p>
        )}

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginTop:12, paddingTop:10, borderTop:"1px solid #f8fafc" }}>
          <span style={{ fontSize:10, fontWeight:600, color:"#94a3b8" }}>
            {new Date(resource.date).toLocaleDateString(undefined, { month:"short", day:"numeric" })}
          </span>
          {resource.type !== "note" && resource.url && (
            <a href={resource.url.startsWith("http") ? resource.url : `https://${resource.url}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700,
                color:"#6366f1", textDecoration:"none" }}>
              Open <FiExternalLink size={11}/>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── main page ──────────────────────────────────────── */
export default function ResourceHub() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("All");
  const [showAdd, setShowAdd]     = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`resources_${user?.email}`);
    if (saved) setResources(JSON.parse(saved));
  }, [user?.email]);

  const save = (updated) => {
    localStorage.setItem(`resources_${user?.email}`, JSON.stringify(updated));
    setResources(updated);
  };

  const handleAdd    = (r)  => save([...resources, r]);
  const handleDelete = (id) => save(resources.filter(r => r.id !== id));
  const handleFav    = (id) => save(resources.map(r => r.id===id ? { ...r, favorite:!r.favorite } : r));

  const filtered = resources.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) ||
      (r.subject||"").toLowerCase().includes(q) || (r.category||"").toLowerCase().includes(q);
    const matchFilter =
      filter === "All"      ? true :
      filter === "Links"    ? r.type === "link" :
      filter === "Notes"    ? r.type === "note" :
      filter === "PDFs"     ? r.type === "pdf" :
      filter === "Videos"   ? r.type === "video" :
      filter === "Favorites"? r.favorite : true;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display:"flex", flexDirection:"column", gap:24, paddingBottom:48 }}>

        {/* ── HEADER ─────────────────────────────────── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <span style={{ fontSize:11, fontWeight:600, color:"#94a3b8" }}>Workspace</span>
              <span style={{ fontSize:11, color:"#cbd5e1" }}>›</span>
              <span style={{ fontSize:11, fontWeight:700, color:"#6366f1" }}>Resources</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <h1 style={{ fontFamily:"Outfit,sans-serif", fontSize:28, fontWeight:800,
                color:"#1e293b", lineHeight:1 }}>Resource Hub</h1>
              <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:99,
                background:"linear-gradient(135deg,#eef2ff,#ede9fe)", color:"#6366f1",
                border:"1px solid #c7d2fe" }}>{resources.length} saved</span>
            </div>
            <p style={{ fontSize:13, color:"#94a3b8", marginTop:6, fontWeight:500 }}>
              Organize your study materials, notes, and academic resources.
            </p>
          </div>
          <motion.button onClick={() => setShowAdd(true)}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px",
              background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"white",
              fontWeight:700, fontSize:14, borderRadius:13, border:"none", cursor:"pointer",
              boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
            <FiPlus size={16}/> Add Resource
          </motion.button>
        </div>

        {/* ── TOOLBAR ────────────────────────────────── */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ position:"relative" }}>
            <FiSearch style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
              color: searchFocused ? "#6366f1" : "#94a3b8", transition:"color 0.2s" }} size={15}/>
            <input type="text" placeholder="Search by title, subject, or category…"
              value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              style={{ width:"100%", padding:"11px 14px 11px 40px",
                background: searchFocused ? "white" : "rgba(255,255,255,0.8)",
                border: searchFocused ? "1.5px solid #818cf8" : "1.5px solid #e2e8f0",
                borderRadius:13, fontSize:13, fontWeight:500, color:"#1e293b",
                outline:"none", transition:"all 0.2s",
                boxShadow: searchFocused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                fontFamily:"Inter,sans-serif", boxSizing:"border-box" }} />
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {FILTERS.map(f => (
              <motion.button key={f} onClick={() => setFilter(f)}
                whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                style={{ padding:"6px 14px", borderRadius:99, border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:700, transition:"all 0.2s",
                  background: filter===f ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "rgba(255,255,255,0.9)",
                  color: filter===f ? "white" : "#64748b",
                  boxShadow: filter===f ? "0 3px 10px rgba(99,102,241,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
                  border: filter===f ? "1.5px solid transparent" : "1.5px solid #e2e8f0" }}>
                {f}
                {f === "Favorites" && resources.filter(r => r.favorite).length > 0 && (
                  <span style={{ marginLeft:5, fontSize:10, fontWeight:800,
                    background: filter===f ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                    color: filter===f ? "white" : "#64748b",
                    padding:"1px 6px", borderRadius:99 }}>
                    {resources.filter(r => r.favorite).length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── GRID ───────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
            <AnimatePresence>
              {filtered.map(r => (
                <ResourceCard key={r.id} resource={r} onDelete={handleDelete} onToggleFav={handleFav} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            style={{ display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", padding:"72px 24px", gap:20,
              background:"rgba(255,255,255,0.7)", borderRadius:20,
              border:"2px dashed #e0e7ff", textAlign:"center" }}>
            <div style={{ width:72, height:72, borderRadius:20,
              background:"linear-gradient(135deg,#e0e7ff,#ede9fe)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <FiFolder size={28} color="#6366f1"/>
            </div>
            <div>
              <p style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:20,
                color:"#334155", marginBottom:6 }}>No resources yet 📚</p>
              <p style={{ fontSize:14, color:"#94a3b8", maxWidth:300 }}>
                Start building your personal study library.
              </p>
            </div>
            <motion.button onClick={() => setShowAdd(true)}
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 24px",
                background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"white",
                fontWeight:700, fontSize:14, borderRadius:13, border:"none", cursor:"pointer",
                boxShadow:"0 4px 16px rgba(99,102,241,0.35)" }}>
              <FiPlus size={16}/> Add Your First Resource
            </motion.button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && <AddModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
      </AnimatePresence>
    </>
  );
}
