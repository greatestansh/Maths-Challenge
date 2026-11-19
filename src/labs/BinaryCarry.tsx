import { BitWord } from '../components/BitWord';
import { Equation } from '../components/Math';
import { bits, createCarry, stepCarry } from '../math/twoadic.mjs';

const width = 8;
const start = createCarry(width);
let end = start;
while (!end.done) end = stepCarry(end);

export function BinaryCarry() {
  return (
    <figure className="stage carry-example">
      <figcaption>Adding one in an eight-bit window</figcaption>
      <div className="carry-reading">
        <div className="carry-words">
          <BitWord label="Start" word={bits(start.visible, width)} />
          <BitWord label="Add" word={bits(start.pending, width)} />
          <BitWord label="Result" word={bits(end.visible, width)} />
        </div>
        <div className="carry-out">
          <p className="eyebrow">Carry-out at bit {width}</p>
          <p><Equation tex={`1\\cdot 2^{${width}}=${end.pending}`} /></p>
          <p className="muted">This bit sits just to the left of the window.</p>
        </div>
      </div>
      <dl className="carry-arithmetic">
        <div><dt>Integer sum</dt><dd><Equation tex={`${start.visible}+${start.pending}=${end.pending}`} /></dd></div>
        <div><dt>Remainder in the window</dt><dd><Equation tex={`${end.pending}\\equiv ${end.visible}\\pmod{${end.pending}}`} /></dd></div>
      </dl>
    </figure>
  );
}
