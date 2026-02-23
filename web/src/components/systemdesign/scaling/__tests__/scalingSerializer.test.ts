import { describe, it, expect } from 'vitest';
import { serializeScalingPlanToText } from '../scalingSerializer';
import type { ScalingState } from '../../../../types';

// ── Helpers ──

function emptyScaling(): ScalingState {
  return {
    capacity: {
      readQps: '',
      writeQps: '',
      storageDayGb: '',
      storageGrowthTbYr: '',
      bandwidthMbS: '',
      cacheMemGb: '',
    },
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

// ── Tests ──

describe('serializeScalingPlanToText', () => {
  // ── Output structure ──

  describe('output structure', () => {
    it('starts with "Scaling Plan:" header', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toMatch(/^Scaling Plan:/);
    });

    it('contains all section headers', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toContain('Capacity Estimation:');
      expect(result).toContain('Compute Scaling:');
      expect(result).toContain('Database Scaling:');
      expect(result).toContain('Caching:');
      expect(result).toContain('Load Balancing & CDN:');
      expect(result).toContain('Reliability & Monitoring:');
    });

    it('separates sections with blank lines', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      const lines = result.split('\n');
      // After "Scaling Plan:" there should be a blank line before "Capacity Estimation:"
      const capIdx = lines.indexOf('Capacity Estimation:');
      expect(capIdx).toBeGreaterThan(0);
      expect(lines[capIdx - 1]).toBe('');
    });
  });

  // ── Capacity estimation ──

  describe('capacity estimation', () => {
    it('shows "(none)" when all capacity fields are empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toContain('Capacity Estimation:\n  (none)');
    });

    it('renders read QPS', () => {
      const s = emptyScaling();
      s.capacity.readQps = '10000';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Read QPS: 10000 req/s');
    });

    it('renders write QPS', () => {
      const s = emptyScaling();
      s.capacity.writeQps = '500';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Write QPS: 500 req/s');
    });

    it('renders storage per day', () => {
      const s = emptyScaling();
      s.capacity.storageDayGb = '50';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Storage/Day: 50 GB');
    });

    it('renders storage growth per year', () => {
      const s = emptyScaling();
      s.capacity.storageGrowthTbYr = '18';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Growth: 18 TB/yr');
    });

    it('renders bandwidth', () => {
      const s = emptyScaling();
      s.capacity.bandwidthMbS = '200';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Bandwidth: 200 MB/s');
    });

    it('renders cache memory', () => {
      const s = emptyScaling();
      s.capacity.cacheMemGb = '64';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Cache Memory: 64 GB');
    });

    it('renders multiple capacity entries indented', () => {
      const s = emptyScaling();
      s.capacity.readQps = '5000';
      s.capacity.writeQps = '1000';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('  Read QPS: 5000 req/s');
      expect(result).toContain('  Write QPS: 1000 req/s');
    });
  });

  // ── Compute scaling ──

  describe('compute scaling', () => {
    it('shows "(not selected)" when compute strategy is empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toContain('Strategy: (not selected)');
    });

    it('maps "horizontal" to "Horizontal"', () => {
      const s = emptyScaling();
      s.computeStrategy = 'horizontal';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Strategy: Horizontal');
    });

    it('maps "vertical" to "Vertical"', () => {
      const s = emptyScaling();
      s.computeStrategy = 'vertical';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Strategy: Vertical');
    });

    it('maps "both" to "Both"', () => {
      const s = emptyScaling();
      s.computeStrategy = 'both';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Strategy: Both');
    });

    it('omits details line when compute details is empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      const lines = result.split('\n');
      const strategyIdx = lines.findIndex((l) => l.includes('Strategy: (not selected)'));
      // Next non-blank line should be a section header, not "Details:"
      expect(lines[strategyIdx + 1]).toBe('');
      expect(lines[strategyIdx + 2]).toBe('Database Scaling:');
    });

    it('includes details line when compute details is provided', () => {
      const s = emptyScaling();
      s.computeStrategy = 'horizontal';
      s.computeDetails = 'Auto-scaling with k8s HPA';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Details: Auto-scaling with k8s HPA');
    });

    it('trims whitespace from compute details', () => {
      const s = emptyScaling();
      s.computeDetails = '  needs trimming  ';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Details: needs trimming');
    });
  });

  // ── Database scaling ──

  describe('database scaling', () => {
    it('shows "(not selected)" for empty replication and sharding', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toContain('Replication: (not selected)');
      expect(result).toContain('Sharding: (not selected)');
    });

    it('maps replication choices correctly', () => {
      const s = emptyScaling();
      s.dbReplication = 'primary-replica';
      expect(serializeScalingPlanToText(s)).toContain('Replication: Primary-Replica');

      s.dbReplication = 'multi-primary';
      expect(serializeScalingPlanToText(s)).toContain('Replication: Multi-Primary');

      s.dbReplication = 'none';
      expect(serializeScalingPlanToText(s)).toContain('Replication: None');
    });

    it('maps sharding choices correctly', () => {
      const s = emptyScaling();
      s.dbSharding = 'hash';
      expect(serializeScalingPlanToText(s)).toContain('Sharding: Hash-based');

      s.dbSharding = 'range';
      expect(serializeScalingPlanToText(s)).toContain('Sharding: Range-based');

      s.dbSharding = 'geo';
      expect(serializeScalingPlanToText(s)).toContain('Sharding: Geographic');

      s.dbSharding = 'none';
      expect(serializeScalingPlanToText(s)).toContain('Sharding: None');
    });

    it('includes shard key when provided', () => {
      const s = emptyScaling();
      s.dbShardKey = 'user_id';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Shard Key: user_id');
    });

    it('omits shard key line when empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).not.toContain('Shard Key:');
    });

    it('trims whitespace from shard key', () => {
      const s = emptyScaling();
      s.dbShardKey = '  tenant_id  ';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Shard Key: tenant_id');
    });

    it('includes db details when provided', () => {
      const s = emptyScaling();
      s.dbDetails = 'Using CockroachDB for multi-region';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Details: Using CockroachDB for multi-region');
    });

    it('omits db details line when empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      // Count occurrences of "Details:" in the DB section
      const lines = result.split('\n');
      const dbIdx = lines.indexOf('Database Scaling:');
      const cachingIdx = lines.indexOf('Caching:');
      const dbSection = lines.slice(dbIdx, cachingIdx).join('\n');
      expect(dbSection).not.toContain('Details:');
    });
  });

  // ── Caching ──

  describe('caching', () => {
    it('shows "(not selected)" for empty cache pattern and eviction', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toContain('Pattern: (not selected)');
      expect(result).toContain('Eviction: (not selected)');
    });

    it('maps cache pattern choices correctly', () => {
      const s = emptyScaling();
      s.cachePattern = 'cache-aside';
      expect(serializeScalingPlanToText(s)).toContain('Pattern: Cache-Aside');

      s.cachePattern = 'write-through';
      expect(serializeScalingPlanToText(s)).toContain('Pattern: Write-Through');

      s.cachePattern = 'write-behind';
      expect(serializeScalingPlanToText(s)).toContain('Pattern: Write-Behind');

      s.cachePattern = 'read-through';
      expect(serializeScalingPlanToText(s)).toContain('Pattern: Read-Through');
    });

    it('maps eviction policy choices correctly', () => {
      const s = emptyScaling();
      s.evictionPolicy = 'lru';
      expect(serializeScalingPlanToText(s)).toContain('Eviction: LRU');

      s.evictionPolicy = 'lfu';
      expect(serializeScalingPlanToText(s)).toContain('Eviction: LFU');

      s.evictionPolicy = 'ttl';
      expect(serializeScalingPlanToText(s)).toContain('Eviction: TTL-based');
    });

    it('includes TTL when provided', () => {
      const s = emptyScaling();
      s.cacheTtl = '300s';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('TTL: 300s');
    });

    it('omits TTL line when empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).not.toContain('TTL:');
    });

    it('includes cache details when provided', () => {
      const s = emptyScaling();
      s.cacheDetails = 'Redis cluster with sentinel';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Details: Redis cluster with sentinel');
    });

    it('trims cache TTL and details', () => {
      const s = emptyScaling();
      s.cacheTtl = '  60s  ';
      s.cacheDetails = '  local + distributed  ';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('TTL: 60s');
      expect(result).toContain('Details: local + distributed');
    });
  });

  // ── Load balancing & CDN ──

  describe('load balancing & CDN', () => {
    it('shows "(not selected)" for empty LB algorithm', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toContain('Algorithm: (not selected)');
    });

    it('maps LB algorithm choices correctly', () => {
      const s = emptyScaling();
      s.lbAlgorithm = 'round-robin';
      expect(serializeScalingPlanToText(s)).toContain('Algorithm: Round Robin');

      s.lbAlgorithm = 'least-connections';
      expect(serializeScalingPlanToText(s)).toContain('Algorithm: Least Connections');

      s.lbAlgorithm = 'consistent-hash';
      expect(serializeScalingPlanToText(s)).toContain('Algorithm: Consistent Hash');

      s.lbAlgorithm = 'weighted';
      expect(serializeScalingPlanToText(s)).toContain('Algorithm: Weighted');
    });

    it('shows CDN as Disabled when useCdn is false', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toContain('CDN: Disabled');
    });

    it('shows CDN as Enabled when useCdn is true', () => {
      const s = emptyScaling();
      s.useCdn = true;
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('CDN: Enabled');
    });

    it('includes LB details when provided', () => {
      const s = emptyScaling();
      s.lbDetails = 'AWS ALB with path-based routing';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Details: AWS ALB with path-based routing');
    });

    it('omits LB details line when empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      const lines = result.split('\n');
      const lbIdx = lines.indexOf('Load Balancing & CDN:');
      const reliIdx = lines.indexOf('Reliability & Monitoring:');
      const lbSection = lines.slice(lbIdx, reliIdx).join('\n');
      expect(lbSection).not.toContain('Details:');
    });
  });

  // ── Reliability & monitoring ──

  describe('reliability & monitoring', () => {
    it('shows "(none selected)" when reliability checks is empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toContain('Patterns: (none selected)');
    });

    it('shows "(none)" when metrics is empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).toContain('Metrics: (none)');
    });

    it('renders single reliability check', () => {
      const s = emptyScaling();
      s.reliabilityChecks = ['Circuit Breaker'];
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Patterns: Circuit Breaker');
    });

    it('renders multiple reliability checks comma-separated', () => {
      const s = emptyScaling();
      s.reliabilityChecks = ['Circuit Breaker', 'Retry with Backoff', 'Bulkhead'];
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Patterns: Circuit Breaker, Retry with Backoff, Bulkhead');
    });

    it('renders single metric', () => {
      const s = emptyScaling();
      s.metrics = ['p99 latency'];
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Metrics: p99 latency');
    });

    it('renders multiple metrics comma-separated', () => {
      const s = emptyScaling();
      s.metrics = ['p99 latency', 'error rate', 'throughput'];
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Metrics: p99 latency, error rate, throughput');
    });

    it('includes alerting details when provided', () => {
      const s = emptyScaling();
      s.alertingDetails = 'PagerDuty for critical alerts';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Alerting: PagerDuty for critical alerts');
    });

    it('omits alerting line when empty', () => {
      const result = serializeScalingPlanToText(emptyScaling());
      expect(result).not.toContain('Alerting:');
    });

    it('trims alerting details', () => {
      const s = emptyScaling();
      s.alertingDetails = '  Slack + PagerDuty  ';
      const result = serializeScalingPlanToText(s);
      expect(result).toContain('Alerting: Slack + PagerDuty');
    });
  });

  // ── Full integration ──

  describe('full integration', () => {
    it('serializes all fields populated', () => {
      const s: ScalingState = {
        capacity: {
          readQps: '10000',
          writeQps: '500',
          storageDayGb: '50',
          storageGrowthTbYr: '18',
          bandwidthMbS: '200',
          cacheMemGb: '64',
        },
        computeStrategy: 'horizontal',
        computeDetails: 'K8s HPA with 2-10 pods',
        dbReplication: 'primary-replica',
        dbSharding: 'hash',
        dbShardKey: 'user_id',
        dbDetails: 'PostgreSQL with read replicas',
        cachePattern: 'cache-aside',
        evictionPolicy: 'lru',
        cacheTtl: '300s',
        cacheDetails: 'Redis cluster',
        lbAlgorithm: 'round-robin',
        useCdn: true,
        lbDetails: 'AWS ALB',
        reliabilityChecks: ['Circuit Breaker', 'Retry with Backoff'],
        metrics: ['p99 latency', 'error rate'],
        alertingDetails: 'PagerDuty on-call',
      };

      const result = serializeScalingPlanToText(s);

      expect(result).toBe(
        'Scaling Plan:\n' +
        '\n' +
        'Capacity Estimation:\n' +
        '  Read QPS: 10000 req/s\n' +
        '  Write QPS: 500 req/s\n' +
        '  Storage/Day: 50 GB\n' +
        '  Growth: 18 TB/yr\n' +
        '  Bandwidth: 200 MB/s\n' +
        '  Cache Memory: 64 GB\n' +
        '\n' +
        'Compute Scaling:\n' +
        '  Strategy: Horizontal\n' +
        '  Details: K8s HPA with 2-10 pods\n' +
        '\n' +
        'Database Scaling:\n' +
        '  Replication: Primary-Replica\n' +
        '  Sharding: Hash-based\n' +
        '  Shard Key: user_id\n' +
        '  Details: PostgreSQL with read replicas\n' +
        '\n' +
        'Caching:\n' +
        '  Pattern: Cache-Aside\n' +
        '  Eviction: LRU\n' +
        '  TTL: 300s\n' +
        '  Details: Redis cluster\n' +
        '\n' +
        'Load Balancing & CDN:\n' +
        '  Algorithm: Round Robin\n' +
        '  CDN: Enabled\n' +
        '  Details: AWS ALB\n' +
        '\n' +
        'Reliability & Monitoring:\n' +
        '  Patterns: Circuit Breaker, Retry with Backoff\n' +
        '  Metrics: p99 latency, error rate\n' +
        '  Alerting: PagerDuty on-call',
      );
    });

    it('serializes all fields empty (worst case)', () => {
      const result = serializeScalingPlanToText(emptyScaling());

      expect(result).toBe(
        'Scaling Plan:\n' +
        '\n' +
        'Capacity Estimation:\n' +
        '  (none)\n' +
        '\n' +
        'Compute Scaling:\n' +
        '  Strategy: (not selected)\n' +
        '\n' +
        'Database Scaling:\n' +
        '  Replication: (not selected)\n' +
        '  Sharding: (not selected)\n' +
        '\n' +
        'Caching:\n' +
        '  Pattern: (not selected)\n' +
        '  Eviction: (not selected)\n' +
        '\n' +
        'Load Balancing & CDN:\n' +
        '  Algorithm: (not selected)\n' +
        '  CDN: Disabled\n' +
        '\n' +
        'Reliability & Monitoring:\n' +
        '  Patterns: (none selected)\n' +
        '  Metrics: (none)',
      );
    });
  });
});
