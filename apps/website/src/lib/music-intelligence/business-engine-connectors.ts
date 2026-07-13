import { REVENUE_CONNECTOR_DEFINITIONS } from './business-engine-constants';
import type { RevenueConnector, RevenueConnectorStatus } from './business-engine-types';

export function buildRevenueConnectors(): RevenueConnector[] {
  return REVENUE_CONNECTOR_DEFINITIONS.map((def) => {
    const status: RevenueConnectorStatus = 'awaiting_integration';
    return {
      key: def.key,
      label: def.label,
      status,
      supportsLiveMetrics: def.supportsLiveMetrics,
      summary: `${def.label} connector framework ready. Integration pending executive authorization.`,
    };
  });
}
