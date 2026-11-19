import { Equation } from './components/Math';
import { TreeDiagram } from './components/TreeDiagram';
import { article } from './content/article';
import { BinaryCarry } from './labs/BinaryCarry';
import { ConvergenceLab } from './labs/ConvergenceLab';
import { DistanceLab } from './labs/DistanceLab';
import { GuidedTree } from './labs/GuidedTree';
import { LowBitBridge } from './labs/LowBitBridge';
import { PartialSums } from './labs/PartialSums';
import { distance2, formatSize, sharedDepth } from './math/twoadic.mjs';
import { SequenceProvider } from './state/SequenceContext';

function Hero() {
  const a = 1n;
  const b = 9n;
  const shared = sharedDepth(a, b);
  return (
    <section className="hero" aria-labelledby="hero-title">
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
      <header className="masthead wrap" id="top">
        <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true">₂</span> A Different Kind of Close</a>
        <nav aria-label="Chapters">
          <a href="#distance">Distance</a><a href="#tree">The tree</a><a href="#limit">The limit</a>
        </nav>
      </header>
      <main className="wrap" id="article" tabIndex={-1}>
        <article>
          <Hero />
          <PartialSums />
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
              <details className="prose-details"><summary>Why the strong triangle inequality holds</summary>
                <p>{article.distance.triangle} Applying this to <Equation tex="(a-b)+(b-c)=a-c" /> gives</p>
                <Equation block tex="d_2(a,c)\le\max\{d_2(a,b),d_2(b,c)\}." />
              </details>
            </div>
            <DistanceLab />
          </section>
          <section className="chapter tree-chapter" id="tree" aria-labelledby="tree-title">
            <div className="prose">
              <p className="eyebrow">The tree of nearness</p>
              <h2 id="tree-title">{article.tree.title}</h2>
              <p>{article.tree.intro}</p>
              <p>{article.tree.ball}</p>
            </div>
            <GuidedTree />
            <div className="prose after-lab">
              <p>{article.tree.closing}</p>
            </div>
          </section>
          <section className="chapter" id="limit" aria-labelledby="limit-title">
            <div className="prose">
              <p className="eyebrow">The limit</p>
              <h2 id="limit-title">{article.limit.title}</h2>
            </div>
            <ConvergenceLab />
            <div className="prose after-lab">
              <p>{article.limit.intro}</p>
              <p>{article.limit.geometric} <Equation tex="2S_n-S_n=2^n-1" />.</p>
              <p>{article.limit.proof}</p>
              <h3 className="reading-heading">Why −1 has an all-ones expansion</h3>
              <p>{article.limit.digits}</p>
              <Equation block tex="-1\equiv 2^k-1\pmod{2^k}." />
              <BinaryCarry />
              <p>{article.limit.carry}</p>
              <p className="essay-conclusion">{article.limit.conclusion}</p>
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
