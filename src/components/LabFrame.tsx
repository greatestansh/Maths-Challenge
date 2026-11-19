import type { ReactNode } from 'react';

export function LabFrame({ title, id, label, children }: {
  title: string;
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="stage lab" aria-labelledby={id}>
      <header className="lab-heading">
        <p className="eyebrow">{label}</p>
        <h3 id={id} tabIndex={-1}>{title}</h3>
      </header>
      {children}
    </section>
  );
}
