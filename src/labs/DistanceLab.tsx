import { useState } from 'react';
import { IntegerField } from '../components/IntegerField';
import { LabFrame } from '../components/LabFrame';
import { Equation } from '../components/Math';
import { displayInteger, sizeTex } from '../math/format';
import { bits, compareSizes, distance2, formatSize, norm2, v2, valuationSteps } from '../math/twoadic.mjs';
import { Factorization, signedFactorTex } from './Factorization';
import '../styles/distance.css';

const presets = [[1n, 9n], [1n, 2n], [1n, 1025n], [0n, 1024n], [7n, 7n]] as const;
const bitWidth = 8;

function measure(anchor: bigint, neighbor: bigint, label: 'B' | 'C') {
  const difference = anchor - neighbor;
  return {
    label,
    neighbor,
    difference,
    ordinary: difference < 0n ? -difference : difference,
    twoAdic: distance2(anchor, neighbor),
    valuation: v2(difference),
  };
}

type Measurement = ReturnType<typeof measure>;

function neighborName(row: Measurement) {
  return `${row.label} (${displayInteger(row.neighbor)})`;
}

function Rank({ comparison, first, second }: { comparison: number; first: Measurement; second: Measurement }) {
  return <p className="distance-ranking" aria-live="polite">{comparison === 0 ? 'Both neighbors are equally close.'
    : `${neighborName(comparison < 0 ? first : second)} is the closer neighbor.`}</p>;
}

function BitRows({ anchor, row }: { anchor: bigint; row: Measurement }) {
  const words = [{ label: 'A', word: bits(anchor, bitWidth) }, { label: row.label, word: bits(row.neighbor, bitWidth) }];
  const shared = row.valuation.kind === 'finite' ? row.valuation.exponent : bitWidth;
  return <>
    {words.map(({ label, word }) => (
      <div className="distance-bit-row" key={label}>
        <span className="visually-hidden">{label} low bits {word.split('').join(' ')}</span>
        <span className="distance-bit-label" aria-hidden="true">{label}</span>
        {Array.from(word, (bit, index) => <span key={index} aria-hidden="true"
          className={index >= bitWidth - shared ? 'matched' : undefined}>{bit}</span>)}
      </div>
    ))}
    <p className="shared-copy distance-bit-note">{row.valuation.kind === 'infinite' ? 'All low bits match. These are equal integers.'
      : `${shared} shared low ${shared === 1 ? 'bit' : 'bits'}.${shared >= bitWidth ? ` All ${bitWidth} shown match.` : ''}`}</p>
  </>;
}

const predictions = [48n, 80n, 'equal'] as const;

function Prediction() {
  const [answer, setAnswer] = useState<(typeof predictions)[number] | null>(null);
  const [left, right] = predictions;
  const divisions = valuationSteps(left).length - 1;

  return <details className="distance-drawer">
    <summary>Make a prediction</summary>
    <p id="prediction-question">Which has the smaller 2-adic norm, {left.toString()} or {right.toString()}?</p>
    <div className="controls" role="group" aria-labelledby="prediction-question">
      {predictions.map((choice) => <button className="stage-button" type="button" key={String(choice)}
        aria-pressed={answer === choice} onClick={() => setAnswer(choice)}>{choice === 'equal' ? 'Equal' : choice.toString()}</button>)}
    </div>
    <div className="prediction-feedback" aria-live="polite">
      {answer !== null && <>
        <p>{answer === 'equal' ? 'Yes. The norms are equal.' : 'The norms are equal.'} Divide each number by 2 a total of {divisions} times to reach an odd quotient.</p>
        <p>{[left, right].map((integer) => <span className="prediction-value" key={integer.toString()}>
          <Equation tex={`|${integer}|_2=${sizeTex(norm2(integer))}`} />
        </span>)}</p>
      </>}
    </div>
  </details>;
}

export function DistanceLab() {
  const [anchor, setAnchor] = useState<bigint>(presets[0][0]);
  const [neighbor, setNeighbor] = useState<bigint>(presets[0][1]);
  const [candidate, setCandidate] = useState(2n);
  const [showCandidate, setShowCandidate] = useState(false);
  const [pairVersion, setPairVersion] = useState(0);

  const first = measure(anchor, neighbor, 'B');
  const second = showCandidate ? measure(anchor, candidate, 'C') : undefined;
  const measurements = second ? [first, second] : [first];
  const furthest = second && second.ordinary > first.ordinary ? second.ordinary : first.ordinary;
  const scale = furthest === 0n ? 2n : (furthest + 1n) / 2n * 2n;
  const ticks = [0n, scale / 2n, scale];
  const differenceTex = first.valuation.kind === 'finite'
    ? signedFactorTex(first.difference, first.valuation.exponent) : '0';

  function setPair(a: bigint, b: bigint) {
    setAnchor(a);
    setNeighbor(b);
    setPairVersion((version) => version + 1);
  }

  return (
    <LabFrame title="Measure closeness two ways" id="distance-lab-heading" label="Distance lab">
      <div className="distance-controls">
        <div className="controls distance-inputs">
          <IntegerField key={`a-${pairVersion}`} label="Anchor A" value={anchor} onCommit={setAnchor} />
          <IntegerField key={`b-${pairVersion}`} label="Neighbor B" value={neighbor} onCommit={setNeighbor} />
          <label className="neighbor-toggle">
            <input type="checkbox" checked={showCandidate} onChange={(event) => setShowCandidate(event.target.checked)} />
            Compare a second neighbor
          </label>
          {showCandidate && <IntegerField label="Neighbor C" value={candidate} onCommit={setCandidate} />}
        </div>
        <details className="presets distance-presets">
          <summary>Example pairs</summary>
          <div className="controls">
            {presets.map(([a, b]) => <button type="button" className="stage-button" key={`${a}:${b}`} onClick={() => setPair(a, b)}>
              {a.toString()} and {b.toString()}
            </button>)}
            <button type="button" className="stage-button" onClick={() => {
              setPair(...presets[0]);
              setCandidate(2n);
              setShowCandidate(false);
            }}>Reset comparison</button>
          </div>
        </details>
      </div>

      <div className="measurement-grid">
        <section className="measurement-panel" aria-labelledby="ordinary-measurement">
          <h4 id="ordinary-measurement" className="tone-b">Ordinary distance</h4>
          <p className="muted measurement-caption">Linear scale · absolute difference from A</p>
          {measurements.map((row) => <div className="measurement-item" key={row.label}>
            <div className="measurement-value"><span>{neighborName(row)}</span><strong className="tone-b">{row.ordinary.toString()}</strong></div>
            <svg className="distance-ruler" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
              <rect className="ruler-track" x="0" y="2" width="100" height="4" />
              <rect className="ruler-fill" x="0" y="2" width={100 * Number(row.ordinary) / Number(scale)} height="4" />
              <path className="ruler-ticks" d="M0 0V8 M50 0V8 M100 0V8" />
            </svg>
            <div className="ruler-labels" aria-hidden="true">{ticks.map((tick) => <span key={tick.toString()}>{tick.toString()}</span>)}</div>
          </div>)}
          {second && <Rank comparison={first.ordinary < second.ordinary ? -1 : first.ordinary > second.ordinary ? 1 : 0}
            first={first} second={second} />}
        </section>

        <section className="measurement-panel" aria-labelledby="adic-measurement">
          <h4 id="adic-measurement" className="tone-a">2-adic distance</h4>
          <p className="muted measurement-caption">Low {bitWidth} bits · least significant bit on the right</p>
          {measurements.map((row) => <div className="measurement-item" key={row.label}>
            <div className="measurement-value"><span>{neighborName(row)}</span><strong className="tone-a">{formatSize(row.twoAdic)}</strong></div>
            <BitRows anchor={anchor} row={row} />
          </div>)}
          {second && <Rank comparison={compareSizes(first.twoAdic, second.twoAdic)} first={first} second={second} />}
        </section>
      </div>

      <div className="difference-ledger" aria-live="polite">
        <p className="eyebrow">Signed difference A − B</p>
        <p><Equation tex={`a-b=${differenceTex}`} /></p>
        <p className="muted"><Equation tex={`v_2(a-b)=${first.valuation.kind === 'finite' ? first.valuation.exponent : '\\infty'}`} />
          {first.valuation.kind === 'infinite' && ' · Zero is divisible by every power of 2.'}</p>
      </div>
      <Factorization difference={first.difference} />
      <Prediction />
    </LabFrame>
  );
}
