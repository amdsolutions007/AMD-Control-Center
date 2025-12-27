'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const mediaCategories = [
  {
    id: 'viral',
    name: 'Viral Edits',
    count: 47,
    projects: [
      {
        id: 1,
        title: 'SkyCap Launch Campaign',
        category: 'Viral Edits',
        views: '2.4M',
        duration: '0:45',
        featured: true,
        thumbnail: '🎬',
        awards: ['Best Digital Campaign 2024'],
      },
      {
        id: 2,
        title: 'Shine AI Artist Reel',
        category: 'Viral Edits',
        views: '1.8M',
        duration: '1:20',
        featured: true,
        thumbnail: '🎵',
        awards: ['Viral Achievement Award'],
      },
      {
        id: 3,
        title: 'NaijaBiz Success Stories',
        category: 'Viral Edits',
        views: '890K',
        duration: '2:15',
        featured: false,
        thumbnail: '🚀',
        awards: [],
      },
    ],
  },
  {
    id: 'commercials',
    name: 'Commercials',
    count: 32,
    projects: [
      {
        id: 4,
        title: 'Enterprise AI Solutions',
        category: 'Commercials',
        views: '3.2M',
        duration: '0:30',
        featured: true,
        thumbnail: '💼',
        awards: ['Best Corporate Film'],
      },
      {
        id: 5,
        title: 'Financial Innovation Spot',
        category: 'Commercials',
        views: '1.5M',
        duration: '0:60',
        featured: false,
        thumbnail: '💰',
        awards: [],
      },
      {
        id: 6,
        title: 'Tech Ecosystem Overview',
        category: 'Commercials',
        views: '2.1M',
        duration: '1:45',
        featured: false,
        thumbnail: '⚡',
        awards: [],
      },
    ],
  },
  {
    id: 'manifesto',
    name: 'Manifesto Videos',
    count: 18,
    projects: [
      {
        id: 7,
        title: 'The Digital Dark',
        category: 'Manifesto Videos',
        views: '5.7M',
        duration: '3:30',
        featured: true,
        thumbnail: '🎭',
        awards: ['Director\'s Choice', 'Best Narrative'],
      },
      {
        id: 8,
        title: 'Working Smartly',
        category: 'Manifesto Videos',
        views: '4.2M',
        duration: '2:45',
        featured: true,
        thumbnail: '💡',
        awards: ['Audience Favorite'],
      },
      {
        id: 9,
        title: 'Solutions 007: Origin Story',
        category: 'Manifesto Videos',
        views: '3.8M',
        duration: '4:10',
        featured: false,
        thumbnail: '🎯',
        awards: [],
      },
    ],
  },
];

export default function MediaPage() {
  const [activeCategory, setActiveCategory] = useState('viral');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const currentCategory = mediaCategories.find(cat => cat.id === activeCategory);

  return (
    <main className="min-h-screen bg-black">
      {/* Film Grain Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      {/* Spotlight Gradient */}
      <div className="fixed left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-radial from-yellow-500/10 via-yellow-600/5 to-transparent blur-3xl" />

      <div className="relative">
        {/* Hero Section */}
        <section className="border-b border-yellow-500/10 px-6 pb-20 pt-32 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Film Strip Decoration */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="mx-auto mb-8 h-2 w-32 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(234, 179, 8, 0.5) 8px, rgba(234, 179, 8, 0.5) 10px)',
                }}
              />

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6 inline-block"
              >
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-yellow-300 backdrop-blur-sm">
                  🎬 NOW SHOWING
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="mb-6 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl lg:text-8xl">
                Media Engineering.
              </h1>

              {/* Subtext */}
              <p className="mx-auto max-w-3xl text-lg text-yellow-100/60 md:text-xl">
                High-performance creatives engineered for{' '}
                <span className="font-semibold text-yellow-300">attention</span>.
              </p>

              {/* Reel Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-12 flex items-center justify-center gap-8 text-sm text-yellow-300/70"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="font-mono">LIVE PRODUCTION</span>
                </div>
                <div className="h-4 w-px bg-yellow-500/20" />
                <span className="font-mono">97 PROJECTS</span>
                <div className="h-4 w-px bg-yellow-500/20" />
                <span className="font-mono">18M+ VIEWS</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Category Filter Tabs */}
        <section className="sticky top-20 z-40 border-b border-yellow-500/10 bg-black/95 px-6 backdrop-blur-xl md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center gap-2 py-6 md:gap-4">
              {mediaCategories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                      : 'border border-yellow-500/20 text-yellow-100/60 hover:border-yellow-500/40 hover:text-yellow-300'
                  }`}
                >
                  <span className="relative z-10">{category.name}</span>
                  <span className="relative z-10 ml-2 text-xs opacity-60">({category.count})</span>
                  {activeCategory === category.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10"
                      transition={{ type: 'spring', duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="px-6 py-20 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {currentCategory?.projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className="group relative cursor-pointer"
                >
                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute -right-2 -top-2 z-20 rotate-12">
                      <div className="flex items-center gap-1 rounded-full border border-yellow-400 bg-gradient-to-r from-yellow-500 to-yellow-600 px-3 py-1 text-xs font-bold text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                        ⭐ FEATURED
                      </div>
                    </div>
                  )}

                  {/* Video Thumbnail Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black transition-all duration-500 group-hover:border-yellow-500/40 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-yellow-900/20 to-black">
                      {/* Icon Placeholder */}
                      <div className="flex h-full items-center justify-center text-8xl opacity-40 transition-all duration-500 group-hover:scale-110 group-hover:opacity-60">
                        {project.thumbnail}
                      </div>

                      {/* Play Button Overlay */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: hoveredProject === project.id ? 1 : 0,
                          scale: hoveredProject === project.id ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                      >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-500 bg-yellow-500/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]">
                          <svg className="ml-1 h-8 w-8 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </motion.div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs font-mono text-yellow-300 backdrop-blur-sm">
                        {project.duration}
                      </div>

                      {/* Scanline Effect */}
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(234,179,8,0.02)_50%)] bg-[length:100%_4px]" />
                    </div>

                    {/* Project Info */}
                    <div className="p-6">
                      <h3 className="mb-2 text-xl font-bold text-yellow-200 group-hover:text-yellow-300">
                        {project.title}
                      </h3>
                      
                      {/* Stats */}
                      <div className="mb-3 flex items-center gap-4 text-sm text-yellow-100/50">
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          <span className="font-mono">{project.views}</span>
                        </div>
                        {project.awards.length > 0 && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs">{project.awards.length}</span>
                          </div>
                        )}
                      </div>

                      {/* Awards */}
                      {project.awards.length > 0 && (
                        <div className="space-y-1">
                          {project.awards.map((award, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-yellow-400/80">
                              <div className="h-1 w-1 rounded-full bg-yellow-400" />
                              <span>{award}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Director's Cut Label */}
                      {project.featured && (
                        <div className="mt-4 border-t border-yellow-500/10 pt-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-yellow-500/70">Director's Cut Available</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Accent */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 transition-all duration-500 group-hover:w-full" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Behind the Scenes Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-20 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-black p-8 md:p-12"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-2xl">
                  🎥
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-yellow-300">Behind the Scenes</h3>
                  <p className="text-sm text-yellow-100/50">The making of award-winning content</p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { stat: '12+', label: 'Production Crew', icon: '👥' },
                  { stat: '4K', label: 'Cinema Quality', icon: '📹' },
                  { stat: '72hrs', label: 'Avg. Turnaround', icon: '⚡' },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl border border-yellow-500/10 bg-black/40 p-6 text-center backdrop-blur-sm">
                    <div className="mb-2 text-3xl">{item.icon}</div>
                    <div className="mb-1 text-3xl font-bold text-yellow-300">{item.stat}</div>
                    <div className="text-sm text-yellow-100/60">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-yellow-500/10 px-6 py-20 md:px-12 lg:px-24">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="mb-6 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Ready for Your Premiere?
              </h2>
              <p className="mb-10 text-lg text-yellow-100/60">
                Let's engineer content that commands attention and converts viewers into believers.
              </p>
              <motion.a
                href="https://wa.me/2348148419412?text=I%20want%20to%20discuss%20a%20media%20production%20project"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border-2 border-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-4 font-semibold text-black shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(234,179,8,0.5)]"
              >
                <span className="relative z-10">Start Your Production</span>
                <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
