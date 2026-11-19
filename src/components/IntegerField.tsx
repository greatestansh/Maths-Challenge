import { useId, useState } from 'react';
import { displayInteger } from '../math/format';
import { parseInteger } from '../math/twoadic.mjs';

export function IntegerField({ label, value, onCommit, tone }: {
  label: string;
  value: bigint;
  onCommit: (value: bigint) => void;
  tone?: 'a' | 'b';
}) {
  const id = useId();
  const [draft, setDraft] = useState(value.toString());
  const [error, setError] = useState('');
  const changed = draft !== value.toString();

  function commit() {
    try {
      const next = parseInteger(draft.trim().replace(/^−/, '-'), 7);
      if (next < -1_000_000n || next > 1_000_000n) throw new RangeError('Use an integer from −1,000,000 to 1,000,000.');
      onCommit(next);
      setDraft(next.toString());
      setError('');
    } catch (failure) {
      setError(failure instanceof RangeError
        ? 'Use an integer from −1,000,000 to 1,000,000.'
        : 'Enter a signed whole number.');
    }
  }

  return (
    <div className={tone ? `integer-field tone-${tone}` : 'integer-field'}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" value={draft} autoComplete="off" spellCheck={false}
        aria-invalid={Boolean(error)} aria-describedby={error || changed ? `${id}-hint` : undefined}
        onChange={(event) => { setDraft(event.target.value); setError(''); }} onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit();
          if (event.key === 'Escape') { setDraft(value.toString()); setError(''); }
        }} />
      {(error || changed) && <small id={`${id}-hint`} className={error ? 'invalid' : ''} aria-live="polite">
        {error ? `${error} Showing ${displayInteger(value)}.` : `Press Enter to apply. Showing ${displayInteger(value)}.`}
      </small>}
    </div>
  );
}
