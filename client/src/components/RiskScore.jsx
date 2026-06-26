import { useEffect, useState } from 'react';

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const COLOR_MAP = {
  LOW:    { stroke: '#22c55e', text: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20' },
  MEDIUM: { stroke: '#eab308', text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  HIGH:   { stroke: '#ef4444', text: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20' },
};

export default function RiskScore({ score }) {
  const [animated, setAnimated] = useState(0);
  const { score: value, label } = score;
  const colors = COLOR_MAP[label] || COLOR_MAP.HIGH;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-6 flex flex-col items-center justify-center h-full`}>
      <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-4">Risk Score</p>

      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />
          {/* Fill */}
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-bold text-3xl ${colors.text}`}>{value}</span>
          <span className="font-mono text-slate-500 text-xs">/100</span>
        </div>
      </div>

      <div className={`mt-4 font-mono font-bold text-sm tracking-widest px-4 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
        {label} RISK
      </div>
    </div>
  );
}