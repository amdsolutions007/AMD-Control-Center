export default function IntelligencePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pt-28 pb-16">
      <h1 className="text-3xl font-semibold">Intelligence</h1>
      <p className="mt-3 text-white/70">
        Proprietary tools: SkyCap AI, Shine AI, NaijaBiz Assist.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {['SkyCap AI', 'Shine AI', 'NaijaBiz Assist'].map((name) => (
          <div key={name} className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-semibold">{name}</div>
            <div className="mt-2 text-white/70">
              Internal product module (scaffold).
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
