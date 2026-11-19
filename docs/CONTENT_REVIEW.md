# Content review

The essay prose is a draft for author review. The supplied original is in `Two_Adic_Codex_Build_Kit/two-adic-build-kit/original/SPEC.original.md`. Its SHA‑256 matches the kit manifest (`11bfcfdcf40f4f35f8d1540c5bea0a6a0703d6280156ef877fbb271320850ddd`).

| Source location | Proposed wording or treatment | Author review |
| --- | --- | --- |
| Section 1, metric axioms | A distance is nonnegative, zero exactly for equal points, symmetric, and satisfies the triangle inequality. | Pending |
| Section 2, valuation | The valuation is the **exponent** of the largest power of two dividing a nonzero integer. For example, \(v_2(8)=3\). Set \(v_2(0)=\infty\). | Pending |
| Section 3 / I4, triangles | In an ultrametric space the maximum side length occurs at least twice. In \(\mathbb Q_2\), three distinct points give exactly two longest sides. If two differences have the same valuation, their odd parts have an even difference. Handle repeated points separately. | Pending, optional lab deferred |
| Section 4 / I5, split indexing | With the root at depth zero, \(k=v_2(a-b)\) is the **last shared depth** for distinct inputs. The first different nodes occur at depth \(k+1\). For 1 and 9 this gives depths 3 and 4 and distance 1/8. | Pending |
| Section 4, balls | The closed ball of radius \(2^{-k}\) centered at \(a\in\mathbb Z_2\) is \(a+2^k\mathbb Z_2\). Listed ordinary integers are examples from that infinite class. | Pending |
| Section 4, tree domain | The root and infinite paths describe \(\mathbb Z_2\). The field \(\mathbb Q_2\) also contains elements with norm greater than one, such as \(1/2\). | Pending |
| Section 5, convergence | For every \(\varepsilon>0\), choose \(N\) with \(2^{-N}<\varepsilon\). For all \(n\ge N\), the 2-adic error is \(2^{-n}<\varepsilon\). The ordinary error \(2^n\) grows. | Pending |
| Section 6, binary integers | Nonnegative ordinary integers have terminating binary expansions. Negative ordinary integers have 2-adic binary expansions that are eventually all ones. | Pending |
| Section 6, compatibility | A 2-adic integer is described by residues whose reductions agree across all widths. These describe \(\mathbb Z_2\). | Pending |
| Section 6 / I7, carry | In a width-\(k\) window, \((2^k-1)+1=2^k\equiv0\pmod{2^k}\). The main reading path now puts the eight-bit equality and congruence on separate lines and labels bit 8 as the carry-out. As \(k\) grows, \(2^k\) tends to zero 2-adically. | Pending, finite example implemented |
| Section 7 / I9, Hensel | Use the odd-square criterion \(a\equiv1\pmod8\) for odd \(a\). The simple-root test requires a nonzero derivative mod 2, whereas the derivative of \(x^2-17\) is even. Some finite branches end. | Pending, optional lab deferred |
| Section 8, Ostrowski | Every **nontrivial** absolute value on \(\mathbb Q\) is equivalent to the usual one or a \(p\)-adic one. | Pending, further reading deferred |
| I1 / I6, chart axes | Plot the positive errors \(2^n\) and \(2^{-n}\) on fixed axes with a labeled base-2 logarithmic vertical scale. The target −1 belongs in the caption. When \(n\ge k\), all later sums agree with −1 in the chosen low \(k\) bits. | Pending, chart and bit window implemented |
| I2, visual comparison | Show exact values and compare the order of neighbors under each metric. The ordinary ruler uses a labeled linear scale. The 2-adic panel highlights shared low bits and reports the exact distance and total match count. | Pending, distance lab implemented |
| I2 / I3, sign and zero | Write the signed difference as a power of 2 times a signed odd factor. Divide the magnitude when counting the factors. Zero has infinite valuation and 2-adic norm zero, so its factorization drawer stops before any division. | Pending, factorization drawer implemented |
| I8, rational inputs | Reduce the fraction before checking denominator parity. The residue window applies to rationals in \(\mathbb Z_2\), including \(2/6=1/3\). | Pending, optional lab deferred |

The current essay uses the corrected metric, indexing, and convergence contract. For the norm, stronger triangle inequality, and compatible residues, see §§1.2, 2.1, and 5.1 of [A first course on p-adic numbers](https://mathweb.ucsd.edu/~amathers/padic_notes.pdf).
