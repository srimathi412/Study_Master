// src/components/MotivationalCard.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw, FiZap } from "react-icons/fi";

const quotes = [
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
];

const tips = [
  "Use the Pomodoro technique — 25 min focus, 5 min break.",
  "Tackle your hardest task first. Eat the frog!",
  "A clean desk = a clear mind. Tidy up before you start.",
  "Teach what you learned to solidify your knowledge.",
  "Stay hydrated — your brain is 75% water.",
  "Review your notes within 24 hours to boost retention.",
  "Break big tasks into smaller, actionable steps.",
];

export default function MotivationalCard() {
  const [idx, setIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    setIdx(Math.floor(Math.random() * quotes.length));
    setTipIdx(Math.floor(Math.random() * tips.length));
  }, []);

  const refresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
    setIdx(i => (i + 1) % quotes.length);
    setTipIdx(i => (i + 1) % tips.length);
  };

  const q = quotes[idx];

  return (
    <div style={{
      borderRadius: 16,
      overflow: "hidden",
      background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 60%, #ec4899 100%)",
      color: "white",
      boxShadow: "0 8px 32px rgba(245,158,11,0.3)",
      position: "relative",
    }}>
      {/* decorative blobs */}
      <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120,
        borderRadius:"50%", background:"rgba(255,255,255,0.1)", filter:"blur(20px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-20, left:-20, width:90, height:90,
        borderRadius:"50%", background:"rgba(255,255,255,0.08)", filter:"blur(16px)", pointerEvents:"none" }} />

      <div style={{ padding:22, position:"relative", zIndex:1 }}>
        {/* header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ padding:8, background:"rgba(255,255,255,0.2)", borderRadius:10,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <FiZap size={15} />
            </div>
            <span style={{ fontSize:10, fontWeight:800, textTransform:"uppercase",
              letterSpacing:"0.1em", color:"rgba(255,255,255,0.85)" }}>Daily Motivation</span>
          </div>
          <motion.button onClick={refresh} whileTap={{ scale:0.9 }}
            animate={{ rotate: spinning ? 360 : 0 }}
            transition={{ duration:0.5 }}
            style={{ padding:7, background:"rgba(255,255,255,0.18)", border:"none",
              borderRadius:9, cursor:"pointer", color:"white", display:"flex",
              alignItems:"center", justifyContent:"center" }}>
            <FiRefreshCw size={13} />
          </motion.button>
        </div>

        {/* quote */}
        <AnimatePresence mode="wait">
          <motion.div key={idx}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            transition={{ duration:0.3 }}>
            <p style={{ fontSize:14, fontWeight:600, lineHeight:1.6, marginBottom:10,
              fontFamily:"Outfit,sans-serif" }}>
              "{q.text}"
            </p>
            <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase",
              letterSpacing:"0.08em", color:"rgba(255,255,255,0.65)" }}>
              — {q.author}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* tip */}
        <div style={{ marginTop:18, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.2)" }}>
          <p style={{ fontSize:9, fontWeight:800, textTransform:"uppercase",
            letterSpacing:"0.1em", color:"rgba(255,255,255,0.55)", marginBottom:8 }}>Study Tip</p>
          <AnimatePresence mode="wait">
            <motion.p key={tipIdx}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.85)",
                lineHeight:1.6, background:"rgba(255,255,255,0.12)",
                padding:"8px 12px", borderRadius:10 }}>
              {tips[tipIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
