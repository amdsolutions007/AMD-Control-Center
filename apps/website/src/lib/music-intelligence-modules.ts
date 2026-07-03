export const COMING_SOON_MODULES: Record<
  string,
  { title: string; headline: string; description: string; vision: string }
> = {
  'discovery-engine': {
    title: 'Discovery Engine',
    headline: 'Discovery Engine',
    description:
      'AI-powered music discovery that surfaces the next wave of Afrofusion hits before they break globally.',
    vision:
      'Executive AI platform for artists, audience intelligence, playlist optimization, campaign analytics, and autonomous reporting.',
  },
  'smart-recs': {
    title: 'Smart Recommendations',
    headline: 'Discovery Engine',
    description:
      'Personalized recommendation intelligence tuned for African popular music and editorial curation.',
    vision:
      'Executive AI platform for artists, audience intelligence, playlist optimization, campaign analytics, and autonomous reporting.',
  },
  'analytics-dashboard': {
    title: 'Analytics Dashboard',
    headline: 'Analytics Dashboard',
    description:
      'Campaign-grade streaming analytics, audience signals, and performance intelligence in one command center.',
    vision:
      'Executive AI platform for artists, audience intelligence, playlist optimization, campaign analytics, and autonomous reporting.',
  },
  'artist-services': {
    title: 'Artist Services',
    headline: 'Artist Services',
    description:
      'Visibility, distribution intelligence, and growth tooling built for artists scaling across every platform.',
    vision:
      'Executive AI platform for artists, audience intelligence, playlist optimization, campaign analytics, and autonomous reporting.',
  },
  'smart-link-technology': {
    title: 'Smart Link Technology',
    headline: 'Smart Link Technology',
    description:
      'One-link routing architecture that connects fans to every DSP with premium gateway intelligence.',
    vision:
      'Executive AI platform for artists, audience intelligence, playlist optimization, campaign analytics, and autonomous reporting.',
  },
  'agent-007': {
    title: 'Agent 007',
    headline: 'Agent 007',
    description:
      'Executive-grade music intelligence mode — strategic insights, audience analysis, and autonomous reporting.',
    vision:
      'Executive AI platform for artists, audience intelligence, playlist optimization, campaign analytics, and autonomous reporting.',
  },
  'analytics-platform': {
    title: 'Analytics Platform',
    headline: 'Analytics Platform',
    description:
      'Enterprise audience intelligence, campaign analytics, and growth forecasting for the AMD Music Intelligence ecosystem.',
    vision:
      'Executive AI platform for artists, audience intelligence, playlist optimization, campaign analytics, and autonomous reporting.',
  },
};

export function getComingSoonModule(slug: string) {
  return COMING_SOON_MODULES[slug] ?? null;
}
