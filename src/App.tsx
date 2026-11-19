import { Equation } from './components/Math';
import { ChapterNavigation } from './components/ChapterNavigation';
import { TreeDiagram } from './components/TreeDiagram';
import { article } from './content/article';
import { exposition } from './content/exposition';
import { BinaryCarry } from './labs/BinaryCarry';
import { ConvergenceLab } from './labs/ConvergenceLab';
import { DistanceLab } from './labs/DistanceLab';
import { DoublingLab } from './labs/DoublingLab';
import { FractionBuilder } from './labs/FractionBuilder';
import { BallLesson, BallRelationships, ThreePointTree } from './labs/GeometryLabs';
import { GuidedTree } from './labs/GuidedTree';
import { LowBitBridge } from './labs/LowBitBridge';
import { PartialSums } from './labs/PartialSums';
import { distance2, expandFraction, formatSize, residue, sharedDepth } from './math/twoadic.mjs';
import { SequenceProvider } from './state/SequenceContext';
import './styles/exposition.css';

const chapters = [
  ['puzzle', 'Puzzle'], ['distance', 'Closeness'], ['tree', 'Addresses'], ['geometry', 'Geometry'],
  ['limit', 'Convergence'], ['carrying', 'Carrying'], ['fraction', 'One third'], ['integers', 'Integers'],
] as const;
const courseNotes = article.sources[0];
const liftingNotes = { label: 'Hensel’s Lemma · Keith Conrad', href: 'https://kconrad.math.uconn.edu/blurbs/gradnumthy/hensel.pdf' };

function Paragraphs({ copy }: { copy: readonly string[] }) {
  return <>{copy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</>;
}

function RemainderTable() {
  return <figure className="stage compatibility-table">
    <figcaption>One address seen at three precisions</figcaption>
    <table>
      <thead><tr><th scope="col">Modulus</th><th scope="col">Remainder</th><th scope="col">Low bits</th><th scope="col">At the previous width</th></tr></thead>
      <tbody>{[3, 4, 5].map((depth) => {
        const row = expandFraction(1n, 3n, depth);
        return <tr key={depth}><th scope="row">{row.modulus.toString()}</th><td>{row.residue.toString()}</td>
          <td><code>{row.bits}</code></td><td>{residue(row.residue, depth - 1).toString()}</td></tr>;
      })}</tbody>
    </table>
  </figure>;
}

function Hero() {
  const a = 1n;
  const b = 9n;
  const shared = sharedDepth(a, b);
  return (
    <section className="hero" id="puzzle" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow"><span aria-hidden="true" /> An interactive mathematical essay</p>
        <h1 id="hero-title">{article.title[0]} <em>{article.title[1]}</em></h1>
        <p className="hero-series"><Equation tex={article.series} /></p>
        <p className="hero-intro">{article.opening}</p>
        <a className="primary-link" href="#sums">Explore the sums</a>
      </div>
      <figure className="stage hero-figure">
        <div className="hero-card-header">
          <p className="eyebrow">The geometry of low bits</p>
          <div className="hero-key" aria-label="Cyan 1, amber 9">
            <span className="tone-a"><i /> {a.toString()}</span><span className="tone-b"><i /> {b.toString()}</span>
          </div>
        </div>
        <h2>Far on a line.<br /> Close in a tree.</h2>
        <TreeDiagram depth={4} a={a} b={b} full preview />
        <figcaption>
          {shared.kind === 'finite' && <span className="shared-copy">{a.toString()} and {b.toString()} share {shared.exponent} low bits.</span>}
          <span>Their 2-adic distance is <strong>{formatSize(distance2(a, b))}</strong>.</span>
        </figcaption>
      </figure>
    </section>
  );
}

export function App() {
  return (
    <SequenceProvider>
      <a href="#article" className="skip-link">Skip to article</a>
      <ChapterNavigation chapters={chapters} />
      <main className="wrap" id="article" tabIndex={-1}>
        <article>
          <Hero />
          <div className="prose puzzle-intro"><Paragraphs copy={exposition.puzzle.slice(0, 1)} /></div>
          <PartialSums />
          <div className="prose after-lab"><Paragraphs copy={exposition.puzzle.slice(1)} /></div>
          <section className="chapter" id="distance" aria-labelledby="distance-title">
            <div className="prose">
              <p className="eyebrow">Distance</p>
              <h2 id="distance-title">{article.distance.title}</h2>
              <p>{article.distance.intro}</p>
            </div>
            <LowBitBridge />
            <div className="prose after-lab">
              <p>{article.distance.remainders}</p>
              <p>{article.distance.exact}</p>
              <p>{article.distance.valuation}</p>
              <Equation block tex="\begin{gathered}d_2(a,b)=2^{-v_2(a-b)}\quad(a\ne b)\\[3pt]d_2(a,a)=0\end{gathered}" />
              <p>{article.distance.metric}</p>
            </div>
            <DistanceLab />
            <div className="prose after-lab"><Paragraphs copy={exposition.doubling.slice(0, 1)} /></div>
            <DoublingLab />
            <div className="prose after-lab">
              <Paragraphs copy={exposition.doubling.slice(1, 2)} />
              <Equation block tex="d_2(2a,2b)=\frac{d_2(a,b)}{2}." />
              <p className="source-note">For the norm and its valuation, see <a href={`${courseNotes.href}#page=7`}>the course notes, §1.2</a>.</p>
              <Paragraphs copy={exposition.doubling.slice(2)} />
            </div>
          </section>
          <section className="chapter tree-chapter" id="tree" aria-labelledby="tree-title">
            <div className="prose">
              <p className="eyebrow">The tree of nearness</p>
              <h2 id="tree-title">{article.tree.title}</h2>
              <p>{article.tree.intro}</p>
              <Paragraphs copy={exposition.addresses.slice(0, 1)} />
            </div>
            <GuidedTree />
            <div className="prose after-lab">
              <Paragraphs copy={exposition.addresses.slice(1)} />
            </div>
          </section>
          <section className="chapter" id="geometry" aria-labelledby="geometry-title">
            <div className="prose">
              <p className="eyebrow">Neighbourhoods</p>
              <h2 id="geometry-title">A ball with more than one center</h2>
              <Paragraphs copy={exposition.geometry.slice(0, 1)} />
            </div>
            <BallLesson />
            <div className="prose after-lab"><Paragraphs copy={exposition.geometry.slice(1, 3)} /></div>
            <BallRelationships />
            <div className="prose after-lab"><Paragraphs copy={exposition.geometry.slice(3, 5)} /></div>
            <ThreePointTree />
            <div className="prose after-lab">
              <Paragraphs copy={exposition.geometry.slice(5, 6)} />
              <details className="prose-details"><summary>Why the strong triangle inequality holds</summary>
                <p>Take the smaller of the exponents dividing the two differences. Both differences, and therefore their sum, are multiples of that power of two. Since <Equation tex="(a-b)+(b-c)=a-c" />, this gives</p>
                <Equation block tex="d_2(a,c)\le\max\{d_2(a,b),d_2(b,c)\}." />
              </details>
              <p className="source-note">See <a href={`${courseNotes.href}#page=9`}>§2.1 of the course notes</a> for the stronger triangle inequality.</p>
              <Paragraphs copy={exposition.geometry.slice(6)} />
            </div>
          </section>
          <section className="chapter" id="limit" aria-labelledby="limit-title">
            <div className="prose">
              <p className="eyebrow">The limit</p>
              <h2 id="limit-title">{article.limit.title}</h2>
            </div>
            <ConvergenceLab />
            <div className="prose after-lab">
              <Paragraphs copy={exposition.convergence.slice(0, 3)} />
              <p>{article.limit.geometric} <Equation tex="2S_n-S_n=2^n-1" />.</p>
              <p>{article.limit.proof}</p>
              <p className="essay-conclusion">{article.limit.conclusion}</p>
              <Paragraphs copy={exposition.convergence.slice(3)} />
            </div>
          </section>
          <section className="chapter" id="carrying" aria-labelledby="carry-title">
            <div className="prose">
              <p className="eyebrow">Negative numbers and carrying</p>
              <h2 id="carry-title">Why −1 has an all-ones expansion</h2>
              <Paragraphs copy={exposition.negative.slice(0, 2)} />
              <Equation block tex="-1\equiv 2^k-1\pmod{2^k}." />
              <Paragraphs copy={exposition.negative.slice(2, 3)} />
              <BinaryCarry />
              <Paragraphs copy={exposition.negative.slice(3)} />
            </div>
          </section>
          <section className="chapter" id="fraction" aria-labelledby="fraction-title">
            <div className="prose">
              <p className="eyebrow">Odd denominators</p>
              <h2 id="fraction-title">Build one third, bit by bit</h2>
              <Paragraphs copy={exposition.fraction.slice(0, 1)} />
            </div>
            <FractionBuilder />
            <div className="prose after-lab">
              <Paragraphs copy={exposition.fraction.slice(1)} />
              <p className="source-note">This step is an instance of lifting a congruence. See <a href={liftingNotes.href}>{liftingNotes.label}</a>, §§1–2.</p>
            </div>
          </section>
          <section className="chapter" id="integers" aria-labelledby="integers-title">
            <div className="prose">
              <p className="eyebrow">The number system</p>
              <h2 id="integers-title">What is a 2-adic integer?</h2>
              <Paragraphs copy={exposition.integers.slice(0, 2)} />
              <RemainderTable />
              <Paragraphs copy={exposition.integers.slice(2)} />
              <h3 className="reading-heading">Three challenges</h3>
              {exposition.challenges.map(({ question, answer }) => <details className="prose-details challenge" key={question}>
                <summary>{question}</summary><p>{answer}</p>
              </details>)}
              <h3 className="reading-heading">References</h3>
              <ul>
                <li>For construction by completion, compatible remainders, and digit expansions, see §§3.2 and 5.1–5.2 of <a href={courseNotes.href}>{courseNotes.label}</a>.</li>
                <li>For extending congruences to higher powers and an explanation of when the extension is unique, see <a href={liftingNotes.href}>{liftingNotes.label}</a>.</li>
              </ul>
            </div>
          </section>
        </article>
      </main>
      <footer className="wrap site-footer">
        <a className="brand" href="#top">A Different Kind of Close</a>
        {article.sources.map((source) => <a href={source.href} key={source.href}>{source.label}</a>)}
      </footer>
    </SequenceProvider>
  );
}
