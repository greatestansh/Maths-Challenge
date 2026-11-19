import { Equation } from '../components/Math';
import { BitWord } from '../components/BitWord';
import { displayInteger, sizeTex } from '../math/format';
import { bits, distance2, formatSize, pow2, residue, sharedDepth } from '../math/twoadic.mjs';

export function TreeReadout({ a, b, depth }: { a: bigint; b?: bigint; depth: number }) {
  const aBits = bits(a, depth);
  if (b === undefined) return (
    <div className="tree-readout" aria-live="polite">
      <p className="eyebrow">What this path tells us</p>
      <p className="trace-value tone-a">A = {displayInteger(a)}</p>
      <p className="muted">Low {depth} {depth === 1 ? 'bit' : 'bits'} · rightmost bit first</p>
      <p className="bit-word tone-a">{aBits}</p>
      <p className="muted">{displayInteger(a)} belongs to {residue(a, depth).toString()} mod {pow2(depth).toString()}.</p>
      {a === -1n && <p className="shared-copy">−1 takes the 1 branch at every depth.</p>}
    </div>
  );

  const bBits = bits(b, depth);
  const common = sharedDepth(a, b);
  const distance = distance2(a, b);
  const equal = common.kind === 'infinite';
  const visibleAgreement = equal ? depth : Math.min(depth, common.exponent);
  const suffix = visibleAgreement ? aBits.slice(-visibleAgreement) : '';
  const split = equal ? null : common.exponent + 1;
  const distanceTex = distance.kind === 'pow2' && distance.exponent !== 0
    ? `2^{${distance.exponent}} = ${sizeTex(distance)}` : sizeTex(distance);

  return (
    <div className="tree-readout" aria-live="polite">
      <p className="eyebrow">What these paths tell us</p>
      <div className="pair-values">
        <span className="tone-a">A = {displayInteger(a)}</span>
        <span className="tone-b">B = {displayInteger(b)}</span>
      </div>
      <p className="muted">Low {depth} {depth === 1 ? 'bit' : 'bits'} · rightmost bit first</p>
      <BitWord label="A" word={aBits} matches={visibleAgreement} tone="a" />
      <BitWord label="B" word={bBits} matches={visibleAgreement} tone="b" />
      <p className="shared-copy">{suffix ? `Shared visible suffix ${suffix}` : 'No shared low bits'}</p>
      <div className="distance-readout">
        <p className="eyebrow">Exact 2-adic distance</p>
        <p className="distance-value" data-distance={formatSize(distance)}><Equation tex={distanceTex} /></p>
        {equal ? <p>Identical paths at every depth. There is no finite split.</p> : (
          <>
            <p>{common.exponent} shared low {common.exponent === 1 ? 'bit' : 'bits'}. Last shared depth {common.exponent}. First different nodes at depth {split}.</p>
            {split !== null && split > depth
              ? <p className="muted">Same class at this resolution. Visible bound <Equation tex={`d_2\\le ${sizeTex({ kind: 'pow2', exponent: -depth })}`} />. The split is beyond the displayed depth.</p>
              : <p className="muted">First different bit <Equation tex={`b_{${common.exponent}}`} />.</p>}
          </>
        )}
      </div>
    </div>
  );
}
