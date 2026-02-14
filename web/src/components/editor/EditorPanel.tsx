import { useState } from 'react';
import { Play, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import Editor, { type BeforeMount } from '@monaco-editor/react';
import type { EditorTab, TestCase, ConsoleMessage, InterviewStage, SystemDesignTopicId } from '../../types';
import SystemDesignEditor from './SystemDesignEditor';

export type CodeLanguage = 'typescript' | 'javascript' | 'python';

// Configure Monaco to be more lenient with TypeScript
const handleEditorWillMount: BeforeMount = (monaco) => {
  // Disable TypeScript diagnostics (no red squiggly lines)
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false, // Keep syntax validation for obvious errors
  });

  // Set compiler options for better standalone experience
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowJs: true,
    strict: false,
  });

  // Configure JavaScript defaults too
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: false,
  });
};

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
  runningTests?: boolean;
  testResults: TestCase[];
  consoleLogs: ConsoleMessage[];
  consoleOpen: boolean;
  onToggleConsole: () => void;
  hidden?: boolean;
  problemId?: string;
  interviewStage?: InterviewStage | null;
  systemDesignTopicId?: SystemDesignTopicId | null;
  onSendMessage?: (message: string) => void;
  onLanguageChange?: (language: CodeLanguage) => void;
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
  runningTests,
  testResults,
  consoleLogs,
  consoleOpen,
  onToggleConsole,
  hidden,
  problemId,
  interviewStage,
  systemDesignTopicId,
  onSendMessage,
  onLanguageChange,
}: EditorPanelProps) {
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('typescript');
  const [outputTab, setOutputTab] = useState<'tests' | 'console'>('tests');

  const handleLanguageChange = (newLang: CodeLanguage) => {
    if (newLang === codeLanguage) return;
    setCodeLanguage(newLang);
    // Notify parent — it handles language state and starter code loading
    onLanguageChange?.(newLang);
  };

  const isSystemDesign = interviewStage === 'system-design';
  const currentTabs = isSystemDesign ? sdTabs : tabs;

  const currentContent =
    activeTab === 'solution' ? code : activeTab === 'tests' ? testCode : notes;
  const currentHandler =
    activeTab === 'solution' ? onCodeChange : activeTab === 'tests' ? onTestCodeChange : onNotesChange;

  const passCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;

  const editorLanguage = activeTab === 'notes' ? 'markdown' : codeLanguage;
  const ext = codeLanguage === 'python' ? 'py' : codeLanguage === 'typescript' ? 'ts' : 'js';
  const pid = problemId ?? 'default';
  const editorPath = activeTab === 'notes' ? `${pid}-notes.md` : `${pid}-${activeTab}.${ext}`;

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
          {!isSystemDesign && activeTab !== 'notes' && (
            <select
              className="language-select"
              value={codeLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as CodeLanguage)}
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          )}
          {!isSystemDesign && (
            <button className="btn btn-primary btn-sm" onClick={onRunTests} disabled={runningTests}>
              <Play size={14} />
              {runningTests ? 'Running...' : 'Run Tests'}
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
            key={pid}
            height="100%"
            path={editorPath}
            language={editorLanguage}
            theme="vs-dark"
            value={currentContent}
            onChange={(value) => currentHandler(value ?? '')}
            beforeMount={handleEditorWillMount}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              tabSize: codeLanguage === 'python' ? 4 : 2,
              wordWrap: activeTab === 'notes' ? 'on' : 'off',
              renderLineHighlight: 'line',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              bracketPairColorization: { enabled: true },
              autoClosingBrackets: 'always',
              suggestOnTriggerCharacters: true,
              fixedOverflowWidgets: true,
            }}
          />
        )}
      </div>

      {!isSystemDesign && (
        <div className="editor-console" style={{ height: consoleOpen ? 200 : 36 }}>
          <div className="editor-console-header">
            <span className="editor-console-title" onClick={onToggleConsole} style={{ cursor: 'pointer' }}>
              {consoleOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              Output
              {outputTab === 'tests' && totalCount > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginLeft: 8 }}>
                  {passCount}/{totalCount} passed
                </span>
              )}
              {outputTab === 'console' && consoleLogs.length > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginLeft: 8 }}>
                  {consoleLogs.length} {consoleLogs.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </span>
            {consoleOpen && (
              <div className="output-tabs">
                <button
                  className={`output-tab ${outputTab === 'tests' ? 'output-tab-active' : ''}`}
                  onClick={() => setOutputTab('tests')}
                >
                  Tests
                </button>
                <button
                  className={`output-tab ${outputTab === 'console' ? 'output-tab-active' : ''}`}
                  onClick={() => setOutputTab('console')}
                >
                  Console
                  {consoleLogs.length > 0 && (
                    <span className="output-tab-badge">{consoleLogs.length}</span>
                  )}
                </button>
              </div>
            )}
          </div>
          {consoleOpen && (
            <div className="editor-console-content">
              {outputTab === 'tests' ? (
                testResults.length === 0 ? (
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
                )
              ) : (
                consoleLogs.length === 0 ? (
                  <div className="empty-state" style={{ padding: '16px' }}>
                    <div className="empty-state-description">
                      Add console.log() to your code and run tests to see output here.
                    </div>
                  </div>
                ) : (
                  consoleLogs.map((log, i) => (
                    <div key={i} className={`console-entry console-entry-${log.type}`}>
                      <span className="console-entry-prefix">
                        {log.type === 'error' ? '✕' : log.type === 'warn' ? '⚠' : log.type === 'info' ? 'ℹ' : '›'}
                      </span>
                      <pre className="console-entry-message">{log.message}</pre>
                    </div>
                  ))
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
