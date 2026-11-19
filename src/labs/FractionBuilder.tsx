import { useState } from 'react';
import { BitWord } from '../components/BitWord';
import { LabFrame } from '../components/LabFrame';
import { Equation } from '../components/Math';
import { bits, pow2, residue } from '../math/twoadic.mjs';

const limit = 8;
const denominator = 3n;
const initial = { depth: 0, value: 0n };

export function FractionBuilder() {
  const [window, setWindow] = useState(initial);
  const [attempt, setAttempt] = useState<{ digit: number; value: bigint; depth: number; remainder: bigint } | null>(null);
  const { depth, value } = window;
  const exponent = depth + 1;
  const complete = depth === limit;
  const options = [value, value + pow2(depth)];

  function tryDigit(digit: number) {
    const candidate = options[digit];
    const remainder = residue(denominator * candidate, exponent);
    setAttempt({ digit, depth: exponent, value: candidate, remainder });
    if (remainder === 1n) setWindow({ depth: exponent, value: candidate });
  }

  return <LabFrame title="Choose the next bit of 1/3" id="fraction-builder-title" label="Lift a remainder">
    <div className="exposition-grid">
      <div className="tree-readout">
        <p className="eyebrow">Fixed low bits</p>
        {depth ? <>
          <BitWord label={`${value}`} word={bits(value, depth)} binary matches={depth} tone="a" />
          <p>Accepted remainder <strong>{value.toString()}</strong> modulo <strong>{pow2(depth).toString()}</strong>.</p>
        </> : <p>Start at remainder 0 modulo 1. There are no fixed bits yet.</p>}
        {complete ? <p>Eight low bits are now fixed. The same rule extends the window further.</p> : <>
          <p>Next modulus <strong>{pow2(exponent).toString()}</strong>. Try adding a bit to the left of the current window.</p>
          <div className="controls" role="group" aria-label="Choose the next binary digit">
            {options.map((candidate, digit) => <button type="button" key={digit} className="stage-button" onClick={() => tryDigit(digit)}>
              Bit {digit} · try {candidate.toString()}
            </button>)}
          </div>
        </>}
        <button type="button" className="stage-button lab-reset" onClick={() => { setWindow(initial); setAttempt(null); }}>Reset builder</button>
      </div>
      <div className="tree-readout" aria-live="polite">
        <p className="eyebrow">Check the candidate</p>
        {attempt ? <>
          <p>Bit {attempt.digit} gives candidate <strong>{attempt.value.toString()}</strong> modulo <strong>{pow2(attempt.depth).toString()}</strong>.</p>
          <p><Equation tex={`${denominator}\\cdot ${attempt.value}=${denominator * attempt.value}`} /></p>
          <p><Equation tex={`${denominator * attempt.value}\\equiv ${attempt.remainder}\\pmod{${pow2(attempt.depth)}}`} /></p>
          <p>{attempt.remainder === 1n ? 'Remainder 1. This bit is fixed and the earlier bits stay in place.'
            : `Remainder ${attempt.remainder}. Try the other bit. The fixed window stays the same.`}</p>
        </> : <p>A digit is accepted when three times its candidate leaves remainder 1 at the new modulus.</p>}
      </div>
    </div>
  </LabFrame>;
}
