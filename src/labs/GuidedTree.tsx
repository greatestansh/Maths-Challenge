import { useLayoutEffect, useRef, useState } from 'react';
import { TreeDiagram } from '../components/TreeDiagram';
import { article } from '../content/article';
import { ResidueTree } from './ResidueTree';

type View = 'guide' | 'explorer';

export function GuidedTree() {
  const [view, setView] = useState<View>('guide');
  const [step, setStep] = useState(0);
  const moveFocus = useRef(false);
  const lessons = article.tree.guide;
  const lesson = lessons[step];

  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    document.getElementById(view === 'explorer' ? 'tree-lab-heading' : 'explore-tree')?.focus();
  }, [view]);

  function show(next: View) {
    moveFocus.current = true;
    setView(next);
  }

  return (
    <>
      <section className="stage lab tree-guide" aria-labelledby="guide-title" hidden={view !== 'guide'}>
        <div className="guide-grid">
          <div className="guide-copy">
            <header className="lab-heading"><h3 id="guide-title">Build the tree one digit at a time</h3></header>
            <div className="guide-lesson" aria-live="polite">
              <h4>{lesson.title}</h4>
              <p className="muted">{lesson.text}</p>
            </div>
          </div>
          <div className="lesson-diagram"><TreeDiagram depth={step} full compact label={lesson.diagram} /></div>
        </div>
        <div className="controls" role="group" aria-label="Tree guide controls">
          <button type="button" className="stage-button" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          <button type="button" className="stage-button" disabled={step === lessons.length - 1} onClick={() => setStep(step + 1)}>Next</button>
          <button type="button" id="explore-tree" className="stage-button featured-control" onClick={() => show('explorer')}>Explore freely</button>
          <span className="muted lesson-step">{step + 1} of {lessons.length}</span>
        </div>
      </section>
      <div hidden={view !== 'explorer'}>
        <ResidueTree onGuide={() => show('guide')} />
      </div>
    </>
  );
}
