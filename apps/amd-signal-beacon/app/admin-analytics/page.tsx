export default function AdminAnalytics() {
  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-amd-gold/25 bg-amd-gold/[0.04] p-6 sm:p-8">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-amd-gold">Signal Beacon Analytics</div>
        <h1 className="mt-3 text-3xl font-black text-white">Public client-side admin access retired</h1>
        <p className="mt-4 text-sm leading-7 text-gray-400">
          The previous dashboard relied on a browser-visible password and local browser storage. That is not an appropriate security boundary for an administrative surface.
        </p>
        <p className="mt-4 text-sm leading-7 text-gray-400">
          Administrative analytics should be exposed only through an authenticated server-side or provider-managed access layer. Until that replacement is implemented, this public route does not expose the old dashboard.
        </p>
        <a href="/" className="mt-6 inline-flex rounded-xl border border-amd-gold/50 px-5 py-3 font-bold text-amd-gold">
          Return to Signal Beacon
        </a>
      </div>
    </main>
  )
}
