'use client'

import Script from 'next/script'

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { page_path: window.location.pathname });

          if (!window.__amdAnalyticsClickTrackingInstalled) {
            window.__amdAnalyticsClickTrackingInstalled = true;
            document.addEventListener('click', function(e) {
              const target = e.target && e.target.closest ? e.target.closest('a') : null;
              if (!target || !target.href) return;

              if (target.href.includes('wa.me')) {
                gtag('event', 'whatsapp_click', {
                  event_category: 'engagement',
                  event_label: 'canonical_whatsapp'
                });
              } else if (target.href.includes('mailto:')) {
                gtag('event', 'email_click', {
                  event_category: 'engagement',
                  event_label: 'email'
                });
              } else if (target.href.includes('github.com')) {
                gtag('event', 'github_portfolio_click', {
                  event_category: 'engagement',
                  event_label: 'github_portfolio'
                });
              }
            });
          }
        `}
      </Script>
    </>
  )
}
