import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import './TerminalPage.css';

const BANNER = [
  '  ╔══════════════════════════════════════════════════╗',
  '  ║              AUSTWise NEXUS TERMINAL             ║',
  '  ║         ╔═╗╦ ╦╔═╗╦ ╦╔═╗╦═╗╔═╗                  ║',
  '  ║         ║  ╚╦╝║ ║║ ║║ ║║ ║║ ║                  ║',
  '  ║         ╚═╝ ╩ ╚═╝╚═╝╚═╝╩═╝╚═╝                  ║',
  '  ║                                                  ║',
  '  ║         Welcome to the Nexus Terminal             ║',
  '  ║     Unrestricted access granted.                  ║',
  '  ║                                                  ║',
  '  ╚══════════════════════════════════════════════════╝',
];

const COMMANDS = [
  { cmd: 'help', desc: 'Show available commands' },
  { cmd: 'whoami', desc: 'Display current user info' },
  { cmd: 'nexus', desc: 'Nexus zone - view hidden resources' },
  { cmd: 'clear', desc: 'Clear terminal' },
  { cmd: 'date', desc: 'Show current date & time' },
  { cmd: 'exit', desc: 'Exit terminal' },
];

const NEXUS_ZONE = [
  '',
  '  ╔══════════════════════════════════════════════════╗',
  '  ║              NEXUS ZONE ACCESSED                  ║',
  '  ╚══════════════════════════════════════════════════╝',
  '',
  '  > Decrypting secure payload...',
  '  > Accessing hidden resources...',
  '  > All past papers & solutions unlocked.',
  '  > Senior-exclusive study materials available.',
  '  > Direct line to faculty archives open.',
  '',
  '  Use the navigation menu to access unlocked content.',
  '',
];

export default function TerminalPage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [showRestricted, setShowRestricted] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  const isSenior = hasRole?.('senior');

  useEffect(() => {
    if (!isSenior) {
      setShowRestricted(true);
      return;
    }
    const initLines = [
      '',
      '  Initializing Nexus terminal...',
      '  Verifying credentials...',
      `  Access level: ${user?.name || 'Unknown'} [SENIOR]`,
      '',
      ...BANNER,
      '',
      '  Type "help" for available commands.',
      '',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < initLines.length) {
        setLines((prev) => [...prev, initLines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [isSenior, user]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (!showRestricted) {
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  }, [showRestricted]);

  const processCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    const prompt = `  ── $ ${cmd}`;

    if (!trimmed) {
      setLines((prev) => [...prev, prompt]);
      return;
    }

    const output = [];

    switch (trimmed) {
      case 'help':
        output.push('  Available commands:');
        COMMANDS.forEach(({ cmd: c, desc }) => output.push(`    ${c.padEnd(12)} ${desc}`));
        break;
      case 'whoami':
        output.push(`  Name:         ${user?.name || 'N/A'}`);
        output.push(`  Role:         ${user?.role || 'N/A'}`);
        output.push(`  Department:   ${user?.department || 'N/A'}`);
        output.push(`  Access Level: SENIOR`);
        break;
      case 'nexus':
        NEXUS_ZONE.forEach((l) => output.push(l));
        break;
      case 'date':
        output.push(`  ${new Date().toLocaleString()}`);
        break;
      case 'clear':
        setLines([]);
        return;
      case 'exit':
        navigate(-1);
        return;
      default:
        output.push(`  Command not found: ${cmd}`);
        output.push('  Type "help" to see available commands.');
    }

    setLines((prev) => [...prev, prompt, ...output]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setInput('');
    }
  };

  if (showRestricted) {
    return (
      <div className="access-denied-page">
        <div className="access-denied-card">
          <div className="access-denied-icon-wrap">
            <ShieldAlert size={40} />
          </div>
          <h1 className="access-denied-title">Access Restricted</h1>
          <p className="access-denied-sub">
            This area is for senior students only.
          </p>
          <p className="access-denied-desc">
            You do not have the required access level to enter the Nexus zone.
          </p>
          <button className="access-denied-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nexus-overlay">
      <div className="nexus-terminal">
        <div className="nexus-terminal-header">
          <div className="nexus-terminal-dots">
            <span className="nexus-dot red" onClick={() => navigate(-1)} />
            <span className="nexus-dot yellow" />
            <span className="nexus-dot green" />
          </div>
          <span className="nexus-terminal-title">nexus-terminal — AUSTWise</span>
        </div>
        <div className="nexus-terminal-body" ref={terminalRef}>
          {lines.map((line, i) => (
            <div key={i} className="nexus-line" dangerouslySetInnerHTML={{ __html: line }} />
          ))}
          <div className="nexus-input-line">
            <span className="nexus-prompt">{'  ── $'}</span>
            <input
              ref={inputRef}
              type="text"
              className="nexus-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
