import { useState } from 'react';

type Variable = 'V' | 'I' | 'R';

type Problem = {
  hidden: Variable;
  V: number;
  I: number;
  R: number;
};

const RESISTANCES = [47, 100, 220, 330, 470, 1000, 2200, 4700, 10000];
const VOLTAGES = [1.5, 3.3, 5, 9, 12, 24];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateProblem(): Problem {
  const hidden = pick<Variable>(['V', 'I', 'R']);
  const R = pick(RESISTANCES);
  const V = pick(VOLTAGES);
  const I = V / R;
  return { hidden, V, I, R };
}

function formatValue(variable: Variable, value: number): string {
  switch (variable) {
    case 'V':
      return `${sigFigs(value, 3)} V`;
    case 'I':
      if (value < 0.001) return `${sigFigs(value * 1e6, 3)} µA`;
      if (value < 1) return `${sigFigs(value * 1000, 3)} mA`;
      return `${sigFigs(value, 3)} A`;
    case 'R':
      if (value >= 1000) return `${sigFigs(value / 1000, 3)} kΩ`;
      return `${sigFigs(value, 3)} Ω`;
  }
}

function unitLabel(variable: Variable, value: number): string {
  switch (variable) {
    case 'V': return 'V';
    case 'I':
      if (value < 0.001) return 'µA';
      if (value < 1) return 'mA';
      return 'A';
    case 'R':
      if (value >= 1000) return 'kΩ';
      return 'Ω';
  }
}

function toDisplayUnit(variable: Variable, value: number): number {
  switch (variable) {
    case 'V': return value;
    case 'I':
      if (value < 0.001) return value * 1e6;
      if (value < 1) return value * 1000;
      return value;
    case 'R':
      if (value >= 1000) return value / 1000;
      return value;
  }
}

function sigFigs(n: number, figs: number): string {
  const s = n.toPrecision(figs);
  // strip trailing zeros after decimal point
  if (s.includes('.')) return s.replace(/\.?0+$/, '');
  return s;
}

function constraintExplanation(problem: Problem): string {
  const vStr = formatValue('V', problem.V);
  const iStr = formatValue('I', problem.I);
  const rStr = formatValue('R', problem.R);

  switch (problem.hidden) {
    case 'V':
      return `With I = ${iStr} flowing through R = ${rStr}, the voltage can only be ${vStr}. V = IR — no other value satisfies the constraint.`;
    case 'I':
      return `With V = ${vStr} across R = ${rStr}, the current can only be ${iStr}. I = V/R — the constraint leaves one answer.`;
    case 'R':
      return `With V = ${vStr} driving I = ${iStr}, the resistance can only be ${rStr}. R = V/I — fixed by the other two.`;
  }
}

const LABELS: Record<Variable, string> = { V: 'Voltage', I: 'Current', R: 'Resistance' };

export function OhmsLawPredict() {
  const [problem, setProblem] = useState<Problem>(generateProblem);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);

  const hiddenValue = problem[problem.hidden];
  const displayAnswer = toDisplayUnit(problem.hidden, hiddenValue);
  const unit = unitLabel(problem.hidden, hiddenValue);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
  };

  const next = () => {
    setProblem(generateProblem());
    setGuess('');
    setRevealed(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') reveal();
  };

  const guessNum = parseFloat(guess);
  const hasGuess = guess.trim() !== '' && !isNaN(guessNum);
  const pctError = hasGuess ? Math.abs((guessNum - displayAnswer) / displayAnswer) * 100 : null;

  const variables: Variable[] = ['V', 'I', 'R'];

  return (
    <div className="my-8 not-prose">
      <div className="flex flex-wrap gap-3 mb-4">
        {variables.map((v) => {
          const isHidden = v === problem.hidden;
          return (
            <div
              key={v}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded border text-center ${
                isHidden
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-1">
                {LABELS[v]}
              </div>
              <div className="text-lg font-medium text-slate-900">
                {isHidden
                  ? revealed
                    ? formatValue(v, problem[v])
                    : '?'
                  : formatValue(v, problem[v])}
              </div>
            </div>
          );
        })}
      </div>

      {!revealed && (
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <span className="text-sm text-slate-600">Your prediction:</span>
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={LABELS[problem.hidden]}
            aria-label={`Your prediction for ${LABELS[problem.hidden].toLowerCase()} in ${unit}`}
            className="w-28 px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-500">{unit}</span>
          <button
            onClick={reveal}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50 active:bg-slate-100"
          >
            Reveal
          </button>
        </div>
      )}

      {revealed && (
        <>
          <div className="text-sm leading-relaxed text-slate-700 px-3.5 py-2.5 bg-slate-50 rounded mb-3">
            {hasGuess && pctError !== null ? (
              pctError < 1 ? (
                <><b>Exact.</b> {constraintExplanation(problem)}</>
              ) : pctError < 10 ? (
                <><b>Close — off by {sigFigs(pctError, 2)}%.</b> {constraintExplanation(problem)}</>
              ) : pctError < 25 ? (
                <><b>Off by {sigFigs(pctError, 2)}%.</b> {constraintExplanation(problem)}</>
              ) : (
                <><b>Off by {sigFigs(pctError, 2)}%.</b> {constraintExplanation(problem)}</>
              )
            ) : (
              <>{constraintExplanation(problem)}</>
            )}
          </div>
          <button
            onClick={next}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50 active:bg-slate-100"
          >
            Next problem
          </button>
        </>
      )}
    </div>
  );
}
