import { useLayoutEffect, useRef, useState } from 'react';
import { IntegerField } from '../components/IntegerField';
import { BallReadout } from '../components/BallReadout';
import { LabFrame } from '../components/LabFrame';
import { TreeDiagram } from '../components/TreeDiagram';
import { path, residue } from '../math/twoadic.mjs';
import { nodeKey, type TreeClass } from '../math/treeLayout';
import { lastTerm, useSequence } from '../state/SequenceContext';
import { TreeReadout } from './TreeReadout';

const modes = [
  ['compare', 'Compare'], ['trace', 'Trace'], ['ball', 'Select ball'], ['sequence', 'Convergence'],
] as const;
const presets = [[1n, 9n], [1n, 2n], [1n, 1025n], [0n, 1024n], [7n, 7n]] as const;
const firstBall = { depth: 3, residue: 1n };
const root = { depth: 0, residue: 0n };

function centerDiagram(area: HTMLDivElement | null, node: TreeClass) {
  const dot = area?.querySelector(`[data-node-key="${nodeKey(node)}"] .node-dot`);
  if (!area || !dot) return;
  const target = dot.getBoundingClientRect();
  const viewport = area.getBoundingClientRect();
  area.scrollLeft += target.left + target.width / 2 - viewport.left - viewport.width / 2;
}

export function ResidueTree({ onGuide }: { onGuide: () => void }) {
  const { current, setTerm } = useSequence();
  const [mode, setMode] = useState<(typeof modes)[number][0]>('compare');
  const [depth, setDepth] = useState(4);
  const [a, setA] = useState(1n);
  const [b, setB] = useState(9n);
  const [trace, setTrace] = useState(-1n);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<TreeClass>(firstBall);
  const [center, setCenter] = useState(firstBall.residue);
  const [largeView, setLargeView] = useState(false);
  const [mobileDiagram, setMobileDiagram] = useState(false);
  const scrollArea = useRef<HTMLDivElement>(null);
  const valueA = mode === 'sequence' ? current.sum : mode === 'trace' ? trace : a;
  const valueB = mode === 'sequence' ? -1n : mode === 'trace' ? undefined : b;
  const pathA = path(valueA, depth);
  const pathB = valueB === undefined ? undefined : path(valueB, depth);
  const inBallMode = mode === 'ball';
  const full = depth <= 4 || largeView;

  useLayoutEffect(() => {
    if (largeView && depth > 4) centerDiagram(scrollArea.current, root);
  }, [largeView, depth, mobileDiagram]);

  function selectNode(node: TreeClass) {
    setSelected({ depth: node.depth, residue: node.residue });
    setCenter(node.residue);
  }

  function changeDepth(next: number) {
    setDepth(next);
    if (selected.depth > next) selectNode({ depth: next, residue: residue(selected.residue, next) });
  }

  function applyPreset(first: bigint, second: bigint) {
    setA(first);
    setB(second);
    setRevision((previous) => previous + 1);
  }

  function reset() {
    setMode('compare');
    setDepth(4);
    applyPreset(1n, 9n);
    setTrace(-1n);
    selectNode(firstBall);
    setLargeView(false);
    setMobileDiagram(false);
  }

  return (
    <LabFrame title="Compare paths through the tree" id="tree-lab-heading" label="Residue tree">
      <div className="tree-toolbar">
        <div className="segments" role="group" aria-label="Tree mode">
          {modes.map(([key, label]) => <button type="button" key={key} aria-pressed={mode === key} onClick={() => setMode(key)}>{label}</button>)}
        </div>
        <div className="controls">
          <label className="select-label">Depth<select value={depth} onChange={(event) => changeDepth(Number(event.target.value))}>
            {Array.from({ length: 7 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}
          </select></label>
          <button type="button" className="stage-button" onClick={reset}>Reset tree</button>
          <button type="button" className="stage-button" onClick={onGuide}>Return to guide</button>
        </div>
      </div>
      <div className="tree-controls">
        {mode === 'compare' && <>
          <IntegerField key={`a-${revision}`} label="Integer A" tone="a" value={a} onCommit={setA} />
          <IntegerField key={`b-${revision}`} label="Integer B" tone="b" value={b} onCommit={setB} />
          <details className="presets">
            <summary>Example pairs</summary>
            <div className="controls">
              {presets.map(([first, second]) => <button type="button" className="stage-button" key={`${first}:${second}`}
                onClick={() => applyPreset(first, second)}>{first.toString()} and {second.toString()}</button>)}
            </div>
          </details>
        </>}
        {mode === 'trace' && <IntegerField label="Integer to trace" tone="a" value={trace} onCommit={setTrace} />}
        {mode === 'sequence' && <><label className="term-range tree-range">Number of terms <strong>{current.n}</strong>
          <input type="range" min="1" max={lastTerm} value={current.n} onChange={(event) => setTerm(Number(event.target.value))} />
        </label><p className="muted">A is the partial sum. B is the limit, −1.</p></>}
        {inBallMode && <p className="muted">Each node stands for a closed ball, the numbers whose distance from a center is at most its radius. Choose a node in the tree or a remainder in the table to see its members.</p>}
      </div>

      <div className="tree-columns">
        <div className="tree-graphics">
          <div className="tree-options">
            <div className="legend" aria-label="Path legend">
              {inBallMode ? <span className="tone-shared"><i /> Selected class</span> : <>
                <span className="tone-a"><i /> A</span>
                {valueB !== undefined && <><span className="tone-b"><i /> B</span><span className="tone-shared"><i /> Shared path</span></>}
              </>}
            </div>
            <button type="button" className="stage-button mobile-tree-toggle" aria-expanded={mobileDiagram} aria-controls="tree-graphic"
              onClick={() => setMobileDiagram(!mobileDiagram)}>{mobileDiagram ? 'Hide diagram' : 'Show diagram'}</button>
            {depth > 4 && <button type="button" className={`stage-button ${mobileDiagram ? '' : 'desktop-view-toggle'}`}
              aria-pressed={largeView} onClick={() => setLargeView(!largeView)}>{largeView ? 'Focused tree' : 'Full tree'}</button>}
          </div>
          <div className={`tree-graphic ${mobileDiagram ? 'show-mobile' : ''}`} id="tree-graphic">
            {full && depth > 4 && <div className="controls tree-pan">
              <button type="button" className="stage-button" onClick={() => centerDiagram(scrollArea.current, root)}>Center root</button>
              <button type="button" className="stage-button" onClick={() => centerDiagram(scrollArea.current, inBallMode ? selected : pathA[depth])}>
                {inBallMode ? 'Center selected class' : 'Center path A'}
              </button>
            </div>}
            {inBallMode && <p className="diagram-help" id="tree-keyboard-help">Use Left for parent, Right for child, Up and Down for nearby nodes, and Enter to select.</p>}
            <div ref={scrollArea} className="diagram-scroll" role="region" aria-label="Residue diagram scroll area"
              aria-describedby={inBallMode ? 'tree-keyboard-help' : undefined} tabIndex={full && depth > 4 ? 0 : undefined}>
              <TreeDiagram depth={depth} a={inBallMode ? selected.residue : valueA} b={inBallMode ? undefined : valueB} full={full}
                selected={inBallMode ? selected : undefined} onSelect={inBallMode ? selectNode : undefined} />
            </div>
            <p className="diagram-help">Read from the root, least significant bit first. {full ? 'Edge lengths describe the layout.' : 'Diamonds group sibling subtrees and count their terminal classes.'}{full && depth > 4 && ' Scroll sideways to see more classes.'}</p>
          </div>
          <div className="residue-rows">
            <table>
              <caption>Remainders by depth</caption>
              <thead><tr><th scope="col">Depth</th><th scope="col">Modulus</th><th scope="col" className="tone-a">A</th>
                {pathB && <th scope="col" className="tone-b">B</th>}{!inBallMode && <th scope="col">{pathB ? 'Match' : 'New bit'}</th>}</tr></thead>
              <tbody>
                {pathA.map((row) => {
                  const other = pathB?.[row.depth];
                  const same = other?.residue === row.residue;
                  function renderResidue(node: TreeClass, color: 'a' | 'b') {
                    return inBallMode ? <button type="button" className="residue-button" aria-pressed={nodeKey(node) === nodeKey(selected)}
                      aria-label={`${node.residue} modulo ${row.modulus} from path ${color.toUpperCase()}`} onClick={() => selectNode(node)}>{node.residue.toString()}</button>
                      : node.residue.toString();
                  }
                  return <tr key={row.depth}>
                    <th scope="row">{row.depth}</th><td>{row.modulus.toString()}</td><td className="tone-a">{renderResidue(row, 'a')}</td>
                    {other && <td className="tone-b">{same && inBallMode ? other.residue.toString() : renderResidue(other, 'b')}</td>}
                    {!inBallMode && <td className={same ? 'tone-shared' : ''}>{other ? same ? 'Same' : 'Different' : row.bit ?? 'Root'}</td>}
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
        {inBallMode ? <BallReadout selected={selected} center={center} onCenter={setCenter} />
          : <TreeReadout a={valueA} b={valueB} depth={depth} />}
      </div>
    </LabFrame>
  );
}
