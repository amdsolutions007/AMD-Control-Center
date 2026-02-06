'use client';

import React, { useEffect, useRef } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import { trackVideoClick, trackSectionView, trackCTAClick, trackScrollDepth } from '@/lib/analytics';

interface Video {
  id: string;
  title: string;
  creator: string;
  duration: string;
  category: string;
  take007: string;
  why007?: string;
  toolsMentioned?: string[];
  actionable?: string;
}

interface VideoData {
  featured: Video;
  grid: Video[];
}

export default function VideoGrid({ videos }: { videos: VideoData }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Track section view when it enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackSectionView();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Track scroll depth
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const depth = Math.round((scrolled / height) * 100);
      trackScrollDepth(depth);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleVideoClick = (videoId: string, title: string) => {
    trackVideoClick(videoId, title);
  };

  return (
    <section ref={sectionRef} className="py-16 px-6 border-t border-amd-gold border-opacity-20 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">📺</span>
            <h2 className="text-3xl md:text-4xl font-bold text-amd-gold">
              VISUAL INTEL BRIEFING
            </h2>
          </div>
          <p className="text-gray-400 text-lg">
            What African Builders Are Watching • Curated by AMD Agent 007
          </p>
        </div>

        {/* Featured Video */}
        <div className="mb-12">
          <div className="relative bg-black border-2 border-amd-gold rounded-lg overflow-hidden max-w-4xl mx-auto">
            {/* 007 TOP PICK Badge */}
            <div className="absolute top-4 left-4 z-10 bg-amd-gold text-black px-3 py-1 rounded-md font-bold text-sm">
              🎖️ 007 TOP PICK
            </div>
            
            {/* Video Embed */}
            <div className="aspect-video" onClick={() => handleVideoClick(videos.featured.id, videos.featured.title)}>
              <LiteYouTubeEmbed
                id={videos.featured.id}
                title={videos.featured.title}
                poster="maxresdefault"
                noCookie={true}
              />
            </div>

            {/* Video Info */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-bold text-white">
                  {videos.featured.title}
                </h3>
                <span className="text-xs bg-amd-gold text-black px-2 py-1 rounded whitespace-nowrap font-semibold">
                  {videos.featured.duration}
                </span>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  {videos.featured.take007}
                </p>
                
                {videos.featured.why007 && (
                  <div className="bg-black/50 border border-amd-gold/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      <span className="text-amd-gold font-semibold">📡 WHY 007 PICKED THIS:</span>{' '}
                      {videos.featured.why007}
                    </p>
                    {videos.featured.actionable && (
                      <p className="text-sm text-gray-400">
                        <span className="text-amd-gold font-semibold">🎯 ACTION STEP:</span>{' '}
                        {videos.featured.actionable}
                      </p>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Original content by <span className="text-amd-gold">{videos.featured.creator}</span> • 
                  Curated by <span className="text-amd-gold font-semibold">AMD Agent 007</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.grid.map((video) => (
            <article 
              key={video.id}
              className="group relative bg-black border-2 border-amd-gold rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-amd-gold transition-all duration-300"
            >
              {/* Category Badge */}
              <div className="absolute top-3 left-3 z-10 bg-black border border-amd-gold text-amd-gold px-2 py-1 rounded text-xs font-semibold">
                {video.category}
              </div>

              {/* Duration Badge */}
              <div className="absolute top-3 right-3 z-10 bg-amd-gold text-black px-2 py-1 rounded text-xs font-bold">
                {video.duration}
              </div>

              {/* Video Embed */}
              <div className="aspect-video" onClick={() => handleVideoClick(video.id, video.title)}>
                <LiteYouTubeEmbed
                  id={video.id}
                  title={video.title}
                  poster="maxresdefault"
                  noCookie={true}
                />
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-amd-gold transition-colors">
                  {video.title}
                </h3>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {video.take007}
                  </p>
                  
                  {video.why007 && (
                    <div className="bg-black/50 border border-amd-gold/30 rounded-lg p-3 space-y-2">
                      <p className="text-xs text-gray-400 leading-relaxed">
                        <span className="text-amd-gold font-semibold">📡 WHY:</span>{' '}
                        {video.why007}
                      </p>
                      {video.actionable && (
                        <p className="text-xs text-gray-400">
                          <span className="text-amd-gold font-semibold">🎯 ACTION:</span>{' '}
                          {video.actionable}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    by <span className="text-amd-gold">{video.creator}</span> • Curated by <span className="text-amd-gold font-semibold">007</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Conversion CTA + Premium Announcement */}
        <div className="mt-12 space-y-6">
          {/* Premium Tier Announcement */}
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-black via-[rgba(218,165,32,0.15)] to-black border-2 border-amd-gold rounded-lg p-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-4xl">🎖️</span>
              <h3 className="text-2xl font-bold text-amd-gold">
                AMD PREMIUM INTELLIGENCE
              </h3>
            </div>
            <p className="text-gray-300 mb-4 text-lg">
              <span className="text-amd-gold font-semibold">Coming Soon:</span> Access 007's full AI tool arsenal, 
              private deal alerts, and weekly video breakdowns you won't find anywhere else.
            </p>
            <p className="text-gray-400 mb-6">
              • Early access to new tools before public release<br/>
              • Exclusive affiliate deals (save $50-$500/year on AI tools)<br/>
              • Weekly video analysis deep-dives with tool recommendations<br/>
              • Direct 007 support in private Premium War Room
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://chat.whatsapp.com/KmTlNs5TTV69xPNzRkcMZc"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick('premium')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amd-gold text-black font-bold text-lg rounded-lg shadow-2xl hover:bg-[#FFD700] hover:scale-105 transition-all"
              >
                <span>🎯</span>
                <span>Join Waitlist (Free War Room) →</span>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              💎 First 50 members get lifetime 50% discount when Premium launches
            </p>
          </div>

          {/* Community CTA */}
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-[rgba(218,165,32,0.1)] to-[rgba(0,0,0,0)] border-2 border-amd-gold rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-amd-gold mb-3">
              💬 Discuss These Videos in the War Room
            </h3>
            <p className="text-gray-300 mb-6">
              Join 127+ active builders sharing insights, hot takes, and actionable strategies from these videos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://chat.whatsapp.com/KmTlNs5TTV69xPNzRkcMZc"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick('whatsapp')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amd-gold text-black font-bold text-lg rounded-lg shadow-2xl hover:bg-[#FFD700] hover:scale-105 transition-all"
              >
                <span>📞</span>
                <span>Join WhatsApp War Room →</span>
              </a>
              <a
                href="https://www.lekeelekee.com/@amd"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick('lekeLeke')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-amd-gold text-amd-gold font-bold text-lg rounded-lg hover:bg-amd-gold hover:text-black transition-all"
              >
                <span>✈️</span>
                <span>Follow on Leke Leke →</span>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              🔥 New videos curated weekly by AMD Agent 007
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
