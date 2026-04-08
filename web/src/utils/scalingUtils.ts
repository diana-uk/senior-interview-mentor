import type { ScalingState } from '../types';

export type SectionId = 'capacity' | 'compute' | 'database' | 'caching' | 'loadbalancing' | 'reliability';

/**
 * Returns true when the given ScalingWorkspace section has at least one filled field.
 */
export function isSectionFilled(section: SectionId, s: ScalingState): boolean {
  switch (section) {
    case 'capacity':
      return Object.values(s.capacity).some((v) => v.trim() !== '');
    case 'compute':
      return s.computeStrategy !== '';
    case 'database':
      return s.dbReplication !== '' || s.dbSharding !== '';
    case 'caching':
      return s.cachePattern !== '';
    case 'loadbalancing':
      return s.lbAlgorithm !== '' || s.useCdn;
    case 'reliability':
      return s.reliabilityChecks.length > 0 || s.metrics.length > 0;
  }
}
