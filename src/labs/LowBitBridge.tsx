import { useState } from 'react';
import { BitWord } from '../components/BitWord';
import { Equation } from '../components/Math';
import { bits, pow2, residue, sharedDepth } from '../math/twoadic.mjs';

const a = 1n;
const b = 9n;
const width = 4;
const comparison = sharedDepth(a, b);
const matches = comparison.kind === 'finite' ? comparison.exponent : width;

export function LowBitBridge() {
  const [k, setK] = useState(1);
  const modulus = pow2(k);
  const left = residue(a, k);
  const right = residue(b, k);
  const agree = left === right;
  const wordA = bits(a, width);
  const wordB = bits(b, width);

  return (
    <section className="stage lab low-bit-bridge" aria-labelledby="bridge-title">
      <header className="lab-heading"><h3 id="bridge-title">Start with the bits on the right</h3></header>
      <div className="low-bit-grid">
        <div className="low-bit-words">
          <BitWord label="1" word={wordA} matches={matches} inspected={k} tone="a" binary />
          <BitWord label="9" word={wordB} matches={matches} inspected={k} tone="b" binary />
          <p className="shared-copy">Shared suffix <strong>{wordA.slice(-matches)}</strong></p>
        </div>
        <div className="low-bit-result" aria-live="polite">
          <p className="eyebrow">Checking {k} low {k === 1 ? 'bit' : 'bits'}</p>
          <p className="lesson-equation"><Equation tex={`1 ${agree ? '\\equiv' : '\\not\\equiv'} 9 \\pmod{${modulus}}`} /></p>
          <p>{agree ? `Both leave remainder ${left} on division by ${modulus}.` : `They leave remainders ${left} and ${right} on division by ${modulus}.`}</p>
          <p className="muted">{agree ? `${modulus} divides the difference ${b - a}.` : `The difference ${b - a} leaves remainder ${residue(b - a, k)} on division by ${modulus}.`}</p>
        </div>
      </div>
      <div className="controls" role="group" aria-label="Number of low bits to check">
        <button type="button" className="stage-button" disabled={k === 1} onClick={() => setK(k - 1)}>Back</button>
        <button type="button" className="stage-button" disabled={k === width} onClick={() => setK(k + 1)}>Next</button>
        <span className="muted lesson-step">{k} of {width}</span>
      </div>
    </section>
  );
}
