export default function EnterpriseEngineModule({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
