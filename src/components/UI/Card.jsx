// src/components/UI/Card.jsx
import React from 'react';

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`glass-card overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={`px-8 py-6 border-b border-white/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-xl font-['Outfit'] font-bold text-slate-800 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div
      className={`px-8 py-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`px-8 py-6 bg-white/30 border-t border-white/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
