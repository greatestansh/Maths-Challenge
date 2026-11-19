import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from './twoadic.mjs';
const f = x=>m.formatSize(x);
test('reference values, signs, zero, parsing and large values',()=>{
  for(const[n,v]of [[8n,3],[12n,2],[7n,0],[-12n,2],[1n<<100n,100]])assert.deepEqual(m.v2(n),{kind:'finite',exponent:v});
  assert.deepEqual(m.v2(0n),{kind:'infinite'});assert.equal(f(m.norm2(0n)),'0');assert.equal(f(m.norm2(12n)),'1/4');
  for(const[a,b,d]of [[1n,9n,'1/8'],[1n,2n,'1'],[3n,19n,'1/16'],[0n,64n,'1/64'],[7n,7n,'0']])assert.equal(f(m.distance2(a,b)),d);
  assert.equal(m.parseInteger(' -9007199254740993 '),-9007199254740993n);
  for(const s of ['','-','2.5','1e3','0x10'])assert.throws(()=>m.parseInteger(s));assert.throws(()=>m.parseInteger('1'.repeat(81)));
  assert.throws(()=>m.v2(2));assert.equal(f(m.rationalNorm(1n,2n)),'2');assert.equal(f(m.rationalNorm(0n,-2n)),'0');
});
test('exact partial sums at core and large n',()=>{
  for(let n=1;n<=100;n++){let expected=0n;for(let j=0;j<n;j++)expected+=1n<<BigInt(j);const s=m.sequence(n);assert.equal(s.sum,expected);assert.equal(s.plusOne,1n<<BigInt(n));assert.equal(f(s.twoAdicError),`1/${1n<<BigInt(n)}`);}
  assert.equal(m.sequence(5).sum,31n);assert.equal(m.sequence(20).sum,1048575n);assert.throws(()=>m.sequence(0));
});
test('tree indexing, negative residues and recentering',()=>{
  assert.equal(m.residue(-9n,3),7n);assert.equal(m.bits(-1n,8),'11111111');
  const p=m.path(1n,4),q=m.path(9n,4);for(let k=0;k<=3;k++)assert.equal(p[k].residue,q[k].residue);assert.notEqual(p[4].residue,q[4].residue);
  assert.deepEqual(m.sharedDepth(1n,9n),{kind:'finite',exponent:3});assert.deepEqual(m.sharedDepth(7n,7n),{kind:'infinite'});
  assert.deepEqual(m.ballExamples(1n,3),[-15n,-7n,1n,9n,17n,25n,33n,41n]);assert.deepEqual(m.ballExamples(1n,3),m.ballExamples(9n,3));
  assert.ok(m.path(-1n,7).slice(1).every(x=>x.bit===1));
  for(let n=1;n<=20;n++)assert.deepEqual(m.sharedDepth(m.sequence(n).sum,-1n),{kind:'finite',exponent:n});
  assert.deepEqual(m.valuationSteps(1000n),[1000n,500n,250n,125n]);assert.deepEqual(m.valuationSteps(0n),[0n]);
});
test('5000 seeded triples: ultrametricity, symmetry, multiplicativity, residues',()=>{
  let seed=20261119;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return BigInt(seed%2000001)-1000000n;};
  for(let i=0;i<5000;i++){
    const a=rand(),b=rand(),c=rand(),ab=m.distance2(a,b),ac=m.distance2(a,c),cb=m.distance2(c,b),max=m.compareSizes(ac,cb)>0?ac:cb;
    assert.ok(m.compareSizes(ab,max)<=0);assert.deepEqual(ab,m.distance2(b,a));
    if(a!==0n&&b!==0n)assert.equal(m.v2(a*b).exponent,m.v2(a).exponent+m.v2(b).exponent);
    const k=i%32+1,r=m.residue(a,k);assert.ok(r>=0n&&r<m.pow2(k));assert.equal((a-r)%m.pow2(k),0n);assert.equal(m.residue(r,k-1),m.residue(a,k-1));
    const shared=m.sharedDepth(a,b);if(shared.kind==='finite'){assert.equal(m.residue(a,shared.exponent),m.residue(b,shared.exponent));assert.notEqual(m.residue(a,shared.exponent+1),m.residue(b,shared.exponent+1));}
  }
});
test('rational reduction, finite expansion and verification',()=>{
  assert.equal(m.expandFraction(1n,3n,8).bits,'10101011');assert.equal(m.expandFraction(1n,3n,5).residue,11n);
  assert.deepEqual(m.expandFraction(1n,3n,8),m.expandFraction(2n,6n,8));assert.equal(m.expandFraction(-1n,1n,8).bits,'11111111');
  for(let p=-20n;p<=20n;p++)for(let q=1n;q<20n;q+=2n)for(const k of[1,5,8,32]){const e=m.expandFraction(p,q,k);assert.equal(e.verification,e.target);}
  assert.throws(()=>m.expandFraction(1n,2n,8));assert.throws(()=>m.expandFraction(1n,0n,8));assert.deepEqual(m.rational(2n,-6n),{p:-1n,q:3n});
});
test('lifting matches independent exhaustive modular search',()=>{
  for(const a of[1n,3n,5n,9n,17n,-7n]){const levels=m.rootLevels(a,12);for(let k=1;k<=12;k++){const bound=1n<<BigInt(k),expected=[];for(let x=0n;x<bound;x++)if(((x*x-a)%bound+bound)%bound===0n)expected.push(x);assert.deepEqual(levels[k].roots,expected);}}
  assert.deepEqual(m.rootLevels(17n,5)[5].roots,[7n,9n,23n,25n]);assert.equal(m.rootLevels(5n,3)[3].roots.length,0);assert.equal(m.rootLevels(3n,2)[2].roots.length,0);
});
test('carry invariant at every step and idempotent completion',()=>{
  for(const width of[8,16,32,64]){let s=m.createCarry(width);for(let j=0;j<=width;j++){assert.equal(s.cursor,j);assert.equal(s.visible+s.pending,1n<<BigInt(width));assert.equal(m.bits(s.visible,width),'1'.repeat(width-j)+'0'.repeat(j));if(j<width)s=m.stepCarry(s);}assert.ok(s.done);assert.equal(s.visible,0n);assert.deepEqual(m.stepCarry(s),s);}
});
