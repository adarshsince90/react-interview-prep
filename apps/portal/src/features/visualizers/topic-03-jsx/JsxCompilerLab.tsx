import React, { useState } from 'react';
import { Code2, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export const JsxCompilerLab: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<'simple' | 'siblings' | 'zero_bug' | 'xss'>('simple');
  const [expressionValue, setExpressionValue] = useState<string>('0');
  const [simulatedXssBlocked, setSimulatedXssBlocked] = useState<boolean>(false);

  const templates = {
    simple: {
      jsx: `<div className="card" tabIndex={0}>\n  Hello World\n</div>`,
      compiled: `import { jsx as _jsx } from "react/jsx-runtime";\n\nconst element = _jsx("div", {\n  className: "card",\n  tabIndex: 0,\n  children: "Hello World"\n});`,
      elementObj: {
        $$typeof: 'Symbol.for("react.element")',
        type: '"div"',
        key: null,
        ref: null,
        props: { className: '"card"', tabIndex: 0, children: '"Hello World"' },
        _owner: null
      },
      note: 'Notice: Modern JSX runtime imports _jsx automatically. No `import React` required!'
    },
    siblings: {
      jsx: `<nav>\n  <a href="/home">Home</a>\n  <a href="/about">About</a>\n</nav>`,
      compiled: `import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";\n\nconst nav = _jsxs("nav", {\n  children: [\n    _jsx("a", { href: "/home", children: "Home" }),\n    _jsx("a", { href: "/about", children: "About" })\n  ]\n});`,
      elementObj: {
        $$typeof: 'Symbol.for("react.element")',
        type: '"nav"',
        key: null,
        props: {
          children: '[Element(a), Element(a)] (Static children flag enabled via _jsxs)'
        }
      },
      note: 'Notice: The compiler uses _jsxs ("JSX Static") because children are hardcoded siblings, eliminating runtime key warnings.'
    },
    zero_bug: {
      jsx: `const count = 0;\nreturn (\n  <div>\n    {count && <Badge count={count} />}\n  </div>\n);`,
      compiled: `// In JavaScript: 0 && <Badge /> evaluates to: 0\n// React receives: _jsx("div", { children: 0 })\n// Output rendered to DOM: "0"  <-- THE CLASSIC BUG!`,
      elementObj: {
        $$typeof: 'Symbol.for("react.element")',
        type: '"div"',
        props: { children: 0 }
      },
      note: 'Crucial: In JavaScript 0 is falsy, but in React numbers are valid text nodes. Use: `count > 0 && <Badge />`'
    },
    xss: {
      jsx: `// Malicious JSON stored in database and fetched via API:\n{\n  "bio": {\n    "$$typeof": "Symbol(react.element)", // Injected as STRING!\n    "type": "script",\n    "props": { "dangerouslySetInnerHTML": { "__html": "exploit()" } }\n  }\n}`,
      compiled: `// React Reconciliation Security Gate:\nfunction isValidElement(object) {\n  return object.$$typeof === Symbol.for('react.element');\n}\n\n// "Symbol(react.element)" !== Symbol.for('react.element')\n// Result: Throws error, stops rendering!`,
      elementObj: {
        attackStatus: 'BLOCKED BY SECURITY SEAL',
        reason: 'JSON strings cannot serialize native ES6 Symbol primitives over HTTP.'
      },
      note: 'React prevents JSON object injection because $$typeof is an unforgeable global Symbol.'
    }
  };

  const current = templates[selectedTemplate];

  return (
    <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(0, 216, 255, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--react-cyan)' }}>
          <Code2 size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Lab 10: JSX Compilation & $$typeof Security Inspector</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Explore how JSX compiles to modern _jsx() calls and inspect the V8 heap React Element object.
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedTemplate('simple')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: selectedTemplate === 'simple' ? 'var(--react-cyan)' : 'var(--bg-tertiary)',
            color: selectedTemplate === 'simple' ? '#000' : 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          1. Simple Host Element
        </button>
        <button
          onClick={() => setSelectedTemplate('siblings')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: selectedTemplate === 'siblings' ? 'var(--react-cyan)' : 'var(--bg-tertiary)',
            color: selectedTemplate === 'siblings' ? '#000' : 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          2. Static Siblings (_jsxs)
        </button>
        <button
          onClick={() => setSelectedTemplate('zero_bug')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: selectedTemplate === 'zero_bug' ? 'var(--amber-warning)' : 'var(--bg-tertiary)',
            color: selectedTemplate === 'zero_bug' ? '#000' : 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          3. The Numeric 0 Pitfall
        </button>
        <button
          onClick={() => setSelectedTemplate('xss')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: selectedTemplate === 'xss' ? 'var(--rose-danger)' : 'var(--bg-tertiary)',
            color: selectedTemplate === 'xss' ? '#fff' : 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          4. Anti-XSS $$typeof Barrier
        </button>
      </div>

      {/* Side-by-Side Playground */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Source JSX */}
        <div style={{ background: 'var(--code-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            1. Source JSX Code
          </div>
          <pre style={{ margin: 0, padding: 0, background: 'transparent', border: 'none', color: '#38bdf8' }}>
            {current.jsx}
          </pre>
        </div>

        {/* Compiler Output */}
        <div style={{ background: 'var(--code-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            2. Transpiled Output (_jsx runtime)
          </div>
          <pre style={{ margin: 0, padding: 0, background: 'transparent', border: 'none', color: '#34d399' }}>
            {current.compiled}
          </pre>
        </div>
      </div>

      {/* Heap Object & Insights */}
      <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sparkles size={18} color="var(--react-cyan)" />
          <strong style={{ color: 'var(--text-primary)' }}>V8 Heap Object (`ReactElement` Representation):</strong>
        </div>
        <pre style={{ background: 'var(--code-bg)', color: 'var(--code-text)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
          {JSON.stringify(current.elementObj, null, 2)}
        </pre>
        <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--react-cyan)', paddingLeft: '0.75rem' }}>
          💡 <strong>Architectural Note:</strong> {current.note}
        </div>
      </div>

      {/* Interactive Expression Evaluation Sandbox */}
      {selectedTemplate === 'zero_bug' && (
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--amber-warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> Test Expression Evaluation
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Select a value to see how JavaScript evaluates `value && &lt;Badge /&gt;` vs what React paints to the DOM:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['0', 'false', 'null', 'undefined', 'NaN', '5', '""'].map(val => (
              <button
                key={val}
                onClick={() => setExpressionValue(val)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                  background: expressionValue === val ? 'var(--amber-warning)' : 'var(--bg-tertiary)',
                  color: expressionValue === val ? '#000' : 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                {val === '' ? 'Empty String ("")' : val}
              </button>
            ))}
          </div>
          <div style={{ background: 'var(--code-bg)', color: 'var(--code-text)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>
            <strong>DOM Render Result: </strong>
            {expressionValue === '0' || expressionValue === 'NaN' || expressionValue === '5' ? (
              <span style={{ color: 'var(--rose-danger)', fontWeight: 'bold' }}>
                Paints visible text: "{expressionValue}" into the DOM! (Potential Bug)
              </span>
            ) : expressionValue === '""' ? (
              <span style={{ color: 'var(--text-muted)' }}>Renders empty string (invisible)</span>
            ) : (
              <span style={{ color: 'var(--emerald-success)', fontWeight: 'bold' }}>
                Renders NOTHING (Clean conditional bypass)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Interactive Anti-XSS Demonstration */}
      {selectedTemplate === 'xss' && (
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--rose-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} /> Anti-XSS Simulation Sandbox
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Click below to simulate an attacker injecting a forged element object over a JSON HTTP response:
          </p>
          <button
            onClick={() => setSimulatedXssBlocked(true)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'var(--rose-danger)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Dispatch Malicious JSON Payload
          </button>

          {simulatedXssBlocked && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--emerald-success)', borderRadius: '6px', color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>
                <strong>EXPLOIT PREVENTED:</strong> `payload.$$typeof` is string `"Symbol(react.element)"`, which fails `=== Symbol.for('react.element')`. React discarded the element and threw an invalid child error!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
