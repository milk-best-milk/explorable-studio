import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextView } from './TextView'
import { VizView } from './VizView'
import { ControlView } from './ControlView'
import { createVizBlock, createControlBlock } from '../core'

describe('TextView', () => {
  it('renders Markdown with interpolated values', () => {
    const { container } = render(<TextView markdown="Result: **{{ a + b }}**" scope={{ a: 1, b: 2 }} />)
    expect(container.textContent).toContain('Result: 3')
    expect(container.querySelector('strong')?.textContent).toBe('3')
  })

  it('does not render raw HTML from source (sanitised)', () => {
    const { container } = render(<TextView markdown={'<img src=x onerror=alert(1)>'} scope={{}} />)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('VizView', () => {
  it('produces an SVG chart for a function plot', () => {
    const block = createVizBlock({ curves: [{ expr: 'x * x' }], xMin: '0', xMax: '5', samples: 10 })
    const { container } = render(<VizView block={block} scope={{}} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(container.querySelector('path')).not.toBeNull()
  })

  it('shows an error note for an invalid curve expression', () => {
    const block = createVizBlock({ curves: [{ expr: 'x +' }] })
    const { container } = render(<VizView block={block} scope={{}} />)
    expect(container.textContent).toContain('⚠️')
  })
})

describe('ControlView', () => {
  it('renders a slider and emits numeric changes', () => {
    const onChange = vi.fn()
    const block = createControlBlock({ control: 'slider', variable: 'rate', min: 0, max: 10, step: 1, label: 'Rate' })
    render(<ControlView block={block} value={3} onChange={onChange} />)
    const slider = screen.getByLabelText('Rate') as HTMLInputElement
    expect(slider).toHaveValue('3')
    fireEvent.change(slider, { target: { value: '7' } })
    expect(onChange).toHaveBeenCalledWith(7)
  })

  it('renders a toggle switch', () => {
    const onChange = vi.fn()
    const block = createControlBlock({ control: 'toggle', variable: 'on', label: 'Enabled' })
    render(<ControlView block={block} value={false} onChange={onChange} />)
    const sw = screen.getByRole('switch')
    fireEvent.click(sw)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
