'use client';

import { motion } from 'framer-motion';

const techStack = [
  { name: 'Python', icon: '🐍', category: 'Backend' },
  { name: 'Next.js', icon: '⚡', category: 'Frontend' },
  { name: 'React', icon: '⚛️', category: 'Frontend' },
  { name: 'TypeScript', icon: '📘', category: 'Frontend' },
  { name: 'AI/ML', icon: '🤖', category: 'AI' },
  { name: 'TensorFlow', icon: '🧠', category: 'AI' },
  { name: 'PostgreSQL', icon: '🐘', category: 'Database' },
  { name: 'Redis', icon: '🔴', category: 'Database' },
  { name: 'Docker', icon: '🐳', category: 'DevOps' },
  { name: 'AWS', icon: '☁️', category: 'Cloud' },
  { name: 'Vercel', icon: '▲', category: 'Cloud' },
  { name: 'FastAPI', icon: '🚀', category: 'Backend' },
];

const timeline = [
  {
    year: '2021',
    title: 'Genesis',
    description: 'Founded with a mission to bring world-class AI to Nigerian businesses',
    icon: '🌟',
  },
  {
    year: '2022',
    title: 'First AI Systems',
    description: 'Launched Naija-Prop-Intel and NaijaLaw-GPT, serving 50+ businesses',
    icon: '🚀',
  },
  {
    year: '2023',
    title: 'Media Evolution',
    description: 'Expanded into viral content production, reaching 20M+ views',
    icon: '🎬',
  },
  {
    year: '2024',
    title: 'Enterprise Scale',
    description: '18 active projects, 25+ clients, ₦2.5B+ revenue generated',
    icon: '🏆',
  },
];

const values = [
  {
    icon: '🎯',
    title: 'Mission-Driven',
    description: 'Illuminating the digital dark - bringing clarity to complex business challenges through custom technology',
  },
  {
    icon: '⚡',
    title: 'Speed & Quality',
    description: 'Delivering production-grade systems in weeks, not months, without compromising on excellence',
  },
  {
    icon: '🇳🇬',
    title: 'Nigerian Focus',
    description: 'Building solutions specifically for Nigerian businesses, understanding local challenges and opportunities',
  },
  {
    icon: '🔬',
    title: 'Innovation First',
    description: 'Staying on the cutting edge of AI, automation, and media technology to give clients competitive advantages',
  },
];

export function AboutSection() {
  return (
    <section className="border-b border-yellow-500/10 px-6 py-20 md:px-12 lg:px-24">
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
              About AMD Solutions 007
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          <h2 className="mb-6 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] md:text-6xl">
            Licensed To Solve
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-yellow-100/60 md:text-xl">
            We're not just another tech agency. We're your secret weapon in the digital transformation revolution.
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-black p-8 md:p-12"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-4xl">
              🕵️
            </div>
            <div>
              <h3 className="text-3xl font-bold text-yellow-300">Why "007"?</h3>
              <p className="text-sm text-yellow-100/50">Licensed to solve impossible problems</p>
            </div>
          </div>
          <div className="space-y-4 text-yellow-100/70">
            <p>
              <span className="font-bold text-yellow-300">AMD Solutions 007</span> was born from a simple observation: 
              Nigerian businesses were trapped in the "digital dark" - struggling with outdated systems, manual processes, 
              and missing out on the AI revolution happening worldwide.
            </p>
            <p>
              We decided to change that. Like Agent 007, we take on the impossible missions - the custom AI systems others 
              say can't be built, the viral content strategies that seem too ambitious, the automation workflows deemed 
              "too complex."
            </p>
            <p>
              Today, we're proud to have <span className="font-bold text-yellow-300">18 active production systems</span>, 
              serving <span className="font-bold text-yellow-300">25+ clients</span> across real estate, legal tech, 
              fintech, and media. Our solutions have generated over{' '}
              <span className="font-bold text-yellow-300">₦2.5 billion</span> in client revenue.
            </p>
            <p className="font-semibold text-yellow-300">
              We don't just build software. We architect growth systems that transform businesses.
            </p>
          </div>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="mb-8 text-center text-3xl font-bold text-yellow-300">Our Core Values</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black p-6 transition-all duration-500 hover:border-yellow-500/40 hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-3xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  {value.icon}
                </div>
                <h4 className="mb-2 text-xl font-bold text-yellow-200 transition-colors group-hover:text-yellow-300">
                  {value.title}
                </h4>
                <p className="text-sm text-yellow-100/70">{value.description}</p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 transition-all duration-500 group-hover:w-full"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="mb-12 text-center text-3xl font-bold text-yellow-300">Our Journey</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-yellow-500 via-yellow-300 to-yellow-500"></div>

            {timeline.map((milestone, idx) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className={`relative mb-12 flex items-center gap-8 ${
                  idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`w-5/12 ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black p-6 transition-all duration-500 hover:border-yellow-500/40 hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                    <div className="mb-2 text-sm font-bold text-yellow-500">{milestone.year}</div>
                    <h4 className="mb-2 text-xl font-bold text-yellow-200">{milestone.title}</h4>
                    <p className="text-sm text-yellow-100/70">{milestone.description}</p>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-yellow-500 bg-black text-3xl shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                  {milestone.icon}
                </div>

                {/* Spacer */}
                <div className="w-5/12"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="mb-8 text-center text-3xl font-bold text-yellow-300">Our Tech Arsenal</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {techStack.map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black p-4 text-center transition-all duration-500 hover:border-yellow-500/40 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]"
              >
                <div className="mb-2 text-4xl transition-all duration-500 group-hover:scale-125">{tech.icon}</div>
                <div className="text-sm font-semibold text-yellow-200">{tech.name}</div>
                <div className="text-xs text-yellow-500/60">{tech.category}</div>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 transition-all duration-500 group-hover:w-full"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-black p-8 text-center md:p-12"
        >
          <h3 className="mb-4 text-3xl font-bold text-yellow-300">Ready to Start Your Mission?</h3>
          <p className="mb-6 text-lg text-yellow-100/60">
            Let's discuss how AMD Solutions 007 can transform your business with custom AI, automation, and media production.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/2349134492041?text=Hi%2C%20I%27d%20like%20to%20learn%20more%20about%20AMD%20Solutions%20007"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-yellow-500 bg-yellow-500 px-8 py-3 text-base font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]"
            >
              <span className="text-xl">💬</span>
              Let's Talk
            </a>
            <a
              href="https://amdsolutions007.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-8 py-3 text-base font-bold text-yellow-300 transition-all duration-300 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
            >
              <span className="text-xl">💼</span>
              View Full Portfolio
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
