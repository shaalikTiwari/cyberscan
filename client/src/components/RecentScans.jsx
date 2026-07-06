import { useEffect, useState } from 'react';

const LABEL_COLORS = {
  LOW:    'text-green-400 bg-green-900/20 border-green-800/40',
  MEDIUM: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/40',
  HIGH:   'text-red-400 bg-red-900/20 border-red-800/40',
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RecentScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/history`);
        const data = await res.json();
        setScans(data.scans || []);
      } catch {
        // silently fail — history is non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) return null;
  if (scans.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="font-mono text-slate-500 text-xs uppercase tracking-widest">Recent Scans</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <div className="space-y-2">
        {scans.map((scan) => (
          <div
            key={scan._id}
            className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-lg px-4 py-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className={`font-mono text-xs px-2 py-0.5 rounded border whitespace-nowrap ${LABEL_COLORS[scan.score?.label] || LABEL_COLORS.HIGH}`}>
                {scan.score?.score ?? '?'} {scan.score?.label}
              </span>
              <span className="font-mono text-slate-300 text-sm truncate">{scan.url}</span>
            </div>
            <div className="flex items-center gap-4 ml-4 shrink-0">
              <span className="font-mono text-slate-600 text-xs hidden sm:block">{scan.duration}</span>
              <span className="font-mono text-slate-600 text-xs">{timeAgo(scan.scannedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}