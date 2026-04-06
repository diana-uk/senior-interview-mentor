import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComponentPalette from '../ComponentPalette';

describe('ComponentPalette', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<ComponentPalette />)).not.toThrow();
    });

    it('shows Components header', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Components')).toBeDefined();
    });
  });

  describe('group labels', () => {
    it('shows Networking group', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Networking')).toBeDefined();
    });

    it('shows Compute group', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Compute')).toBeDefined();
    });

    it('shows Data group', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Data')).toBeDefined();
    });

    it('shows External group', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('External')).toBeDefined();
    });

    it('shows Zones group', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Zones')).toBeDefined();
    });
  });

  describe('Networking items', () => {
    it('shows Client item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Client')).toBeDefined();
    });

    it('shows Load Balancer item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Load Balancer')).toBeDefined();
    });

    it('shows API Gateway item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('API Gateway')).toBeDefined();
    });

    it('shows CDN item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('CDN')).toBeDefined();
    });
  });

  describe('Compute items', () => {
    it('shows Service item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Service')).toBeDefined();
    });

    it('shows Worker item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Worker')).toBeDefined();
    });

    it('shows Container item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Container')).toBeDefined();
    });
  });

  describe('Data items', () => {
    it('shows Database item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Database')).toBeDefined();
    });

    it('shows Cache item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Cache')).toBeDefined();
    });

    it('shows Queue item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Queue')).toBeDefined();
    });

    it('shows Storage item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Storage')).toBeDefined();
    });
  });

  describe('Zones items', () => {
    it('shows VPC Zone item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('VPC Zone')).toBeDefined();
    });

    it('shows Avail. Zone item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Avail. Zone')).toBeDefined();
    });

    it('shows Cluster item', () => {
      render(<ComponentPalette />);
      expect(screen.getByText('Cluster')).toBeDefined();
    });
  });

  describe('drag behavior', () => {
    it('palette items are draggable', () => {
      render(<ComponentPalette />);
      // All items in the palette are draggable divs
      const draggable = document
        .querySelectorAll('[draggable="true"]');
      expect(draggable.length).toBeGreaterThan(0);
    });

    it('dragStart on Client sets reactflow-type=client', () => {
      render(<ComponentPalette />);
      const clientItem = screen.getByText('Client').closest('[draggable]')!;
      const setData = vi.fn();
      const event = { dataTransfer: { setData, effectAllowed: '' } } as unknown as React.DragEvent;
      fireEvent.dragStart(clientItem, { dataTransfer: { setData, effectAllowed: '' } });
      // The setData was called with 'application/reactflow-type' = 'client'
      expect(setData).toHaveBeenCalledWith('application/reactflow-type', 'client');
    });

    it('dragStart on VPC Zone sets reactflow-type=group', () => {
      render(<ComponentPalette />);
      const vpcItem = screen.getByText('VPC Zone').closest('[draggable]')!;
      const setData = vi.fn();
      fireEvent.dragStart(vpcItem, { dataTransfer: { setData, effectAllowed: '' } });
      expect(setData).toHaveBeenCalledWith('application/reactflow-type', 'group');
    });

    it('dragStart on VPC Zone sets reactflow-zone=vpc', () => {
      render(<ComponentPalette />);
      const vpcItem = screen.getByText('VPC Zone').closest('[draggable]')!;
      const setData = vi.fn();
      fireEvent.dragStart(vpcItem, { dataTransfer: { setData, effectAllowed: '' } });
      expect(setData).toHaveBeenCalledWith('application/reactflow-zone', 'vpc');
    });

    it('dragStart on Database sets reactflow-label=Database', () => {
      render(<ComponentPalette />);
      const dbItem = screen.getByText('Database').closest('[draggable]')!;
      const setData = vi.fn();
      fireEvent.dragStart(dbItem, { dataTransfer: { setData, effectAllowed: '' } });
      expect(setData).toHaveBeenCalledWith('application/reactflow-label', 'Database');
    });
  });
});
