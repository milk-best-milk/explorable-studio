import { formatValue, type ControlBlock, type Value } from '../core'

interface Props {
  block: ControlBlock
  value: Value
  onChange: (value: Value) => void
}

/** An interactive input bound to a variable (readers manipulate these). */
export function ControlView({ block, value, onChange }: Props) {
  const label = block.label || block.variable

  if (block.control === 'slider') {
    const num = typeof value === 'number' ? value : Number(value)
    return (
      <label className="block select-none">
        <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-300">{formatValue(num)}</span>
        </div>
        <input
          type="range"
          className="w-full accent-indigo-600"
          min={block.min ?? 0}
          max={block.max ?? 100}
          step={block.step ?? 1}
          value={Number.isFinite(num) ? num : 0}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    )
  }

  if (block.control === 'number') {
    const num = typeof value === 'number' ? value : Number(value)
    return (
      <label className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <input
          type="number"
          className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          min={block.min}
          max={block.max}
          step={block.step ?? 1}
          value={Number.isFinite(num) ? num : 0}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    )
  }

  if (block.control === 'toggle') {
    const on = Boolean(value)
    return (
      <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          onClick={() => onChange(!on)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            on ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              on ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </label>
    )
  }

  if (block.control === 'radio') {
    const radioOptions = block.options ?? []
    return (
      <div className="select-none">
        <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>
        <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1">
          {radioOptions.map((o, i) => {
            const active = String(o.value) === String(value)
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(o.value)}
                className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                  active
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // select
  const options = block.options ?? []
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        value={String(value)}
        aria-label={label}
        onChange={(e) => {
          const opt = options.find((o) => String(o.value) === e.target.value)
          onChange(opt ? opt.value : e.target.value)
        }}
      >
        {options.map((o, i) => (
          <option key={i} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
