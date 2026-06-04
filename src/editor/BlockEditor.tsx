import type { Block, CalloutBlock, ControlBlock, MathBlock, TextBlock, VizBlock } from '../core'
import { useEditor } from './store'
import { Labeled, TextInput, Textarea, Select, Button, IconButton } from './ui'

/** Inline editor for a single block; dispatches by type. */
export function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  switch (block.type) {
    case 'text':
      return <TextEditor block={block} onChange={onChange} />
    case 'control':
      return <ControlEditor block={block} onChange={onChange} />
    case 'viz':
      return <VizEditor block={block} onChange={onChange} />
    case 'math':
      return <MathEditor block={block} onChange={onChange} />
    case 'callout':
      return <CalloutEditor block={block} onChange={onChange} />
  }
}

const CALLOUT_VARIANT_OPTIONS = [
  { label: 'Info', value: 'info' },
  { label: 'Tip', value: 'tip' },
  { label: 'Warning', value: 'warning' },
]

function CalloutEditor({ block, onChange }: { block: CalloutBlock; onChange: (b: Block) => void }) {
  return (
    <div className="space-y-2">
      <Labeled label="Style">
        <Select
          value={block.variant}
          options={CALLOUT_VARIANT_OPTIONS}
          onChange={(e) => onChange({ ...block, variant: e.target.value as CalloutBlock['variant'] })}
        />
      </Labeled>
      <Labeled label="Markdown" hint="Supports {{ expression }} interpolation.">
        <Textarea
          mono
          rows={3}
          value={block.markdown}
          onChange={(e) => onChange({ ...block, markdown: e.target.value })}
        />
      </Labeled>
    </div>
  )
}

function TextEditor({ block, onChange }: { block: TextBlock; onChange: (b: Block) => void }) {
  return (
    <Labeled label="Markdown" hint="Insert live values with {{ expression }}.">
      <Textarea
        mono
        rows={4}
        value={block.markdown}
        onChange={(e) => onChange({ ...block, markdown: e.target.value })}
      />
    </Labeled>
  )
}

function MathEditor({ block, onChange }: { block: MathBlock; onChange: (b: Block) => void }) {
  return (
    <div className="space-y-2">
      <Labeled label="TeX (KaTeX)" hint="Supports {{ expression }} interpolation.">
        <Textarea
          mono
          rows={2}
          value={block.tex}
          onChange={(e) => onChange({ ...block, tex: e.target.value })}
        />
      </Labeled>
      <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <input
          type="checkbox"
          checked={block.display ?? true}
          onChange={(e) => onChange({ ...block, display: e.target.checked })}
        />
        Display mode (centered)
      </label>
    </div>
  )
}

const CONTROL_OPTIONS = [
  { label: 'Slider', value: 'slider' },
  { label: 'Number', value: 'number' },
  { label: 'Toggle', value: 'toggle' },
  { label: 'Dropdown', value: 'select' },
  { label: 'Radio', value: 'radio' },
]

function defaultTypeFor(control: ControlBlock['control']): 'number' | 'boolean' | 'string' {
  if (control === 'toggle') return 'boolean'
  if (control === 'select' || control === 'radio') return 'string'
  return 'number'
}

function ControlEditor({ block, onChange }: { block: ControlBlock; onChange: (b: Block) => void }) {
  const variables = useEditor((s) => s.doc.variables)
  const addVariable = useEditor((s) => s.addVariable)
  const exists = variables.some((v) => v.name === block.variable)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Labeled label="Type">
          <Select
            value={block.control}
            options={CONTROL_OPTIONS}
            onChange={(e) => onChange({ ...block, control: e.target.value as ControlBlock['control'] })}
          />
        </Labeled>
        <Labeled label="Variable">
          <TextInput
            mono
            value={block.variable}
            onChange={(e) => onChange({ ...block, variable: e.target.value })}
          />
        </Labeled>
      </div>

      {!exists && block.variable && (
        <button
          type="button"
          className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          onClick={() => addVariable({ name: block.variable, type: defaultTypeFor(block.control) })}
        >
          ＋ Create variable “{block.variable}” ({defaultTypeFor(block.control)})
        </button>
      )}

      <Labeled label="Label (optional)">
        <TextInput
          value={block.label ?? ''}
          onChange={(e) => onChange({ ...block, label: e.target.value || undefined })}
        />
      </Labeled>

      {(block.control === 'slider' || block.control === 'number') && (
        <div className="grid grid-cols-3 gap-2">
          <Labeled label="Min">
            <TextInput
              type="number"
              value={block.min ?? ''}
              onChange={(e) =>
                onChange({ ...block, min: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </Labeled>
          <Labeled label="Max">
            <TextInput
              type="number"
              value={block.max ?? ''}
              onChange={(e) =>
                onChange({ ...block, max: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </Labeled>
          <Labeled label="Step">
            <TextInput
              type="number"
              value={block.step ?? ''}
              onChange={(e) =>
                onChange({ ...block, step: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </Labeled>
        </div>
      )}

      {(block.control === 'select' || block.control === 'radio') && (
        <OptionsEditor block={block} onChange={onChange} />
      )}
    </div>
  )
}

function OptionsEditor({ block, onChange }: { block: ControlBlock; onChange: (b: Block) => void }) {
  const options = block.options ?? []
  const set = (opts: ControlBlock['options']) => onChange({ ...block, options: opts })
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Options</span>
      {options.map((o, i) => (
        <div key={i} className="flex items-center gap-1">
          <TextInput
            placeholder="Label"
            value={o.label}
            onChange={(e) => set(options.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
          />
          <TextInput
            placeholder="Value"
            mono
            value={String(o.value)}
            onChange={(e) => set(options.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
          />
          <IconButton title="Remove" onClick={() => set(options.filter((_, j) => j !== i))}>
            ✕
          </IconButton>
        </div>
      ))}
      <Button
        variant="ghost"
        onClick={() => set([...options, { label: `Option ${options.length + 1}`, value: String(options.length + 1) }])}
      >
        ＋ Add option
      </Button>
    </div>
  )
}

const VIZ_MODE_OPTIONS = [
  { label: 'Function plot', value: 'function' },
  { label: 'Bars', value: 'bars' },
  { label: 'Scatter', value: 'scatter' },
]

function VizEditor({ block, onChange }: { block: VizBlock; onChange: (b: Block) => void }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Labeled label="Chart type">
          <Select
            value={block.mode}
            options={VIZ_MODE_OPTIONS}
            onChange={(e) => onChange({ ...block, mode: e.target.value as VizBlock['mode'] })}
          />
        </Labeled>
        <Labeled label="Title (optional)">
          <TextInput
            value={block.title ?? ''}
            onChange={(e) => onChange({ ...block, title: e.target.value || undefined })}
          />
        </Labeled>
      </div>
      {block.mode === 'function' ? (
        <FunctionVizEditor block={block} onChange={onChange} />
      ) : block.mode === 'scatter' ? (
        <ScatterVizEditor block={block} onChange={onChange} />
      ) : (
        <BarsVizEditor block={block} onChange={onChange} />
      )}
    </div>
  )
}

function ScatterVizEditor({ block, onChange }: { block: VizBlock; onChange: (b: Block) => void }) {
  const points = block.points ?? []
  const setPoints = (p: VizBlock['points']) => onChange({ ...block, points: p })
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Points — x and y expressions
      </span>
      {points.map((p, i) => (
        <div key={i} className="flex items-center gap-1">
          <TextInput
            placeholder="label"
            className="w-20 shrink-0"
            value={p.label ?? ''}
            onChange={(e) =>
              setPoints(points.map((q, j) => (j === i ? { ...q, label: e.target.value || undefined } : q)))
            }
          />
          <TextInput
            placeholder="x"
            mono
            value={p.x}
            onChange={(e) => setPoints(points.map((q, j) => (j === i ? { ...q, x: e.target.value } : q)))}
          />
          <TextInput
            placeholder="y"
            mono
            value={p.y}
            onChange={(e) => setPoints(points.map((q, j) => (j === i ? { ...q, y: e.target.value } : q)))}
          />
          <IconButton title="Remove" onClick={() => setPoints(points.filter((_, j) => j !== i))}>
            ✕
          </IconButton>
        </div>
      ))}
      <Button variant="ghost" onClick={() => setPoints([...points, { x: '0', y: '0' }])}>
        ＋ Add point
      </Button>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Labeled label="x label">
          <TextInput
            value={block.xLabel ?? ''}
            onChange={(e) => onChange({ ...block, xLabel: e.target.value || undefined })}
          />
        </Labeled>
        <Labeled label="y label">
          <TextInput
            value={block.yLabel ?? ''}
            onChange={(e) => onChange({ ...block, yLabel: e.target.value || undefined })}
          />
        </Labeled>
      </div>
    </div>
  )
}

function FunctionVizEditor({ block, onChange }: { block: VizBlock; onChange: (b: Block) => void }) {
  const curves = block.curves ?? []
  const setCurves = (c: VizBlock['curves']) => onChange({ ...block, curves: c })
  const xName = block.xName ?? 'x'
  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        <Labeled label="x var">
          <TextInput mono value={xName} onChange={(e) => onChange({ ...block, xName: e.target.value })} />
        </Labeled>
        <Labeled label="x min">
          <TextInput mono value={block.xMin ?? '0'} onChange={(e) => onChange({ ...block, xMin: e.target.value })} />
        </Labeled>
        <Labeled label="x max">
          <TextInput mono value={block.xMax ?? '10'} onChange={(e) => onChange({ ...block, xMax: e.target.value })} />
        </Labeled>
        <Labeled label="samples">
          <TextInput
            type="number"
            value={block.samples ?? 80}
            onChange={(e) => onChange({ ...block, samples: Number(e.target.value) })}
          />
        </Labeled>
      </div>
      <div className="space-y-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Curves: y = f({xName})
        </span>
        {curves.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <TextInput
              placeholder="label"
              className="w-24 shrink-0"
              value={c.label ?? ''}
              onChange={(e) =>
                setCurves(curves.map((x, j) => (j === i ? { ...x, label: e.target.value || undefined } : x)))
              }
            />
            <TextInput
              placeholder="expression"
              mono
              value={c.expr}
              onChange={(e) => setCurves(curves.map((x, j) => (j === i ? { ...x, expr: e.target.value } : x)))}
            />
            <IconButton title="Remove" onClick={() => setCurves(curves.filter((_, j) => j !== i))}>
              ✕
            </IconButton>
          </div>
        ))}
        <Button variant="ghost" onClick={() => setCurves([...curves, { expr: xName }])}>
          ＋ Add curve
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Labeled label="x label">
          <TextInput
            value={block.xLabel ?? ''}
            onChange={(e) => onChange({ ...block, xLabel: e.target.value || undefined })}
          />
        </Labeled>
        <Labeled label="y label">
          <TextInput
            value={block.yLabel ?? ''}
            onChange={(e) => onChange({ ...block, yLabel: e.target.value || undefined })}
          />
        </Labeled>
      </div>
    </>
  )
}

function BarsVizEditor({ block, onChange }: { block: VizBlock; onChange: (b: Block) => void }) {
  const bars = block.bars ?? []
  const setBars = (b: VizBlock['bars']) => onChange({ ...block, bars: b })
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Bars</span>
      {bars.map((b, i) => (
        <div key={i} className="flex items-center gap-1">
          <TextInput
            placeholder="label"
            className="w-28 shrink-0"
            value={b.label}
            onChange={(e) => setBars(bars.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
          />
          <TextInput
            placeholder="expression"
            mono
            value={b.expr}
            onChange={(e) => setBars(bars.map((x, j) => (j === i ? { ...x, expr: e.target.value } : x)))}
          />
          <IconButton title="Remove" onClick={() => setBars(bars.filter((_, j) => j !== i))}>
            ✕
          </IconButton>
        </div>
      ))}
      <Button variant="ghost" onClick={() => setBars([...bars, { label: `Bar ${bars.length + 1}`, expr: '0' }])}>
        ＋ Add bar
      </Button>
    </div>
  )
}
