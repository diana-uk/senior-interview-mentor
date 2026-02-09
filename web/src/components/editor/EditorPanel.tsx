import { Play, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import type { EditorTab, TestCase, InterviewStage, SystemDesignTopicId } from '../../types';
import SystemDesignEditor from './SystemDesignEditor';

interface EditorPanelProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  code: string;
  testCode: string;
  notes: string;
  onCodeChange: (code: string) => void;
  onTestCodeChange: (code: string) => void;
  onNotesChange: (notes: string) => void;
  onRunTests: () => void;
  testResults: TestCase[];
  consoleOpen: boolean;
  onToggleConsole: () => void;
  hidden?: boolean;
  interviewStage?: InterviewStage | null;
  systemDesignTopicId?: SystemDesignTopicId | null;
}

const tabs: { id: EditorTab; label: string }[] = [
  { id: 'solution', label: 'Solution' },
  { id: 'tests', label: 'Tests' },
  { id: 'notes', label: 'Notes' },
];

const sdTabs: { id: EditorTab; label: string }[] = [
  { id: 'solution', label: 'Design' },
  { id: 'notes', label: 'Notes' },
];

export default function EditorPanel({
  activeTab,
  onTabChange,
  code,
  testCode,
  notes,
  onCodeChange,
  onTestCodeChange,
  onNotesChange,
  onRunTests,
  testResults,
  consoleOpen,
  onToggleConsole,
  hidden,
  interviewStage,
  systemDesignTopicId,
}: EditorPanelProps) {
  const isSystemDesign = interviewStage === 'system-design';
  const currentTabs = isSystemDesign ? sdTabs : tabs;

  const currentContent =
    activeTab === 'solution' ? code : activeTab === 'tests' ? testCode : notes;
  const currentHandler =
    activeTab === 'solution' ? onCodeChange : activeTab === 'tests' ? onTestCodeChange : onNotesChange;

  const passCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;

  const editorLanguage = activeTab === 'notes' ? 'markdown' : 'typescript';

  return (
    <div className={`panel-editor ${hidden ? 'panel-hidden' : ''}`}>
      <div className="editor-tabs">
        {currentTabs.map((tab) => (
          <button
            key={tab.id}
            className={`editor-tab ${activeTab === tab.id ? 'editor-tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="editor-content">
        {isSystemDesign && activeTab === 'solution' ? (
          <SystemDesignEditor value={code} onChange={onCodeChange} topicId={systemDesignTopicId ?? 'url-shortener'} />
        ) : (
          <Editor
            height="100%"
            language={editorLanguage}
            theme="vs-dark"
            value={currentContent}
            onChange={(value) => currentHandler(value ?? '')}
            options={{
              fontSize: 13,
              fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              tabSize: 2,
              wordWrap: activeTab === 'notes' ? 'on' : 'off',
              renderLineHighlight: 'line',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              bracketPairColorization: { enabled: true },
              autoClosingBrackets: 'always',
              suggestOnTriggerCharacters: true,
            }}
          />
        )}

        {!isSystemDesign && (
          <button className="run-tests-btn" onClick={onRunTests}>
            <Play size={14} />
            Run Tests
          </button>
        )}
      </div>

      {!isSystemDesign && (
        <div className="console-panel" style={{ height: consoleOpen ? 200 : 36 }}>
          <div className="console-header" onClick={onToggleConsole}>
            <span className="console-header__title">
              {consoleOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              Output
              {totalCount > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginLeft: 8 }}>
                  {passCount}/{totalCount} passed
                </span>
              )}
            </span>
          </div>
          {consoleOpen && (
            <div className="console-body">
              {testResults.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, padding: 8 }}>
                  Run tests to see results here.
                </div>
              ) : (
                testResults.map((test, i) => (
                  <div key={i} className="test-result">
                    {test.passed ? (
                      <CheckCircle2 size={14} className="test-result__icon--pass" />
                    ) : (
                      <XCircle size={14} className="test-result__icon--fail" />
                    )}
                    <span className="test-result__label">Test {i + 1}: {test.input}</span>
                    <span className="test-result__expected">
                      {test.passed
                        ? `= ${test.expected}`
                        : `Expected: ${test.expected}${test.actual ? ` | Got: ${test.actual}` : ''}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
