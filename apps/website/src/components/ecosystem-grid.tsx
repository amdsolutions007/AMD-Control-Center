'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const items = [
	{
		title: 'Naira-AI-Crypto-Tracker',
		desc: 'Real-time financial analysis for Nigeria with Telegram alerts and AI signals.',
		icon: '💹',
		link: 'https://github.com/amdsolutions007/Naira-AI-Crypto-Tracker',
	},
	{
		title: 'AMD-Activity-Booster',
		desc: 'Automated GitHub activity visualization for developers on GitHub Marketplace.',
		icon: '📊',
		link: 'https://github.com/amdsolutions007/amd-activity-booster',
	},
	{
		title: 'AMD-Global-Intelligence',
		desc: 'AI-powered tech news aggregation engine with automated daily updates.',
		icon: '🌐',
		link: 'https://github.com/amdsolutions007/AMD-Global-Intelligence',
	},
	{
		title: 'Social Broadcast System',
		desc: 'Automated multi-platform content distribution via GitHub Actions.',
		icon: '📢',
		link: 'https://github.com/amdsolutions007/Naira-AI-Crypto-Tracker',
	},
	{
		title: 'Ad Tech',
		desc: 'Campaign architecture, tracking, and optimization pipelines.',
		icon: '🎯',
	},
	{
		title: 'Media Engineering',
		desc: 'High-performance creatives engineered for attention and conversion.',
		icon: '🎬',
	},
	{
		title: 'Automation',
		desc: 'Operational tooling that standardizes execution and reporting.',
		icon: '⚡',
	},
	{
		title: 'AI Systems',
		desc: 'Proprietary assistants and internal tools powering growth systems.',
		icon: '🤖',
	},
]

export function EcosystemGrid() {
	return (
		<div id="ecosystem" className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
			{items.map((it, idx) => (
				<EcosystemCard key={it.title} item={it} index={idx} />
			))}
		</div>
	)
}

function EcosystemCard({ item, index }: { item: typeof items[0]; index: number }) {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const [isInteractive, setIsInteractive] = useState(true)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const touch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0
		const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
		const narrow = window.innerWidth < 768
		// disable heavy interactive transforms on touch / coarse / narrow devices
		setIsInteractive(!(touch || coarse || narrow))
	}, [])

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isInteractive) return
		const rect = e.currentTarget.getBoundingClientRect()
		const x = (e.clientX - rect.left - rect.width / 2) / 20
		const y = (e.clientY - rect.top - rect.height / 2) / 20
		setMousePosition({ x, y })
	}

	const handleMouseLeave = () => {
		if (!isInteractive) return
		setMousePosition({ x: 0, y: 0 })
	}

	const transformStyle = isInteractive
		? `perspective(1000px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale3d(1, 1, 1)`
		: 'none'

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.3 }}
			transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
			onMouseMove={isInteractive ? handleMouseMove : undefined}
			onMouseLeave={isInteractive ? handleMouseLeave : undefined}
			style={{
				transform: transformStyle,
				transition: 'transform 0.2s ease-out',
				cursor: item.link ? 'pointer' : 'default',
			}}
			className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black/60 via-black/40 to-black/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-yellow-500/60 hover:shadow-[0_0_40px_rgba(234,179,8,0.3),inset_0_0_60px_rgba(234,179,8,0.05)]"
			onClick={() => item.link && window.open(item.link, '_blank')}
		>
			{/* Animated gradient overlay */}
			<div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
				<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-500/5" />
			</div>

			{/* Content */}
			<div className="relative z-10">
				<div className="mb-4 flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 text-2xl shadow-lg shadow-yellow-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-yellow-500/40">
						{item.icon}
					</div>
					<h3 className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-xl font-bold tracking-wide text-transparent">
						{item.title}
					</h3>
				</div>
				<p className="leading-relaxed text-yellow-100/70 transition-colors duration-300 group-hover:text-yellow-100/90">
					{item.desc}
				</p>
			</div>

			{/* Shine effect */}
			<div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
		</motion.div>
	)
}
