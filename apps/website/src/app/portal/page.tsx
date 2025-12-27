'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function PortalPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityLevel, setSecurityLevel] = useState(0);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Calculate security level (0-5)
    let level = 0;
    if (value.length >= 8) level++;
    if (value.length >= 12) level++;
    if (/[A-Z]/.test(value)) level++;
    if (/[0-9]/.test(value)) level++;
    if (/[^A-Za-z0-9]/.test(value)) level++;
    setSecurityLevel(level);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    // Simulate biometric scan
    setTimeout(() => {
      setIsScanning(false);
      // Add your authentication logic here
      alert('Authentication system integration required. Connect to your backend.');
    }, 3000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* Hexagon Security Grid Background */}
      <div className="fixed inset-0 opacity-[0.03]" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23eab308' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />

      {/* Scanning Line Animation */}
      <motion.div
        className="fixed left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Radial Gradient Glow */}
      <div className="fixed left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/5 blur-3xl" />

      {/* Particle Effects */}
      <div className="fixed inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-yellow-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {/* Security Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 text-center"
          >
            {/* Biometric Icon */}
            <motion.div
              animate={{ 
                rotate: isScanning ? 360 : 0,
                scale: isScanning ? [1, 1.1, 1] : 1,
              }}
              transition={{ 
                rotate: { duration: 2, repeat: isScanning ? Infinity : 0, ease: 'linear' },
                scale: { duration: 0.5, repeat: isScanning ? Infinity : 0 },
              }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-sm"
            >
              <svg className="h-10 w-10 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 inline-block"
            >
              <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-yellow-300 backdrop-blur-sm">
                🔒 SECURE ACCESS POINT
              </span>
            </motion.div>

            <h1 className="mb-3 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Client Portal
            </h1>
            <p className="text-yellow-100/60">
              Authorized personnel only. Multi-factor authentication required.
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-black via-yellow-950/5 to-black p-8 backdrop-blur-xl"
          >
            {/* Corner Security Indicators */}
            <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-yellow-500/50" />
            <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-yellow-500/50" />
            <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-yellow-500/50" />
            <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-yellow-500/50" />

            {/* Security Clearance Status */}
            <div className="mb-6 flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Security Status</div>
                  <div className="text-xs text-yellow-100/60">Clearance Level: {securityLevel}/5</div>
                </div>
              </div>
              <div className="text-2xl">
                {isScanning ? '🔍' : '🔐'}
              </div>
            </div>

            {/* Scanning Overlay */}
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mx-auto mb-4 h-16 w-16"
                  >
                    <svg className="text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </motion.div>
                  <div className="mb-2 font-mono text-lg font-semibold text-yellow-300">VERIFYING CREDENTIALS</div>
                  <div className="text-sm text-yellow-100/60">Biometric scan in progress...</div>
                  <div className="mt-4 flex justify-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-yellow-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-yellow-300">
                  Access ID
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/50">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-yellow-500/30 bg-black/60 py-3 pl-12 pr-4 text-yellow-100 placeholder-yellow-100/30 backdrop-blur-sm transition-all duration-300 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="Enter your access ID"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-yellow-300">
                  Security Key
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/50">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="w-full rounded-lg border border-yellow-500/30 bg-black/60 py-3 pl-12 pr-4 text-yellow-100 placeholder-yellow-100/30 backdrop-blur-sm transition-all duration-300 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                    placeholder="Enter your security key"
                  />
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-yellow-100/50">Security Level</span>
                      <span className="font-mono text-yellow-400">{securityLevel}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < securityLevel
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                              : 'bg-yellow-500/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Biometric Authentication Badge */}
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-yellow-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  </svg>
                  Multi-Factor Authentication
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: '🔑', label: 'Password' },
                    { icon: '📱', label: '2FA Code' },
                    { icon: '👤', label: 'Biometric' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-md border border-yellow-500/20 bg-black/40 px-2 py-3">
                      <div className="mb-1 text-xl">{item.icon}</div>
                      <div className="text-xs text-yellow-100/60">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isScanning}
                whileHover={{ scale: isScanning ? 1 : 1.02 }}
                whileTap={{ scale: isScanning ? 1 : 0.98 }}
                className="group relative w-full overflow-hidden rounded-lg border-2 border-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-600 py-4 font-semibold text-black shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isScanning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </motion.div>
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span>INITIATE SECURE ACCESS</span>
                      <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                {!isScanning && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}
              </motion.button>
            </form>

            {/* Additional Security Info */}
            <div className="mt-6 space-y-3 border-t border-yellow-500/10 pt-6">
              <div className="flex items-start gap-3 text-xs text-yellow-100/50">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400/70" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Your connection is encrypted with military-grade AES-256 encryption</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-yellow-100/50">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400/70" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>All access attempts are logged and monitored for security compliance</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-300/70 backdrop-blur-sm">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-mono">PROTECTED BY AMD SECURITY PROTOCOL v3.0</span>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
