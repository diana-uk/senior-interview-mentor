import type { ScalingState } from '../../../types';

const COMPUTE_LABELS: Record<string, string> = {
  horizontal: 'Horizontal',
  vertical: 'Vertical',
  both: 'Both',
};

const REPLICATION_LABELS: Record<string, string> = {
  'primary-replica': 'Primary-Replica',
  'multi-primary': 'Multi-Primary',
  none: 'None',
};

const SHARDING_LABELS: Record<string, string> = {
  hash: 'Hash-based',
  range: 'Range-based',
  geo: 'Geographic',
  none: 'None',
};

const CACHE_LABELS: Record<string, string> = {
  'cache-aside': 'Cache-Aside',
  'write-through': 'Write-Through',
  'write-behind': 'Write-Behind',
  'read-through': 'Read-Through',
};

const EVICTION_LABELS: Record<string, string> = {
  lru: 'LRU',
  lfu: 'LFU',
  ttl: 'TTL-based',
};

const LB_LABELS: Record<string, string> = {
  'round-robin': 'Round Robin',
  'least-connections': 'Least Connections',
  'consistent-hash': 'Consistent Hash',
  weighted: 'Weighted',
};

export function serializeScalingPlanToText(scaling: ScalingState): string {
  const lines: string[] = ['Scaling Plan:'];

  // Capacity estimation
  const { capacity } = scaling;
  const capEntries: string[] = [];
  if (capacity.readQps) capEntries.push(`Read QPS: ${capacity.readQps} req/s`);
  if (capacity.writeQps) capEntries.push(`Write QPS: ${capacity.writeQps} req/s`);
  if (capacity.storageDayGb) capEntries.push(`Storage/Day: ${capacity.storageDayGb} GB`);
  if (capacity.storageGrowthTbYr) capEntries.push(`Growth: ${capacity.storageGrowthTbYr} TB/yr`);
  if (capacity.bandwidthMbS) capEntries.push(`Bandwidth: ${capacity.bandwidthMbS} MB/s`);
  if (capacity.cacheMemGb) capEntries.push(`Cache Memory: ${capacity.cacheMemGb} GB`);
  lines.push('');
  lines.push('Capacity Estimation:');
  lines.push(capEntries.length > 0 ? capEntries.map((e) => `  ${e}`).join('\n') : '  (none)');

  // Compute
  lines.push('');
  lines.push('Compute Scaling:');
  lines.push(`  Strategy: ${scaling.computeStrategy ? COMPUTE_LABELS[scaling.computeStrategy] ?? scaling.computeStrategy : '(not selected)'}`);
  if (scaling.computeDetails.trim()) lines.push(`  Details: ${scaling.computeDetails.trim()}`);

  // Database
  lines.push('');
  lines.push('Database Scaling:');
  lines.push(`  Replication: ${scaling.dbReplication ? REPLICATION_LABELS[scaling.dbReplication] ?? scaling.dbReplication : '(not selected)'}`);
  lines.push(`  Sharding: ${scaling.dbSharding ? SHARDING_LABELS[scaling.dbSharding] ?? scaling.dbSharding : '(not selected)'}`);
  if (scaling.dbShardKey.trim()) lines.push(`  Shard Key: ${scaling.dbShardKey.trim()}`);
  if (scaling.dbDetails.trim()) lines.push(`  Details: ${scaling.dbDetails.trim()}`);

  // Caching
  lines.push('');
  lines.push('Caching:');
  lines.push(`  Pattern: ${scaling.cachePattern ? CACHE_LABELS[scaling.cachePattern] ?? scaling.cachePattern : '(not selected)'}`);
  lines.push(`  Eviction: ${scaling.evictionPolicy ? EVICTION_LABELS[scaling.evictionPolicy] ?? scaling.evictionPolicy : '(not selected)'}`);
  if (scaling.cacheTtl.trim()) lines.push(`  TTL: ${scaling.cacheTtl.trim()}`);
  if (scaling.cacheDetails.trim()) lines.push(`  Details: ${scaling.cacheDetails.trim()}`);

  // Load Balancing
  lines.push('');
  lines.push('Load Balancing & CDN:');
  lines.push(`  Algorithm: ${scaling.lbAlgorithm ? LB_LABELS[scaling.lbAlgorithm] ?? scaling.lbAlgorithm : '(not selected)'}`);
  lines.push(`  CDN: ${scaling.useCdn ? 'Enabled' : 'Disabled'}`);
  if (scaling.lbDetails.trim()) lines.push(`  Details: ${scaling.lbDetails.trim()}`);

  // Reliability
  lines.push('');
  lines.push('Reliability & Monitoring:');
  lines.push(`  Patterns: ${scaling.reliabilityChecks.length > 0 ? scaling.reliabilityChecks.join(', ') : '(none selected)'}`);
  lines.push(`  Metrics: ${scaling.metrics.length > 0 ? scaling.metrics.join(', ') : '(none)'}`);
  if (scaling.alertingDetails.trim()) lines.push(`  Alerting: ${scaling.alertingDetails.trim()}`);

  return lines.join('\n');
}
