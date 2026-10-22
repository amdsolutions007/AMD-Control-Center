import Link from 'next/link'
import { canonicalOrigin, canonicalTelephone, canonicalWhatsApp, getLocationDisplayName, type GovernedLocation } from '@/lib/location-network'

function jsonLdFor(location: GovernedLocation) {
  const canonical = `${canonicalOrigin}/locations/${location.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${canonicalOrigin}/#organization`, name: 'AMD Solutions 007', url: canonicalOrigin, telephone: canonicalTelephone },
      { '@type': 'WebSite', '@id': `${canonicalOrigin}/#website`, url: canonicalOrigin, name: 'AMD Solutions 007', publisher: { '@id': `${canonicalOrigin}/#organization` } },
      { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: location.title, description: location.description, isPartOf: { '@id': `${canonicalOrigin}/#website` }, about: { '@id': `${canonical}#service` } },
      { '@type': 'Service', '@id': `${canonical}#service`, name: location.h1, provider: { '@id': `${canonicalOrigin}/#organization` }, areaServed: { '@type': 'AdministrativeArea', name: `${location.displayName}, Nigeria` }, serviceType: location.services },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalOrigin },
        { '@type': 'ListItem', position: 2, name: 'Locations', item: `${canonicalOrigin}/locations/nigeria` },
        { '@type': 'ListItem', position: 3, name: location.displayName, item: canonical },
      ] },
      { '@type': 'FAQPage', mainEntity: location.faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    ],
  }
}

export function LocationLandingPage({ location }: { location: GovernedLocation }) {
  const canonical = `${canonicalOrigin}/locations/${location.slug}`
  const isLagos = location.slug === 'lagos'
  const truth = isLagos
    ? 'AMD Solutions 007 operates from Ibeju-Lekki, Lagos. Client-site discovery, assessment, implementation, training or support may be arranged by appointment. This is not a public walk-in office.'
    : `AMD Solutions 007 serves ${location.displayName} remotely from its Ibeju-Lekki, Lagos operating base. This page represents service coverage and does not represent an AMD office, branch or local team in ${location.displayName}.`

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFor(location)) }} />
      <header className="sticky top-0 z-40 border-b border-yellow-400/20 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="rounded text-sm font-black tracking-[0.18em] text-yellow-300 outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">AMD SOLUTIONS 007</Link>
          <a href={canonicalWhatsApp} className="rounded-full border border-yellow-300/50 px-4 py-2 text-sm font-semibold text-yellow-200 outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">WhatsApp</a>
        </div>
      </header>

      <section className="border-b border-white/10 bg-gradient-to-b from-yellow-400/10 to-transparent">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-yellow-300">AMD Nigeria service coverage · {location.displayName}</p>
          <h1 className="max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{location.h1}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">{location.summary}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={canonicalWhatsApp} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-yellow-300 px-5 py-3 text-center font-bold text-black outline-none focus-visible:ring-2 focus-visible:ring-white">Discuss your project on WhatsApp</a>
            <Link href="/client-portal" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-center font-bold outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">Client portal</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div data-truth-panel className="rounded-2xl border border-yellow-300/25 bg-yellow-300/5 p-6">
          <h2 className="text-xl font-bold text-yellow-200">Service-area truth</h2>
          <p className="mt-3 leading-7 text-white/75">{truth}</p>
          <p className="mt-3 text-sm text-white/55">Canonical contact: <a href={canonicalWhatsApp} className="text-yellow-200 underline underline-offset-4">{canonicalTelephone}</a></p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-bold">Commercial context</h2>
          <div className="mt-4 space-y-4 text-white/70">{location.market.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-bold">Markets and centres</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">{location.centres.map((item) => <li key={item} className="rounded-xl border border-white/10 p-3 text-white/70">{item}</li>)}</ul>
        </article>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-bold">Where AMD can help</h2>
          <ul className="mt-4 space-y-3">{location.services.map((item) => <li key={item} className="rounded-xl bg-white/[0.04] p-4 text-white/75">{item}</li>)}</ul>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-bold">Decision and delivery journey</h2>
          <ol className="mt-4 space-y-3">{location.journey.map((item, index) => <li key={item} className="flex gap-3 text-white/75"><span className="font-black text-yellow-300">{index + 1}.</span><span>{item}</span></li>)}</ol>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <h2 className="text-2xl font-bold">Questions businesses in {location.displayName} may ask</h2>
        <div className="mt-5 space-y-3">{location.faq.map((item) => (
          <details key={item.question} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 open:border-yellow-300/30">
            <summary className="cursor-pointer rounded font-semibold outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">{item.question}</summary>
            <p className="mt-3 leading-7 text-white/70">{item.answer}</p>
          </details>
        ))}</div>
      </section>

      <section data-evidence-panel className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-bold">Evidence and governance</h2>
          <p className="mt-3 text-white/70">These sources support market framing only. They do not prove AMD customers, endorsements, partnerships, demand, revenue or physical presence in {location.displayName}.</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-white/65">{location.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="mt-4 text-sm text-white/50">Evidence reviewed: {location.governance.evidenceReviewedAt} · Last validated: {location.governance.lastValidatedAt} · Demand confidence: {location.governance.demandConfidence}</p>
        </div>
      </section>

      <section data-related-panel className="mx-auto max-w-6xl px-5 py-8 pb-16">
        <div className="rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold">Related service locations</h2>
          <div className="mt-4 flex flex-wrap gap-3">{location.governance.relatedLocations.map((slug) => (
            <Link key={slug} href={`/locations/${slug}`} className="rounded-full border border-yellow-300/30 px-4 py-2 text-sm text-yellow-200 outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">{getLocationDisplayName(slug)}</Link>
          ))}</div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-white/45"><p>Self-canonical: {canonical}</p></footer>
    </main>
  )
}
