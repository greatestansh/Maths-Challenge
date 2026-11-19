import { useState } from 'react';
import { BallReadout } from '../components/BallReadout';
import { IntegerField } from '../components/IntegerField';
import { LabFrame } from '../components/LabFrame';
import { TreeDiagram } from '../components/TreeDiagram';
import { compareSizes, distance2, formatSize, sharedDepth } from '../math/twoadic.mjs';
import { displayInteger } from '../math/format';

const ball = { depth: 3, residue: 1n };

export function BallLesson() {
  const [center, setCenter] = useState(1n);
  const [prediction, setPrediction] = useState<'same' | 'different' | null>(null);
  return <LabFrame title="Can the center move?" id="ball-lesson-title" label="The ball of radius 1/8">
    <div className="exposition-grid">
      <div>
        <figure className="lesson-diagram inset-figure">
          <TreeDiagram depth={3} a={center} selected={ball} full compact label="The highlighted subtree ends at the class 1 modulo 8" />
          <figcaption className="muted">The highlighted class fixes the low bits 001.</figcaption>
        </figure>
        <p>Predict what happens to the members when the center moves from 1 to 9.</p>
        <div className="controls" role="group" aria-label="Predict what happens to ball membership">
          <button type="button" className="stage-button" aria-pressed={prediction === 'same'} onClick={() => setPrediction('same')}>Same members</button>
          <button type="button" className="stage-button" aria-pressed={prediction === 'different'} onClick={() => setPrediction('different')}>Different members</button>
        </div>
      </div>
      <div>
        <BallReadout selected={ball} center={center} onCenter={setCenter} canRecenter={prediction !== null} />
        <p className="muted" aria-live="polite">{center === 9n ? 'Both centers leave remainder 1 modulo 8. The highlighted class and its members stay the same.'
          : prediction ? 'Now use 9 as the center and compare the list.' : 'Make a prediction to try the new center.'}</p>
      </div>
    </div>
  </LabFrame>;
}

export function ThreePointTree() {
  const [a, setA] = useState(1n);
  const [b, setB] = useState(9n);
  const [c, setC] = useState(3n);
  const pairs = [
    { label: 'A and B', first: a, second: b },
    { label: 'A and C', first: a, second: c },
    { label: 'B and C', first: b, second: c },
  ].map((pair) => ({ ...pair, distance: distance2(pair.first, pair.second), shared: sharedDepth(pair.first, pair.second) }));
  const largest = pairs.reduce((max, row) => compareSizes(row.distance, max) > 0 ? row.distance : max, pairs[0].distance);
  const repeated = a === b || a === c || b === c;

  return <LabFrame title="Which pair splits first?" id="three-point-title" label="Three-point geometry">
    <div className="controls triplet-controls">
      <IntegerField label="Point A" tone="a" value={a} onCommit={setA} />
      <IntegerField label="Point B" tone="b" value={b} onCommit={setB} />
      <IntegerField label="Point C" value={c} onCommit={setC} />
    </div>
    <div className="exposition-grid">
      <figure className="lesson-diagram inset-figure">
        <div className="legend"><span className="tone-a"><i /> A</span><span className="tone-b"><i /> B</span><span className="tone-c"><i /> C</span><span className="tone-shared"><i /> Shared</span></div>
        <TreeDiagram depth={4} a={a} b={b} c={c} full={false} compact label="Four levels of the three paths; pair distances follow from shared low bits" />
        <figcaption className="muted">Branch positions help trace the paths. Count shared bits to measure a distance.</figcaption>
      </figure>
      <div className="tree-readout" aria-live="polite">
        <dl className="distance-pairs">
          {pairs.map(({ label, first, second, distance, shared }) => {
            const isLargest = compareSizes(distance, largest) === 0;
            return <div key={label} className={isLargest ? 'largest' : undefined}>
              <dt>{label} ({displayInteger(first)}, {displayInteger(second)})</dt>
              <dd><strong>{formatSize(distance)}</strong>{isLargest && ' · largest'}</dd>
              <dd className="muted">{shared.kind === 'infinite' ? 'The same point' : `${shared.exponent} shared low ${shared.exponent === 1 ? 'bit' : 'bits'}${shared.exponent >= 4 ? ' · split beyond the diagram' : ''}`}</dd>
            </div>;
          })}
        </dl>
        <p>{largest.kind === 'zero' ? 'All three names refer to the same point. All distances are zero.'
          : repeated ? 'Two names refer to the same point. Their mutual distance is zero and their distances to the third point agree.'
          : 'At the first split, two points take one branch and the third takes the other. Both pairs across that split have the largest distance.'}</p>
      </div>
    </div>
  </LabFrame>;
}
