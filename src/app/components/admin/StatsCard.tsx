export function StatsCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="border border-stone-200 bg-white/80 p-6 md:p-7">
      <span className="block text-[11px] tracking-[0.24em] uppercase text-stone-500 mb-4">
        {label}
      </span>
      <p className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">{value}</p>
      <p className="text-sm text-stone-600 font-light leading-relaxed">{hint}</p>
    </article>
  );
}
