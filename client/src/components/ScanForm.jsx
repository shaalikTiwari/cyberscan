import { useState } from 'react';

export default function ScanForm({ onScan, loading }) {
  const [url, setUrl] = useState('');

  function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onScan(trimmed);
  }

  return (
    <div className="w-full border border-blue-500/40 rounded-lg bg-[#0d1117] p-4">
      <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-3">Target URL</p>
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="https://example.com"
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
          style={{ 
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '14px',
            width: '100%',
            pointerEvents: 'all',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !url.trim()}
          style={{
            background: url.trim() && !loading ? '#2563eb' : '#1e3a5f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 20px',
            fontFamily: 'monospace',
            fontSize: '13px',
            cursor: url.trim() && !loading ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
            opacity: url.trim() && !loading ? 1 : 0.5,
          }}
        >
          {loading ? 'Scanning...' : 'Run Scan →'}
        </button>
      </div>
    </div>
  );
}