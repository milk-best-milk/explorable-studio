import { computeScope, formatValue, type Value, type Variable } from '../core'
import { useEditor } from './store'
import { TextInput, Select, Button, IconButton } from './ui'

const TYPE_OPTIONS = [
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Text', value: 'string' },
]

function uniqueName(variables: Variable[]): string {
  const taken = new Set(variables.map((v) => v.name))
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (const c of letters) if (!taken.has(c)) return c
  let i = 1
  while (taken.has(`v${i}`)) i++
  return `v${i}`
}

function defaultValueFor(type: Variable['type']): Value {
  return type === 'number' ? 0 : type === 'boolean' ? false : ''
}

export function VariablesPanel() {
  const variables = useEditor((s) => s.doc.variables)
  const addVariable = useEditor((s) => s.addVariable)
  const updateVariable = useEditor((s) => s.updateVariable)
  const removeVariable = useEditor((s) => s.removeVariable)
  const { scope, errors } = computeScope(variables)

  return (
    <div className="space-y-2">
      {variables.length === 0 && (
        <p className="text-xs text-slate-400">
          No variables yet. Variables hold the numbers, toggles and text your explainer reacts to.
        </p>
      )}

      {variables.map((v) => (
        <div key={v.id} className="space-y-1 rounded-md border border-slate-200 p-2 dark:border-slate-700">
          <div className="flex items-center gap-1">
            <TextInput
              mono
              placeholder="name"
              className="w-28 shrink-0"
              value={v.name}
              onChange={(e) => updateVariable({ ...v, name: e.target.value })}
            />
            <Select
              className="w-24 shrink-0"
              value={v.type}
              options={TYPE_OPTIONS}
              onChange={(e) => {
                const type = e.target.value as Variable['type']
                updateVariable({ ...v, type, value: defaultValueFor(type) })
              }}
            />
            {!v.expr && <ValueInput variable={v} onChange={(value) => updateVariable({ ...v, value })} />}
            <IconButton title="Delete variable" onClick={() => removeVariable(v.id)}>
              ✕
            </IconButton>
          </div>
          <TextInput
            mono
            placeholder="= derived expression (optional)"
            value={v.expr ?? ''}
            onChange={(e) => updateVariable({ ...v, expr: e.target.value ? e.target.value : undefined })}
          />
          {errors[v.name] ? (
            <div className="text-[11px] text-red-500">⚠️ {errors[v.name]}</div>
          ) : v.expr ? (
            <div className="text-[11px] text-slate-400">= {formatValue(scope[v.name])}</div>
          ) : null}
        </div>
      ))}

      <Button variant="ghost" onClick={() => addVariable({ name: uniqueName(variables) })}>
        ＋ Add variable
      </Button>
    </div>
  )
}

function ValueInput({ variable, onChange }: { variable: Variable; onChange: (v: Value) => void }) {
  if (variable.type === 'boolean') {
    return (
      <label className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
        <input type="checkbox" checked={Boolean(variable.value)} onChange={(e) => onChange(e.target.checked)} />
        default
      </label>
    )
  }
  if (variable.type === 'string') {
    return (
      <TextInput
        placeholder="default"
        className="w-24 shrink-0"
        value={String(variable.value)}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
  return (
    <TextInput
      type="number"
      placeholder="default"
      className="w-24 shrink-0"
      value={typeof variable.value === 'number' ? variable.value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}
