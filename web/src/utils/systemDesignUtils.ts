import type { SDRubricDimension } from '../components/systemdesign/SystemDesignRubric';
import type { DeepDiveApproach } from '../types/index.js';

/** Create a blank DeepDiveApproach entry. */
export function createEmptyApproach(): DeepDiveApproach {
  return { name: '', pros: '', cons: '' };
}

/**
 * Generate an improvement plan for a system design review.
 * Returns one plan string per weak dimension (score ≤ 2), sorted weakest-first.
 * If no weak dimensions, returns a single encouragement string.
 */
export function generateSDImprovementPlan(dims: SDRubricDimension[]): string[] {
  const weak = dims.filter((d) => d.score <= 2).sort((a, b) => a.score - b.score);
  const plans: string[] = [];
  for (const d of weak) {
    switch (d.id) {
      case 'scalability':
        plans.push('Practice horizontal scaling patterns: sharding, load balancing, caching layers, and CDN placement.');
        break;
      case 'reliability':
        plans.push('Study fault tolerance: replication, circuit breakers, health checks, graceful degradation, and retry strategies.');
        break;
      case 'data-model':
        plans.push('Practice designing schemas before coding. Compare SQL vs NoSQL trade-offs for each entity. Consider access patterns first.');
        break;
      case 'api-design':
        plans.push('Follow REST best practices: consistent naming, proper HTTP methods, pagination, versioning, and error contracts.');
        break;
      case 'trade-offs':
        plans.push('Always state trade-offs explicitly: "I chose X over Y because..." Practice CAP theorem applications and consistency models.');
        break;
      case 'communication':
        plans.push('Structure your design: requirements → API → data model → high-level → deep-dive → scaling. Narrate as you draw.');
        break;
    }
  }
  if (plans.length === 0) {
    plans.push('Excellent design! Focus on speed — practice completing designs within 35 minutes.');
  }
  return plans;
}
