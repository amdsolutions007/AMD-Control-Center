import type { IntelligenceWidgetId } from '@/lib/music-intelligence/intelligence-types';

const ICON_CLASS = 'h-5 w-5 shrink-0';

export function IntelligenceWidgetIcon({ id }: { id: IntelligenceWidgetId }) {
  switch (id) {
    case 'total_artists':
      return (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'total_partners':
    case 'total_organizations':
      return (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'total_submissions':
      return (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'pending_reviews':
      return (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'approved_submissions':
      return (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'active_campaigns':
      return (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'connected_streaming_platforms':
      return (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'ai_processing_status':
      return (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12h2l1 3 2-6 1 3h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
