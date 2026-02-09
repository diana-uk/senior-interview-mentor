import { ArrowRight } from 'lucide-react';
import type { DbChoice, ChatMessage, SystemDesignPhase, PhaseStatus } from '../../types';
import PhaseProgressSidebar from './PhaseProgressSidebar';
import MentorPanel from './MentorPanel';

interface DataModelWorkspaceProps {
  schema: string;
  dbChoice: DbChoice;
  dbJustification: string;
  onUpdateSchema: (schema: string) => void;
  onUpdateDbChoice: (choice: DbChoice) => void;
  onUpdateJustification: (justification: string) => void;
  onAdvancePhase: () => void;
  // Sidebar props
  currentPhase: SystemDesignPhase;
  phaseStatuses: Record<SystemDesignPhase, PhaseStatus>;
  phaseOrder: SystemDesignPhase[];
  onPhaseClick: (phase: SystemDesignPhase) => void;
  timerSeconds: number;
  // Mentor props
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
}

const DB_OPTIONS: { value: DbChoice; label: string; description: string }[] = [
  { value: 'sql', label: 'SQL (Relational)', description: 'PostgreSQL, MySQL — strong consistency, joins, ACID' },
  { value: 'nosql', label: 'NoSQL (Document/KV)', description: 'MongoDB, DynamoDB, Redis — flexible schema, horizontal scale' },
  { value: 'both', label: 'Polyglot Persistence', description: 'Use multiple databases for different access patterns' },
];

export default function DataModelWorkspace({
  schema,
  dbChoice,
  dbJustification,
  onUpdateSchema,
  onUpdateDbChoice,
  onUpdateJustification,
  onAdvancePhase,
  currentPhase,
  phaseStatuses,
  phaseOrder,
  onPhaseClick,
  timerSeconds,
  messages,
  onSendMessage,
  isStreaming,
  onStopStreaming,
}: DataModelWorkspaceProps) {
  return (
    <div className="sd-data">
      <PhaseProgressSidebar
        currentPhase={currentPhase}
        phaseStatuses={phaseStatuses}
        phaseOrder={phaseOrder}
        onPhaseClick={onPhaseClick}
        timerSeconds={timerSeconds}
      />

      <div className="sd-data__main">
        <div className="sd-data__schema-section">
          <div className="sd-data__section-header">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>database</span>
            <h3>Schema Design</h3>
          </div>
          <p className="sd-data__hint">
            Define your tables/collections, fields, types, and relationships. Use plain text or pseudo-SQL.
          </p>
          <textarea
            className="sd-data__schema-textarea"
            value={schema}
            onChange={(e) => onUpdateSchema(e.target.value)}
            placeholder={`-- Example:\nCREATE TABLE users (\n  id UUID PRIMARY KEY,\n  username VARCHAR(50) UNIQUE NOT NULL,\n  email VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\nCREATE TABLE posts (\n  id UUID PRIMARY KEY,\n  author_id UUID REFERENCES users(id),\n  content TEXT,\n  created_at TIMESTAMP DEFAULT NOW()\n);`}
            spellCheck={false}
          />
        </div>

        <div className="sd-data__db-section">
          <div className="sd-data__section-header">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>storage</span>
            <h3>Database Choice</h3>
          </div>
          <div className="sd-data__db-options">
            {DB_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`sd-data__db-option ${dbChoice === opt.value ? 'sd-data__db-option--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="dbChoice"
                  value={opt.value}
                  checked={dbChoice === opt.value}
                  onChange={() => onUpdateDbChoice(opt.value as DbChoice)}
                  className="sd-data__db-radio"
                />
                <div className="sd-data__db-option-text">
                  <span className="sd-data__db-option-label">{opt.label}</span>
                  <span className="sd-data__db-option-desc">{opt.description}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="sd-data__justification">
            <label className="sd-data__label">Justification</label>
            <textarea
              className="sd-data__justification-textarea"
              value={dbJustification}
              onChange={(e) => onUpdateJustification(e.target.value)}
              placeholder="Why did you choose this database? What tradeoffs are you making?"
              rows={3}
            />
          </div>

          <div className="sd-data__actions">
            <button className="btn btn--primary" onClick={onAdvancePhase}>
              Next Step: Architecture <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <MentorPanel
        messages={messages}
        onSendMessage={onSendMessage}
        isStreaming={isStreaming}
        onStopStreaming={onStopStreaming}
      />
    </div>
  );
}
