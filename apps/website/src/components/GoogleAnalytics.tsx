'use client'

import Script from 'next/script'

export function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });

          // Track WhatsApp clicks
          document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (target && target.href && target.href.includes('wa.me')) {
              gtag('event', 'click', {
                event_category: 'engagement',
                event_label: 'whatsapp_click',
                value: 1
              });
            }
          });

          // Track email clicks
          document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (target && target.href && target.href.includes('mailto:')) {
              gtag('event', 'click', {
                event_category: 'engagement',
                event_label: 'email_click',
                value: 1
              });
            }
          });

          // Track GitHub portfolio clicks
          document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (target && target.href && target.href.includes('github.com')) {
              gtag('event', 'click', {
                event_category: 'engagement',
                event_label: 'github_portfolio_click',
                value: 1
              });
            }
          });

          // Track package selection clicks (pricing CTAs)
          document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (target && target.href && target.href.includes('interested%20in%20the')) {
              const packageName = target.href.includes('Starter') ? 'starter' :
                                  target.href.includes('Professional') ? 'professional' :
                                  target.href.includes('Enterprise') ? 'enterprise' : 'custom';
              gtag('event', 'click', {
                event_category: 'conversion',
                event_label: 'package_' + packageName,
                value: packageName === 'starter' ? 2500 : 
                       packageName === 'professional' ? 10000 : 
                       25000
              });
            }
          });

          // Track scroll depth
          let maxScroll = 0;
          window.addEventListener('scroll', function() {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
              maxScroll = scrollPercent;
              gtag('event', 'scroll', {
                event_category: 'engagement',
                event_label: 'scroll_depth_' + scrollPercent,
                value: scrollPercent
              });
            }
          });
        `}
      </Script>
    </>
  )
}
