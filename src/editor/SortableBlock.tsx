import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'
import type { Block } from '../core'
import { BLOCK_META } from '../blocks'
import { BlockEditor } from './BlockEditor'
import { IconButton } from './ui'

interface Props {
  block: Block
  onChange: (b: Block) => void
  onDuplicate: () => void
  onRemove: () => void
}

export function SortableBlock({ block, onChange, onDuplicate, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const meta = BLOCK_META[block.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'rounded-lg border bg-white p-3 dark:bg-slate-800/60',
        isDragging
          ? 'z-10 border-indigo-400 opacity-80 shadow-lg'
          : 'border-slate-200 dark:border-slate-700',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-slate-400"
            title="Drag to reorder"
            aria-label="Drag to reorder"
          >
            ⠿
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {meta.icon} {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <IconButton title="Duplicate" onClick={onDuplicate}>
            ⧉
          </IconButton>
          <IconButton title="Delete" onClick={onRemove}>
            🗑
          </IconButton>
        </div>
      </div>
      <BlockEditor block={block} onChange={onChange} />
    </div>
  )
}
