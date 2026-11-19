import { displayInteger } from '../math/format';
import { ballExamples, formatSize, pow2 } from '../math/twoadic.mjs';
import type { TreeClass } from '../math/treeLayout';

export function BallReadout({ selected, center, onCenter, canRecenter = true }: {
  selected: TreeClass;
  center: bigint;
  onCenter: (center: bigint) => void;
  canRecenter?: boolean;
}) {
  const modulus = pow2(selected.depth);
  const examples = ballExamples(selected.residue, selected.depth);
  const otherCenter = center === selected.residue ? examples[3] : selected.residue;
  return <div className="tree-readout ball-readout" aria-live="polite">
    <p className="eyebrow">Selected closed ball in ℤ₂</p>
    <p className="ball-class">{selected.residue.toString()} mod {modulus.toString()}</p>
    <p>Radius <strong>{formatSize({ kind: 'pow2', exponent: -selected.depth })}</strong>, including the boundary</p>
    <p>Center <strong>{displayInteger(center)}</strong></p>
    <p className="muted">Integer examples from this infinite class</p>
    <p className="ball-examples">{examples.map(displayInteger).join(', ')}</p>
    <button type="button" className="stage-button" disabled={!canRecenter} onClick={() => onCenter(otherCenter)}>
      Use {displayInteger(otherCenter)} as center
    </button>
    {canRecenter && <p className="muted">Every member of the ball can serve as its center.</p>}
  </div>;
}
