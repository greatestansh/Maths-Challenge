import { useEffect, useRef, type CSSProperties } from 'react';
import { firstTerm, lastTerm, useSequence } from '../state/SequenceContext';

export function SequenceControls({ id, onReset }: { id: string; onReset?: () => void }) {
  const { current, setTerm, player, togglePlayback, pause } = useSequence();
  const controls = useRef<HTMLDivElement>(null);
  const atEnd = current.n === lastTerm;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(id); });
    const section = controls.current?.closest('section');
    if (section) observer.observe(section);
    return () => { observer.disconnect(); pause(id); };
  }, [id, pause]);

  return (
    <div className="sum-controls" ref={controls}>
      <label className="term-range" htmlFor={id}>Number of terms <strong aria-hidden="true">{current.n}</strong></label>
      <input id={id} className="range" type="range" min={firstTerm} max={lastTerm} value={current.n}
        style={{ '--range-fill': `${(current.n - firstTerm) * 100 / (lastTerm - firstTerm)}%` } as CSSProperties}
        onChange={(event) => setTerm(Number(event.target.value))} />
      <div className="range-ends" aria-hidden="true"><span>{firstTerm}</span><span>{lastTerm}</span></div>
      <div className="controls">
        <button type="button" className="stage-button" disabled={atEnd} onClick={() => togglePlayback(id)}>
          {player === id ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="stage-button" disabled={atEnd} onClick={() => setTerm(current.n + 1)}>Step</button>
        <button type="button" className="stage-button" onClick={() => { setTerm(firstTerm); onReset?.(); }}>Reset</button>
      </div>
    </div>
  );
}
