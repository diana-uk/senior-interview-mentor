import type { ChatMessage, SystemDesignState, SystemDesignAction, SystemDesignPhase } from '../../types';
import SystemDesignPlanOverview from './SystemDesignPlanOverview';
import ApiContractWorkspace from './ApiContractWorkspace';
import DataModelWorkspace from './DataModelWorkspace';
import PhaseProgressSidebar from './PhaseProgressSidebar';

interface SystemDesignRouterProps {
  sdState: SystemDesignState;
  sdDispatch: React.Dispatch<SystemDesignAction>;
  advancePhase: () => void;
  phaseOrder: SystemDesignPhase[];
  timerSeconds: number;
  // Chat props passed through from App
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  // Text phase fallback elements
  chatPanel: React.ReactNode;
  editorPanel: React.ReactNode;
}

export default function SystemDesignRouter({
  sdState,
  sdDispatch,
  advancePhase,
  phaseOrder,
  timerSeconds,
  messages,
  onSendMessage,
  isStreaming,
  onStopStreaming,
  chatPanel,
  editorPanel,
}: SystemDesignRouterProps) {
  const { currentPhase, phaseStatuses, topicTitle, topicPrompt, endpoints, schema, dbChoice, dbJustification } = sdState;

  function handlePhaseClick(phase: SystemDesignPhase) {
    sdDispatch({ type: 'SET_PHASE', phase });
  }

  function handleStartDesigning() {
    sdDispatch({ type: 'SET_PHASE', phase: 'requirements' });
  }

  // Shared sidebar props
  const sidebarProps = {
    currentPhase,
    phaseStatuses,
    phaseOrder,
    onPhaseClick: handlePhaseClick,
    timerSeconds,
  };

  // Shared mentor props
  const mentorProps = {
    messages,
    onSendMessage,
    isStreaming,
    onStopStreaming,
  };

  switch (currentPhase) {
    case 'overview':
      return (
        <SystemDesignPlanOverview
          topicTitle={topicTitle}
          topicPrompt={topicPrompt}
          phaseStatuses={phaseStatuses}
          onStartDesigning={handleStartDesigning}
          timerSeconds={timerSeconds}
        />
      );

    case 'api':
      return (
        <ApiContractWorkspace
          endpoints={endpoints}
          onUpdateEndpoints={(eps) => sdDispatch({ type: 'UPDATE_ENDPOINTS', endpoints: eps })}
          onAdvancePhase={advancePhase}
          {...sidebarProps}
          {...mentorProps}
        />
      );

    case 'data':
      return (
        <DataModelWorkspace
          schema={schema}
          dbChoice={dbChoice}
          dbJustification={dbJustification}
          onUpdateSchema={(s) => sdDispatch({ type: 'UPDATE_SCHEMA', schema: s })}
          onUpdateDbChoice={(c) => sdDispatch({ type: 'UPDATE_DB_CHOICE', dbChoice: c })}
          onUpdateJustification={(j) => sdDispatch({ type: 'UPDATE_JUSTIFICATION', justification: j })}
          onAdvancePhase={advancePhase}
          {...sidebarProps}
          {...mentorProps}
        />
      );

    // Text-based phases: requirements, architecture, deepdive, scaling
    case 'requirements':
    case 'architecture':
    case 'deepdive':
    case 'scaling':
      return (
        <div className="sd-text-phase">
          <PhaseProgressSidebar {...sidebarProps} />
          <div className="sd-text-phase__workspace">
            {chatPanel}
            {editorPanel}
          </div>
        </div>
      );

    default:
      return null;
  }
}
