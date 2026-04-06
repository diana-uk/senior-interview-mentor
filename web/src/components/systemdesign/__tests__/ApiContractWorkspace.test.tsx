import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApiContractWorkspace from '../ApiContractWorkspace';
import type { Endpoint, SystemDesignPhase, PhaseStatus } from '../../../types';

vi.mock('lucide-react', () => ({
  Plus:        () => <span data-testid="icon-plus" />,
  Trash2:      () => <span data-testid="icon-trash" />,
  ArrowRight:  () => <span data-testid="icon-arrow-right" />,
  Zap:         () => <span data-testid="icon-zap" />,
  CheckCircle: () => <span data-testid="icon-check-circle" />,
}));

vi.mock('../PhaseProgressSidebar', () => ({
  default: () => <div data-testid="phase-progress-sidebar" />,
}));

vi.mock('../MentorPanel', () => ({
  default: () => <div data-testid="mentor-panel" />,
}));

vi.mock('../api/endpointSerializer', () => ({
  serializeEndpointsToText: vi.fn(() => 'serialized-api'),
}));

import { serializeEndpointsToText } from '../api/endpointSerializer';

function makeEndpoint(overrides: Partial<Endpoint> = {}): Endpoint {
  return {
    id: 'ep1',
    method: 'GET',
    path: '/api/v1/users',
    description: 'Get users',
    requestBody: '{}',
    responseBody: '{"users":[]}',
    ...overrides,
  };
}

function makeStatuses(
  overrides: Partial<Record<SystemDesignPhase, PhaseStatus>> = {},
): Record<SystemDesignPhase, PhaseStatus> {
  return {
    overview: 'completed',
    requirements: 'completed',
    api: 'in-progress',
    data: 'locked',
    architecture: 'locked',
    deepdive: 'locked',
    scaling: 'locked',
    ...overrides,
  };
}

const PHASE_ORDER: SystemDesignPhase[] = [
  'overview', 'requirements', 'api', 'data', 'architecture', 'deepdive', 'scaling',
];

const BASE_PROPS = {
  endpoints: [] as Endpoint[],
  onUpdateEndpoints: vi.fn(),
  onAdvancePhase: vi.fn(),
  currentPhase: 'api' as SystemDesignPhase,
  phaseStatuses: makeStatuses(),
  phaseOrder: PHASE_ORDER,
  onPhaseClick: vi.fn(),
  timerSeconds: 1800,
  messages: [],
  onSendMessage: vi.fn(),
  isStreaming: false,
  onStopStreaming: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onUpdateEndpoints.mockClear();
  BASE_PROPS.onAdvancePhase.mockClear();
  BASE_PROPS.onPhaseClick.mockClear();
  BASE_PROPS.onSendMessage.mockClear();
  BASE_PROPS.onStopStreaming.mockClear();
  vi.mocked(serializeEndpointsToText).mockClear();
});

describe('ApiContractWorkspace', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<ApiContractWorkspace {...BASE_PROPS} />)).not.toThrow();
    });

    it('renders PhaseProgressSidebar', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('phase-progress-sidebar')).toBeDefined();
    });

    it('renders MentorPanel', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('mentor-panel')).toBeDefined();
    });

    it('shows Endpoints list header', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Endpoints')).toBeDefined();
    });

    it('shows endpoint count', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[makeEndpoint()]} />);
      expect(screen.getByText('1')).toBeDefined();
    });

    it('shows Add button', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Add')).toBeDefined();
    });
  });

  describe('empty state', () => {
    it('shows Design Your API title when no endpoints', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[]} />);
      expect(screen.getByText('Design Your API')).toBeDefined();
    });

    it('shows description text in empty state', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[]} />);
      expect(screen.getByText(/Define the endpoints your system needs/)).toBeDefined();
    });

    it('shows Quick add section', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[]} />);
      expect(screen.getByText('Quick add')).toBeDefined();
    });

    it('shows 3 quick template buttons', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[]} />);
      const paths = ['/api/v1/resource', '/api/v1/resource/:id', '/api/v1/resources'];
      paths.forEach(p => expect(screen.getByText(p)).toBeDefined());
    });

    it('clicking quick template POST calls onUpdateEndpoints with a POST endpoint', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[]} />);
      const postBtn = screen.getByText('/api/v1/resource').closest('button')!;
      fireEvent.click(postBtn);
      expect(BASE_PROPS.onUpdateEndpoints).toHaveBeenCalledOnce();
      const [newEndpoints] = BASE_PROPS.onUpdateEndpoints.mock.calls[0];
      expect(newEndpoints[0].method).toBe('POST');
      expect(newEndpoints[0].path).toBe('/api/v1/resource');
    });
  });

  describe('Add endpoint', () => {
    it('clicking Add calls onUpdateEndpoints with one new endpoint', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[]} />);
      fireEvent.click(screen.getByText('Add'));
      expect(BASE_PROPS.onUpdateEndpoints).toHaveBeenCalledOnce();
      const [newEndpoints] = BASE_PROPS.onUpdateEndpoints.mock.calls[0];
      expect(newEndpoints.length).toBe(1);
    });

    it('new endpoint has default method GET', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[]} />);
      fireEvent.click(screen.getByText('Add'));
      const [newEndpoints] = BASE_PROPS.onUpdateEndpoints.mock.calls[0];
      expect(newEndpoints[0].method).toBe('GET');
    });

    it('new endpoint has default path /api/', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[]} />);
      fireEvent.click(screen.getByText('Add'));
      const [newEndpoints] = BASE_PROPS.onUpdateEndpoints.mock.calls[0];
      expect(newEndpoints[0].path).toBe('/api/');
    });

    it('adding to existing endpoints appends at the end', () => {
      const existing = makeEndpoint({ id: 'ep1', path: '/api/existing' });
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[existing]} />);
      fireEvent.click(screen.getByText('Add'));
      const [newEndpoints] = BASE_PROPS.onUpdateEndpoints.mock.calls[0];
      expect(newEndpoints.length).toBe(2);
      expect(newEndpoints[0].path).toBe('/api/existing');
    });
  });

  describe('endpoint list items', () => {
    it('renders endpoint in list', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[makeEndpoint({ method: 'GET', path: '/api/v1/users' })]} />);
      expect(screen.getByText('/api/v1/users')).toBeDefined();
    });

    it('renders endpoint method badge in list', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[makeEndpoint({ method: 'POST', path: '/api/v1/posts' })]} />);
      // Both the list badge and the select option contain "POST"; check the span badge exists
      const badges = document.querySelectorAll('.sd-api__method');
      expect(Array.from(badges).some(b => b.textContent === 'POST')).toBe(true);
    });

    it('first endpoint list item has active class', () => {
      const ep = makeEndpoint();
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      const items = document.querySelectorAll('.sd-api__list-item');
      expect(items[0].classList.contains('sd-api__list-item--active')).toBe(true);
    });

    it('shows /... for endpoint with empty path', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[makeEndpoint({ path: '' })]} />);
      expect(screen.getByText('/...')).toBeDefined();
    });
  });

  describe('delete endpoint', () => {
    it('clicking delete calls onUpdateEndpoints without that endpoint', () => {
      const ep1 = makeEndpoint({ id: 'ep1', path: '/api/v1/a' });
      const ep2 = makeEndpoint({ id: 'ep2', path: '/api/v1/b' });
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep1, ep2]} />);
      const deleteButtons = document.querySelectorAll('.sd-api__delete-btn');
      fireEvent.click(deleteButtons[0]);
      const [newEndpoints] = BASE_PROPS.onUpdateEndpoints.mock.calls[0];
      expect(newEndpoints.length).toBe(1);
      expect(newEndpoints[0].id).toBe('ep2');
    });
  });

  describe('endpoint editor', () => {
    const ep = makeEndpoint({
      id: 'ep1',
      method: 'GET',
      path: '/api/v1/users',
      description: 'List users',
      requestBody: '{"limit": 10}',
      responseBody: '{"users":[]}',
    });

    it('shows method select with current method', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('GET');
    });

    it('shows all HTTP methods in select', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].forEach(m =>
        expect(screen.getByRole('option', { name: m })).toBeDefined(),
      );
    });

    it('changing method calls onUpdateEndpoints with updated method', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'POST' } });
      const [updated] = BASE_PROPS.onUpdateEndpoints.mock.calls[0];
      expect(updated[0].method).toBe('POST');
    });

    it('shows path input with current path', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      const pathInput = screen.getByPlaceholderText('/api/v1/endpoint') as HTMLInputElement;
      expect(pathInput.value).toBe('/api/v1/users');
    });

    it('changing path calls onUpdateEndpoints with updated path', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      fireEvent.change(screen.getByPlaceholderText('/api/v1/endpoint'), { target: { value: '/api/v2/users' } });
      const [updated] = BASE_PROPS.onUpdateEndpoints.mock.calls[0];
      expect(updated[0].path).toBe('/api/v2/users');
    });

    it('shows description input with current description', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      const descInput = screen.getByPlaceholderText('What does this endpoint do?') as HTMLInputElement;
      expect(descInput.value).toBe('List users');
    });

    it('changing description calls onUpdateEndpoints with updated description', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      fireEvent.change(screen.getByPlaceholderText('What does this endpoint do?'), { target: { value: 'Fetch users' } });
      const [updated] = BASE_PROPS.onUpdateEndpoints.mock.calls[0];
      expect(updated[0].description).toBe('Fetch users');
    });

    it('shows request body textarea', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      const ta = screen.getByPlaceholderText('{ "key": "value" }') as HTMLTextAreaElement;
      expect(ta.value).toBe('{"limit": 10}');
    });

    it('shows response body textarea', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      const ta = screen.getByPlaceholderText('{ "id": "...", "status": "ok" }') as HTMLTextAreaElement;
      expect(ta.value).toBe('{"users":[]}');
    });
  });

  describe('Review API Design button', () => {
    it('is enabled when endpoints exist', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[makeEndpoint()]} />);
      expect(screen.getByText('Review API Design').closest('button')!.hasAttribute('disabled')).toBe(false);
    });

    it('clicking calls serializeEndpointsToText with all endpoints', () => {
      const ep = makeEndpoint();
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[ep]} />);
      fireEvent.click(screen.getByText('Review API Design').closest('button')!);
      expect(serializeEndpointsToText).toHaveBeenCalledWith([ep]);
    });

    it('clicking calls onSendMessage with serialized text', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[makeEndpoint()]} />);
      fireEvent.click(screen.getByText('Review API Design').closest('button')!);
      expect(BASE_PROPS.onSendMessage).toHaveBeenCalledWith(
        'Please review my API design:\n\nserialized-api',
      );
    });
  });

  describe('Next Step button', () => {
    it('shows Next Step: Data Model button', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[makeEndpoint()]} />);
      expect(screen.getByText(/Next Step: Data Model/)).toBeDefined();
    });

    it('clicking Next Step calls onAdvancePhase', () => {
      render(<ApiContractWorkspace {...BASE_PROPS} endpoints={[makeEndpoint()]} />);
      fireEvent.click(screen.getByText(/Next Step: Data Model/).closest('button')!);
      expect(BASE_PROPS.onAdvancePhase).toHaveBeenCalledOnce();
    });
  });
});
