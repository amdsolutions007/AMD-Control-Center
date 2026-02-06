'use client';

import React, { useState, useEffect } from 'react';
import { getVideoAnalytics, getSessionAnalytics, getAnalyticsSummary, exportAnalytics } from '@/lib/analytics';
import videosData from '@/data/videos.json';

export default function AdminAnalytics() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [premiumWaitlist, setPremiumWaitlist] = useState(0);

  // Check if already authenticated in session
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadAnalytics();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Password check - default is 'amd007' but can be changed
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'amd007';
    
    if (password === correctPassword) {
      sessionStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
      loadAnalytics();
    } else {
      setError('❌ Invalid password. Try again, Agent.');
    }
  };

  const loadAnalytics = () => {
    const summary = getAnalyticsSummary();
    const videos = getVideoAnalytics();
    const session = getSessionAnalytics();
    
    setAnalytics({
      summary,
      videos,
      session,
    });
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  const handleExport = () => {
    const data = exportAnalytics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amd-signal-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amd-gold mb-2">🎖️</h1>
            <h1 className="text-3xl font-bold text-amd-gold mb-2">
              AMD SIGNAL BEACON
            </h1>
            <p className="text-gray-400">Analytics Command Center</p>
          </div>

          <form onSubmit={handleLogin} className="bg-black border-2 border-amd-gold rounded-lg p-8">
            <div className="mb-6">
              <label className="block text-amd-gold font-semibold mb-2">
                ENTER AUTHORIZATION CODE
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-amd-gold text-white px-4 py-3 rounded focus:outline-none focus:border-[#FFD700]"
                placeholder="•••••••"
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amd-gold text-black font-bold py-3 rounded hover:bg-[#FFD700] transition-colors"
            >
              ACCESS INTEL
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Authorized Personnel Only • AMD Agent 007
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  const allVideos = [videosData.featured, ...videosData.grid];
  const mostWatchedVideo = analytics?.videos?.sort((a: any, b: any) => b.totalClicks - a.totalClicks)[0];
  const mostWatchedVideoData = allVideos.find((v) => v.id === mostWatchedVideo?.videoId);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-amd-gold/20 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-amd-gold">🎖️ SIGNAL BEACON ANALYTICS</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-amd-gold text-amd-gold rounded hover:bg-amd-gold hover:text-black transition-colors text-sm"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-amd-gold text-black rounded hover:bg-[#FFD700] transition-colors text-sm font-semibold"
            >
              📥 Export Data
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors text-sm"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon="📺"
            title="Total Video Clicks"
            value={analytics?.summary?.totalVideoClicks || 0}
            subtitle={`${analytics?.summary?.uniqueVideosClicked || 0} videos engaged`}
          />
          <MetricCard
            icon="👁️"
            title="Section Views"
            value={analytics?.summary?.sectionViewed ? 'Yes' : 'Not Yet'}
            subtitle={`${analytics?.summary?.maxScrollDepth || 0}% scroll depth`}
          />
          <MetricCard
            icon="📞"
            title="WhatsApp Clicks"
            value={analytics?.session?.ctaClicked?.whatsapp || 0}
            subtitle="War Room conversions"
          />
          <MetricCard
            icon="💎"
            title="Premium Interest"
            value={analytics?.session?.ctaClicked?.premium || 0}
            subtitle={`+ ${premiumWaitlist} manual entries`}
          />
        </div>

        {/* Premium Waitlist Tracker */}
        <div className="bg-gradient-to-br from-[rgba(218,165,32,0.1)] to-black border-2 border-amd-gold rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-amd-gold mb-1">💎 PREMIUM WAITLIST TRACKER</h2>
              <p className="text-gray-400 text-sm">Manual tracking of War Room "007" replies</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amd-gold">{premiumWaitlist}</div>
              <div className="text-xs text-gray-500">members waiting</div>
            </div>
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Add War Room "007" Replies:</label>
              <input
                type="number"
                value={premiumWaitlist}
                onChange={(e) => setPremiumWaitlist(parseInt(e.target.value) || 0)}
                className="w-full bg-black border border-amd-gold text-white px-4 py-2 rounded focus:outline-none focus:border-[#FFD700]"
                min="0"
              />
            </div>
            <div className="flex-1">
              <div className="bg-black/50 border border-amd-gold/30 rounded p-4">
                <div className="text-sm text-gray-400 mb-1">Projected Revenue (15% conversion @ $9/mo)</div>
                <div className="text-2xl font-bold text-amd-gold">
                  ${Math.round(premiumWaitlist * 0.15 * 9)}/mo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Performance */}
        <div className="bg-black border-2 border-amd-gold rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-amd-gold mb-4">📊 VIDEO PERFORMANCE</h2>
          
          {mostWatchedVideoData && (
            <div className="bg-gradient-to-br from-[rgba(218,165,32,0.1)] to-black border border-amd-gold/30 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-gray-400 mb-1">🏆 TOP PERFORMER</div>
                  <div className="text-lg font-bold text-white mb-1">{mostWatchedVideoData.title}</div>
                  <div className="text-sm text-gray-400">by {mostWatchedVideoData.creator}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amd-gold">{mostWatchedVideo?.totalClicks || 0}</div>
                  <div className="text-xs text-gray-500">clicks</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {allVideos.map((video) => {
              const videoStats = analytics?.videos?.find((v: any) => v.videoId === video.id);
              const clicks = videoStats?.totalClicks || 0;
              const maxClicks = Math.max(...(analytics?.videos?.map((v: any) => v.totalClicks) || [1]));
              const percentage = maxClicks > 0 ? (clicks / maxClicks) * 100 : 0;

              return (
                <div key={video.id} className="bg-black/50 border border-amd-gold/20 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{video.title}</div>
                      <div className="text-xs text-gray-500">by {video.creator}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-amd-gold">{clicks}</div>
                      <div className="text-xs text-gray-500">clicks</div>
                    </div>
                  </div>
                  <div className="w-full bg-black rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-amd-gold to-[#FFD700] h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-black border-2 border-amd-gold rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-amd-gold mb-4">🎯 CONVERSION FUNNEL</h2>
          
          <div className="space-y-4">
            <FunnelStep
              label="Section Viewed"
              value={analytics?.summary?.sectionViewed ? 'Yes' : 'No'}
              description="User scrolled to video section"
            />
            <FunnelStep
              label="Video Engagement"
              value={`${analytics?.summary?.totalVideoClicks || 0} clicks`}
              description={`${analytics?.summary?.uniqueVideosClicked || 0} unique videos`}
            />
            <FunnelStep
              label="WhatsApp CTA"
              value={`${analytics?.session?.ctaClicked?.whatsapp || 0} clicks`}
              description="War Room conversions"
            />
            <FunnelStep
              label="Leke Leke CTA"
              value={`${analytics?.session?.ctaClicked?.lekeLeke || 0} clicks`}
              description="Social platform follows"
            />
            <FunnelStep
              label="Premium CTA"
              value={`${analytics?.session?.ctaClicked?.premium || 0} clicks`}
              description="Waitlist interest"
              highlight
            />
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-black border border-amd-gold/30 rounded-lg p-6">
          <h2 className="text-lg font-bold text-amd-gold mb-4">📡 SESSION INFO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Session Start:</div>
              <div className="text-white font-mono">
                {analytics?.session?.sessionStart 
                  ? new Date(analytics.session.sessionStart).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Max Scroll Depth:</div>
              <div className="text-white font-mono">{analytics?.summary?.maxScrollDepth || 0}%</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-br from-[rgba(218,165,32,0.05)] to-black border border-amd-gold/20 rounded-lg p-6">
          <h3 className="text-sm font-bold text-amd-gold mb-3">📚 USAGE INSTRUCTIONS</h3>
          <ul className="text-xs text-gray-400 space-y-2">
            <li>• <strong className="text-white">Refresh:</strong> Click refresh button to reload latest analytics data</li>
            <li>• <strong className="text-white">Export:</strong> Download JSON file for weekly reports</li>
            <li>• <strong className="text-white">Premium Waitlist:</strong> Manually enter War Room "007" reply count</li>
            <li>• <strong className="text-white">Data Source:</strong> Client-side localStorage (users' browsers)</li>
            <li>• <strong className="text-white">Privacy:</strong> No external tracking, all data stays local</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle }: any) {
  return (
    <div className="bg-black border-2 border-amd-gold rounded-lg p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-amd-gold mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

function FunnelStep({ label, value, description, highlight }: any) {
  return (
    <div className={`${highlight ? 'bg-gradient-to-r from-[rgba(218,165,32,0.2)] to-black border-2 border-amd-gold' : 'bg-black/50 border border-amd-gold/20'} rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-white">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
        <div className={`text-xl font-bold ${highlight ? 'text-amd-gold' : 'text-white'}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
