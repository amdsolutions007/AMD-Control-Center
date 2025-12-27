import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-yellow-500/20 bg-gradient-to-b from-black/40 to-black shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Social Media - Column 1 */}
          <div>
            <div className="mb-4 text-sm font-bold text-yellow-400">Social Media</div>
            <div className="space-y-1.5 text-sm text-yellow-100/70">
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://wa.me/2348180021007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>📱</span>
                  <span>WhatsApp</span>
                </a>
              </div>
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://t.me/amdsolutions007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>✈️</span>
                  <span>Telegram</span>
                </a>
              </div>
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://youtube.com/@amdsolutions007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>▶️</span>
                  <span>YouTube</span>
                </a>
              </div>
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://linkedin.com/company/amdsolutions007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>💼</span>
                  <span>LinkedIn</span>
                </a>
              </div>
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://instagram.com/amdsolutions007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>📸</span>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* More Socials - Column 2 */}
          <div>
            <div className="mb-4 text-sm font-bold text-yellow-400">Connect</div>
            <div className="space-y-1.5 text-sm text-yellow-100/70">
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://facebook.com/amdsolutions007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>👥</span>
                  <span>Facebook</span>
                </a>
              </div>
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://tiktok.com/@amdsolutions007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>📺</span>
                  <span>TikTok</span>
                </a>
              </div>
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://x.com/amdsolutions007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>✖️</span>
                  <span>X</span>
                </a>
              </div>
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://pinterest.com/amdsolutions007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>📌</span>
                  <span>Pinterest</span>
                </a>
              </div>
              <div>
                <a 
                  className="group inline-flex items-center gap-2 transition-all hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                  href="https://snapchat.com/add/solutions007"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>👻</span>
                  <span>Snapchat</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact - Column 3 */}
          <div>
            <div className="mb-4 text-sm font-bold text-yellow-400">Contact</div>
            <div className="space-y-1.5 text-sm text-yellow-100/70">
              <div className="hover:text-yellow-300 transition-colors">
                Email: ceo@amdsolutions007.com
              </div>
              <div className="hover:text-yellow-300 transition-colors">
                Phone: +234 818 002 1007
              </div>
              <div>
                Website:{' '}
                <a 
                  className="underline decoration-yellow-500/30 underline-offset-4 hover:text-yellow-300 hover:decoration-yellow-400/60 transition-all" 
                  href="https://www.amdsolutions007.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.amdsolutions007.com
                </a>
              </div>
            </div>
          </div>

          {/* Global Office - Column 4 */}
          <div>
            <div className="mb-4 text-sm font-bold text-yellow-400">Global Office (US)</div>
            <div className="whitespace-pre-wrap rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent p-4 text-xs leading-relaxed text-yellow-100/70 shadow-lg">
              651 N Broad Street, Suite 206
              Middletown, DE 19709
              United States
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-yellow-500/20 pt-8 text-xs">
          <div className="text-yellow-100/50">© {new Date().getFullYear()} AMD Media Solutions. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link className="text-yellow-200/70 hover:text-yellow-300 transition-colors font-medium" href="/intelligence">
              Intelligence
            </Link>
            <Link className="text-yellow-200/70 hover:text-yellow-300 transition-colors font-medium" href="/media">
              Media
            </Link>
            <Link className="text-yellow-200/70 hover:text-yellow-300 transition-colors font-medium" href="/portal">
              Client Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
