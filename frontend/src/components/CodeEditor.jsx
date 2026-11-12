import React from 'react';
import { Terminal, RotateCcw, Copy, Check } from 'lucide-react';

export const CodeEditor = ({
  value,
  onChange,
  language = 'python',
  onReset,
  placeholder = '# Write your technical solution here...\n'
}) => {
  const [copied, setCopied] = React.useState(false);

  const lines = value ? value.split('\n') : [''];
  const lineCount = Math.max(lines.length, 12);

  const handleKeyDown = (e) => {
    // Support Tab indentation inside the code editor
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = '    ';
      const newValue = value.substring(0, start) + spaces + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-medium)',
      background: '#090d16',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
    }}>
      {/* Editor Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: '#0c1322',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          </div>
          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-blue)',
            fontWeight: 600,
            textTransform: 'uppercase',
            marginLeft: '8px'
          }}>
            {language} solution.editor
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            title="Copy Code"
          >
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              title="Reset boilerplate"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Code Area */}
      <div style={{ display: 'flex', minHeight: '300px', maxHeight: '520px', overflowY: 'auto' }}>
        {/* Line Numbers */}
        <div style={{
          padding: '16px 10px 16px 14px',
          background: 'rgba(7, 11, 20, 0.6)',
          borderRight: '1px solid var(--border-subtle)',
          color: '#475569',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          userSelect: 'none',
          textAlign: 'right',
          minWidth: '40px',
        }}>
          {Array.from({ length: lineCount }).map((_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          style={{
            flex: 1,
            padding: '16px',
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.88rem',
            lineHeight: 1.6,
            resize: 'none',
            outline: 'none',
            tabSize: 4,
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflowX: 'auto',
          }}
        />
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '6px 16px',
        background: '#0c1322',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
      }}>
        <span>UTF-8 • Indent: 4 spaces • Press Tab to indent</span>
        <span>{value.length} characters • {lines.length} lines</span>
      </div>
    </div>
  );
};
