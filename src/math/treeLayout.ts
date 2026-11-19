import { pow2, residue } from './twoadic.mjs';

export type TreeClass = { depth: number; residue: bigint };

export type DiagramNode = TreeClass & {
  key: string;
  parent: string | null;
  bit: 0 | 1 | null;
  hiddenLeaves: number;
  x: number;
  y: number;
};

export function nodeKey(node: TreeClass) {
  return `${node.depth}:${node.residue}`;
}

export function treeLayout(depth: number, full: boolean, anchors: TreeClass[], preview: boolean, compact: boolean) {
  const width = full && depth > 4 ? 120 + Number(pow2(depth)) * 47 : compact ? 390 : 650;
  const spacing = preview ? 74 : 70;
  const height = 64 + spacing * depth;
  const levels: DiagramNode[][] = [];

  function visit(node: TreeClass, order: number, parent: string | null, bit: DiagramNode['bit']) {
    const key = nodeKey(node);
    const containsAnchor = anchors.some((anchor) => anchor.depth >= node.depth
      && residue(anchor.residue, node.depth) === node.residue);
    const hiddenLeaves = full || containsAnchor || node.depth === depth ? 0 : Number(pow2(depth - node.depth));
    const x = 62 + (width - 98) * (order + 0.5) / Number(pow2(node.depth));
    const y = 22 + node.depth * spacing;
    (levels[node.depth] ??= []).push({ ...node, key, parent, bit, hiddenLeaves, x, y });
    if (node.depth === depth || hiddenLeaves) return;

    const next = node.depth + 1;
    visit({ depth: next, residue: node.residue }, order * 2, key, 0);
    visit({ depth: next, residue: node.residue + pow2(node.depth) }, order * 2 + 1, key, 1);
  }

  visit({ depth: 0, residue: 0n }, 0, null, null);
  if (!full) {
    for (const level of levels) {
      level.forEach((node, index) => { node.x = 62 + (width - 98) * (index + 0.5) / level.length; });
    }
  }
  return { nodes: levels.flat(), width, height };
}
