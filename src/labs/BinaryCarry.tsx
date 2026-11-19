import { useEffect, useRef, useState } from 'react';
import { BitWord } from '../components/BitWord';
import { Equation } from '../components/Math';
import { bits, createCarry, pow2, stepCarry } from '../math/twoadic.mjs';

export function BinaryCarry() {
  const [carry, setCarry] = useState(() => createCarry(8));
  const [playing, setPlaying] = useState(false);
  const figure = useRef<HTMLElement>(null);
  const { width, cursor, visible, pending, done } = carry;
  const modulus = pow2(width);
  const start = createCarry(width);

  useEffect(() => {
    if (!playing || done) return;
    const timer = window.setTimeout(() => {
      if (!document.hidden) setCarry((current) => current === carry ? stepCarry(current) : current);
    }, 750);
    return () => window.clearTimeout(timer);
  }, [playing, done, carry]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setPlaying(false); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) setPlaying(false); });
    if (figure.current) observer.observe(figure.current);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  function reset(nextWidth: number) {
    setPlaying(false);
    setCarry(createCarry(nextWidth));
  }

  return (
    <figure ref={figure} className="stage carry-example" aria-labelledby="carry-demo-title">
      <figcaption id="carry-demo-title">Follow the carry through the window</figcaption>
      <div className="controls carry-controls">
        <label className="select-label">Bit width<select value={width} onChange={(event) => reset(Number(event.target.value))}>
          {[4, 8, 16].map((choice) => <option key={choice} value={choice}>{choice} bits</option>)}
        </select></label>
        <button type="button" className="stage-button" disabled={done} onClick={() => { setPlaying(false); setCarry(stepCarry); }}>Step carry</button>
        <button type="button" className="stage-button" disabled={done} onClick={() => setPlaying(!playing)}>{playing && !done ? 'Pause' : 'Play'}</button>
        <button type="button" className="stage-button" onClick={() => reset(width)}>Reset</button>
      </div>
      <div className="carry-reading">
        <div className="carry-words" role="region" aria-label="Binary carry window" tabIndex={width > 8 ? 0 : undefined}>
          <BitWord label="Start" word={bits(start.visible, width)} />
          <BitWord label={done ? 'Result' : 'Window'} word={bits(visible, width)} />
        </div>
        <div className="carry-out" aria-live="polite">
          <p className="eyebrow">{done ? 'Carry-out' : 'Pending carry'} at bit {cursor}</p>
          <p><Equation tex={`1\\cdot 2^{${cursor}}=${pending}`} /></p>
          <p className="muted">{done ? 'This bit sits just to the left of the window.' : `${cursor} of ${width} bits processed. Step carry processes one bit.`}</p>
        </div>
      </div>
      <dl className="carry-arithmetic">
        <div><dt>Integer sum</dt><dd><Equation tex={`${start.visible}+1=${modulus}`} /></dd></div>
        {done ? <div><dt>Remainder in the window</dt><dd><Equation tex={`${modulus}\\equiv ${visible}\\pmod{${modulus}}`} /></dd></div>
          : <div><dt>Window plus pending carry</dt><dd><Equation tex={`${visible}+${pending}=${modulus}`} /></dd></div>}
      </dl>
    </figure>
  );
}
