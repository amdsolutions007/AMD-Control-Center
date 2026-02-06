/**
 * AMD Signal Beacon - Video Analytics Tracking
 * 
 * Lightweight client-side analytics for measuring video engagement
 * Tracks: clicks, watch time estimates, scroll depth, CTA conversions
 * 
 * Privacy-first: All data stored locally, no external analytics services
 */

export interface VideoAnalytics {
  videoId: string;
  clicks: number;
  lastWatched: string;
  totalClicks: number;
}

export interface PageAnalytics {
  videosSectionViewed: boolean;
  scrollDepth: number;
  ctaClicked: {
    whatsapp: number;
    lekeLeke: number;
    premium: number;
  };
  sessionStart: string;
}

const STORAGE_KEY = 'amd_video_analytics';
const SESSION_KEY = 'amd_session_analytics';

/**
 * Track video click event
 */
export function trackVideoClick(videoId: string, videoTitle: string): void {
  try {
    const analytics = getVideoAnalytics();
    const existingVideo = analytics.find((v) => v.videoId === videoId);

    if (existingVideo) {
      existingVideo.clicks += 1;
      existingVideo.totalClicks += 1;
      existingVideo.lastWatched = new Date().toISOString();
    } else {
      analytics.push({
        videoId,
        clicks: 1,
        totalClicks: 1,
        lastWatched: new Date().toISOString(),
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));

    // Console log for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[007 ANALYTICS] Video clicked: ${videoTitle} (${videoId})`);
    }
  } catch (error) {
    console.error('[007 ANALYTICS] Failed to track video click:', error);
  }
}

/**
 * Track Videos Section view (scroll into view)
 */
export function trackSectionView(): void {
  try {
    const session = getSessionAnalytics();
    session.videosSectionViewed = true;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('[007 ANALYTICS] Failed to track section view:', error);
  }
}

/**
 * Track CTA button clicks
 */
export function trackCTAClick(ctaType: 'whatsapp' | 'lekeLeke' | 'premium'): void {
  try {
    const session = getSessionAnalytics();
    session.ctaClicked[ctaType] += 1;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    if (process.env.NODE_ENV === 'development') {
      console.log(`[007 ANALYTICS] CTA clicked: ${ctaType}`);
    }
  } catch (error) {
    console.error('[007 ANALYTICS] Failed to track CTA click:', error);
  }
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(depth: number): void {
  try {
    const session = getSessionAnalytics();
    if (depth > session.scrollDepth) {
      session.scrollDepth = depth;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch (error) {
    console.error('[007 ANALYTICS] Failed to track scroll depth:', error);
  }
}

/**
 * Get all video analytics
 */
export function getVideoAnalytics(): VideoAnalytics[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[007 ANALYTICS] Failed to get video analytics:', error);
    return [];
  }
}

/**
 * Get session analytics
 */
export function getSessionAnalytics(): PageAnalytics {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initialize new session
    const newSession: PageAnalytics = {
      videosSectionViewed: false,
      scrollDepth: 0,
      ctaClicked: {
        whatsapp: 0,
        lekeLeke: 0,
        premium: 0,
      },
      sessionStart: new Date().toISOString(),
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  } catch (error) {
    console.error('[007 ANALYTICS] Failed to get session analytics:', error);
    return {
      videosSectionViewed: false,
      scrollDepth: 0,
      ctaClicked: { whatsapp: 0, lekeLeke: 0, premium: 0 },
      sessionStart: new Date().toISOString(),
    };
  }
}

/**
 * Get analytics summary for admin dashboard
 */
export function getAnalyticsSummary() {
  const videos = getVideoAnalytics();
  const session = getSessionAnalytics();

  const totalClicks = videos.reduce((sum, v) => sum + v.totalClicks, 0);
  const mostWatchedVideo = videos.sort((a, b) => b.totalClicks - a.totalClicks)[0];

  return {
    totalVideoClicks: totalClicks,
    uniqueVideosClicked: videos.length,
    mostWatchedVideoId: mostWatchedVideo?.videoId || null,
    sectionViewed: session.videosSectionViewed,
    maxScrollDepth: session.scrollDepth,
    ctaConversions: session.ctaClicked,
    sessionStart: session.sessionStart,
  };
}

/**
 * Export analytics data as JSON for reporting
 */
export function exportAnalytics(): string {
  const videos = getVideoAnalytics();
  const session = getSessionAnalytics();
  const summary = getAnalyticsSummary();

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      summary,
      videos,
      session,
    },
    null,
    2
  );
}

/**
 * Clear all analytics data (for testing/reset)
 */
export function clearAnalytics(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    console.log('[007 ANALYTICS] All analytics cleared');
  } catch (error) {
    console.error('[007 ANALYTICS] Failed to clear analytics:', error);
  }
}
