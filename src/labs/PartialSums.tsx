import { useState } from 'react';
import { Equation } from '../components/Math';
import { SequenceControls } from '../components/SequenceControls';
import { pow2, sequence } from '../math/twoadic.mjs';
import { lastTerm, useSequence } from '../state/SequenceContext';

export function PartialSums() {
  const { current } = useSequence();
  const [revealed, setRevealed] = useState(false);

  const shownTerms = current.n <= 5 ? current.n : 4;
  const terms = Array.from({ length: shownTerms }, (_, index) => pow2(index).toString()).join(' + ');

  return (
    <section className="stage sum-lab" id="sums" aria-labelledby="sum-title">
      <div className="sum-current">
        <p className="eyebrow" id="sum-title">Try a partial sum</p>
        <div className="sum-value" aria-live="polite">
          <Equation tex={`S_{${current.n}} = ${current.sum}`} />
        </div>
        <p className="muted sum-expansion"><Equation tex={current.n > shownTerms ? `${terms} + \\cdots + ${pow2(current.n - 1)}` : terms} /></p>
      </div>
      <SequenceControls id="opening-term" onReset={() => setRevealed(false)} />
      <div className="sum-pattern">
        <p className="eyebrow">Find the pattern</p>
        <p>What happens when you add 1?</p>
        <button type="button" className="stage-button" aria-expanded={revealed} aria-controls="sum-reveal"
          onClick={() => setRevealed(!revealed)}>{revealed ? 'Hide answer' : 'Reveal answer'}</button>
        <div id="sum-reveal" hidden={!revealed} className="sum-reveal"><Equation tex={`S_{${current.n}} + 1 = ${current.plusOne} = 2^{${current.n}}`} /></div>
      </div>
      <details className="sum-table">
        <summary>View exact sums</summary>
        <table><caption>First {lastTerm} partial sums</caption>
          <thead><tr><th scope="col">Terms</th><th scope="col">Sum</th><th scope="col">Sum + 1</th></tr></thead>
          <tbody>{Array.from({ length: lastTerm }, (_, index) => {
            const row = sequence(index + 1);
            return <tr key={row.n}><th scope="row">{row.n}</th><td>{row.sum.toString()}</td><td>{row.plusOne.toString()}</td></tr>;
          })}</tbody>
        </table>
      </details>
    </section>
  );
}
