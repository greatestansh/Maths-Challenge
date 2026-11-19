import { useId, useState } from 'react';
import { BitWord } from '../components/BitWord';
import { LabFrame } from '../components/LabFrame';
import { Equation } from '../components/Math';
import { SequenceControls } from '../components/SequenceControls';
import { TreeDiagram } from '../components/TreeDiagram';
import { bits, formatSize } from '../math/twoadic.mjs';
import { useSequence } from '../state/SequenceContext';
import { ConvergenceChart } from './ConvergenceChart';

const defaultPrecision = 5;
const precisions = [1, 2, 3, 4, 5, 6, 7, 8];

export function ConvergenceLab() {
  const [precision, setPrecision] = useState(defaultPrecision);
  const { current, pause } = useSequence();
  const controlsId = useId();
  const { n, sum, ordinaryError, twoAdicError } = current;
  const matched = Math.min(n, precision);
  const diagramDepth = Math.min(precision, 4);
  const sumBits = sum.toString(2);

  return (
    <LabFrame title="Watch the same sum move two ways" id="convergence-lab-heading" label="Convergence lab">
      <div className="convergence-controls">
        <SequenceControls id={controlsId} onReset={() => setPrecision(defaultPrecision)} />
        <label className="select-label">Precision k<select value={precision} onChange={(event) => {
          pause(controlsId);
          setPrecision(Number(event.target.value));
        }}>
          {precisions.map((k) => <option value={k} key={k}>{k} low {k === 1 ? 'bit' : 'bits'}</option>)}
        </select></label>
      </div>

      <dl className="convergence-numbers">
        <div className="convergence-sum">
          <dt className="eyebrow">Partial sum</dt>
          <dd><Equation tex={`S_{${n}}=2^{${n}}-1=${sum}`} /></dd>
          <dd className="convergence-binary"><span className="muted">In binary</span> <code>{sumBits}</code><sub>2</sub></dd>
        </div>
        <div><dt className="eyebrow">Ordinary distance to −1</dt><dd className="tone-b">{ordinaryError.toString()}</dd></div>
        <div><dt className="eyebrow">2-adic distance to −1</dt><dd className="tone-a">{formatSize(twoAdicError)}</dd></div>
      </dl>

      <div className="convergence-grid">
        <ConvergenceChart term={n} />
        <div className="convergence-path">
          <h4>Compare the low bits</h4>
          <BitWord label={`S${n}`} word={bits(sum, precision)} matches={matched} tone="a" />
          <BitWord label="−1" word={bits(-1n, precision)} matches={matched} tone="b" />
          <p className="shared-copy" aria-live="polite">{n >= precision
            ? <>All {precision} chosen low {precision === 1 ? 'bit agrees' : 'bits agree'}. Every subsequent sum keeps that agreement.</>
            : <>The rightmost {matched} {matched === 1 ? 'bit agrees' : 'bits agree'}. The full window agrees once the sum has {precision} terms.</>}</p>
          <figure className="convergence-tree lesson-diagram">
            <figcaption>First {diagramDepth} tree {diagramDepth === 1 ? 'level' : 'levels'} · violet marks the shared path{diagramDepth === 4 && ' and diamonds group other branches'}</figcaption>
            <TreeDiagram depth={diagramDepth} a={sum} b={-1n} full={diagramDepth < 4} compact
              label={`The paths for the partial sum and minus one share ${Math.min(n, diagramDepth)} displayed levels below the root.`} />
          </figure>
        </div>
      </div>
    </LabFrame>
  );
}
