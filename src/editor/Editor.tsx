import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { parseDoc, serializeDoc } from '../core'
import { useEditor } from './store'
import { SortableBlock } from './SortableBlock'
import { VariablesPanel } from './VariablesPanel'
import { Explainer } from '../viewer/Explainer'
import { BLOCK_LIST } from '../blocks'
import { Button } from './ui'
import { buildShareUrl, buildEmbedCode, copyToClipboard } from '../app/share'
import { buildStandaloneHtml } from '../app/exportHtml'
import { downloadText, slugify } from '../app/download'

export function Editor() {
  const doc = useEditor((s) => s.doc)
  const setTitle = useEditor((s) => s.setTitle)
  const setDescription = useEditor((s) => s.setDescription)
  const setAccent = useEditor((s) => s.setAccent)
  const addBlock = useEditor((s) => s.addBlock)
  const updateBlock = useEditor((s) => s.updateBlock)
  const removeBlock = useEditor((s) => s.removeBlock)
  const duplicateBlock = useEditor((s) => s.duplicateBlock)
  const reorderBlocks = useEditor((s) => s.reorderBlocks)
  const load = useEditor((s) => s.load)
  const undo = useEditor((s) => s.undo)
  const redo = useEditor((s) => s.redo)
  const canUndo = useEditor((s) => s.past.length > 0)
  const canRedo = useEditor((s) => s.future.length > 0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = doc.blocks.map((b) => b.id)
    reorderBlocks(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  const onShare = async () => {
    const url = buildShareUrl(doc)
    const ok = await copyToClipboard(url)
    if (!ok) console.log('Share link:', url)
    flash(ok ? 'Share link copied to clipboard' : 'Copy failed — link logged to console')
  }

  const onEmbed = async () => {
    const code = buildEmbedCode(doc)
    const ok = await copyToClipboard(code)
    if (!ok) console.log('Embed code:', code)
    flash(ok ? 'Embed code copied to clipboard' : 'Copy failed — code logged to console')
  }

  const onExportHtml = async () => {
    setBusy(true)
    try {
      const html = await buildStandaloneHtml(doc)
      downloadText(`${slugify(doc.title)}.html`, html, 'text/html')
      flash('Exported standalone HTML')
    } catch (err) {
      flash('Export failed (build the app first)')
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  const onExportJson = () => {
    downloadText(`${slugify(doc.title)}.json`, serializeDoc(doc, true), 'application/json')
    flash('Exported project JSON')
  }

  const onImport = async (file: File) => {
    try {
      const imported = parseDoc(await file.text())
      load(imported, useEditor.getState().projectId)
      flash('Imported explainer')
    } catch (err) {
      flash('Could not import that file')
      console.error(err)
    }
  }

  return (
    <div className="grid h-full grid-cols-1 divide-slate-200 lg:grid-cols-2 lg:divide-x dark:divide-slate-800">
      {/* Editor column */}
      <div className="flex min-h-0 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
          <Button onClick={undo} disabled={!canUndo} title="Undo (⌘/Ctrl+Z)" aria-label="Undo">
            ↶
          </Button>
          <Button onClick={redo} disabled={!canRedo} title="Redo (⇧⌘/Ctrl+Z)" aria-label="Redo">
            ↷
          </Button>
          <Button variant="primary" onClick={onShare}>
            🔗 Share
          </Button>
          <Button onClick={onExportHtml} disabled={busy}>
            {busy ? 'Exporting…' : '⬇ HTML'}
          </Button>
          <Button onClick={onExportJson}>⬇ JSON</Button>
          <Button onClick={onEmbed} title="Copy an <iframe> embed snippet">
            ⧉ Embed
          </Button>
          <Button onClick={() => fileInput.current?.click()}>⬆ Import</Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImport(f)
              e.target.value = ''
            }}
          />
          {toast && <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">{toast}</span>}
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          <div>
            <input
              value={doc.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled explainer"
              aria-label="Title"
              className="w-full bg-transparent text-2xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 dark:text-white dark:placeholder:text-slate-600"
            />
            <input
              value={doc.description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              aria-label="Description"
              className="mt-1 w-full bg-transparent text-sm text-slate-500 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Accent</span>
              <input
                type="color"
                aria-label="Accent colour"
                value={doc.theme?.accent ?? '#4f46e5'}
                onChange={(e) => setAccent(e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-slate-300 bg-transparent dark:border-slate-600"
              />
              {doc.theme?.accent && (
                <button type="button" className="hover:underline" onClick={() => setAccent(undefined)}>
                  reset
                </button>
              )}
            </div>
          </div>

          <Section title="Variables" defaultOpen>
            <VariablesPanel />
          </Section>

          <Section title="Blocks" defaultOpen>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={doc.blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {doc.blocks.map((b) => (
                    <SortableBlock
                      key={b.id}
                      block={b}
                      onChange={updateBlock}
                      onDuplicate={() => duplicateBlock(b.id)}
                      onRemove={() => removeBlock(b.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {doc.blocks.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
                Add your first block below.
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {BLOCK_LIST.map((m) => (
                <Button key={m.type} onClick={() => addBlock(m.type)} title={m.description}>
                  {m.icon} {m.label}
                </Button>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Preview column */}
      <div className="min-h-0 overflow-y-auto bg-slate-50 px-6 py-8 dark:bg-slate-900">
        <Explainer doc={doc} />
      </div>
    </div>
  )
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-2 flex w-full items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <span className="text-slate-400">{open ? '▾' : '▸'}</span>
        {title}
      </button>
      {open && children}
    </section>
  )
}
