// src/components/UI/CalendarPicker.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX } from "react-icons/fi";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

/**
 * CalendarPicker — premium date picker matching the purple/violet design.
 * Props: value (YYYY-MM-DD string), onChange(dateStr), placeholder
 */
export default function CalendarPicker({ value, onChange, placeholder = "Pick a date" }) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const ref = useRef(null);

  // parse selected date
  const selected = value ? new Date(value + "T00:00:00") : null;

  // close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // sync view to selected date when opening
  useEffect(() => {
    if (open && selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  // prev month tail
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, month: "prev" });
  // current month
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, month: "cur" });
  // next month head
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)
    cells.push({ day: d, month: "next" });

  const selectDay = (cell) => {
    if (cell.month !== "cur") return;
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(cell.day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const isToday = (cell) => {
    if (cell.month !== "cur") return false;
    return cell.day === today.getDate() &&
           viewMonth === today.getMonth() &&
           viewYear  === today.getFullYear();
  };

  const isSelected = (cell) => {
    if (!selected || cell.month !== "cur") return false;
    return cell.day === selected.getDate() &&
           viewMonth === selected.getMonth() &&
           viewYear  === selected.getFullYear();
  };

  const displayValue = selected
    ? selected.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      {/* trigger */}
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "9px 12px", borderRadius: 10, cursor: "pointer",
          border: open ? "1.5px solid #818cf8" : "1.5px solid #e2e8f0",
          background: "white",
          boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
          transition: "all 0.2s", fontFamily: "Inter,sans-serif",
          justifyContent: "space-between",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <FiCalendar size={13} color={open ? "#6366f1" : "#94a3b8"} style={{ transition: "color 0.2s" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: displayValue ? "#334155" : "#94a3b8" }}>
            {displayValue || placeholder}
          </span>
        </div>
        {value && (
          <span onClick={e => { e.stopPropagation(); onChange(""); }}
            style={{ display: "flex", color: "#94a3b8", cursor: "pointer", padding: 2,
              borderRadius: 4, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color="#94a3b8"}>
            <FiX size={12} />
          </span>
        )}
      </button>

      {/* calendar popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: "50%",
              transform: "translateX(-50%)",
              background: "white", borderRadius: 16, zIndex: 300, width: 280,
              border: "1.5px solid #e0e7ff",
              boxShadow: "0 16px 48px rgba(99,102,241,0.18), 0 4px 16px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}>

            {/* header gradient bar */}
            <div style={{
              background: "linear-gradient(135deg,#6366f1,#7c3aed)",
              padding: "14px 16px 12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button type="button" onClick={prevMonth}
                  style={{ width: 28, height: 28, borderRadius: 8, border: "none",
                    background: "rgba(255,255,255,0.15)", color: "white", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}>
                  <FiChevronLeft size={14} />
                </button>

                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "Outfit,sans-serif", fontWeight: 800, fontSize: 15,
                    color: "white", lineHeight: 1 }}>
                    {MONTHS[viewMonth]}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginTop: 2 }}>
                    {viewYear}
                  </p>
                </div>

                <button type="button" onClick={nextMonth}
                  style={{ width: 28, height: 28, borderRadius: 8, border: "none",
                    background: "rgba(255,255,255,0.15)", color: "white", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}>
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>

            <div style={{ padding: "12px 14px 14px" }}>
              {/* day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)",
                marginBottom: 6 }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 800,
                    color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em",
                    padding: "4px 0" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                {cells.map((cell, i) => {
                  const sel  = isSelected(cell);
                  const tod  = isToday(cell);
                  const grey = cell.month !== "cur";
                  return (
                    <motion.button key={i} type="button"
                      onClick={() => selectDay(cell)}
                      whileHover={!grey ? { scale: 1.12 } : {}}
                      whileTap={!grey ? { scale: 0.92 } : {}}
                      style={{
                        width: "100%", aspectRatio: "1", borderRadius: 8, border: "none",
                        cursor: grey ? "default" : "pointer",
                        fontSize: 12, fontWeight: sel ? 800 : tod ? 700 : 500,
                        background: sel
                          ? "linear-gradient(135deg,#6366f1,#7c3aed)"
                          : tod ? "#eef2ff" : "transparent",
                        color: sel ? "white" : grey ? "#d1d5db" : tod ? "#6366f1" : "#334155",
                        boxShadow: sel ? "0 3px 10px rgba(99,102,241,0.35)" : "none",
                        transition: "all 0.15s",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                      {cell.day}
                    </motion.button>
                  );
                })}
              </div>

              {/* footer */}
              <div style={{ display: "flex", justifyContent: "space-between",
                marginTop: 12, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={() => { onChange(""); setOpen(false); }}
                  style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", background: "none",
                    border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 7,
                    transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.color="#ef4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="#94a3b8"; }}>
                  Clear
                </button>
                <button type="button" onClick={() => {
                    const t = new Date();
                    const m = String(t.getMonth()+1).padStart(2,"0");
                    const d = String(t.getDate()).padStart(2,"0");
                    onChange(`${t.getFullYear()}-${m}-${d}`);
                    setOpen(false);
                  }}
                  style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "none",
                    border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 7,
                    transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#eef2ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="none"; }}>
                  Today
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
