import { firstTerm, lastTerm } from '../state/SequenceContext';

// The errors are exact powers of two with exponents +n and −n.
const chart = { left: 62, right: 370, top: 18, bottom: 202 };
const x = (term: number) => chart.left + (term - firstTerm) * (chart.right - chart.left) / (lastTerm - firstTerm);
const y = (exponent: number) => chart.top + (lastTerm - exponent) * (chart.bottom - chart.top) / (2 * lastTerm);
const exponentTicks = [lastTerm, lastTerm / 2, 0, -lastTerm / 2, -lastTerm];
const termTicks = [firstTerm, 5, 10, 15, lastTerm];

export function ConvergenceChart({ term }: { term: number }) {
  return (
    <figure className="convergence-chart">
      <figcaption>
        <strong>Distance to −1</strong>
        <span className="muted">Base-2 logarithmic scale · vertical ticks differ by a factor of 2¹⁰</span>
      </figcaption>
      <div className="legend error-legend" aria-label="Chart legend">
        <span className="tone-b"><i /> Ordinary</span><span className="tone-a"><i /> 2-adic</span>
      </div>
      <svg viewBox="0 0 390 250" role="img" aria-label="On a fixed logarithmic scale, ordinary errors rise and 2-adic errors fall as the number of terms increases.">
        {exponentTicks.map((exponent) => <g key={exponent}>
          <line className="chart-gridline" x1={chart.left} x2={chart.right} y1={y(exponent)} y2={y(exponent)} />
          <text x={chart.left - 11} y={y(exponent) + 5} textAnchor="end">{exponent === 0 ? '1' : <>2<tspan baselineShift="super" fontSize="12">{String(exponent).replace('-', '−')}</tspan></>}</text>
        </g>)}
        <line className="chart-gridline" x1={chart.left} x2={chart.left} y1={chart.top} y2={chart.bottom} />
        {termTicks.map((value) => <text key={value} x={x(value)} y={chart.bottom + 22} textAnchor="middle">{value}</text>)}
        <text x={(chart.left + chart.right) / 2} y={chart.bottom + 43} textAnchor="middle">Number of terms</text>
        <line className="chart-cursor" x1={x(term)} x2={x(term)} y1={chart.top} y2={chart.bottom} />
        <line className="error-line ordinary-line" x1={x(firstTerm)} x2={x(lastTerm)} y1={y(firstTerm)} y2={y(lastTerm)} />
        <line className="error-line adic-line" x1={x(firstTerm)} x2={x(lastTerm)} y1={y(-firstTerm)} y2={y(-lastTerm)} />
        <rect className="ordinary-marker" x={x(term) - 4.5} y={y(term) - 4.5} width="9" height="9" />
        <circle className="adic-marker" cx={x(term)} cy={y(-term)} r="5" />
      </svg>
    </figure>
  );
}
