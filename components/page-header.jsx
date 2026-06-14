export function PageHeader({ eyebrow, title }) {
  return (
    <header className="space-y-3">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
        {eyebrow}
      </p>
      <h1 className="font-serif text-4xl font-normal tracking-tight text-stone-900">
        {title}
      </h1>
    </header>
  );
}
