'use client';

import { motion } from 'framer-motion';

const services = [
  {
    id: 1,
    icon: '🤖',
    title: 'Custom AI Development',
    description: 'Bespoke AI solutions tailored to your business needs - from NLP to computer vision',
    features: [
      'Machine Learning Models',
      'Natural Language Processing',
      'Predictive Analytics',
      'AI Integration & Deployment',
    ],
    priceRange: '$5,000 - $50,000',
    timeline: '4-12 weeks',
    popular: true,
  },
  {
    id: 2,
    icon: '🎬',
    title: 'Media Production',
    description: 'Award-winning video content that captures attention and drives engagement',
    features: [
      'Viral Edits & Reels',
      'Commercial Productions',
      'Manifesto Videos',
      'Brand Storytelling',
    ],
    priceRange: '$500 - $5,000',
    timeline: '1-3 weeks',
    popular: false,
  },
  {
    id: 3,
    icon: '⚡',
    title: 'Automation Systems',
    description: 'Streamline operations with custom automation workflows and integrations',
    features: [
      'Business Process Automation',
      'API Integration & Development',
      'Data Pipeline Engineering',
      'Workflow Optimization',
    ],
    priceRange: '$3,000 - $30,000',
    timeline: '2-8 weeks',
    popular: false,
  },
  {
    id: 4,
    icon: '🎓',
    title: 'Consulting & Strategy',
    description: 'Expert guidance on AI adoption, digital transformation, and technical architecture',
    features: [
      'AI Strategy & Roadmaps',
      'Tech Stack Evaluation',
      'System Architecture Design',
      'Training & Workshops',
    ],
    priceRange: '$200/hour',
    timeline: 'Flexible',
    popular: false,
  },
];

const packages = [
  {
    name: 'Starter',
    price: '$2,500',
    period: 'one-time',
    description: 'Perfect for small businesses getting started',
    features: [
      'Basic AI Integration',
      '2 Social Media Videos',
      'Email Support',
      '1 Month Support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '$10,000',
    period: 'one-time',
    description: 'For growing businesses ready to scale',
    features: [
      'Custom AI Solution',
      '5 Premium Videos',
      'Priority Support',
      '3 Months Support',
      'API Integration',
      'Training Included',
    ],
    cta: 'Go Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Full-scale solutions for established companies',
    features: [
      'Multiple AI Systems',
      'Unlimited Videos',
      '24/7 Support',
      '12 Months Support',
      'Dedicated Team',
      'White-Label Options',
    ],
    cta: 'Contact Us',
  },
];

export function ServicesPricing() {
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
              Services & Investment
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          <h2 className="mb-6 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] md:text-6xl">
            What We Build
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-yellow-100/60 md:text-xl">
            From AI systems to viral content - we deliver solutions that transform businesses.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="mb-20 grid gap-6 md:grid-cols-2">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute -right-3 -top-3 z-20 rotate-12">
                  <div className="rounded-full border border-yellow-400 bg-gradient-to-r from-yellow-500 to-yellow-600 px-3 py-1 text-xs font-bold text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                    🔥 MOST POPULAR
                  </div>
                </div>
              )}

              <div className="relative h-full overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black p-8 transition-all duration-500 group-hover:border-yellow-500/40 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                {/* Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-4xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-2xl font-bold text-yellow-200 transition-colors group-hover:text-yellow-300">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mb-6 text-yellow-100/60">{service.description}</p>

                {/* Features */}
                <ul className="mb-6 space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-yellow-100/70">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-400"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Pricing Info */}
                <div className="mb-4 flex items-center justify-between border-t border-yellow-500/10 pt-4">
                  <div>
                    <div className="text-xs text-yellow-500/70">Investment</div>
                    <div className="text-lg font-bold text-yellow-300">{service.priceRange}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-yellow-500/70">Timeline</div>
                    <div className="text-lg font-bold text-yellow-300">{service.timeline}</div>
                  </div>
                </div>

                {/* CTA Button */}
                <a
                  href={`https://wa.me/2349134492041?text=Hi%2C%20I%27m%20interested%20in%20${encodeURIComponent(service.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-6 py-3 text-sm font-semibold text-yellow-300 transition-all duration-300 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                >
                  <span className="text-lg">💬</span>
                  Discuss This Service
                </a>

                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 transition-all duration-500 group-hover:w-full"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Packages Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h3 className="mb-4 text-3xl font-bold text-yellow-300 md:text-4xl">Pre-Built Packages</h3>
          <p className="mx-auto max-w-2xl text-yellow-100/60">
            Choose a ready-made package or let us customize one for your specific needs.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2">
                  <div className="rounded-full border-2 border-yellow-400 bg-yellow-500 px-4 py-1 text-xs font-bold text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                    ⭐ BEST VALUE
                  </div>
                </div>
              )}

              <div
                className={`relative h-full overflow-hidden rounded-2xl border p-8 transition-all duration-500 ${
                  pkg.popular
                    ? 'border-yellow-500 bg-gradient-to-br from-yellow-950/20 via-black to-yellow-950/10 shadow-[0_0_40px_rgba(234,179,8,0.3)]'
                    : 'border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black hover:border-yellow-500/40 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]'
                }`}
              >
                {/* Package Name */}
                <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-yellow-500">
                  {pkg.name}
                </div>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-4xl font-bold text-yellow-300">{pkg.price}</span>
                  {pkg.period !== 'pricing' && (
                    <span className="ml-2 text-sm text-yellow-100/50">/ {pkg.period}</span>
                  )}
                </div>

                {/* Description */}
                <p className="mb-6 text-sm text-yellow-100/60">{pkg.description}</p>

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-yellow-100/70">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href={`https://wa.me/2349134492041?text=Hi%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(pkg.name)}%20package`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-all duration-300 ${
                    pkg.popular
                      ? 'border-2 border-yellow-500 bg-yellow-500 text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]'
                      : 'border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                  }`}
                >
                  {pkg.cta}
                </a>

                {/* Bottom Glow */}
                {!pkg.popular && (
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 transition-all duration-500 group-hover:w-full"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 text-center"
        >
          <div className="mb-2 text-3xl">🛡️</div>
          <h4 className="mb-1 text-lg font-bold text-yellow-300">Quality Guarantee</h4>
          <p className="text-sm text-yellow-100/60">
            Not satisfied? We'll revise until you are - or your money back within 30 days.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
