import Image from 'next/image'

export default function LinksPage() {
  const links = [
    {
      icon: '📞',
      title: 'WhatsApp Hotline (Priority)',
      url: 'https://wa.me/2348180021007',
    },
    {
      icon: '💻',
      title: 'AI Engineering Portfolio',
      url: 'https://amdsolutions007.github.io',
    },
    {
      icon: '🌐',
      title: 'Visit Official Website',
      url: 'https://www.amdsolutions007.com',
    },
    {
      icon: '✈️',
      title: 'Join Telegram Intelligence',
      url: 'https://t.me/amdsolutions007',
    },
    {
      icon: '📸',
      title: 'Instagram',
      url: 'https://instagram.com/amdsolutions007',
    },
    {
      icon: '❌',
      title: 'X / Twitter',
      url: 'https://x.com/amdsolutions007',
    },
    {
      icon: '🎵',
      title: 'TikTok',
      url: 'https://tiktok.com/@amdsolutions007',
    },
    {
      icon: '💼',
      title: 'LinkedIn',
      url: 'https://linkedin.com/company/amdsolutions007',
    },
    {
      icon: '�',
      title: 'GitHub / Code Portfolio',
      url: 'https://github.com/amdsolutions007',
    },
    {
      icon: '�📘',
      title: 'Facebook',
      url: 'https://facebook.com/amdsolutions007',
    },
    {
      icon: '👻',
      title: 'Snapchat',
      url: 'https://snapchat.com/add/solutions007',
    },
    {
      icon: '📺',
      title: 'YouTube',
      url: 'https://youtube.com/@amdsolutions007',
    },
    {
      icon: '📌',
      title: 'Pinterest',
      url: 'https://pinterest.com/amdsolutions007',
    },
  ]

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          {/* Avatar */}
          <div className="mb-6 flex justify-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(212,175,55,0.5)]">
              <Image
                src="/amd_logo.png"
                alt="AMD Media Solutions"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-3xl font-bold text-yellow-400">
            AMD MEDIA SOLUTIONS
          </h1>

          {/* Bio */}
          <p className="text-lg text-yellow-100/70">
            Illuminating the Digital Dark.
          </p>
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 rounded-xl border-2 border-yellow-400 bg-black px-6 py-4 text-center text-white transition-all duration-300 hover:bg-yellow-400/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-lg font-semibold">{link.title}</span>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-yellow-100/50">
          © 2025 AMD Media Solutions.
        </div>
      </div>
    </div>
  )
}
