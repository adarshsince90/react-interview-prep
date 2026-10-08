import React, { useState } from 'react';
import { 
  Network, 
  Terminal, 
  Play, 
  RotateCcw, 
  Clock, 
  Layers 
} from 'lucide-react';

interface FlightChunk {
  id: string;
  type: 'MODULE' | 'JSX_TREE' | 'SUSPENSE_PLACEHOLDER' | 'RESOLVED_ASYNC';
  rawLine: string;
  description: string;
  parsedMeaning: string;
}

export const RscFlightLab: React.FC = () => {
  const flightChunks: FlightChunk[] = [
    {
      id: 'chunk-1',
      type: 'MODULE',
      rawLine: 'M1:{"id":"./src/components/LikeButton.client.js","chunks":["client-chunk-48.js"],"name":"LikeButton"}',
      description: 'Client Reference Manifest Entry',
      parsedMeaning: 'Tells browser runtime: Component M1 is a client island located in client-chunk-48.js. Bundle only download this interactive island!'
    },
    {
      id: 'chunk-2',
      type: 'JSX_TREE',
      rawLine: 'J0:["$","div",null,{"className":"article-view","children":[["$","h1",null,{"children":"RSC Internals"}],["$","$L1",null,{"initialLikes":42}],["$","$S2",null,{}]]}]',
      description: 'Initial Server Component Virtual DOM Shell',
      parsedMeaning: 'Streamed instant shell! Contains static HTML (h1), a Client Island reference ($L1 pointing to LikeButton), and a Suspense boundary slot ($S2).'
    },
    {
      id: 'chunk-3',
      type: 'SUSPENSE_PLACEHOLDER',
      rawLine: 'S2:{"fallback":["$","div",null,{"className":"spinner","children":"Loading database comments..."}]}',
      description: 'Suspense Fallback Directive',
      parsedMeaning: 'Browser immediately mounts the spinner fallback into slot $S2 while the server continues awaiting slow database queries asynchronously.'
    },
    {
      id: 'chunk-4',
      type: 'RESOLVED_ASYNC',
      rawLine: '2:["$","section",null,{"className":"comments","children":[["$","p",null,{"children":"Alice: Brilliant breakdown of Flight protocol!"}],["$","p",null,{"children":"Bob: Fiber + Flight makes complete sense now."}]]}]',
      description: 'Resolved Async Chunk (Pushed via Stream)',
      parsedMeaning: 'Database query finished! Server streams resolved chunk 2 to swap the fallback spinner with real comments in-place without page refresh or client re-rendering.'
    }
  ];

  const [streamIndex, setStreamIndex] = useState<number>(0);
  const [likes, setLikes] = useState<number>(42);

  const handleNextChunk = () => {
    if (streamIndex < flightChunks.length) {
      setStreamIndex(prev => prev + 1);
    }
  };

  const handleStreamAll = () => {
    setStreamIndex(flightChunks.length);
  };

  const handleReset = () => {
    setStreamIndex(0);
    setLikes(42);
  };

  const streamedChunks = flightChunks.slice(0, streamIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Network style={{ color: 'var(--react-cyan)' }} size={20} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              React Server Components (RSC) Flight Wire Format Stream Parser
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Inspect raw <code>M:</code>, <code>J:</code>, and <code>S:</code> Flight protocol chunks and observe progressive browser hydration.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleNextChunk}
            disabled={streamIndex >= flightChunks.length}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: streamIndex >= flightChunks.length ? 'var(--bg-tertiary)' : 'var(--react-cyan)',
              color: streamIndex >= flightChunks.length ? 'var(--text-muted)' : '#000',
              fontWeight: 700,
              border: 'none',
              cursor: streamIndex >= flightChunks.length ? 'not-allowed' : 'pointer'
            }}
          >
            <Play size={16} /> Stream Next Chunk ({streamIndex}/{flightChunks.length})
          </button>

          <button
            onClick={handleStreamAll}
            disabled={streamIndex >= flightChunks.length}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: streamIndex >= flightChunks.length ? 'not-allowed' : 'pointer'
            }}
          >
            Stream All
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '0.5rem 0.8rem',
              borderRadius: '6px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: Raw Wire Stream vs Reconstructed UI */}
      <div className="responsive-split-grid">
        
        {/* Left Column: Raw Wire Stream Terminal */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Terminal style={{ color: 'var(--react-cyan)' }} size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              HTTP/2 Response Body (application/octet-stream / text/x-component)
            </span>
          </div>

          <div style={{
            flex: 1,
            minHeight: '340px',
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            padding: '1rem',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflowY: 'auto'
          }}>
            {streamedChunks.length > 0 ? (
              streamedChunks.map(chunk => (
                <div key={chunk.id} style={{
                  background: 'var(--bg-secondary)',
                  borderLeft: `4px solid ${
                    chunk.type === 'MODULE' ? '#c084fc' :
                    chunk.type === 'JSX_TREE' ? 'var(--react-cyan)' :
                    chunk.type === 'SUSPENSE_PLACEHOLDER' ? '#f59e0b' : '#10b981'
                  }`,
                  padding: '0.6rem 0.75rem',
                  borderRadius: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      color: chunk.type === 'MODULE' ? '#c084fc' :
                             chunk.type === 'JSX_TREE' ? 'var(--react-cyan)' :
                             chunk.type === 'SUSPENSE_PLACEHOLDER' ? '#f59e0b' : '#10b981'
                    }}>
                      [{chunk.type}] - {chunk.description}
                    </span>
                  </div>
                  <div style={{ wordBreak: 'break-all', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    {chunk.rawLine}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    💡 {chunk.parsedMeaning}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                Flight stream pending connection...<br />Click <strong>"Stream Next Chunk"</strong> to begin.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Progressive Client DOM Reconstruction */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Layers style={{ color: 'var(--react-cyan)' }} size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Client Browser DOM Rehydration State
            </span>
          </div>

          <div style={{
            flex: 1,
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {streamIndex === 0 && (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Clock size={28} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                <div>Waiting for first Flight chunk from Server...</div>
              </div>
            )}

            {streamIndex >= 1 && streamIndex < 2 && (
              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                color: '#c084fc'
              }}>
                ✓ Client manifest received. Registered <code>LikeButton</code> Client Reference.
              </div>
            )}

            {streamIndex >= 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Static Server Rendered Title */}
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    RSC Internals: Architecture & Wire Protocol
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--emerald-success, #10b981)' }}>
                    ● Server Component (Zero JavaScript bundle shipped)
                  </span>
                </div>

                {/* Client Component Island */}
                <div style={{
                  background: 'rgba(0, 216, 255, 0.08)',
                  border: '1px solid var(--react-cyan)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Interactive Client Island ($L1)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Likes Counter: {likes}
                    </div>
                  </div>
                  <button
                    onClick={() => setLikes(l => l + 1)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      background: 'var(--react-cyan)',
                      color: '#000',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    👍 Like (+1)
                  </button>
                </div>

                {/* Suspense Slot */}
                {streamIndex < 4 ? (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px dashed #f59e0b',
                    borderRadius: '6px',
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#f59e0b',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ animation: 'pulse 1.5s infinite', fontWeight: 600 }}>
                      ⏳ Suspense Fallback ($S2): Loading comments from PostgreSQL database...
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid var(--emerald-success, #10b981)',
                    borderRadius: '6px',
                    padding: '0.85rem'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      💬 Streamed Comments (Chunk 2 Resolved):
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <li>Alice: Brilliant breakdown of Flight protocol!</li>
                      <li>Bob: Fiber + Flight makes complete sense now.</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
