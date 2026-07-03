/**
 * Agent 007 unified knowledge domain registry.
 * Phase 2 will load the matching domain automatically based on route context.
 */
export const AGENT_007_DOMAINS = {
  AMD_SOLUTIONS: 'amd-solutions',
  MUSIC_INTELLIGENCE: 'music-intelligence',
  MATERIALITY_ENGINE: 'materiality-engine',
  CHROME_MUSIC_HUB: 'chrome-music-hub',
} as const;

export type Agent007Domain = (typeof AGENT_007_DOMAINS)[keyof typeof AGENT_007_DOMAINS];

export const AGENT_007_MUSIC_INTELLIGENCE_CONTEXT = AGENT_007_DOMAINS.MUSIC_INTELLIGENCE;

const ROUTE_DOMAIN_RULES: Array<{ prefix: string; domain: Agent007Domain }> = [
  { prefix: '/sl/', domain: AGENT_007_DOMAINS.MUSIC_INTELLIGENCE },
  { prefix: '/music-intelligence', domain: AGENT_007_DOMAINS.MUSIC_INTELLIGENCE },
];

export function resolveAgent007Domain(pathname: string): Agent007Domain {
  const match = ROUTE_DOMAIN_RULES.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.domain ?? AGENT_007_DOMAINS.AMD_SOLUTIONS;
}
