import { useEffect, useRef } from 'react';

interface CommandEntry {
  cmd: string;
  description: string;
  group: string;
}

const ALL_COMMANDS: CommandEntry[] = [
  { cmd: '/solve',    description: 'Start solving a problem',          group: 'Navigate' },
  { cmd: '/next',     description: 'Get next recommended problem',     group: 'Navigate' },
  { cmd: '/continue', description: 'Resume last session',              group: 'Navigate' },
  { cmd: '/hint',     description: 'Get next hint',                    group: 'During Solving' },
  { cmd: '/stuck',    description: 'Auto-advance to next hint',        group: 'During Solving' },
  { cmd: '/check',    description: 'Validate your current approach',   group: 'During Solving' },
  { cmd: '/recap',    description: 'Show current session state',       group: 'During Solving' },
  { cmd: '/pattern',  description: 'Pattern drill or explain',         group: 'During Solving' },
  { cmd: '/mistakes', description: 'Track and review weaknesses',      group: 'During Solving' },
  { cmd: '/review',   description: 'Review code with rubric',          group: 'Review' },
  { cmd: '/chat',     description: 'Open Q&A mode',                    group: 'Review' },
];

interface CommandPaletteProps {
  query: string;
  activeIndex: number;
  onSelect: (cmd: string) => void;
  onClose: () => void;
  onActiveChange: (index: number) => void;
}

export function filterCommands(query: string): CommandEntry[] {
  const lower = query.toLowerCase();
  return ALL_COMMANDS.filter((c) => c.cmd.startsWith(lower));
}

export default function CommandPalette({ query, activeIndex, onSelect, onClose, onActiveChange }: CommandPaletteProps) {
  const filtered = filterCommands(query);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll active item into view
  useEffect(() => {
    const el = containerRef.current?.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (filtered.length === 0) return null;

  // Build grouped structure preserving insertion order
  const groups: { name: string; items: (CommandEntry & { globalIndex: number })[] }[] = [];
  let idx = 0;
  for (const cmd of filtered) {
    let group = groups.find((g) => g.name === cmd.group);
    if (!group) {
      group = { name: cmd.group, items: [] };
      groups.push(group);
    }
    group.items.push({ ...cmd, globalIndex: idx++ });
  }

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Command palette"
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        marginBottom: 4,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        zIndex: 'var(--z-popover)',
        maxHeight: 280,
        overflowY: 'auto',
        animation: 'cmdPaletteFadeIn 150ms ease forwards',
      }}
    >
      {groups.map((group) => (
        <div key={group.name}>
          <div
            style={{
              padding: '6px 12px 2px',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}
          >
            {group.name}
          </div>
          {group.items.map(({ cmd, description, globalIndex }) => {
            const isActive = globalIndex === activeIndex;
            return (
              <div
                key={cmd}
                role="option"
                aria-selected={isActive}
                data-index={globalIndex}
                onMouseDown={(e) => { e.preventDefault(); onSelect(cmd); }}
                onMouseEnter={() => onActiveChange(globalIndex)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '7px 12px',
                  cursor: 'pointer',
                  background: isActive ? 'var(--bg-raised)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                  transition: 'background 0.1s',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--neon-cyan)',
                    minWidth: 90,
                  }}
                >
                  {cmd}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {description}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      {/* Keyboard hint */}
      <div style={{
        padding: '4px 12px 6px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 12,
        fontSize: 10,
        color: 'var(--text-muted)',
      }}>
        <span>↑↓ navigate</span>
        <span>↵ insert</span>
        <span>Esc close</span>
      </div>
    </div>
  );
}
