import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemDesignRouter from '../SystemDesignRouter';
import type { SystemDesignState, SystemDesignPhase, PhaseStatus } from '../../../types';

// Child component mocks — each exposes a testid so we can verify routing

vi.mock('../SystemDesignPlanOverview', () => ({
  default: ({ onStartDesigning }: { onStartDesigning: () => void }) => (
    <div data-testid="plan-overview">
      <button type="button" onClick={onStartDesigning}>Start</button>
    </div>
  ),
}));

vi.mock('../ApiContractWorkspace', () => ({
  default: () => <div data-testid="api-workspace" />,
}));

vi.mock('../DataModelWorkspace', () => ({
  default: () => <div data-testid="data-workspace" />,
}));

vi.mock('../ArchitectureWorkspace', () => ({
  default: () => <div data-testid="architecture-workspace" />,
}));

vi.mock('../DeepDiveWorkspace', () => ({
  default: () => <div data-testid="deepdive-workspace" />,
}));

vi.mock('../ScalingWorkspace', () => ({
  default: () => <div data-testid="scaling-workspace" />,
}));

vi.mock('../PhaseProgressSidebar', () => ({
  default: () => <div data-testid="phase-progress-sidebar" />,
}));

const PHASE_ORDER: SystemDesignPhase[] = [
  'overview', 'requirements', 'api', 'data', 'architecture', 'deepdive', 'scaling',
];

function makeStatuses(
  overrides: Partial<Record<SystemDesignPhase, PhaseStatus>> = {},
): Record<SystemDesignPhase, PhaseStatus> {
  return {
    overview: 'completed',
    requirements: 'pending',
    api: 'locked',
    data: 'locked',
    architecture: 'locked',
    deepdive: 'locked',
    scaling: 'locked',
    ...overrides,
  };
}

function makeState(overrides: Partial<SystemDesignState> = {}): SystemDesignState {
  return {
    active: true,
    currentPhase: 'overview',
    phaseStatuses: makeStatuses(),
    topicTitle: 'URL Shortener',
    topicPrompt: 'Design bit.ly',
    endpoints: [],
    schema: '',
    dbChoice: 'sql',
    dbJustification: '',
    diagramNodes: [],
    diagramEdges: [],
    deepDiveChallenges: [],
    scaling: {
      capacity: { dau: '', rps: '', storage: '', bandwidth: '' } as never,
      computeStrategy: 'horizontal',
      computeDetails: '',
      dbReplication: 'primary-replica',
      dbSharding: 'none',
      dbShardKey: '',
      dbDetails: '',
      cachePattern: 'cache-aside',
      evictionPolicy: 'lru',
      cacheTtl: '',
      cacheDetails: '',
      lbAlgorithm: 'round-robin',
      useCdn: false,
      lbDetails: '',
      reliabilityChecks: [],
      metrics: [],
      alertingDetails: '',
    },
    ...overrides,
  };
}

const BASE_PROPS = {
  sdState: makeState(),
  sdDispatch: vi.fn(),
  advancePhase: vi.fn(),
  phaseOrder: PHASE_ORDER,
  timerSeconds: 2700,
  messages: [],
  onSendMessage: vi.fn(),
  isStreaming: false,
  onStopStreaming: vi.fn(),
  chatPanel: <div data-testid="chat-panel" />,
  editorPanel: <div data-testid="editor-panel" />,
};

beforeEach(() => {
  BASE_PROPS.sdDispatch.mockClear();
  BASE_PROPS.advancePhase.mockClear();
  BASE_PROPS.onSendMessage.mockClear();
  BASE_PROPS.onStopStreaming.mockClear();
});

describe('SystemDesignRouter', () => {
  describe('phase routing', () => {
    it('renders SystemDesignPlanOverview for overview phase', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'overview' })} />);
      expect(screen.getByTestId('plan-overview')).toBeDefined();
    });

    it('renders ApiContractWorkspace for api phase', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'api' })} />);
      expect(screen.getByTestId('api-workspace')).toBeDefined();
    });

    it('renders DataModelWorkspace for data phase', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'data' })} />);
      expect(screen.getByTestId('data-workspace')).toBeDefined();
    });

    it('renders ArchitectureWorkspace for architecture phase', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'architecture' })} />);
      expect(screen.getByTestId('architecture-workspace')).toBeDefined();
    });

    it('renders DeepDiveWorkspace for deepdive phase', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'deepdive' })} />);
      expect(screen.getByTestId('deepdive-workspace')).toBeDefined();
    });

    it('renders ScalingWorkspace for scaling phase', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'scaling' })} />);
      expect(screen.getByTestId('scaling-workspace')).toBeDefined();
    });

    it('renders text phase layout for requirements', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'requirements' })} />);
      expect(screen.getByTestId('phase-progress-sidebar')).toBeDefined();
      expect(screen.getByTestId('chat-panel')).toBeDefined();
      expect(screen.getByTestId('editor-panel')).toBeDefined();
    });

    it('renders null for unknown phase', () => {
      const { container } = render(
        <SystemDesignRouter
          {...BASE_PROPS}
          sdState={makeState({ currentPhase: 'unknown' as SystemDesignPhase })}
        />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('overview phase — handleStartDesigning', () => {
    it('clicking Start dispatches SET_PHASE with requirements', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'overview' })} />);
      fireEvent.click(screen.getByText('Start'));
      expect(BASE_PROPS.sdDispatch).toHaveBeenCalledWith({ type: 'SET_PHASE', phase: 'requirements' });
    });
  });

  describe('requirements text phase', () => {
    it('renders within sd-text-phase wrapper', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'requirements' })} />);
      expect(document.querySelector('.sd-text-phase')).not.toBeNull();
    });

    it('renders chatPanel inside workspace area', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'requirements' })} />);
      const workspace = document.querySelector('.sd-text-phase-workspace')!;
      expect(workspace.contains(screen.getByTestId('chat-panel'))).toBe(true);
    });

    it('renders editorPanel inside workspace area', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'requirements' })} />);
      const workspace = document.querySelector('.sd-text-phase-workspace')!;
      expect(workspace.contains(screen.getByTestId('editor-panel'))).toBe(true);
    });
  });

  describe('only one phase rendered at a time', () => {
    it('does not render api-workspace when on overview', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'overview' })} />);
      expect(screen.queryByTestId('api-workspace')).toBeNull();
    });

    it('does not render plan-overview when on api', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'api' })} />);
      expect(screen.queryByTestId('plan-overview')).toBeNull();
    });

    it('does not render data-workspace when on scaling', () => {
      render(<SystemDesignRouter {...BASE_PROPS} sdState={makeState({ currentPhase: 'scaling' })} />);
      expect(screen.queryByTestId('data-workspace')).toBeNull();
    });
  });
});
