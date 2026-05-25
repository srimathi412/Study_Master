// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, BarChart3, User, Settings, Timer, LogOut, FolderOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { to: "/tasks",     icon: <CheckSquare size={18} />,     label: "Tasks"      },
  { to: "/pomodoro",  icon: <Timer size={18} />,           label: "Focus Timer"},
  { to: "/resources", icon: <FolderOpen size={18} />,      label: "Resources"  },
  { to: "/progress",  icon: <BarChart3 size={18} />,       label: "Analytics"  },
  { to: "/profile",   icon: <User size={18} />,            label: "Profile"    },
  { to: "/settings",  icon: <Settings size={18} />,        label: "Settings"   },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: "rgba(255,255,255,0.88)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid rgba(226,232,240,0.8)",
      boxShadow: "4px 0 24px rgba(99,102,241,0.06)",
      zIndex: 30,
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: "24px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg,#6366f1,#7c3aed)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: 18,
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
          }}>S</div>
          <div>
            <div style={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:17, color:"#1e293b", lineHeight:1 }}>
              StudyMaster
            </div>
            <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em" }}>
              Pro
            </div>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding:"8px 20px 6px" }}>
        <p style={{ fontSize:9, fontWeight:800, color:"#cbd5e1", textTransform:"uppercase", letterSpacing:"0.12em" }}>
          Menu
        </p>
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, padding:"0 10px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s ease",
              background: isActive ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "transparent",
              color: isActive ? "white" : "#64748b",
              boxShadow: isActive ? "0 4px 14px rgba(99,102,241,0.3)" : "none",
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.style.background.includes("gradient")) {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.color = "#6366f1";
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.background.includes("gradient")) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#64748b";
              }
            }}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding:"12px 10px", borderTop:"1px solid #f1f5f9" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
          borderRadius:12, background:"#f8fafc", marginBottom:4 }}>
          <div style={{ width:32, height:32, borderRadius:9,
            background:"linear-gradient(135deg,#6366f1,#7c3aed)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"white", fontSize:13, fontWeight:700, flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#334155",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user?.name || "Scholar"}
            </p>
            <p style={{ fontSize:10, color:"#94a3b8", fontWeight:500,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user?.email || ""}
            </p>
          </div>
        </div>
        <button onClick={logout}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
            padding:"9px 14px", borderRadius:12, border:"none", cursor:"pointer",
            background:"transparent", color:"#94a3b8", fontSize:13, fontWeight:600,
            transition:"all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.color="#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#94a3b8"; }}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
