import { ENTERPRISE_API_CONNECTORS } from './enterprise-constants';
import type { EnterpriseApiConnector, ApiConnectorStatus } from './enterprise-types';

export function buildEnterpriseApiConnectors(): EnterpriseApiConnector[] {
  return ENTERPRISE_API_CONNECTORS.map((def) => ({
    key: def.key,
    label: def.label,
    status: (def.key === 'workspace_api' || def.key === 'partner_api' ? 'active' : 'awaiting_integration') as ApiConnectorStatus,
    supportsLiveData: def.key === 'workspace_api' || def.key === 'partner_api',
    summary:
      def.key === 'workspace_api' || def.key === 'partner_api'
        ? `${def.label} active via protected enterprise-engine routes.`
        : `${def.label} connector framework ready. Integration pending executive authorization.`,
  }));
}
