import RecentScans from './components/RecentScans';
import { useState } from 'react';
import ScanForm from './components/ScanForm';
import RiskScore from './components/RiskScore';
import ScanSummary from './components/ScanSummary';
import HeadersCheck from './components/HeadersCheck';
import PathsCheck from './components/PathsCheck';
import SSLCheck from './components/SSLCheck';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  async function handleScan(url) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Scan failed.');
        return;
      }

      setResult(data);
    } catch {
      setError('Could not reach the CyberScan server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <span className="text-blue-400 text-sm">⬡</span>
          </div>
          <span className="font-mono font-bold text-white tracking-tight text-lg">CyberScan</span>
          <span className="text-slate-600 text-sm ml-1">/ web vulnerability scanner</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="font-mono text-blue-400 text-xs tracking-widest uppercase">Security Audit Tool</span>
          </div>
          <h1 className="text-4xl font-semibold text-white mb-3 tracking-tight">
            Scan any URL for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              security vulnerabilities
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
            Checks HTTP security headers, exposed sensitive paths, and SSL certificate health in seconds.
          </p>
        </div>

        {/* Scan Form */}
        <ScanForm onScan={handleScan} loading={loading} />

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-800/40 rounded-lg px-5 py-4 font-mono text-red-400 text-sm flex items-start gap-3">
            <span className="mt-0.5">✗</span>
            <div>
              <p>{error}</p>
              {error.includes('Too many') && (
                <p className="text-red-500/70 text-xs mt-1">Rate limit: 10 scans per 15 minutes per IP.</p>
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              <div className="scan-pulse font-mono text-slate-400 text-sm">
                Running security checks...
              </div>
              <div className="text-slate-600 text-xs font-mono space-y-1 text-left">
                <div>→ Probing HTTP security headers</div>
                <div>→ Checking sensitive paths</div>
                <div>→ Verifying SSL certificate</div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-10 space-y-6">
            {/* Meta info */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-b border-slate-800 pb-4">
              <span>Target: <span className="text-slate-300">{result.url}</span></span>
              <span>Scanned in <span className="text-slate-300">{result.duration}</span></span>
            </div>

            {/* Score + Summary row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <RiskScore score={result.score} />
              </div>
              <div className="md:col-span-2">
                <ScanSummary score={result.score} />
              </div>
            </div>

            {/* Detailed checks */}
            <HeadersCheck data={result.headers} breakdown={result.score.breakdown.headers} />
            <PathsCheck   data={result.paths}   breakdown={result.score.breakdown.paths} />
            <SSLCheck     data={result.ssl}      breakdown={result.score.breakdown.ssl} />
          </div>
        )}
        <RecentScans />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-6 mt-16">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs font-mono text-slate-600">
          <span>CyberScan — built by Shaalik Tiwari</span>
        </div>
      </footer>
    </div>
  );
}