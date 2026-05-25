// src/components/UI/CustomSelect.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCheck } from "react-icons/fi";

/**
 * CustomSelect — premium dropdown matching the purple/violet design system.
 * Props:
 *   value, onChange, options: [{ value, label, color?, bg? }]
 *   placeholder, label, icon
 */
export default function CustomSelect({ value, onChange, options, placeholder = "Select…", icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      {/* trigger */}
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 8, padding: "9px 12px", borderRadius: 10, cursor: "pointer",
          border: open ? "1.5px solid #818cf8" : "1.5px solid #e2e8f0",
          background: selected?.bg || "white",
          boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
          transition: "all 0.2s", fontFamily: "Inter,sans-serif",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {icon && <span style={{ color: "#6366f1", display: "flex" }}>{icon}</span>}
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: selected ? (selected.color || "#334155") : "#94a3b8",
          }}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          style={{ display: "flex", color: "#94a3b8" }}>
          <FiChevronDown size={13} />
        </motion.span>
      </button>

      {/* dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
              background: "white", borderRadius: 12, zIndex: 200,
              border: "1.5px solid #e0e7ff",
              boxShadow: "0 8px 32px rgba(99,102,241,0.15), 0 2px 8px rgba(0,0,0,0.06)",
              overflow: "hidden", maxHeight: 220, overflowY: "auto",
            }}>
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <motion.button key={opt.value} type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  whileHover={{ background: "#f5f3ff" }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 8,
                    padding: "9px 14px", border: "none", cursor: "pointer", textAlign: "left",
                    background: isSelected ? "#eef2ff" : "white",
                    borderBottom: i < options.length - 1 ? "1px solid #f8fafc" : "none",
                    transition: "background 0.15s", fontFamily: "Inter,sans-serif",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {opt.dot && (
                      <span style={{ width: 8, height: 8, borderRadius: "50%",
                        background: opt.dot, flexShrink: 0 }} />
                    )}
                    <span style={{
                      fontSize: 12, fontWeight: isSelected ? 700 : 500,
                      color: opt.color || (isSelected ? "#6366f1" : "#334155"),
                    }}>
                      {opt.label}
                    </span>
                  </div>
                  {isSelected && <FiCheck size={13} color="#6366f1" strokeWidth={3} />}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
