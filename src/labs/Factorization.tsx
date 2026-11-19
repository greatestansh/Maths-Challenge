import { useState } from 'react';
import { IntegerField } from '../components/IntegerField';
import { Equation } from '../components/Math';
import { displayInteger, sizeTex } from '../math/format';
import { norm2, pow2, valuationSteps } from '../math/twoadic.mjs';

const examples = [1000n, -12n, 0n];

export function signedFactorTex(value: bigint, exponent: number) {
  const odd = value / pow2(exponent);
  return `${value}=2^{${exponent}}\\cdot${odd < 0n ? `(${odd})` : odd.toString()}`;
}

function Quotients({ value }: { value: bigint }) {
  const [step, setStep] = useState(0);
  const quotients = valuationSteps(value);
  const finalStep = quotients.length - 1;
  const atEnd = step === finalStep;

  return (
    <div className="quotients">
      {value < 0n && <p className="muted">Divide the magnitude {quotients[0].toString()}. Keep the negative sign on the odd factor.</p>}
      {value === 0n ? <p className="zero-valuation"><Equation tex="v_2(0)=\infty,\quad |0|_2=0" />. Zero is divisible by every power of 2.</p> : (
        <>
          <ol className="quotient-list" aria-label="Successive quotients">
            {quotients.slice(0, step + 1).map((quotient, index) => <li key={index}>
              {index > 0 && <span className="muted quotient-operator" aria-hidden="true">÷ 2</span>}
              <span className={index === step ? 'current-quotient' : undefined}>{quotient.toString()}</span>
            </li>)}
          </ol>
          <div className="quotient-status" aria-live="polite">
            <p>{step} {step === 1 ? 'division' : 'divisions'} by 2. {atEnd ? 'The quotient is odd.' : 'The current quotient is even.'}</p>
            {atEnd && <p><Equation tex={signedFactorTex(value, finalStep)} />
              <span className="equation-divider" aria-hidden="true">·</span>
              <Equation tex={`v_2(${value})=${finalStep},\\quad |${value}|_2=${sizeTex(norm2(value))}`} /></p>}
          </div>
        </>
      )}
      <div className="controls" role="group" aria-label="Factorization steps">
        <button type="button" className="stage-button" disabled={atEnd} onClick={() => setStep((current) => Math.min(current + 1, finalStep))}>Step</button>
        <button type="button" className="stage-button" disabled={atEnd} onClick={() => setStep(finalStep)}>Reveal all</button>
        <button type="button" className="stage-button" disabled={step === 0} onClick={() => setStep(0)}>Reset steps</button>
      </div>
    </div>
  );
}

export function Factorization({ difference }: { difference: bigint }) {
  const [source, setSource] = useState<'difference' | 'integer'>('difference');
  const [integer, setInteger] = useState(1000n);
  const [exampleVersion, setExampleVersion] = useState(0);
  const value = source === 'difference' ? difference : integer;

  function useExample(next: bigint) {
    setInteger(next);
    setExampleVersion((version) => version + 1);
  }

  function randomExample() {
    const magnitude = 1 + Math.floor(Math.random() * 1000);
    useExample(BigInt(magnitude) * (Math.random() < 0.5 ? -1n : 1n));
  }

  return (
    <details className="distance-drawer">
      <summary>Factor a number</summary>
      <div className="segments" role="group" aria-label="Number to factor">
        <button type="button" aria-pressed={source === 'difference'} onClick={() => setSource('difference')}>Use A − B</button>
        <button type="button" aria-pressed={source === 'integer'} onClick={() => setSource('integer')}>Try an integer</button>
      </div>
      {source === 'integer' ? <div className="factorization-inputs">
        <IntegerField key={exampleVersion} label="Integer to factor" value={integer} onCommit={setInteger} />
        <div className="controls" role="group" aria-label="Factorization examples">
          {examples.map((example) => <button type="button" className="stage-button" key={example.toString()}
            onClick={() => useExample(example)}>{displayInteger(example)}</button>)}
          <button type="button" className="stage-button" onClick={randomExample}>Random integer</button>
        </div>
      </div> : <p className="factorization-input-value">A − B = <strong>{displayInteger(difference)}</strong></p>}
      <Quotients key={`${source}:${value}:${exampleVersion}`} value={value} />
    </details>
  );
}
