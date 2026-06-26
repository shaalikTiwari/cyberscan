export default function SSLCheck({ data, breakdown }) {
    if (!data) return null;
  
    const cert = data.cert;
  
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <p className="font-mono font-semibold text-white text-sm">SSL / TLS Certificate</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {data.isHttps ? 'HTTPS enabled' : 'No HTTPS detected'}
              </p>
            </div>
          </div>
          <div className={`font-mono text-xs px-3 py-1 rounded-full ${
            breakdown.findings.length === 0
              ? 'bg-green-900/30 text-green-400 border border-green-800/40'
              : 'bg-red-900/30 text-red-400 border border-red-800/40'
          }`}>
            {breakdown.findings.length === 0 ? 'Healthy' : `${breakdown.findings.length} issue${breakdown.findings.length > 1 ? 's' : ''}`}
          </div>
        </div>
  
        <div className="p-6 space-y-4">
          {/* Issues */}
          {breakdown.findings.length > 0 && (
            <div className="space-y-2">
              {breakdown.findings.map((finding, i) => (
                <div key={i} className="flex items-start justify-between gap-4 bg-slate-800/40 rounded-lg px-4 py-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-white">{finding.issue}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-mono severity-${finding.severity}`}>
                        {finding.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{finding.description}</p>
                  </div>
                  <span className="font-mono text-red-400 text-xs whitespace-nowrap">+{finding.points} pts</span>
                </div>
              ))}
            </div>
          )}
  
          {/* Cert details */}
          {cert?.success && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: 'Issued To',   value: cert.subject?.CN || '—' },
                { label: 'Issuer',      value: cert.issuer?.CN  || '—' },
                { label: 'Valid From',  value: new Date(cert.validFrom).toLocaleDateString() },
                { label: 'Expires',     value: new Date(cert.validTo).toLocaleDateString() },
                { label: 'Days Left',   value: cert.isExpired ? `Expired ${Math.abs(cert.daysLeft)}d ago` : `${cert.daysLeft} days` },
                { label: 'Trusted CA',  value: cert.isAuthorized ? 'Yes ✓' : 'No ✗' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-800/40 rounded-lg px-4 py-3">
                  <p className="font-mono text-slate-500 text-xs uppercase tracking-wide mb-1">{label}</p>
                  <p className="font-mono text-slate-200 text-sm truncate">{value}</p>
                </div>
              ))}
            </div>
          )}
  
          {/* HTTP redirect status */}
          <div className="flex items-center gap-3 bg-slate-800/40 rounded-lg px-4 py-3">
            <span className={`w-2 h-2 rounded-full ${data.httpRedirectsToHttps ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="font-mono text-slate-300 text-xs">
              HTTP → HTTPS redirect: {data.httpRedirectsToHttps ? 'Enabled ✓' : 'Not configured'}
            </span>
          </div>
  
          {breakdown.findings.length === 0 && (
            <p className="text-green-400 font-mono text-sm text-center py-1">SSL configuration is healthy ✓</p>
          )}
        </div>
      </div>
    );
  }