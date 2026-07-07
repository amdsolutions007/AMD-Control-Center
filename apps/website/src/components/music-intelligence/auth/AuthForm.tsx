'use client';

import { MI_AUTH_ROLES, type MIAuthRoleSlug } from '@/lib/music-intelligence/auth-roles';

interface RoleSelectorProps {
  value: MIAuthRoleSlug;
  onChange: (slug: MIAuthRoleSlug) => void;
  id?: string;
}

export default function RoleSelector({ value, onChange, id = 'mi-role' }: RoleSelectorProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-2">
        Your Role
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as MIAuthRoleSlug)}
        className="w-full rounded-xl border border-white/15 bg-[#050512]/90 px-4 py-3 text-sm text-gray-100 focus:border-[#00E5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
        aria-describedby={`${id}-hint`}
      >
        {MI_AUTH_ROLES.map(({ slug, label, icon }) => (
          <option key={slug} value={slug}>
            {icon} {label}
          </option>
        ))}
      </select>
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500">
        {MI_AUTH_ROLES.find((r) => r.slug === value)?.description}
      </p>
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-[#050512]/90 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:border-[#00E5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
      />
    </div>
  );
}

export function AuthSubmitButton({ children, disabled, loading }: { children: React.ReactNode; disabled?: boolean; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="mt-2 w-full rounded-full border border-[#00E5FF]/50 bg-gradient-to-r from-[#050512] to-[#0a0a24] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#00E5FF] transition hover:shadow-[0_0_24px_rgba(0,229,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Processing…' : children}
    </button>
  );
}

export function AuthMessage({ type, children }: { type: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const styles = {
    error: 'border-red-500/40 bg-red-950/30 text-red-300',
    success: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
    info: 'border-[#00E5FF]/30 bg-[#050512]/80 text-gray-300',
  };
  return (
    <p role={type === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </p>
  );
}
