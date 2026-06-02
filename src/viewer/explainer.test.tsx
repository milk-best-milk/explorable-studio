import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Explainer } from './Explainer'
import { EXAMPLES } from '../examples'

const compound = EXAMPLES[0].doc

describe('Explainer (live runtime)', () => {
  it('renders an example with a chart and reacts to control changes', () => {
    const { container } = render(<Explainer doc={compound} />)
    expect(container.textContent).toContain('After 30 years')
    expect(container.querySelector('svg')).not.toBeNull()

    const yearsSlider = screen.getByLabelText('Years invested') as HTMLInputElement
    fireEvent.change(yearsSlider, { target: { value: '10' } })
    expect(container.textContent).toContain('After 10 years')
    expect(container.textContent).not.toContain('After 30 years')
  })

  it('renders every bundled example with no expression errors', () => {
    for (const ex of EXAMPLES) {
      const { container, unmount } = render(<Explainer doc={ex.doc} />)
      expect(container.querySelector('article')).not.toBeNull()
      expect(container.textContent).not.toContain('⚠️')
      unmount()
    }
  })
})
