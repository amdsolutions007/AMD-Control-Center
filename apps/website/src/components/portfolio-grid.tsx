'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const projects = [
  {
    id: 1,
    name: 'Naija-Prop-Intel',
    emoji: '🏠',
    description: 'AI-powered real estate intelligence platform analyzing Nigerian property market trends and valuations',
    category: 'Real Estate',
    tech: ['Python', 'AI/ML', 'PostgreSQL'],
    github: 'https://github.com/amdsolutions007/Naija-Prop-Intel',
    featured: true,
  },
  {
    id: 2,
    name: 'Naija-Voice-AI',
    emoji: '🎤',
    description: 'Advanced voice transcription and analysis system for Nigerian languages and accents',
    category: 'AI/ML',
    tech: ['Python', 'Speech Recognition', 'NLP'],
    github: 'https://github.com/amdsolutions007/Naija-Voice-AI',
    featured: true,
  },
  {
    id: 3,
    name: 'AMD-Control-Center',
    emoji: '🎮',
    description: 'Unified project management hub orchestrating all AMD Solutions systems and deployments',
    category: 'Enterprise',
    tech: ['Next.js', 'TypeScript', 'Vercel'],
    github: 'https://github.com/amdsolutions007/AMD-Control-Center',
    featured: true,
  },
  {
    id: 4,
    name: 'Naija-Resume-Scanner',
    emoji: '📄',
    description: 'Intelligent CV analysis tool extracting insights and matching candidates to Nigerian job market',
    category: 'AI/ML',
    tech: ['Python', 'NLP', 'Machine Learning'],
    github: 'https://github.com/amdsolutions007/Naija-Resume-Scanner',
    featured: false,
  },
  {
    id: 5,
    name: 'NaijaLaw-GPT',
    emoji: '⚖️',
    description: 'Legal AI assistant trained on Nigerian law providing instant legal guidance and document analysis',
    category: 'Legal Tech',
    tech: ['Python', 'GPT', 'Legal AI'],
    github: 'https://github.com/amdsolutions007/NaijaLaw-GPT',
    featured: true,
  },
  {
    id: 6,
    name: 'Naija-Rent-Estimator',
    emoji: '💰',
    description: 'ML-powered rent prediction system analyzing Nigerian rental market patterns and pricing',
    category: 'Real Estate',
    tech: ['Python', 'ML', 'Data Analysis'],
    github: 'https://github.com/amdsolutions007/Naija-Rent-Estimator',
    featured: false,
  },
  {
    id: 7,
    name: 'Naira-AI-Crypto-Tracker',
    emoji: '₦',
    description: 'Real-time cryptocurrency analytics tracking Naira exchange rates and market predictions',
    category: 'Fintech',
    tech: ['Python', 'AI', 'APIs'],
    github: 'https://github.com/amdsolutions007/Naira-AI-Crypto-Tracker',
    featured: false,
  },
  {
    id: 8,
    name: 'AMD-Activity-Booster',
    emoji: '⚡',
    description: 'Productivity optimization system automating social media engagement and growth metrics',
    category: 'Automation',
    tech: ['Python', 'APIs', 'Automation'],
    github: 'https://github.com/amdsolutions007/AMD-Activity-Booster',
    featured: false,
  },
  {
    id: 9,
    name: 'AMD-Global-Intelligence',
    emoji: '🌍',
    description: 'Market intelligence platform aggregating global trends and competitive insights',
    category: 'Enterprise',
    tech: ['Python', 'Data Mining', 'Analytics'],
    github: 'https://github.com/amdsolutions007/AMD-Global-Intelligence',
    featured: false,
  },
  {
    id: 10,
    name: 'AMD-Content-AI',
    emoji: '✍️',
    description: 'AI-powered content generation system creating articles, captions, and marketing copy',
    category: 'AI/ML',
    tech: ['Python', 'GPT', 'NLP'],
    github: 'https://github.com/amdsolutions007/AMD-Content-AI',
    featured: false,
  },
  {
    id: 11,
    name: 'AMD-ML-Predictor',
    emoji: '🔮',
    description: 'Machine learning prediction engine for business forecasting and trend analysis',
    category: 'AI/ML',
    tech: ['Python', 'TensorFlow', 'ML'],
    github: 'https://github.com/amdsolutions007/AMD-ML-Predictor',
    featured: false,
  },
  {
    id: 12,
    name: 'AMD-DB-Manager',
    emoji: '🗄️',
    description: 'Enterprise database management system with automated backups and query optimization',
    category: 'Enterprise',
    tech: ['Python', 'PostgreSQL', 'Redis'],
    github: 'https://github.com/amdsolutions007/AMD-DB-Manager',
    featured: false,
  },
  {
    id: 13,
    name: 'AMD-API-Nexus',
    emoji: '🔌',
    description: 'Unified API gateway connecting all AMD systems with authentication and rate limiting',
    category: 'Enterprise',
    tech: ['Python', 'FastAPI', 'Docker'],
    github: 'https://github.com/amdsolutions007/AMD-API-Nexus',
    featured: false,
  },
  {
    id: 14,
    name: 'AMD-Data-Engine',
    emoji: '📊',
    description: 'High-performance data processing pipeline handling millions of records daily',
    category: 'Enterprise',
    tech: ['Python', 'Apache Spark', 'ETL'],
    github: 'https://github.com/amdsolutions007/AMD-Data-Engine',
    featured: false,
  },
  {
    id: 15,
    name: 'AMD-Alert-System',
    emoji: '🔔',
    description: 'Real-time notification system with multi-channel delivery and priority routing',
    category: 'Enterprise',
    tech: ['Python', 'WebSockets', 'Redis'],
    github: 'https://github.com/amdsolutions007/AMD-Alert-System',
    featured: false,
  },
  {
    id: 16,
    name: 'SkyCap AI',
    emoji: '☁️',
    description: 'Cloud analytics platform monitoring infrastructure performance and cost optimization',
    category: 'AI/ML',
    tech: ['Python', 'AWS', 'ML'],
    github: 'https://github.com/amdsolutions007/SkyCap-AI',
    featured: false,
  },
  {
    id: 17,
    name: 'Shine AI',
    emoji: '✨',
    description: 'AI artist tool generating music, artwork, and creative content for digital campaigns',
    category: 'AI/ML',
    tech: ['Python', 'Generative AI', 'APIs'],
    github: 'https://github.com/amdsolutions007/Shine-AI',
    featured: false,
  },
  {
    id: 18,
    name: 'NaijaBiz Assist',
    emoji: '🚀',
    description: 'Business automation assistant helping Nigerian entrepreneurs streamline operations',
    category: 'Automation',
    tech: ['Python', 'AI', 'Automation'],
    github: 'https://github.com/amdsolutions007/NaijaBiz-Assist',
    featured: false,
  },
];

const categories = [
  'All Projects',
  'AI/ML',
  'Real Estate',
  'Enterprise',
  'Fintech',
  'Legal Tech',
  'Automation',
];

export function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState('All Projects');

  const filteredProjects =
    activeCategory === 'All Projects'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section className="border-b border-yellow-500/10 px-6 pb-20 pt-32 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <span className="text-sm font-semibold uppercase tracking-wider text-yellow-500/70">
              Intelligence Arsenal
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          <h2 className="mb-6 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] md:text-6xl">
            AI & Software Projects
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-yellow-100/60 md:text-xl">
            18 production-grade systems powering Nigerian businesses with custom AI, automation, and enterprise solutions.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2">
              <span className="text-2xl">🏆</span>
              <span className="text-sm font-semibold text-yellow-300">18 Active Projects</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2">
              <span className="text-2xl">💻</span>
              <span className="text-sm font-semibold text-yellow-300">50K+ Lines of Code</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2">
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-semibold text-yellow-300">12 Technologies</span>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {categories.map((category, idx) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              viewport={{ once: true }}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? 'border border-yellow-500 bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]'
                  : 'border border-yellow-500/20 bg-black/40 text-yellow-300 hover:border-yellow-500/40 hover:bg-yellow-500/10'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Featured Badge */}
              {project.featured && (
                <div className="absolute -right-2 -top-2 z-20 rotate-12">
                  <div className="flex items-center gap-1 rounded-full border border-yellow-400 bg-gradient-to-r from-yellow-500 to-yellow-600 px-3 py-1 text-xs font-bold text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                    ⭐ FEATURED
                  </div>
                </div>
              )}

              {/* Card */}
              <div className="relative h-full overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black p-6 transition-all duration-500 group-hover:border-yellow-500/40 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                {/* Icon */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-4xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                    {project.emoji}
                  </div>
                  <div className="rounded-full border border-yellow-500/20 bg-black/60 px-3 py-1 text-xs font-semibold text-yellow-400">
                    {project.category}
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl font-bold text-yellow-200 transition-colors group-hover:text-yellow-300">
                  {project.name}
                </h3>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-yellow-100/60">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-yellow-500/20 bg-yellow-500/5 px-2 py-1 text-xs font-mono text-yellow-400/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300 transition-all duration-300 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>

                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 transition-all duration-500 group-hover:w-full"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-black p-8 text-center md:p-12"
        >
          <h3 className="mb-4 text-3xl font-bold text-yellow-300">Need a Custom Solution?</h3>
          <p className="mb-6 text-lg text-yellow-100/60">
            Let's build the next AI-powered system for your business.
          </p>
          <a
            href="https://wa.me/2349134492041?text=Hi%2C%20I%27d%20like%20to%20discuss%20a%20custom%20AI%2Fsoftware%20project"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-yellow-500 bg-yellow-500 px-8 py-3 text-base font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]"
          >
            <span className="text-xl">💬</span>
            Start Your Project
          </a>
        </motion.div>
      </div>
    </section>
  );
}
