const STAT_CONFIG = [
    { key: 'totalHeadersMissing', label: 'Headers Missing', icon: '⚠', warnIf: (v) => v > 0 },
    { key: 'totalPathsExposed',   label: 'Paths Exposed',   icon: '📂', warnIf: (v) => v > 0 },
    { key: 'sslIssues',           label: 'SSL Issues',      icon: '🔒', warnIf: (v) => v > 0 },
  ];
  
  export default function ScanSummary({ score }) {
    const { summary, breakdown } = score;
  
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 h-full">
        <p className="font-mono text-slate-400 text-xs uppercase tracking-widest mb-5">Summary</p>
  
        <div className="space-y-4">
          {STAT_CONFIG.map(({ key, label, icon, warnIf }) => {
            const value = summary[key];
            const hasIssue = warnIf(value);
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className="text-slate-300 text-sm">{label}</span>
                </div>
                <span className={`font-mono font-semibold text-sm px-3 py-0.5 rounded-full ${
                  hasIssue
                    ? 'bg-red-900/30 text-red-400 border border-red-800/40'
                    : 'bg-green-900/30 text-green-400 border border-green-800/40'
                }`}>
                  {value}
                </span>
              </div>
            );
          })}
        </div>
  
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
          <p className="font-mono text-slate-500 text-xs uppercase tracking-widest mb-3">Points breakdown</p>
          {[
            { label: 'Headers', pts: breakdown.headers.points },
            { label: 'Paths',   pts: breakdown.paths.points },
            { label: 'SSL',     pts: breakdown.ssl.points },
          ].map(({ label, pts }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-slate-500 text-xs font-mono w-16">{label}</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((pts / 60) * 100, 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs text-slate-400 w-8 text-right">+{pts}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }