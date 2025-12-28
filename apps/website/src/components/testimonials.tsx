'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'Chidinma Okonkwo',
    role: 'CEO, PropTech Nigeria',
    company: 'Real Estate Tech Startup',
    avatar: '👩🏿‍💼',
    quote: 'Naija-Prop-Intel transformed how we analyze the Nigerian property market. The AI predictions are 94% accurate - game-changing for our business.',
    project: 'Naija-Prop-Intel',
    metrics: {
      label: 'Revenue Increase',
      value: '340%',
    },
    featured: true,
  },
  {
    id: 2,
    name: 'Emeka Adeyemi',
    role: 'Founder, LegalTech Solutions',
    company: 'Law Firm Automation',
    avatar: '👨🏿‍⚖️',
    quote: 'NaijaLaw-GPT saved us 20+ hours per week on legal research. The system understands Nigerian law better than most junior associates.',
    project: 'NaijaLaw-GPT',
    metrics: {
      label: 'Time Saved',
      value: '20hrs/week',
    },
    featured: false,
  },
  {
    id: 3,
    name: 'Fatima Bello',
    role: 'Marketing Director',
    company: 'E-commerce Platform',
    avatar: '👩🏿‍💻',
    quote: 'The viral video campaign delivered 5.7M views in 2 weeks. Our sales tripled overnight. AMD Solutions understands what resonates.',
    project: 'Media Production',
    metrics: {
      label: 'Sales Increase',
      value: '3x',
    },
    featured: true,
  },
  {
    id: 4,
    name: 'Oluwaseun Ibrahim',
    role: 'CTO, Fintech Startup',
    company: 'Cryptocurrency Exchange',
    avatar: '👨🏿‍💼',
    quote: 'The Naira-AI-Crypto-Tracker helped us optimize trading strategies. ROI was 5x our investment in the first quarter alone.',
    project: 'Naira-AI-Crypto-Tracker',
    metrics: {
      label: 'ROI',
      value: '5x',
    },
    featured: false,
  },
  {
    id: 5,
    name: 'Aisha Mohammed',
    role: 'Operations Manager',
    company: 'Logistics Company',
    avatar: '👩🏿‍✈️',
    quote: 'AMD-Alert-System reduced our response time from hours to minutes. Customer satisfaction jumped to 96%. Worth every kobo.',
    project: 'AMD-Alert-System',
    metrics: {
      label: 'Response Time',
      value: '-85%',
    },
    featured: false,
  },
  {
    id: 6,
    name: 'Chukwuma Nwosu',
    role: 'Founder, Media Agency',
    company: 'Content Production Studio',
    avatar: '👨🏿‍🎨',
    quote: 'Working with AMD Solutions elevated our entire production quality. Clients now come to us specifically for AMD-style content.',
    project: 'Media Training',
    metrics: {
      label: 'Client Growth',
      value: '+150%',
    },
    featured: true,
  },
];

const caseStudies = [
  {
    id: 1,
    title: 'Real Estate AI Revolution',
    client: 'PropTech Nigeria',
    challenge: 'Manual property valuation taking 3-5 days per property',
    solution: 'Naija-Prop-Intel AI analyzing 10,000+ properties in minutes',
    results: [
      '94% prediction accuracy',
      '340% revenue increase',
      'Market leader in 6 months',
    ],
    icon: '🏠',
  },
  {
    id: 2,
    title: 'Legal Tech Transformation',
    client: 'LegalTech Solutions',
    challenge: 'Junior associates spending 60% time on legal research',
    solution: 'NaijaLaw-GPT trained on Nigerian legal corpus',
    results: [
      '20 hours saved per week',
      '70% faster case prep',
      'Expanded to 5 law firms',
    ],
    icon: '⚖️',
  },
  {
    id: 3,
    title: 'Viral Marketing Breakthrough',
    client: 'E-commerce Platform',
    challenge: 'Low brand awareness, struggling to reach Gen Z audience',
    solution: 'Strategic viral video campaign with manifesto storytelling',
    results: [
      '5.7M views in 2 weeks',
      '3x sales increase',
      'Trending #1 on 3 platforms',
    ],
    icon: '🎬',
  },
];

export function Testimonials() {
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
              Client Success Stories
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          <h2 className="mb-6 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] md:text-6xl">
            Results That Speak
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-yellow-100/60 md:text-xl">
            Real businesses, real transformation, real impact across Nigeria.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="mb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Featured Badge */}
              {testimonial.featured && (
                <div className="absolute -right-2 -top-2 z-20 rotate-12">
                  <div className="rounded-full border border-yellow-400 bg-gradient-to-r from-yellow-500 to-yellow-600 px-3 py-1 text-xs font-bold text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                    ⭐ VERIFIED
                  </div>
                </div>
              )}

              <div className="relative h-full overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black p-6 transition-all duration-500 group-hover:border-yellow-500/40 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                {/* Quote Icon */}
                <div className="mb-4 text-4xl text-yellow-500/30">"</div>

                {/* Quote */}
                <p className="mb-6 text-sm leading-relaxed text-yellow-100/80">
                  {testimonial.quote}
                </p>

                {/* Metrics */}
                <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-300">{testimonial.metrics.value}</div>
                  <div className="text-xs text-yellow-100/60">{testimonial.metrics.label}</div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10 text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-yellow-200">{testimonial.name}</div>
                    <div className="text-xs text-yellow-100/50">{testimonial.role}</div>
                    <div className="text-xs text-yellow-500/70">{testimonial.company}</div>
                  </div>
                </div>

                {/* Project Tag */}
                <div className="mt-4 border-t border-yellow-500/10 pt-3">
                  <span className="text-xs font-semibold text-yellow-400/80">
                    Project: {testimonial.project}
                  </span>
                </div>

                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 transition-all duration-500 group-hover:w-full"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Case Studies Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h3 className="mb-4 text-3xl font-bold text-yellow-300 md:text-4xl">Featured Case Studies</h3>
          <p className="mx-auto max-w-2xl text-yellow-100/60">
            Deep dives into how we transformed businesses with custom AI and media solutions.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {caseStudies.map((study, idx) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black p-8 transition-all duration-500 group-hover:border-yellow-500/40 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                {/* Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-4xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  {study.icon}
                </div>

                {/* Title & Client */}
                <h4 className="mb-1 text-xl font-bold text-yellow-200 transition-colors group-hover:text-yellow-300">
                  {study.title}
                </h4>
                <p className="mb-4 text-sm text-yellow-500/70">{study.client}</p>

                {/* Challenge */}
                <div className="mb-3">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-yellow-400/60">
                    Challenge
                  </div>
                  <p className="text-sm text-yellow-100/70">{study.challenge}</p>
                </div>

                {/* Solution */}
                <div className="mb-4">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-yellow-400/60">
                    Solution
                  </div>
                  <p className="text-sm text-yellow-100/70">{study.solution}</p>
                </div>

                {/* Results */}
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-400/80">
                    Results
                  </div>
                  <ul className="space-y-1">
                    {study.results.map((result) => (
                      <li key={result} className="flex items-center gap-2 text-sm text-yellow-100/80">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-400"></div>
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 transition-all duration-500 group-hover:w-full"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-black p-8 md:p-12"
        >
          <div className="mb-8 text-center">
            <h3 className="mb-3 text-3xl font-bold text-yellow-300">Trusted By Nigerian Leaders</h3>
            <p className="text-yellow-100/60">Transforming businesses across industries</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-yellow-500/10 bg-black/40 p-6 text-center backdrop-blur-sm">
              <div className="mb-2 text-3xl">🏢</div>
              <div className="mb-1 text-3xl font-bold text-yellow-300">25+</div>
              <div className="text-sm text-yellow-100/60">Active Clients</div>
            </div>
            <div className="rounded-xl border border-yellow-500/10 bg-black/40 p-6 text-center backdrop-blur-sm">
              <div className="mb-2 text-3xl">📊</div>
              <div className="mb-1 text-3xl font-bold text-yellow-300">98%</div>
              <div className="text-sm text-yellow-100/60">Satisfaction Rate</div>
            </div>
            <div className="rounded-xl border border-yellow-500/10 bg-black/40 p-6 text-center backdrop-blur-sm">
              <div className="mb-2 text-3xl">💰</div>
              <div className="mb-1 text-3xl font-bold text-yellow-300">₦2.5B+</div>
              <div className="text-sm text-yellow-100/60">Client Revenue Generated</div>
            </div>
            <div className="rounded-xl border border-yellow-500/10 bg-black/40 p-6 text-center backdrop-blur-sm">
              <div className="mb-2 text-3xl">⭐</div>
              <div className="mb-1 text-3xl font-bold text-yellow-300">4.9/5</div>
              <div className="text-sm text-yellow-100/60">Average Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
