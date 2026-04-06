import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DataModelWorkspace from '../DataModelWorkspace';
import type { SystemDesignPhase, PhaseStatus, DbChoice } from '../../../types';

vi.mock('lucide-react', () => ({
  ArrowRight:   () => <span data-testid="icon-arrow-right" />,
  CheckCircle:  () => <span data-testid="icon-check-circle" />,
}));

vi.mock('../PhaseProgressSidebar', () => ({
  default: () => <div data-testid="phase-progress-sidebar" />,
}));

vi.mock('../MentorPanel', () => ({
  default: () => <div data-testid="mentor-panel" />,
}));

vi.mock('../data/dataModelSerializer', () => ({
  serializeDataModelToText: vi.fn((_schema, _db, _just) => 'serialized-data-model'),
}));

import { serializeDataModelToText } from '../data/dataModelSerializer';

function makeStatuses(
  overrides: Partial<Record<SystemDesignPhase, PhaseStatus>> = {},
): Record<SystemDesignPhase, PhaseStatus> {
  return {
    overview: 'completed',
    requirements: 'completed',
    api: 'completed',
    data: 'in-progress',
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
  schema: '',
  dbChoice: 'sql' as DbChoice,
  dbJustification: '',
  onUpdateSchema: vi.fn(),
  onUpdateDbChoice: vi.fn(),
  onUpdateJustification: vi.fn(),
  onAdvancePhase: vi.fn(),
  currentPhase: 'data' as SystemDesignPhase,
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
  BASE_PROPS.onUpdateSchema.mockClear();
  BASE_PROPS.onUpdateDbChoice.mockClear();
  BASE_PROPS.onUpdateJustification.mockClear();
  BASE_PROPS.onAdvancePhase.mockClear();
  BASE_PROPS.onPhaseClick.mockClear();
  BASE_PROPS.onSendMessage.mockClear();
  BASE_PROPS.onStopStreaming.mockClear();
  vi.mocked(serializeDataModelToText).mockClear();
});

describe('DataModelWorkspace', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<DataModelWorkspace {...BASE_PROPS} />)).not.toThrow();
    });

    it('renders PhaseProgressSidebar', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('phase-progress-sidebar')).toBeDefined();
    });

    it('renders MentorPanel', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('mentor-panel')).toBeDefined();
    });

    it('shows Schema Design heading', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Schema Design')).toBeDefined();
    });

    it('shows Database Choice heading', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Database Choice')).toBeDefined();
    });

    it('shows Justification label', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Justification')).toBeDefined();
    });
  });

  describe('schema textarea', () => {
    it('displays current schema value', () => {
      render(<DataModelWorkspace {...BASE_PROPS} schema="CREATE TABLE users (id UUID);" />);
      const ta = screen.getByPlaceholderText(/-- Example:/i) as HTMLTextAreaElement;
      expect(ta.value).toBe('CREATE TABLE users (id UUID);');
    });

    it('calls onUpdateSchema on change', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      const ta = screen.getByPlaceholderText(/-- Example:/i);
      fireEvent.change(ta, { target: { value: 'CREATE TABLE posts (id INT);' } });
      expect(BASE_PROPS.onUpdateSchema).toHaveBeenCalledWith('CREATE TABLE posts (id INT);');
    });
  });

  describe('DB choice radio buttons', () => {
    it('shows SQL (Relational) option', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('SQL (Relational)')).toBeDefined();
    });

    it('shows NoSQL (Document/KV) option', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('NoSQL (Document/KV)')).toBeDefined();
    });

    it('shows Polyglot Persistence option', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Polyglot Persistence')).toBeDefined();
    });

    it('SQL radio is checked when dbChoice="sql"', () => {
      render(<DataModelWorkspace {...BASE_PROPS} dbChoice="sql" />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      const sql = radios.find(r => r.value === 'sql')!;
      expect(sql.checked).toBe(true);
    });

    it('NoSQL radio is checked when dbChoice="nosql"', () => {
      render(<DataModelWorkspace {...BASE_PROPS} dbChoice="nosql" />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      const nosql = radios.find(r => r.value === 'nosql')!;
      expect(nosql.checked).toBe(true);
    });

    it('selected label has --selected class when dbChoice="sql"', () => {
      render(<DataModelWorkspace {...BASE_PROPS} dbChoice="sql" />);
      const sqlLabel = (screen.getAllByRole('radio') as HTMLInputElement[])
        .find(r => r.value === 'sql')!.closest('label')!;
      expect(sqlLabel.classList.contains('sd-data__db-option--selected')).toBe(true);
    });

    it('unselected label does not have --selected class', () => {
      render(<DataModelWorkspace {...BASE_PROPS} dbChoice="sql" />);
      const nosqlLabel = (screen.getAllByRole('radio') as HTMLInputElement[])
        .find(r => r.value === 'nosql')!.closest('label')!;
      expect(nosqlLabel.classList.contains('sd-data__db-option--selected')).toBe(false);
    });

    it('clicking NoSQL radio calls onUpdateDbChoice with "nosql"', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      const nosql = radios.find(r => r.value === 'nosql')!;
      fireEvent.click(nosql);
      expect(BASE_PROPS.onUpdateDbChoice).toHaveBeenCalledWith('nosql');
    });

    it('clicking Polyglot radio calls onUpdateDbChoice with "both"', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      const both = radios.find(r => r.value === 'both')!;
      fireEvent.click(both);
      expect(BASE_PROPS.onUpdateDbChoice).toHaveBeenCalledWith('both');
    });
  });

  describe('justification textarea', () => {
    it('displays current justification value', () => {
      render(<DataModelWorkspace {...BASE_PROPS} dbJustification="Needs ACID compliance" />);
      const ta = screen.getByPlaceholderText(/Why did you choose/i) as HTMLTextAreaElement;
      expect(ta.value).toBe('Needs ACID compliance');
    });

    it('calls onUpdateJustification on change', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      const ta = screen.getByPlaceholderText(/Why did you choose/i);
      fireEvent.change(ta, { target: { value: 'Horizontal scaling needed' } });
      expect(BASE_PROPS.onUpdateJustification).toHaveBeenCalledWith('Horizontal scaling needed');
    });
  });

  describe('Review Data Model button', () => {
    it('is disabled when schema is empty', () => {
      render(<DataModelWorkspace {...BASE_PROPS} schema="" />);
      expect(screen.getByText('Review Data Model').closest('button')!.hasAttribute('disabled')).toBe(true);
    });

    it('is disabled when schema is whitespace only', () => {
      render(<DataModelWorkspace {...BASE_PROPS} schema="   " />);
      expect(screen.getByText('Review Data Model').closest('button')!.hasAttribute('disabled')).toBe(true);
    });

    it('is enabled when schema has content', () => {
      render(<DataModelWorkspace {...BASE_PROPS} schema="CREATE TABLE users (id INT);" />);
      expect(screen.getByText('Review Data Model').closest('button')!.hasAttribute('disabled')).toBe(false);
    });

    it('clicking calls serializeDataModelToText with schema, dbChoice, justification', () => {
      render(<DataModelWorkspace {...BASE_PROPS} schema="CREATE TABLE x (id INT);" dbChoice="nosql" dbJustification="scales better" />);
      fireEvent.click(screen.getByText('Review Data Model').closest('button')!);
      expect(serializeDataModelToText).toHaveBeenCalledWith('CREATE TABLE x (id INT);', 'nosql', 'scales better');
    });

    it('clicking calls onSendMessage with serialized text', () => {
      render(<DataModelWorkspace {...BASE_PROPS} schema="CREATE TABLE x (id INT);" />);
      fireEvent.click(screen.getByText('Review Data Model').closest('button')!);
      expect(BASE_PROPS.onSendMessage).toHaveBeenCalledWith(
        'Please review my data model:\n\nserialzied-data-model'
          .replace('serialzied', 'serialized'),
      );
    });
  });

  describe('Next Step button', () => {
    it('shows Next Step: Architecture button', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      expect(screen.getByText(/Next Step: Architecture/)).toBeDefined();
    });

    it('clicking Next Step calls onAdvancePhase', () => {
      render(<DataModelWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText(/Next Step: Architecture/).closest('button')!);
      expect(BASE_PROPS.onAdvancePhase).toHaveBeenCalledOnce();
    });
  });
});
