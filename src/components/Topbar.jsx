// src/components/Topbar.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, Search } from "lucide-react";

export default function Topbar() {
  const { user } = useAuth();
  const [focused, setFocused] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header style={{
      height: 64,
      background: "rgba(255,255,255,0.75)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(226,232,240,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      position: "sticky",
      top: 0,
      zIndex: 20,
      boxShadow: "0 1px 12px rgba(99,102,241,0.06)",
      flexShrink: 0,
    }}>

      {/* Left: greeting + search */}
      <div style={{ display:"flex", alignItems:"center", gap:20, flex:1 }}>
        <div style={{ display:"none" }} className="md-show">
          <p style={{ fontSize:11, fontWeight:600, color:"#94a3b8", lineHeight:1 }}>{greeting},</p>
          <p style={{ fontSize:13, fontWeight:700, color:"#334155", lineHeight:1.3 }}>
            {user?.name?.split(" ")[0] || "Scholar"} 👋
          </p>
        </div>

        {/* search */}
        <div style={{ position:"relative", width: focused ? 300 : 220, transition:"width 0.25s ease" }}>
          <Search style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)",
            color: focused ? "#6366f1" : "#94a3b8", transition:"color 0.2s" }} size={14} />
          <input type="text" placeholder="Search tasks, notes…"
            style={{
              width:"100%", background: focused ? "white" : "#f1f5f9",
              border: focused ? "1.5px solid #818cf8" : "1.5px solid transparent",
              borderRadius:12, padding:"8px 14px 8px 34px",
              fontSize:13, fontWeight:500, outline:"none",
              color:"#1e293b", transition:"all 0.2s",
              boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </div>

      {/* Right: bell + user */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button style={{ position:"relative", padding:8, borderRadius:10, border:"none",
          background:"transparent", cursor:"pointer", color:"#64748b", transition:"all 0.2s",
          display:"flex", alignItems:"center", justifyContent:"center" }}
          onMouseEnter={e => { e.currentTarget.style.background="#f1f5f9"; e.currentTarget.style.color="#6366f1"; }}
          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#64748b"; }}>
          <Bell size={18} />
          <span style={{ position:"absolute", top:6, right:6, width:7, height:7,
            background:"#ef4444", borderRadius:"50%", border:"2px solid white" }} />
        </button>

        <div style={{ width:1, height:24, background:"#e2e8f0" }} />

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#334155", lineHeight:1.2 }}>{user?.name}</p>
            <p style={{ fontSize:10, fontWeight:600, color:"#6366f1" }}>Gold Scholar</p>
          </div>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:"linear-gradient(135deg,#6366f1,#7c3aed)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"white", fontSize:14, fontWeight:700,
            boxShadow:"0 3px 10px rgba(99,102,241,0.35)", cursor:"pointer",
          }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
