type BitWordProps = {
  label: string;
  word: string;
  matches?: number;
  inspected?: number;
  tone?: 'a' | 'b';
  binary?: boolean;
  newest?: boolean;
};

export function BitWord({ label, word, matches = 0, inspected = 0, tone, binary, newest }: BitWordProps) {
  return (
    <div className={`bit-word${tone ? ` tone-${tone}` : ''}`}>
      <span className="visually-hidden">{label} {binary ? 'in binary' : 'low bits'} {word.split('').join(' ')}{newest && `. New leftmost bit: ${word[0]}.`}</span>
      <span className="bit-label" aria-hidden="true">{label}{binary && ' ='}</span>
      {Array.from(word, (bit, index) => {
        const fromRight = word.length - index;
        const classes = [fromRight <= matches && 'matching-bit', fromRight <= inspected && 'inspected-bit', newest && index === 0 && 'newest-bit']
          .filter(Boolean).join(' ');
        return <span key={index} aria-hidden="true" className={classes}>{bit}</span>;
      })}
      {binary && <sub aria-hidden="true">2</sub>}
    </div>
  );
}
