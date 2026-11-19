import { useLayoutEffect, useState, type CSSProperties } from 'react';
import { BitWord } from '../components/BitWord';
import { LabFrame } from '../components/LabFrame';
import { Equation } from '../components/Math';
import { bits, pow2, residue } from '../math/twoadic.mjs';

const limit = 8;
const denominator = 3n;
const initial = { depth: 0, value: 0n };

export function FractionBuilder() {
  const [history, setHistory] = useState<(typeof initial)[]>([]);
  const [attempt, setAttempt] = useState<{ digit: number; value: bigint; depth: number; product: bigint; remainder: bigint } | null>(null);
  const { depth, value } = history.at(-1) ?? initial;
  const exponent = depth + 1;
  const complete = depth === limit;
  const options = [value, value + pow2(depth)].map((candidate, digit) => {
    const product = denominator * candidate;
    return { digit, value: candidate, depth: exponent, product, remainder: residue(product, exponent) };
  });

  useLayoutEffect(() => {
    if (complete) document.getElementById('fraction-builder-title')?.focus();
  }, [complete]);

  function tryDigit(digit: number) {
    const candidate = options[digit];
    setAttempt(candidate);
    if (candidate.remainder === 1n) setHistory([...history, { depth: exponent, value: candidate.value }]);
  }

  return <LabFrame title={complete ? 'You built the first eight low bits of 1/3.' : 'Choose the next bit of 1/3'}
    id="fraction-builder-title" label="Lift a remainder">
    <div className="exposition-grid">
      <div className="tree-readout">
        <p className="eyebrow">Fixed low bits</p>
        {depth ? <>
          <div className="fraction-word" style={{ '--first-bit-column': limit + 2 - depth } as CSSProperties}>
            <BitWord label={`${value}`} word={bits(value, depth)} binary matches={depth - 1} tone="a" newest />
          </div>
          <p>Accepted remainder <strong>{value.toString()}</strong> modulo <strong>{pow2(depth).toString()}</strong>.</p>
        </> : <p>Start at remainder 0 modulo 1. There are no fixed bits yet.</p>}
        {complete ? <>
          <p className="fraction-expansion" aria-label="The expansion of one third continues to the left, ending in 1 0 1 0 1 0 1 1">
            <code>…{bits(value, depth)}</code><sub>2</sub>
          </p>
          <p>To continue left, prepend <strong>10</strong> for each new pair of bits. The infinite expansion represents 1/3 in ℤ₂. The integer {value.toString()} is its representative modulo {pow2(depth).toString()}.</p>
        </> : <>
          <p>Next modulus <strong>{pow2(exponent).toString()}</strong>. Both candidates keep the bits already fixed.</p>
          <div className="fraction-candidates" role="group" aria-label="Choose the next binary digit">
            {options.map((candidate) => <div className="fraction-candidate" key={candidate.digit}>
              <p className="eyebrow">{candidate.digit ? 'r + 2ᵏ' : 'r'}</p>
              <p className="candidate-product">3 × {candidate.value.toString()} = {candidate.product.toString()}</p>
              <p>Remainder <strong>{candidate.remainder.toString()}</strong></p>
              <button type="button" className="stage-button" onClick={() => tryDigit(candidate.digit)}>
                Bit {candidate.digit} · try {candidate.value.toString()}
              </button>
            </div>)}
          </div>
          <p className="muted">The products differ by 3 × {pow2(depth).toString()}. Modulo {pow2(exponent).toString()}, that shifts the remainder by {pow2(depth).toString()}, so exactly one choice lands on 1.</p>
        </>}
        <button type="button" className="stage-button lab-reset" onClick={() => { setHistory([]); setAttempt(null); }}>Reset builder</button>
      </div>
      <div className="tree-readout">
        <p className="eyebrow">Check the candidate</p>
        <div aria-live="polite">{attempt ? <>
          <p>Bit {attempt.digit} gives candidate <strong>{attempt.value.toString()}</strong> modulo <strong>{pow2(attempt.depth).toString()}</strong>.</p>
          <p><Equation tex={`${denominator}\\cdot ${attempt.value}=${attempt.product}`} /></p>
          <p><Equation tex={`${attempt.product}\\equiv ${attempt.remainder}\\pmod{${pow2(attempt.depth)}}`} /></p>
          <p>{attempt.remainder === 1n ? 'Remainder 1. This bit is fixed and the earlier bits stay in place.'
            : `Remainder ${attempt.remainder}. Try the other bit. The fixed window stays the same.`}</p>
        </> : <p>A digit is accepted when three times its candidate leaves remainder 1 at the new modulus.</p>}</div>
        {history.length > 0 && <table className="fraction-history">
          <caption>Accepted windows</caption>
          <thead><tr><th scope="col">Bits</th><th scope="col">Window</th><th scope="col">Remainder</th></tr></thead>
          <tbody>{history.map((row) => {
            const word = bits(row.value, row.depth);
            return <tr key={row.depth}><th scope="row">{row.depth}</th>
              <td><code>{row.depth === depth ? <><span className="newest-bit">{word[0]}</span>{word.slice(1)}</> : word}</code></td>
              <td>{row.value.toString()}</td></tr>;
          })}</tbody>
        </table>}
      </div>
    </div>
  </LabFrame>;
}
