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
  onSendMessage?: (message: string) => void;
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
  onSendMessage,
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
    <div className={`editor-panel ${hidden ? 'panel-hidden' : ''}`}>
      <div className="editor-header">
        <div className="editor-tabs">
          {currentTabs.map((tab) => (
            <button
              key={tab.id}
              className={`editor-tab ${activeTab === tab.id ? 'editor-tab-active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="editor-actions">
          {!isSystemDesign && (
            <button className="btn btn-primary btn-sm" onClick={onRunTests}>
              <Play size={14} />
              Run Tests
            </button>
          )}
        </div>
      </div>

      <div className="editor-content">
        {isSystemDesign && activeTab === 'solution' ? (
          <SystemDesignEditor
            value={code}
            onChange={onCodeChange}
            topicId={systemDesignTopicId ?? 'url-shortener'}
            onSubmitSection={onSendMessage ? (title, content) => {
              onSendMessage(`**${title}:**\n\n${content}\n\nPlease review my ${title.toLowerCase()} section and provide feedback.`);
            } : undefined}
          />
        ) : (
          <Editor
            height="100%"
            language={editorLanguage}
            theme="vs-dark"
            value={currentContent}
            onChange={(value) => currentHandler(value ?? '')}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
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
      </div>

      {!isSystemDesign && (
        <div className="editor-console" style={{ height: consoleOpen ? 200 : 36 }}>
          <div className="editor-console-header" onClick={onToggleConsole}>
            <span className="editor-console-title">
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
            <div className="editor-console-content">
              {testResults.length === 0 ? (
                <div className="empty-state" style={{ padding: '16px' }}>
                  <div className="empty-state-description">Run tests to see results here.</div>
                </div>
              ) : (
                testResults.map((test, i) => (
                  <div key={i} className={`test-result ${test.passed ? 'test-result-pass' : 'test-result-fail'} test-result-enter`}>
                    <div className="test-result-icon">
                      {test.passed ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                    </div>
                    <div className="test-result-content">
                      <div className="test-result-input">Test {i + 1}: {test.input}</div>
                      <div className="test-result-output">
                        <span className="test-result-expected">
                          <span className="test-result-label">Expected: </span>{test.expected}
                        </span>
                        {!test.passed && test.actual && (
                          <span className="test-result-actual">
                            <span className="test-result-label">Got: </span>{test.actual}
                          </span>
                        )}
                      </div>
                    </div>
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
