// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks, updatePassword } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail, FiAward, FiStar, FiZap, FiTrendingUp,
  FiEdit2, FiX, FiCheck, FiBookOpen, FiTarget,
  FiCheckCircle, FiLock, FiAlertCircle
} from "react-icons/fi";

/* ── badge definitions ─────────────────────────────── */
const BADGES = [
  { id:"starter",   icon:"🎯", label:"Starter",       desc:"Complete your first task",    req: c => c >= 1  },
  { id:"learner",   icon:"⚡", label:"Fast Learner",   desc:"Complete 5 tasks",            req: c => c >= 5  },
  { id:"scholar",   icon:"⭐", label:"Top Scholar",    desc:"Complete 10 tasks",           req: c => c >= 10 },
  { id:"growth",    icon:"📈", label:"Growth Mindset", desc:"Complete 20 tasks",           req: c => c >= 20 },
  { id:"master",    icon:"🏆", label:"Task Master",    desc:"Complete 50 tasks",           req: c => c >= 50 },
  { id:"legend",    icon:"👑", label:"Legend",         desc:"Complete 100 tasks",          req: c => c >= 100},
];

/* ── edit profile modal ────────────────────────────── */
function EditModal({ user, onClose, onSave }) {
  const [name, setName]   = useState(user?.name || "");
  const [bio, setBio]     = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ ...user, name, bio });
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
        style={{ background:"white", borderRadius:20, width:"100%", maxWidth:460,
          boxShadow:"0 24px 64px rgba(99,102,241,0.2)", overflow:"hidden" }}>

        <div style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", padding:"20px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontFamily:"Outfit,sans-serif", fontSize:18, fontWeight:800, color:"white" }}>
              Edit Profile
            </h2>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>Update your personal information</p>
          </div>
          <button onClick={onClose} style={{ padding:8, borderRadius:10, border:"none",
            background:"rgba(255,255,255,0.15)", cursor:"pointer", color:"white", display:"flex" }}>
            <FiX size={16} />
          </button>
        </div>

        <div style={{ padding:"24px" }}>
          {/* avatar initial */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
            <div style={{ width:72, height:72, borderRadius:20,
              background:"linear-gradient(135deg,#6366f1,#7c3aed)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:28, fontWeight:800, color:"white",
              boxShadow:"0 8px 24px rgba(99,102,241,0.35)" }}>
              {name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
              letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                border:"1.5px solid #e2e8f0", fontSize:14, fontWeight:600,
                color:"#1e293b", outline:"none", fontFamily:"Inter,sans-serif",
                boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#818cf8"}
              onBlur={e => e.target.style.borderColor="#e2e8f0"} />
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
              letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Email</label>
            <input value={user?.email || ""} disabled
              style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                border:"1.5px solid #f1f5f9", fontSize:13, fontWeight:500,
                color:"#94a3b8", background:"#f8fafc", outline:"none",
                fontFamily:"Inter,sans-serif", boxSizing:"border-box" }} />
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
              letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Tell us about yourself…" rows={3}
              style={{ width:"100%", padding:"11px 14px", borderRadius:12,
                border:"1.5px solid #e2e8f0", fontSize:13, fontWeight:500,
                color:"#334155", outline:"none", resize:"none",
                fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor="#818cf8"}
              onBlur={e => e.target.style.borderColor="#e2e8f0"} />
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose}
              style={{ flex:1, padding:"11px", borderRadius:12, border:"1.5px solid #e2e8f0",
                background:"white", color:"#64748b", fontWeight:600, fontSize:13, cursor:"pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex:2, padding:"11px", borderRadius:12, border:"none",
                background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"white",
                fontWeight:700, fontSize:13, cursor:"pointer",
                boxShadow:"0 4px 14px rgba(99,102,241,0.35)",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving
                ? <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)",
                    borderTopColor:"white", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                : <><FiCheck size={14}/> Save Changes</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── main profile page ─────────────────────────────── */
export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm]     = useState({ old:"", next:"", confirm:"" });
  const [pwStatus, setPwStatus] = useState({ type:"", msg:"" });
  const [toast, setToast]       = useState("");

  useEffect(() => {
    if (user) getTasks().then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSaveProfile = async (updated) => {
    await updateProfile(updated);
    showToast("Profile updated successfully!");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwStatus({ type:"error", msg:"Passwords don't match." }); return; }
    if (pwForm.next.length < 6) { setPwStatus({ type:"error", msg:"Minimum 6 characters." }); return; }
    try {
      await updatePassword(pwForm.old, pwForm.next);
      setPwStatus({ type:"success", msg:"Password updated!" });
      setPwForm({ old:"", next:"", confirm:"" });
      setTimeout(() => { setShowPwForm(false); setPwStatus({ type:"", msg:"" }); }, 2000);
    } catch(err) { setPwStatus({ type:"error", msg: err.message }); }
  };

  const completed  = tasks.filter(t => t.completed).length;
  const total      = tasks.length;
  const progress   = total === 0 ? 0 : Math.round((completed / total) * 100);
  const level      = Math.floor(completed / 5) + 1;
  const streak     = parseInt(localStorage.getItem(`study_streak_${user?.email}`) || localStorage.getItem("study_streak") || "0");
  const unlockedBadges = BADGES.filter(b => b.req(completed));

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

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
            style={{ position:"fixed", top:20, right:20, zIndex:100,
              background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"white",
              padding:"12px 20px", borderRadius:12, fontSize:13, fontWeight:700,
              boxShadow:"0 8px 24px rgba(99,102,241,0.35)", display:"flex", alignItems:"center", gap:8 }}>
            <FiCheck size={14}/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth:900, margin:"0 auto", paddingBottom:48 }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          style={{ display:"flex", flexDirection:"column", gap:24 }}>

          {/* ── PROFILE HEADER ─────────────────────────── */}
          <div style={{ borderRadius:24, overflow:"hidden",
            boxShadow:"0 8px 32px rgba(99,102,241,0.15)" }}>
            {/* banner */}
            <div style={{ height:140, background:"linear-gradient(135deg,#4338ca,#6d28d9,#7c3aed,#6366f1)",
              backgroundSize:"300% 300%", animation:"gradientShift 8s ease infinite",
              position:"relative", overflow:"hidden" }}>
              <div className="float-blob" style={{ position:"absolute", top:-30, right:-30, width:160, height:160,
                borderRadius:"50%", background:"rgba(255,255,255,0.08)", filter:"blur(30px)" }} />
              <div className="float-blob2" style={{ position:"absolute", bottom:-20, left:"30%", width:120, height:120,
                borderRadius:"50%", background:"rgba(255,255,255,0.06)", filter:"blur(20px)" }} />
            </div>

            {/* avatar + info row */}
            <div style={{ background:"white", padding:"0 28px 24px", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between",
                flexWrap:"wrap", gap:12 }}>
                {/* avatar */}
                <div style={{ marginTop:-44, position:"relative", zIndex:2 }}>
                  <div style={{ width:88, height:88, borderRadius:22,
                    background:"linear-gradient(135deg,#6366f1,#7c3aed)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:32, fontWeight:800, color:"white",
                    border:"4px solid white",
                    boxShadow:"0 8px 24px rgba(99,102,241,0.35)" }}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  {/* level badge */}
                  <div style={{ position:"absolute", bottom:-6, right:-6, width:26, height:26,
                    background:"linear-gradient(135deg,#f59e0b,#d97706)", borderRadius:"50%",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:800, color:"white", border:"2px solid white",
                    boxShadow:"0 2px 8px rgba(245,158,11,0.4)" }}>
                    {level}
                  </div>
                </div>

                {/* name + meta */}
                <div style={{ flex:1, minWidth:200, paddingTop:16 }}>
                  <h1 style={{ fontFamily:"Outfit,sans-serif", fontSize:24, fontWeight:800,
                    color:"#1e293b", lineHeight:1.1, marginBottom:4 }}>
                    {user?.name}
                  </h1>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12,
                      color:"#64748b", fontWeight:500 }}>
                      <FiMail size={12} color="#6366f1" /> {user?.email}
                    </span>
                    <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12,
                      color:"#6366f1", fontWeight:700, background:"#eef2ff",
                      padding:"2px 10px", borderRadius:99 }}>
                      <FiStar size={10}/> Level {level} Scholar
                    </span>
                  </div>
                  {user?.bio && (
                    <p style={{ fontSize:13, color:"#64748b", marginTop:8, lineHeight:1.5 }}>
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* edit button */}
                <motion.button onClick={() => setShowEdit(true)}
                  whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px",
                    background:"linear-gradient(135deg,#6366f1,#7c3aed)", color:"white",
                    fontWeight:700, fontSize:13, borderRadius:12, border:"none", cursor:"pointer",
                    boxShadow:"0 4px 14px rgba(99,102,241,0.3)", marginTop:16 }}>
                  <FiEdit2 size={14}/> Edit Profile
                </motion.button>
              </div>
            </div>
          </div>

          {/* ── STATS ROW ───────────────────────────────── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14 }}>
            {[
              { icon:"✅", label:"Tasks Done",    val:completed,  color:"#10b981", bg:"#f0fdf4" },
              { icon:"📋", label:"Total Tasks",   val:total,      color:"#6366f1", bg:"#eef2ff" },
              { icon:"📊", label:"Progress",      val:`${progress}%`, color:"#7c3aed", bg:"#f5f3ff" },
              { icon:"🔥", label:"Day Streak",    val:streak,     color:"#f59e0b", bg:"#fffbeb" },
              { icon:"🏅", label:"Badges Earned", val:unlockedBadges.length, color:"#ec4899", bg:"#fdf2f8" },
            ].map(s => (
              <motion.div key={s.label} whileHover={{ y:-3 }}
                style={{ background:"rgba(255,255,255,0.9)", borderRadius:16,
                  border:"1.5px solid rgba(226,232,240,0.8)", padding:"18px 16px",
                  boxShadow:"0 2px 8px rgba(0,0,0,0.04)", textAlign:"center",
                  transition:"all 0.2s" }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                <p style={{ fontSize:22, fontWeight:800, fontFamily:"Outfit,sans-serif",
                  color:s.color, lineHeight:1 }}>{s.val}</p>
                <p style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase",
                  letterSpacing:"0.07em", marginTop:4 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ── BADGES + ABOUT ──────────────────────────── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}
            className="lg-grid">

            {/* badges */}
            <div style={{ background:"rgba(255,255,255,0.9)", borderRadius:20,
              border:"1.5px solid rgba(226,232,240,0.8)", padding:"24px",
              boxShadow:"0 4px 16px rgba(99,102,241,0.06)" }}>
              <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:800,
                color:"#1e293b", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ padding:6, borderRadius:10, background:"#fef3c7", fontSize:14 }}>🏆</span>
                Achievements
              </h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {BADGES.map(b => {
                  const unlocked = b.req(completed);
                  return (
                    <motion.div key={b.id} whileHover={{ scale: unlocked ? 1.06 : 1 }}
                      title={b.desc}
                      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                        padding:"12px 8px", borderRadius:14,
                        background: unlocked ? "linear-gradient(135deg,#eef2ff,#f5f3ff)" : "#f8fafc",
                        border: unlocked ? "1.5px solid #c7d2fe" : "1.5px solid #f1f5f9",
                        opacity: unlocked ? 1 : 0.45,
                        filter: unlocked ? "none" : "grayscale(1)",
                        cursor:"default", transition:"all 0.2s" }}>
                      <span style={{ fontSize:24 }}>{b.icon}</span>
                      <span style={{ fontSize:9, fontWeight:800, color: unlocked ? "#6366f1" : "#94a3b8",
                        textTransform:"uppercase", letterSpacing:"0.06em", textAlign:"center",
                        lineHeight:1.3 }}>{b.label}</span>
                      {unlocked && (
                        <span style={{ width:6, height:6, borderRadius:"50%",
                          background:"#6366f1", boxShadow:"0 0 6px rgba(99,102,241,0.6)" }} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <p style={{ fontSize:11, color:"#94a3b8", marginTop:16, textAlign:"center" }}>
                {unlockedBadges.length}/{BADGES.length} badges unlocked
              </p>
            </div>

            {/* about + security */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* about */}
              <div style={{ background:"rgba(255,255,255,0.9)", borderRadius:20,
                border:"1.5px solid rgba(226,232,240,0.8)", padding:"24px",
                boxShadow:"0 4px 16px rgba(99,102,241,0.06)" }}>
                <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:800,
                  color:"#1e293b", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ padding:6, borderRadius:10, background:"#e0e7ff", fontSize:14 }}>👤</span>
                  About
                </h3>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                    background:"#f8fafc", borderRadius:12 }}>
                    <FiMail size={14} color="#6366f1" />
                    <span style={{ fontSize:13, fontWeight:600, color:"#334155" }}>{user?.email}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                    background:"#f8fafc", borderRadius:12 }}>
                    <FiBookOpen size={14} color="#7c3aed" />
                    <span style={{ fontSize:13, fontWeight:600, color:"#334155" }}>
                      {user?.bio || "No bio yet — click Edit Profile to add one."}
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                    background:"#f8fafc", borderRadius:12 }}>
                    <FiTarget size={14} color="#10b981" />
                    <span style={{ fontSize:13, fontWeight:600, color:"#334155" }}>
                      {completed} tasks completed · Level {level}
                    </span>
                  </div>
                </div>
              </div>

              {/* security */}
              <div style={{ background:"rgba(255,255,255,0.9)", borderRadius:20,
                border:"1.5px solid rgba(226,232,240,0.8)", padding:"24px",
                boxShadow:"0 4px 16px rgba(99,102,241,0.06)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:800,
                    color:"#1e293b", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ padding:6, borderRadius:10, background:"#fee2e2", fontSize:14 }}>🔒</span>
                    Security
                  </h3>
                  <button onClick={() => setShowPwForm(p => !p)}
                    style={{ fontSize:11, fontWeight:700, color:"#6366f1", background:"#eef2ff",
                      border:"none", padding:"5px 12px", borderRadius:8, cursor:"pointer" }}>
                    {showPwForm ? "Cancel" : "Change Password"}
                  </button>
                </div>

                <AnimatePresence>
                  {showPwForm && (
                    <motion.form initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                      exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}
                      onSubmit={handlePasswordChange}>
                      <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:4 }}>
                        {pwStatus.msg && (
                          <div style={{ padding:"8px 12px", borderRadius:10, fontSize:12, fontWeight:600,
                            background: pwStatus.type==="success" ? "#f0fdf4" : "#fee2e2",
                            color: pwStatus.type==="success" ? "#059669" : "#dc2626",
                            display:"flex", alignItems:"center", gap:6 }}>
                            {pwStatus.type==="success" ? <FiCheck size={12}/> : <FiAlertCircle size={12}/>}
                            {pwStatus.msg}
                          </div>
                        )}
                        {[
                          { key:"old",     label:"Current Password",  val:pwForm.old },
                          { key:"next",    label:"New Password",       val:pwForm.next },
                          { key:"confirm", label:"Confirm Password",   val:pwForm.confirm },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8",
                              textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:4 }}>
                              {f.label}
                            </label>
                            <input type="password" value={f.val} placeholder="••••••••"
                              onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                              style={{ width:"100%", padding:"9px 12px", borderRadius:10,
                                border:"1.5px solid #e2e8f0", fontSize:13, outline:"none",
                                fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
                              onFocus={e => e.target.style.borderColor="#818cf8"}
                              onBlur={e => e.target.style.borderColor="#e2e8f0"} />
                          </div>
                        ))}
                        <button type="submit"
                          style={{ padding:"10px", borderRadius:11, border:"none",
                            background:"linear-gradient(135deg,#1e293b,#334155)", color:"white",
                            fontWeight:700, fontSize:13, cursor:"pointer", marginTop:4 }}>
                          Update Password
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </motion.div>
      </div>

      <AnimatePresence>
        {showEdit && (
          <EditModal user={user} onClose={() => setShowEdit(false)} onSave={handleSaveProfile} />
        )}
      </AnimatePresence>
    </>
  );
}
