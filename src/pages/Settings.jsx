// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell, FiLock, FiSettings,
  FiTarget, FiCheckCircle, FiAlertCircle, FiChevronRight, FiCheck
} from "react-icons/fi";
import { getSettings, saveSettings, updatePassword } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import CustomSelect from "../components/UI/CustomSelect";

const TABS = [
  { id: "general",       label: "General",       icon: <FiSettings size={16} /> },
  { id: "notifications", label: "Notifications", icon: <FiBell size={16} /> },
  { id: "security",      label: "Security",      icon: <FiLock size={16} /> },
];

/* ── toggle component ───────────────────────────────── */
function Toggle({ enabled, onToggle }) {
  return (
    <div onClick={() => onToggle(!enabled)}
      style={{ width:44, height:24, borderRadius:99, position:"relative", cursor:"pointer",
        background: enabled ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "#e2e8f0",
        transition:"background 0.3s", boxShadow: enabled ? "0 2px 8px rgba(99,102,241,0.35)" : "none",
        flexShrink:0 }}>
      <motion.div animate={{ x: enabled ? 20 : 2 }}
        style={{ position:"absolute", top:2, width:20, height:20,
          background:"white", borderRadius:"50%",
          boxShadow:"0 1px 4px rgba(0,0,0,0.15)" }} />
    </div>
  );
}

/* ── settings row ───────────────────────────────────── */
function SettingRow({ icon, title, desc, control, iconBg="#eef2ff", iconColor="#6366f1" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16,
      padding:"14px 16px", borderRadius:14, background:"#f8fafc",
      border:"1.5px solid rgba(226,232,240,0.6)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:11, background:iconBg,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:iconColor, flexShrink:0 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:"#1e293b", lineHeight:1.2 }}>{title}</p>
          <p style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{desc}</p>
        </div>
      </div>
      <div style={{ flexShrink:0 }}>{control}</div>
    </div>
  );
}

/* ── main settings page ─────────────────────────────── */
export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings]   = useState({
    reminders:true, notifications:true, studyGoal:"4 Hours"
  });
  const [pwForm, setPwForm]   = useState({ old:"", next:"", confirm:"" });
  const [pwStatus, setPwStatus] = useState({ type:"", msg:"" });
  const [showPw, setShowPw]   = useState(false);
  const [toast, setToast]     = useState("");

  useEffect(() => {
    if (user) getSettings().then(setSettings).catch(console.error);
  }, [user]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const updateSetting = async (key, value) => {
    const next = { ...settings, [key]:value };
    setSettings(next);
    try { await saveSettings(next); } catch(e) { console.error(e); }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwStatus({ type:"error", msg:"Passwords do not match." }); return; }
    if (pwForm.next.length < 6) { setPwStatus({ type:"error", msg:"Minimum 6 characters." }); return; }
    try {
      await updatePassword(pwForm.old, pwForm.next);
      setPwStatus({ type:"success", msg:"Password updated successfully!" });
      setPwForm({ old:"", next:"", confirm:"" });
      setTimeout(() => { setShowPw(false); setPwStatus({ type:"", msg:"" }); }, 2000);
    } catch(err) { setPwStatus({ type:"error", msg:err.message }); }
  };

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

      <div style={{ maxWidth:860, margin:"0 auto", paddingBottom:48 }}>
        {/* header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
            <span style={{ fontSize:11, fontWeight:600, color:"#94a3b8" }}>Workspace</span>
            <span style={{ fontSize:11, color:"#cbd5e1" }}>›</span>
            <span style={{ fontSize:11, fontWeight:700, color:"#6366f1" }}>Settings</span>
          </div>
          <h1 style={{ fontFamily:"Outfit,sans-serif", fontSize:28, fontWeight:800, color:"#1e293b" }}>
            Settings
          </h1>
        </div>

        <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
          {/* sidebar tabs */}
          <div style={{ width:200, flexShrink:0, display:"flex", flexDirection:"column", gap:4 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
                  borderRadius:12, border:"none", cursor:"pointer", textAlign:"left",
                  fontSize:13, fontWeight:700, transition:"all 0.2s",
                  background: activeTab===tab.id ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "transparent",
                  color: activeTab===tab.id ? "white" : "#64748b",
                  boxShadow: activeTab===tab.id ? "0 4px 14px rgba(99,102,241,0.3)" : "none" }}>
                {tab.icon}
                {tab.label}
                {activeTab!==tab.id && (
                  <FiChevronRight size={13} style={{ marginLeft:"auto", opacity:0.4 }} />
                )}
              </button>
            ))}
          </div>

          {/* content */}
          <div style={{ flex:1, minWidth:280 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-12 }} transition={{ duration:0.2 }}
                style={{ background:"rgba(255,255,255,0.9)", borderRadius:20,
                  border:"1.5px solid rgba(226,232,240,0.8)", padding:"28px 24px",
                  boxShadow:"0 4px 16px rgba(99,102,241,0.06)" }}>

                {/* ── GENERAL ── */}
                {activeTab === "general" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:800,
                      color:"#1e293b", marginBottom:8 }}>General Preferences</h3>
                    <SettingRow icon={<FiTarget size={16}/>} iconBg="#fee2e2" iconColor="#ef4444"
                      title="Daily Study Goal" desc="Set your target focus hours per day"
                      control={
                        <div style={{ width: 140 }}>
                          <CustomSelect
                            value={settings.studyGoal}
                            onChange={v => updateSetting("studyGoal", v)}
                            options={[
                              { value:"2 Hours", label:"2 Hours" },
                              { value:"4 Hours", label:"4 Hours" },
                              { value:"6 Hours", label:"6 Hours" },
                              { value:"8 Hours", label:"8 Hours" },
                            ]}
                            placeholder="4 Hours"
                          />
                        </div>
                      } />
                  </div>
                )}

                {/* ── NOTIFICATIONS ── */}
                {activeTab === "notifications" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:800,
                      color:"#1e293b", marginBottom:8 }}>Notifications</h3>
                    <SettingRow icon={<FiBell size={16}/>} iconBg="#eef2ff" iconColor="#6366f1"
                      title="Push Notifications" desc={`Get alerts for task deadlines (${user?.email})`}
                      control={<Toggle enabled={settings.notifications}
                        onToggle={v => updateSetting("notifications", v)} />} />
                    <SettingRow icon={<span style={{fontSize:16}}>📱</span>} iconBg="#f0fdf4" iconColor="#10b981"
                      title="Sync Across Devices" desc="Keep your data synced everywhere"
                      control={<Toggle enabled={settings.reminders}
                        onToggle={v => updateSetting("reminders", v)} />} />
                  </div>
                )}

                {/* ── SECURITY ── */}
                {activeTab === "security" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <h3 style={{ fontFamily:"Outfit,sans-serif", fontSize:16, fontWeight:800,
                      color:"#1e293b", marginBottom:8 }}>Security</h3>
                    <SettingRow icon={<FiLock size={16}/>} iconBg="#f5f3ff" iconColor="#7c3aed"
                      title="Change Password" desc="Secure your account regularly"
                      control={
                        <button onClick={() => setShowPw(p => !p)}
                          style={{ fontSize:11, fontWeight:700, color:"#6366f1", background:"#eef2ff",
                            border:"none", padding:"5px 12px", borderRadius:8, cursor:"pointer" }}>
                          {showPw ? "Cancel" : "Change"}
                        </button>
                      } />

                    <AnimatePresence>
                      {showPw && (
                        <motion.form initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                          exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}
                          onSubmit={handlePwSubmit}>
                          <div style={{ display:"flex", flexDirection:"column", gap:10,
                            padding:"16px", background:"#f8fafc", borderRadius:14,
                            border:"1.5px solid #e2e8f0" }}>
                            {pwStatus.msg && (
                              <div style={{ padding:"8px 12px", borderRadius:10, fontSize:12, fontWeight:600,
                                background: pwStatus.type==="success" ? "#f0fdf4" : "#fee2e2",
                                color: pwStatus.type==="success" ? "#059669" : "#dc2626",
                                display:"flex", alignItems:"center", gap:6 }}>
                                {pwStatus.type==="success" ? <FiCheckCircle size={12}/> : <FiAlertCircle size={12}/>}
                                {pwStatus.msg}
                              </div>
                            )}
                            {[
                              { key:"old",    label:"Current Password" },
                              { key:"next",   label:"New Password" },
                              { key:"confirm",label:"Confirm Password" },
                            ].map(f => (
                              <div key={f.key}>
                                <label style={{ fontSize:10, fontWeight:700, color:"#94a3b8",
                                  textTransform:"uppercase", letterSpacing:"0.07em",
                                  display:"block", marginBottom:5 }}>{f.label}</label>
                                <input type="password" value={pwForm[f.key]} placeholder="••••••••"
                                  onChange={e => setPwForm(p => ({ ...p, [f.key]:e.target.value }))}
                                  style={{ width:"100%", padding:"9px 12px", borderRadius:10,
                                    border:"1.5px solid #e2e8f0", fontSize:13, outline:"none",
                                    fontFamily:"Inter,sans-serif", boxSizing:"border-box",
                                    background:"white" }}
                                  onFocus={e => e.target.style.borderColor="#818cf8"}
                                  onBlur={e => e.target.style.borderColor="#e2e8f0"} />
                              </div>
                            ))}
                            <button type="submit"
                              style={{ padding:"11px", borderRadius:11, border:"none",
                                background:"linear-gradient(135deg,#1e293b,#334155)", color:"white",
                                fontWeight:700, fontSize:13, cursor:"pointer", marginTop:4 }}>
                              Update Password
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
