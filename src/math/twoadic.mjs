/** Exact 2-adic reference engine. No DOM, floats, or external dependencies. */
function integer(n) { if (typeof n !== 'bigint') throw new TypeError('Expected BigInt'); return n; }
function bounded(k, min=0, max=4096) { if (!Number.isInteger(k)||k<min||k>max) throw new RangeError(`Expected integer ${min}..${max}`); return k; }
const abs = n => n < 0n ? -n : n;
export function parseInteger(raw, maxDigits=80) {
  if(typeof raw!=='string') throw new TypeError('Expected text');
  const s=raw.trim(); if(!/^[+-]?\d+$/.test(s)) throw new SyntaxError('Enter a signed whole number');
  if(s.replace(/^[+-]/,'').length>maxDigits) throw new RangeError('Input is too long');
  return BigInt(s);
}
export function pow2(k) { return 1n << BigInt(bounded(k)); }
export function v2(n) {
  integer(n); if(n===0n) return {kind:'infinite'};
  let m=abs(n), exponent=0; while(m%2n===0n) {m/=2n;exponent++;}
  return {kind:'finite',exponent};
}
export function norm2(n) { const v=v2(n);return v.kind==='infinite'?{kind:'zero'}:{kind:'pow2',exponent:-v.exponent}; }
export function distance2(a,b) {return norm2(integer(a)-integer(b));}
export function compareSizes(a,b) {
  if(a.kind==='zero')return b.kind==='zero'?0:-1;
  if(b.kind==='zero')return 1;
  return Math.sign(a.exponent-b.exponent);
}
export function formatSize(s) {if(s.kind==='zero')return '0';return s.exponent<0?`1/${pow2(-s.exponent)}`:`${pow2(s.exponent)}`;}
export function residue(n,k) {const m=pow2(k);return ((integer(n)%m)+m)%m;}
export function bits(n,k) {bounded(k,1);return residue(n,k).toString(2).padStart(k,'0');}
export function path(n,depth) {
  integer(n);bounded(depth,0,64);
  return Array.from({length:depth+1},(_,k)=>({depth:k,residue:residue(n,k),modulus:pow2(k),bit:k===0?null:Number((residue(n,k)>>BigInt(k-1))&1n)}));
}
export function sharedDepth(a,b) {return v2(integer(a)-integer(b));}
export function ballExamples(r,k) {const base=residue(r,k),m=pow2(k);return [-2n,-1n,0n,1n,2n,3n,4n,5n].map(t=>base+t*m);}
export function valuationSteps(n) {integer(n);let x=abs(n),steps=[x];if(x===0n)return steps;while(x%2n===0n){x/=2n;steps.push(x);}return steps;}
export function sequence(n) {bounded(n,1);const p=pow2(n);return {n,sum:p-1n,plusOne:p,ordinaryError:p,twoAdicError:{kind:'pow2',exponent:-n}};}
export function gcd(a,b) {a=abs(integer(a));b=abs(integer(b));while(b!==0n)[a,b]=[b,a%b];return a;}
export function rational(p,q) {integer(p);integer(q);if(q===0n)throw new RangeError('Denominator cannot be zero');if(q<0n){p=-p;q=-q;}const g=gcd(p,q);return {p:p/g,q:q/g};}
export function rationalNorm(p,q) {const r=rational(p,q);if(r.p===0n)return {kind:'zero'};return {kind:'pow2',exponent:v2(r.q).exponent-v2(r.p).exponent};}
function inverse(a,m) {
  a=((a%m)+m)%m;let r0=m,r1=a,t0=0n,t1=1n;
  while(r1!==0n){const q=r0/r1;[r0,r1]=[r1,r0-q*r1];[t0,t1]=[t1,t0-q*t1];}
  if(r0!==1n)throw new RangeError('No inverse');return ((t0%m)+m)%m;
}
export function expandFraction(p,q,k) {
  bounded(k,1,64);const f=rational(p,q);if(f.q%2n===0n)throw new RangeError('Reduced denominator is even: outside this Z2 display');
  const m=pow2(k),r=residue(f.p*inverse(f.q,m),k);
  return {...f,k,modulus:m,residue:r,bits:bits(r,k),verification:residue(f.q*r,k),target:residue(f.p,k)};
}
export function rootLevels(a,maxDepth) {
  integer(a);bounded(maxDepth,1,12);if(a%2n===0n)throw new RangeError('This explorer expects odd a');
  const levels=[{depth:0,modulus:1n,roots:[0n]}];
  for(let k=1;k<=maxDepth;k++) {
    const half=pow2(k-1), m=pow2(k), roots=[];
    for(const r of levels[k-1].roots)for(const x of [r,r+half])if(residue(x*x-a,k)===0n)roots.push(x);
    roots.sort((x,y)=>x<y?-1:x>y?1:0);levels.push({depth:k,modulus:m,roots});
  }return levels;
}
export function createCarry(width=8) {bounded(width,1,64);return {width,cursor:0,visible:pow2(width)-1n,pending:1n,done:false};}
export function stepCarry(s) {
  bounded(s.width,1,64);bounded(s.cursor,0,s.width);integer(s.visible);integer(s.pending);
  if(s.done)return {...s};const cursor=s.cursor+1,pending=pow2(cursor);
  return {width:s.width,cursor,visible:pow2(s.width)-pending,pending,done:cursor===s.width};
}
