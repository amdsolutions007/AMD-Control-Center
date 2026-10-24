'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const values = [
  {
    title: 'Evidence-Led',
    description: 'We separate verified results from assumptions and keep public claims tied to what can actually be supported.',
  },
  {
    title: 'Practical Engineering',
    description: 'We choose technology around the real workflow, customer journey and business outcome.',
  },
  {
    title: 'Nigeria-Aware',
    description: 'Our Lagos operating base and Nigerian market context shape how we design for connectivity, customer behaviour and local growth.',
  },
  {
    title: 'Measured Growth',
    description: 'We prefer clear baselines, accountable delivery and measurable improvement over vanity metrics.',
  },
];

export function AboutSection() {
  return (
    <section className="border-b border-yellow-500/10 px-4 py-16 sm:px-6 md:px-12 md:py-20 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 text-center md:mb-14"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-yellow-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-500/80">
              About AMD Solutions 007
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-yellow-500" />
          </div>
          <h2 className="bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
            Built to Solve
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-yellow-100/65 md:text-lg">
            AMD Solutions 007 combines software engineering, automation, AI-assisted intelligence and digital growth
            to turn complex business problems into practical systems.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/10 to-black p-6 md:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">Our operating model</div>
              <h3 className="mt-3 text-3xl font-black text-yellow-200">Work smartly. Spend wisely.</h3>
              <div className="mt-5 space-y-4 text-sm leading-7 text-yellow-100/70 md:text-base">
                <p>
                  We start with the business problem, customer journey and desired outcome before choosing technology.
                  That keeps projects focused and reduces unnecessary complexity.
                </p>
                <p>
                  AMD operates from Ibeju-Lekki, Lagos using a remote-first delivery model. Our location pages describe
                  service coverage, not physical AMD branches outside our Lagos operating base.
                </p>
                <p>
                  The public AMD Solutions 007 brand operates under AMD Ascend Solutions.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {values.map((value) => (
                <div key={value.title} className="rounded-2xl border border-yellow-500/15 bg-black/50 p-4">
                  <h4 className="font-bold text-yellow-300">{value.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-yellow-100/60">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-yellow-500/10 pt-6 sm:flex-row sm:justify-center">
            <Link
              href="/about"
              className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-6 py-3 text-center font-bold text-yellow-200"
            >
              Read Our Story
            </Link>
            <Link
              href="/payment"
              className="rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 text-center font-black text-black"
            >
              Request a Quote
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
