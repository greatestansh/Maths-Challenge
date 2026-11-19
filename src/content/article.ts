// Draft for author review. The supplied original remains in the build kit.
export const article = {
  reviewStatus: 'draft for author review',
  title: ['How can a growing sum approach', '−1?'],
  series: '1 + 2 + 4 + 8 + \\cdots',
  opening: 'The sums keep getting larger. What changes when “close” means sharing more low binary digits?',
  distance: {
    title: 'What does it mean to be close?',
    intro: 'On the ordinary number line, 1 is closer to 2 than to 9. To see a different kind of closeness, compare the binary digits of 1 and 9 from right to left.',
    remainders: 'The rightmost k binary digits give the remainder on division by 2ᵏ. If two integers leave the same remainder, subtracting them leaves a multiple of 2ᵏ. If their difference is divisible by 2ᵏ, their remainders must agree. This is what it means to share at least k low bits.',
    exact: 'Sharing exactly k low bits means the next bits differ. The difference is then divisible by 2ᵏ and has a nonzero remainder modulo 2ᵏ⁺¹. Assign those two integers a distance of 2⁻ᵏ. For 1 and 9, the three shared bits give a distance of 1/8.',
    valuation: 'We call the exponent of the largest power of 2 dividing a nonzero integer its 2-adic valuation, written v₂. For 8 the exponent is 3. Zero is divisible by every power of 2, so its valuation is infinite.',
    metric: 'This distance is nonnegative, symmetric, and zero exactly for equal inputs. It also satisfies a stronger form of the triangle inequality.',
  },
  tree: {
    title: 'Read the low bits first.',
    intro: 'A residue is a remainder. A residue class is the set of numbers with the same remainder. The tree organizes those classes from the fewest fixed bits to the most.',
    guide: [
      { title: 'Begin with one class', text: 'Every integer leaves remainder 0 on division by 1. They all start at the root, labeled ℤ₂ for the 2-adic integers. The root fixes zero bits.', diagram: 'Root at depth zero, the single class modulo one' },
      { title: 'Split into even and odd', text: 'Read the rightmost bit. A 0 sends you to the even class, with remainder 0 modulo 2. A 1 sends you to the odd class, with remainder 1.', diagram: 'Level one splits the root into even and odd classes modulo two' },
      { title: 'Fix two bits', text: 'Read the next bit to the left. The even class splits into remainders 0 and 2 modulo 4. The odd class splits into remainders 1 and 3. Depth is the number of steps below the root.', diagram: 'Level two shows four remainder classes modulo four' },
      { title: 'Fix three bits', text: 'Read one more digit. There are now eight classes modulo 8. Both 1 and 9 land at remainder 1 here. In the explorer, follow their paths one level farther to see where they separate.', diagram: 'Level three shows eight remainder classes modulo eight' },
    ],
  },
  limit: {
    title: 'One sequence, two distances.',
    geometric: 'Doubling the sum shifts each term up one power of two. Subtracting the original sum cancels the terms in the middle and leaves',
    proof: 'The difference from −1 is 2ⁿ, so its 2-adic size is 2⁻ⁿ. For any tolerance ε > 0, choose N with 2⁻ᴺ < ε. From term N onward, every error is at most 2⁻ᴺ.',
    conclusion: 'The partial sums diverge in ordinary distance and converge to −1 in 2-adic distance.',
  },
  sources: [{ label: 'A first course on p-adic numbers · UC San Diego', href: 'https://mathweb.ucsd.edu/~amathers/padic_notes.pdf' }],
} as const;
