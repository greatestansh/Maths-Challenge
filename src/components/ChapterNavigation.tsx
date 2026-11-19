import { useEffect, useState } from 'react';

export function ChapterNavigation({ chapters }: { chapters: readonly (readonly [string, string])[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = chapters.map(([id]) => document.getElementById(id));
    let frame = 0;
    function updatePosition() {
      frame = 0;
      const line = Math.min(window.innerHeight * 0.28, 160);
      let index = sections.length - 1;
      while (index > 0 && (sections[index]?.getBoundingClientRect().top ?? Infinity) > line) index--;
      setActive(index);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(updatePosition);
    }
    updatePosition();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [chapters]);

  return <>
    <header className="masthead chapter-masthead wrap" id="top">
      <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true">₂</span> A Different Kind of Close</a>
      <nav aria-label="Chapters">
        {chapters.map(([id, label], index) => <a key={id} href={`#${id}`} aria-current={active === index ? 'location' : undefined}>{label}</a>)}
      </nav>
    </header>
    <div className="chapter-position wrap"><span>Chapter {active + 1} of {chapters.length}</span> <strong>{chapters[active][1]}</strong></div>
  </>;
}
