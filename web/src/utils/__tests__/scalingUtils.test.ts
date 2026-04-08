import { describe, it, expect } from 'vitest';
import { isSectionFilled } from '../scalingUtils';
import type { ScalingState } from '../../types';

function emptyScaling(): ScalingState {
  return {
    capacity: { readQps: '', writeQps: '', storageDayGb: '', storageGrowthTbYr: '', bandwidthMbS: '', cacheMemGb: '' },
    computeStrategy: '',
    computeDetails: '',
    dbReplication: '',
    dbSharding: '',
    dbShardKey: '',
    dbDetails: '',
    cachePattern: '',
    evictionPolicy: '',
    cacheTtl: '',
    cacheDetails: '',
    lbAlgorithm: '',
    useCdn: false,
    lbDetails: '',
    reliabilityChecks: [],
    metrics: [],
    alertingDetails: '',
  };
}

// ─── capacity ────────────────────────────────────────────────────────────────

describe('isSectionFilled — capacity', () => {
  it('returns false when all capacity fields are empty', () => {
    expect(isSectionFilled('capacity', emptyScaling())).toBe(false);
  });

  it('returns true when readQps is set', () => {
    const s = emptyScaling();
    s.capacity.readQps = '10000';
    expect(isSectionFilled('capacity', s)).toBe(true);
  });

  it('returns true when writeQps is set', () => {
    const s = emptyScaling();
    s.capacity.writeQps = '1000';
    expect(isSectionFilled('capacity', s)).toBe(true);
  });

  it('returns true when any single capacity field has a value', () => {
    const s = emptyScaling();
    s.capacity.storageDayGb = '50';
    expect(isSectionFilled('capacity', s)).toBe(true);
  });

  it('returns false when all capacity fields are whitespace only', () => {
    const s = emptyScaling();
    s.capacity.readQps = '   ';
    s.capacity.writeQps = '\t';
    expect(isSectionFilled('capacity', s)).toBe(false);
  });
});

// ─── compute ─────────────────────────────────────────────────────────────────

describe('isSectionFilled — compute', () => {
  it('returns false when computeStrategy is empty string', () => {
    expect(isSectionFilled('compute', emptyScaling())).toBe(false);
  });

  it('returns true when computeStrategy is "horizontal"', () => {
    const s = emptyScaling();
    s.computeStrategy = 'horizontal';
    expect(isSectionFilled('compute', s)).toBe(true);
  });

  it('returns true when computeStrategy is "vertical"', () => {
    const s = emptyScaling();
    s.computeStrategy = 'vertical';
    expect(isSectionFilled('compute', s)).toBe(true);
  });

  it('returns true when computeStrategy is "both"', () => {
    const s = emptyScaling();
    s.computeStrategy = 'both';
    expect(isSectionFilled('compute', s)).toBe(true);
  });
});

// ─── database ────────────────────────────────────────────────────────────────

describe('isSectionFilled — database', () => {
  it('returns false when both dbReplication and dbSharding are empty', () => {
    expect(isSectionFilled('database', emptyScaling())).toBe(false);
  });

  it('returns true when dbReplication is set', () => {
    const s = emptyScaling();
    s.dbReplication = 'primary-replica';
    expect(isSectionFilled('database', s)).toBe(true);
  });

  it('returns true when dbSharding is set', () => {
    const s = emptyScaling();
    s.dbSharding = 'hash';
    expect(isSectionFilled('database', s)).toBe(true);
  });

  it('returns true when both are set', () => {
    const s = emptyScaling();
    s.dbReplication = 'multi-primary';
    s.dbSharding = 'range';
    expect(isSectionFilled('database', s)).toBe(true);
  });
});

// ─── caching ─────────────────────────────────────────────────────────────────

describe('isSectionFilled — caching', () => {
  it('returns false when cachePattern is empty', () => {
    expect(isSectionFilled('caching', emptyScaling())).toBe(false);
  });

  it('returns true when cachePattern is "cache-aside"', () => {
    const s = emptyScaling();
    s.cachePattern = 'cache-aside';
    expect(isSectionFilled('caching', s)).toBe(true);
  });

  it('returns true when cachePattern is "write-through"', () => {
    const s = emptyScaling();
    s.cachePattern = 'write-through';
    expect(isSectionFilled('caching', s)).toBe(true);
  });
});

// ─── loadbalancing ───────────────────────────────────────────────────────────

describe('isSectionFilled — loadbalancing', () => {
  it('returns false when lbAlgorithm is empty and useCdn is false', () => {
    expect(isSectionFilled('loadbalancing', emptyScaling())).toBe(false);
  });

  it('returns true when lbAlgorithm is set', () => {
    const s = emptyScaling();
    s.lbAlgorithm = 'round-robin';
    expect(isSectionFilled('loadbalancing', s)).toBe(true);
  });

  it('returns true when useCdn is true even with empty lbAlgorithm', () => {
    const s = emptyScaling();
    s.useCdn = true;
    expect(isSectionFilled('loadbalancing', s)).toBe(true);
  });

  it('returns true when both lbAlgorithm and useCdn are set', () => {
    const s = emptyScaling();
    s.lbAlgorithm = 'least-connections';
    s.useCdn = true;
    expect(isSectionFilled('loadbalancing', s)).toBe(true);
  });
});

// ─── reliability ─────────────────────────────────────────────────────────────

describe('isSectionFilled — reliability', () => {
  it('returns false when reliabilityChecks and metrics are both empty', () => {
    expect(isSectionFilled('reliability', emptyScaling())).toBe(false);
  });

  it('returns true when reliabilityChecks has at least one entry', () => {
    const s = emptyScaling();
    s.reliabilityChecks = ['circuit-breakers'];
    expect(isSectionFilled('reliability', s)).toBe(true);
  });

  it('returns true when metrics has at least one entry', () => {
    const s = emptyScaling();
    s.metrics = ['P99 latency'];
    expect(isSectionFilled('reliability', s)).toBe(true);
  });

  it('returns true when both reliabilityChecks and metrics are non-empty', () => {
    const s = emptyScaling();
    s.reliabilityChecks = ['retries'];
    s.metrics = ['Error rate', 'QPS'];
    expect(isSectionFilled('reliability', s)).toBe(true);
  });
});
