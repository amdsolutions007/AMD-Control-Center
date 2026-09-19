'use client';

const META_MUSIC_DATASET_ID = '2255953381656415';

type MetaMusicEventParameters = {
  smart_link_code: string;
  smart_link_id: string;
  artist_id?: string;
  track_id?: string;
  playlist_id?: string;
  destination_dsp?: string;
};

type MetaWindow = Window & {
  fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; push?: (...args: unknown[]) => void; loaded?: boolean; version?: string };
  _fbq?: unknown;
  __amdMusicMetaPixelInitialized?: boolean;
};

function withoutUndefined(parameters: MetaMusicEventParameters) {
  return Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined && value !== ''),
  );
}

function createEventId() {
  if (typeof window.crypto?.randomUUID === 'function') return window.crypto.randomUUID();
  return `ami-meta-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function ensureMetaPixel() {
  const metaWindow = window as MetaWindow;
  if (!metaWindow.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue?.push(args);
    } as MetaWindow['fbq'];

    fbq!.queue = [];
    fbq!.push = (...args: unknown[]) => fbq!.queue?.push(args);
    fbq!.loaded = true;
    fbq!.version = '2.0';

    metaWindow.fbq = fbq;
    metaWindow._fbq = fbq;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  if (!metaWindow.__amdMusicMetaPixelInitialized) {
    metaWindow.fbq('init', META_MUSIC_DATASET_ID);
    metaWindow.__amdMusicMetaPixelInitialized = true;
  }

  return metaWindow.fbq;
}

export function trackMusicPageView(parameters: Omit<MetaMusicEventParameters, 'destination_dsp'>) {
  const eventId = createEventId();
  ensureMetaPixel()('track', 'PageView', withoutUndefined(parameters as MetaMusicEventParameters), { eventID: eventId });
  return eventId;
}

export function trackMusicDSPOutboundClick(parameters: Required<Pick<MetaMusicEventParameters, 'destination_dsp'>> & Omit<MetaMusicEventParameters, 'destination_dsp'>) {
  const eventId = createEventId();
  ensureMetaPixel()('trackCustom', 'MusicDSPOutboundClick', withoutUndefined(parameters), { eventID: eventId });
  return eventId;
}
