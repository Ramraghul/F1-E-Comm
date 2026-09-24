export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const state = stepNum < current ? 'done' : stepNum === current ? 'active' : 'pending';
        return (
          <li key={step} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold transition ${
                  state === 'done'
                    ? 'bg-f1red text-white'
                    : state === 'active'
                      ? 'border-2 border-f1red text-white'
                      : 'border border-white/20 text-white/40'
                }`}
              >
                {state === 'done' ? '✓' : stepNum}
              </span>
              <span
                className={`hidden font-display text-xs font-semibold uppercase tracking-wide sm:inline ${
                  state === 'pending' ? 'text-white/30' : 'text-white'
                }`}
              >
                {step}
              </span>
            </div>
            {stepNum < steps.length && <span className="h-px w-6 bg-white/15 sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}
