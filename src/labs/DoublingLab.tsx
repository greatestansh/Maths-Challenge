import { useState } from 'react';
import { BitWord } from '../components/BitWord';
import { LabFrame } from '../components/LabFrame';
import { bits, distance2, formatSize, pow2, sharedDepth } from '../math/twoadic.mjs';

const lastDoubling = 12;

export function DoublingLab() {
  const [count, setCount] = useState(0);
  const a = pow2(count);
  const b = 9n * a;
  const width = b.toString(2).length;
  const common = sharedDepth(a, b);
  const matches = common.kind === 'finite' ? common.exponent : width;

  return <LabFrame title="Double both numbers" id="doubling-title" label="Divisibility and scale">
    <div className="exposition-grid doubling-readout" aria-live="polite">
      <div className="tree-readout" role="region" aria-label="Binary values after doubling" tabIndex={width > 8 ? 0 : undefined}>
        <BitWord label={`${a}`} word={bits(a, width)} binary tone="a" matches={matches} />
        <BitWord label={`${b}`} word={bits(b, width)} binary tone="b" matches={matches} />
        <p className="shared-copy">{matches} shared low bits</p>
      </div>
      <dl className="distance-pairs">
        <div><dt>Ordinary distance</dt><dd className="tone-b">{(b - a).toString()}</dd></div>
        <div><dt>2-adic distance</dt><dd className="tone-a">{formatSize(distance2(a, b))}</dd></div>
      </dl>
    </div>
    <div className="controls">
      <button type="button" className="stage-button" disabled={count === lastDoubling} onClick={() => setCount(count + 1)}>Double both numbers</button>
      <button type="button" className="stage-button" onClick={() => setCount(0)}>Reset</button>
    </div>
  </LabFrame>;
}
