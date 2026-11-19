import { useRef, useState, type KeyboardEvent } from 'react';
import { pow2, residue } from '../math/twoadic.mjs';
import { nodeKey, treeLayout, type DiagramNode, type TreeClass } from '../math/treeLayout';

export function TreeDiagram({ depth, a, b, full, preview = false, compact = false, label, selected, onSelect }: {
  depth: number;
  a?: bigint;
  b?: bigint;
  full: boolean;
  preview?: boolean;
  compact?: boolean;
  label?: string;
  selected?: TreeClass;
  onSelect?: (node: TreeClass) => void;
}) {
  const [focusKey, setFocusKey] = useState('0:0');
  const targets = useRef(new Map<string, SVGGElement>());
  const anchors: TreeClass[] = [];
  if (a !== undefined) anchors.push({ depth, residue: residue(a, depth) });
  if (b !== undefined) anchors.push({ depth, residue: residue(b, depth) });
  if (selected) anchors.push(selected);
  const { nodes, width, height } = treeLayout(depth, full, anchors, preview, compact);
  const byKey = new Map(nodes.map((node) => [node.key, node]));
  const activeKey = byKey.has(focusKey) ? focusKey : '0:0';
  const selectedKey = selected && nodeKey(selected);

  function tone(node: DiagramNode) {
    if (selected) {
      const commonDepth = Math.min(node.depth, selected.depth);
      return residue(node.residue, commonDepth) === residue(selected.residue, commonDepth) ? 'shared' : 'idle';
    }
    if (a === undefined && b === undefined) return node.depth === depth ? 'shared' : 'idle';
    const isA = a !== undefined && residue(a, node.depth) === node.residue;
    const isB = b !== undefined && residue(b, node.depth) === node.residue;
    if (isA && isB) return 'shared';
    if (isA) return 'a';
    return isB ? 'b' : 'idle';
  }

  function navigate(event: KeyboardEvent<SVGGElement>, node: DiagramNode) {
    const index = nodes.indexOf(node);
    let next: string | null | undefined;
    switch (event.key) {
      case 'ArrowLeft': next = node.parent; break;
      case 'ArrowRight': next = nodes.find((child) => child.parent === node.key)?.key; break;
      case 'ArrowUp': next = nodes[index - 1]?.key; break;
      case 'ArrowDown': next = nodes[index + 1]?.key; break;
      case 'Home': next = '0:0'; break;
      case 'Enter': case ' ': onSelect?.(node); break;
      default: return;
    }
    event.preventDefault();
    if (next) targets.current.get(next)?.focus();
  }

  return (
    <svg className={`tree-diagram${preview ? ' preview-diagram' : ''}${compact ? ' compact-diagram' : ''}`} viewBox={`0 0 ${width} ${height}`}
      style={width > 650 ? { width, maxWidth: 'none' } : undefined} role={onSelect ? 'group' : 'img'}
      aria-label={label ?? (onSelect ? 'Selectable residue tree' : 'Binary residue tree with highlighted paths')}>
      <g aria-hidden="true">
        {Array.from({ length: depth + 1 }, (_, level) => {
          const y = 22 + level * (preview ? 74 : 70);
          return <g key={level}>
            <line className="level-guide" x1="58" x2={width - 18} y1={y} y2={y} />
            <text className="level-label" x="2" y={y + 4}>mod {pow2(level).toString()}</text>
          </g>;
        })}
        {nodes.map((node) => {
          const parent = node.parent && byKey.get(node.parent);
          if (!parent) return null;
          const color = tone(node);
          return <g key={node.key}>
            <line className={`tree-edge tone-${color}`} x1={parent.x} y1={parent.y} x2={node.x} y2={node.y} />
            {!preview && (a === undefined || color !== 'idle') && <text className={`branch-bit tone-${color}`} textAnchor="middle"
              x={(parent.x + node.x) / 2 + (node.bit ? 11 : -11)} y={(parent.y + node.y) / 2 + 4}>{node.bit}</text>}
          </g>;
        })}
      </g>
      {nodes.map((node) => {
        const color = tone(node);
        const label = node.depth === 0 ? 'ℤ₂' : node.residue.toString();
        return <g key={node.key} data-node-key={node.key} className={`tree-node tone-${color}`} transform={`translate(${node.x} ${node.y})`}
          ref={onSelect ? (element) => { if (element) targets.current.set(node.key, element); else targets.current.delete(node.key); } : undefined}
          aria-hidden={onSelect ? undefined : true} role={onSelect ? 'button' : undefined}
          aria-label={onSelect ? `Depth ${node.depth}, ${node.residue} modulo ${pow2(node.depth)}${node.hiddenLeaves ? `, ${node.hiddenLeaves} terminal classes collapsed` : ''}` : undefined}
          aria-pressed={onSelect ? selectedKey === node.key : undefined}
          tabIndex={onSelect ? (node.key === activeKey ? 0 : -1) : undefined}
          onFocus={onSelect ? () => setFocusKey(node.key) : undefined}
          onKeyDown={onSelect ? (event) => navigate(event, node) : undefined}
          onClick={onSelect ? () => { targets.current.get(node.key)?.focus(); onSelect(node); } : undefined}>
          {onSelect && <circle r="17" className="node-target" />}
          {selectedKey === node.key && <circle className="selection-ring" r="12" />}
          {node.hiddenLeaves ? <rect className="node-dot" x="-5" y="-5" width="10" height="10" rx="1" transform="rotate(45)" />
            : <circle className="node-dot" r={color === 'idle' ? 4.5 : 6.5} />}
          <text y="23" textAnchor="middle">{label}</text>
          {node.hiddenLeaves > 0 && <text className="collapsed-label" y="40" textAnchor="middle">{node.hiddenLeaves} leaves</text>}
        </g>;
      })}
    </svg>
  );
}
