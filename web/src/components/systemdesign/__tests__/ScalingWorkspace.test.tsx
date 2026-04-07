import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ScalingWorkspace from '../ScalingWorkspace';
import type { ScalingState, SystemDesignPhase, PhaseStatus } from '../../../types';

vi.mock('lucide-react', () => ({
  CheckCircle: () => <span data-testid="icon-check-circle" />,
  Flag:        () => <span data-testid="icon-flag" />,
  X:           () => <span data-testid="icon-x" />,
}));

vi.mock('../PhaseProgressSidebar', () => ({
  default: () => <div data-testid="phase-progress-sidebar" />,
}));

vi.mock('../MentorPanel', () => ({
  default: () => <div data-testid="mentor-panel" />,
}));

vi.mock('../scaling/scalingSerializer', () => ({
  serializeScalingPlanToText: vi.fn(() => 'serialized-scaling-plan'),
}));

import { serializeScalingPlanToText } from '../scaling/scalingSerializer';

function makeCapacity(overrides = {}) {
  return {
    readQps: '',
    writeQps: '',
    storageDayGb: '',
    storageGrowthTbYr: '',
    bandwidthMbS: '',
    cacheMemGb: '',
    ...overrides,
  };
}

function makeScaling(overrides: Partial<ScalingState> = {}): ScalingState {
  return {
    capacity: makeCapacity(),
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
    ...overrides,
  };
}

function makeStatuses(
  overrides: Partial<Record<SystemDesignPhase, PhaseStatus>> = {},
): Record<SystemDesignPhase, PhaseStatus> {
  return {
    overview: 'completed', requirements: 'completed', api: 'completed',
    data: 'completed', architecture: 'completed', deepdive: 'completed',
    scaling: 'in-progress',
    ...overrides,
  };
}

const PHASE_ORDER: SystemDesignPhase[] = [
  'overview', 'requirements', 'api', 'data', 'architecture', 'deepdive', 'scaling',
];

const BASE_PROPS = {
  scaling: makeScaling(),
  onUpdateScaling: vi.fn(),
  onAdvancePhase: vi.fn(),
  currentPhase: 'scaling' as SystemDesignPhase,
  phaseStatuses: makeStatuses(),
  phaseOrder: PHASE_ORDER,
  onPhaseClick: vi.fn(),
  timerSeconds: 600,
  messages: [],
  onSendMessage: vi.fn(),
  isStreaming: false,
  onStopStreaming: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onUpdateScaling.mockClear();
  BASE_PROPS.onAdvancePhase.mockClear();
  BASE_PROPS.onPhaseClick.mockClear();
  BASE_PROPS.onSendMessage.mockClear();
  BASE_PROPS.onStopStreaming.mockClear();
  vi.mocked(serializeScalingPlanToText).mockClear();
});

describe('ScalingWorkspace', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<ScalingWorkspace {...BASE_PROPS} />)).not.toThrow();
    });

    it('renders PhaseProgressSidebar', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('phase-progress-sidebar')).toBeDefined();
    });

    it('renders MentorPanel', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('mentor-panel')).toBeDefined();
    });

    it('shows Scaling & Reliability header', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Scaling & Reliability')).toBeDefined();
    });
  });

  describe('section headers', () => {
    const SECTION_TITLES = [
      'Capacity Estimation',
      'Compute Scaling',
      'Database Scaling',
      'Caching',
      'Load Balancing & CDN',
      'Reliability & Monitoring',
    ];

    SECTION_TITLES.forEach((title) => {
      it(`shows ${title} section`, () => {
        render(<ScalingWorkspace {...BASE_PROPS} />);
        expect(screen.getByText(title)).toBeDefined();
      });
    });

    it('capacity section is open by default (aria-expanded=true)', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    });

    it('compute section is open by default', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      expect(headers[1].getAttribute('aria-expanded')).toBe('true');
    });

    it('database section is closed by default', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      expect(headers[2].getAttribute('aria-expanded')).toBe('false');
    });

    it('clicking a closed section opens it', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[2]); // database — initially closed
      expect(headers[2].getAttribute('aria-expanded')).toBe('true');
    });

    it('clicking an open section closes it', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[0]); // capacity — initially open
      expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('capacity fields', () => {
    it('shows Read QPS input', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('10,000')).toBeDefined();
    });

    it('shows Write QPS input', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('1,000')).toBeDefined();
    });

    it('changing Read QPS calls onUpdateScaling with updated capacity', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('10,000'), { target: { value: '5000' } });
      const [updated] = BASE_PROPS.onUpdateScaling.mock.calls[0];
      expect(updated.capacity.readQps).toBe('5000');
    });
  });

  describe('compute section', () => {
    it('shows Horizontal radio checked when computeStrategy=horizontal', () => {
      render(<ScalingWorkspace {...BASE_PROPS} scaling={makeScaling({ computeStrategy: 'horizontal' })} />);
      const radios = document.querySelectorAll('input[name="computeStrategy"]') as NodeListOf<HTMLInputElement>;
      expect(Array.from(radios).find(r => r.closest('label')?.textContent?.includes('Horizontal'))?.checked).toBe(true);
    });

    it('clicking Vertical radio calls onUpdateScaling with computeStrategy=vertical', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const radios = document.querySelectorAll('input[name="computeStrategy"]') as NodeListOf<HTMLInputElement>;
      const vertical = Array.from(radios).find(r => r.closest('label')?.textContent?.includes('Vertical'))!;
      fireEvent.click(vertical);
      const [updated] = BASE_PROPS.onUpdateScaling.mock.calls[0];
      expect(updated.computeStrategy).toBe('vertical');
    });
  });

  describe('database section', () => {
    it('clicking DB section shows replication radio group', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[2]); // open database
      expect(document.querySelectorAll('input[name="dbReplication"]').length).toBeGreaterThan(0);
    });

    it('clicking Hash-based sharding calls onUpdateScaling with dbSharding=hash', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[2]); // open database
      const radios = document.querySelectorAll('input[name="dbSharding"]') as NodeListOf<HTMLInputElement>;
      const hash = Array.from(radios).find(r => r.closest('label')?.textContent?.includes('Hash-based'))!;
      fireEvent.click(hash);
      const [updated] = BASE_PROPS.onUpdateScaling.mock.calls[0];
      expect(updated.dbSharding).toBe('hash');
    });
  });

  describe('caching section', () => {
    it('clicking caching section shows Cache Pattern radio group', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[3]); // open caching
      expect(document.querySelectorAll('input[name="cachePattern"]').length).toBeGreaterThan(0);
    });

    it('Cache-Aside is checked by default', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[3]);
      const radios = document.querySelectorAll('input[name="cachePattern"]') as NodeListOf<HTMLInputElement>;
      const cacheAside = Array.from(radios).find(r => r.closest('label')?.textContent?.includes('Cache-Aside'))!;
      expect(cacheAside.checked).toBe(true);
    });
  });

  describe('load balancing section', () => {
    it('shows CDN checkbox', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[4]); // open LB
      expect(screen.getByText('Use CDN for static assets and edge caching')).toBeDefined();
    });

    it('checking CDN calls onUpdateScaling with useCdn=true', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[4]);
      const cdnCheckbox = document.querySelector('.sd-scaling__cdn-checkbox') as HTMLInputElement;
      fireEvent.click(cdnCheckbox);
      const [updated] = BASE_PROPS.onUpdateScaling.mock.calls[0];
      expect(updated.useCdn).toBe(true);
    });
  });

  describe('reliability section', () => {
    const openReliability = () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[5]); // open reliability
    };

    it('shows Circuit Breakers checkbox', () => {
      openReliability();
      expect(screen.getByText('Circuit Breakers')).toBeDefined();
    });

    it('shows all 6 reliability pattern checkboxes', () => {
      openReliability();
      const labels = ['Circuit Breakers', 'Retries with Exponential Backoff', 'Health Checks', 'Graceful Degradation', 'Rate Limiting', 'Bulkhead Isolation'];
      labels.forEach(l => expect(screen.getByText(l)).toBeDefined());
    });

    it('checking a reliability pattern calls onUpdateScaling with that check', () => {
      openReliability();
      const checkboxes = document.querySelectorAll('.sd-scaling__checkbox') as NodeListOf<HTMLInputElement>;
      fireEvent.click(checkboxes[0]); // circuit-breakers
      const [updated] = BASE_PROPS.onUpdateScaling.mock.calls[0];
      expect(updated.reliabilityChecks).toContain('circuit-breakers');
    });

    it('shows metric suggestion buttons', () => {
      openReliability();
      expect(screen.getByText('P99 latency')).toBeDefined();
      expect(screen.getByText('Error rate')).toBeDefined();
    });

    it('clicking metric suggestion calls onUpdateScaling with that metric', () => {
      openReliability();
      fireEvent.click(screen.getByText('P99 latency'));
      const [updated] = BASE_PROPS.onUpdateScaling.mock.calls[0];
      expect(updated.metrics).toContain('P99 latency');
    });

    it('typing metric and pressing Enter calls onUpdateScaling', () => {
      openReliability();
      const input = screen.getByPlaceholderText('Type a metric and press Enter');
      fireEvent.change(input, { target: { value: 'Custom metric' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      const [updated] = BASE_PROPS.onUpdateScaling.mock.calls[0];
      expect(updated.metrics).toContain('Custom metric');
    });

    it('removing a metric calls onUpdateScaling without that metric', () => {
      render(<ScalingWorkspace {...BASE_PROPS} scaling={makeScaling({ metrics: ['P99 latency', 'Error rate'] })} />);
      const headers = document.querySelectorAll('.sd-scaling__section-header');
      fireEvent.click(headers[5]);
      fireEvent.click(screen.getByRole('button', { name: 'Remove P99 latency' }));
      const [updated] = BASE_PROPS.onUpdateScaling.mock.calls[0];
      expect(updated.metrics).not.toContain('P99 latency');
      expect(updated.metrics).toContain('Error rate');
    });
  });

  describe('action buttons', () => {
    it('shows Review Scaling Plan button', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Review Scaling Plan')).toBeDefined();
    });

    it('clicking Review Scaling Plan calls serializeScalingPlanToText', () => {
      const scaling = makeScaling();
      render(<ScalingWorkspace {...BASE_PROPS} scaling={scaling} />);
      fireEvent.click(screen.getByText('Review Scaling Plan').closest('button')!);
      expect(serializeScalingPlanToText).toHaveBeenCalledWith(scaling);
    });

    it('clicking Review Scaling Plan calls onSendMessage', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Review Scaling Plan').closest('button')!);
      expect(BASE_PROPS.onSendMessage).toHaveBeenCalledWith(
        'Please review my scaling plan:\n\nserialized-scaling-plan',
      );
    });

    it('shows Finish Interview button', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Finish Interview')).toBeDefined();
    });

    it('clicking Finish Interview calls onSendMessage with final review message', () => {
      render(<ScalingWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Finish Interview').closest('button')!);
      expect(BASE_PROPS.onSendMessage).toHaveBeenCalledWith(
        'I have completed all phases. Please provide a final review and scoring of my system design.',
      );
    });
  });
});
