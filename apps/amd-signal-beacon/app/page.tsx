export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            🚀 AMD Signal Beacon Pro
          </h1>
          <p className="text-xl text-gray-300">
            RSS Content Engine for African Tech Ecosystem Domination
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-green-500 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-green-400">📡 RSS Feed URL</h2>
          <div className="bg-gray-900 p-4 rounded border border-gray-700 mb-4">
            <code className="text-green-300 break-all">
              https://amd-signal-beacon.vercel.app/api/feed
            </code>
          </div>
          <a
            href="/api/feed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔗 View RSS Feed
          </a>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-blue-500 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">⚙️ System Features</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Time-Gated Publishing:</strong> Posts only appear when publishTime has passed</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Dynamic Hooks:</strong> Viral prefixes auto-applied to every post</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>State-Specific CTAs:</strong> Footers adapt based on content tags</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Auto-Branding:</strong> Every post drives traffic to your group</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Content Queue System:</strong> Schedule weeks of content in advance</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-purple-500">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">📋 How to Use</h2>
          <ol className="space-y-4 text-gray-300">
            <li className="flex items-start">
              <span className="text-purple-400 font-bold mr-3">1.</span>
              <span>Copy your RSS feed URL from above</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 font-bold mr-3">2.</span>
              <span>Go to Leke Leke → Settings → Auto-Import Feeds</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 font-bold mr-3">3.</span>
              <span>Add the feed URL and set sync frequency to "Every 2h"</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 font-bold mr-3">4.</span>
              <span>Edit <code className="bg-gray-900 px-2 py-1 rounded text-green-300">data/posts.json</code> to queue new content</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 font-bold mr-3">5.</span>
              <span>Deploy to Vercel and watch your group grow 🚀</span>
            </li>
          </ol>
        </div>

        <div className="text-center mt-12 text-gray-400">
          <p className="text-lg">Built by AMD Solutions</p>
          <p className="text-sm">Illuminating the Digital Dark 🌍💻</p>
        </div>
      </div>
    </main>
  );
}
