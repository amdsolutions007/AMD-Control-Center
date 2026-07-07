'use client';

import { AuthField, AuthSubmitButton, AuthMessage } from '@/components/music-intelligence/auth/AuthForm';

export function WorkspaceField({
  type = 'text',
  ...props
}: React.ComponentProps<typeof AuthField>) {
  return <AuthField type={type} {...props} />;
}

export function WorkspaceTextArea({
  id,
  label,
  value,
  onChange,
  required,
  placeholder,
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 mb-2">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl border border-white/15 bg-[#050512]/90 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:border-[#00E5FF]/60 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
      />
    </div>
  );
}

export function WorkspaceSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="font-black uppercase tracking-[0.24em] text-[#D4AF37]/90 text-[10px]">{eyebrow}</p>
      )}
      <h1
        className="mt-2 font-black uppercase text-white"
        style={{ fontSize: 'clamp(20px,4vw,32px)', letterSpacing: '0.08em' }}
      >
        {title}
      </h1>
      {description && <p className="mt-3 text-gray-400 text-sm leading-relaxed max-w-2xl">{description}</p>}
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_review: 'border-[#00E5FF]/40 text-[#00E5FF]',
    approved: 'border-emerald-500/40 text-emerald-300',
    rejected: 'border-red-500/40 text-red-300',
    draft: 'border-gray-500/40 text-gray-400',
    complete: 'border-emerald-500/40 text-emerald-300',
    incomplete: 'border-amber-500/40 text-amber-300',
  };
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${styles[status] ?? styles.draft}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export { AuthSubmitButton, AuthMessage };
