export default function PathsCheck({ data, breakdown }) {
    if (!data) return null;
  
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-lg">📂</span>
            <div>
              <p className="font-mono font-semibold text-white text-sm">Sensitive Path Exposure</p>
              <p className="text-slate-500 text-xs mt-0.5">{data.totalChecked} paths probed</p>
            </div>
          </div>
          <div className={`font-mono text-xs px-3 py-1 rounded-full ${
            data.exposedCount === 0
              ? 'bg-green-900/30 text-green-400 border border-green-800/40'
              : 'bg-red-900/30 text-red-400 border border-red-800/40'
          }`}>
            {data.exposedCount} exposed
          </div>
        </div>
  
        <div className="p-6">
          {breakdown.findings.length > 0 ? (
            <div className="space-y-2">
              {breakdown.findings.map((finding, i) => (
                <div key={i} className="flex items-start justify-between gap-4 bg-slate-800/40 rounded-lg px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-white">{finding.path}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-mono severity-${finding.severity}`}>
                        {finding.severity}
                      </span>
                      <span className="font-mono text-xs text-slate-500">HTTP {finding.status}</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{finding.description}</p>
                    {finding.note && (
                      <p className="text-slate-500 text-xs mt-1 italic">{finding.note}</p>
                    )}
                  </div>
                  <span className="font-mono text-red-400 text-xs whitespace-nowrap">+{finding.points} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-400 font-mono text-sm text-center py-2">No sensitive paths exposed ✓</p>
          )}
        </div>
      </div>
    );
  }