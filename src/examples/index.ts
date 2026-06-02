import type { ExplorableDoc } from '../core'

export interface Example {
  slug: string
  doc: ExplorableDoc
}

const compoundInterest: ExplorableDoc = {
  version: 1,
  title: 'The magic of compound interest',
  description: 'See how a one-time investment snowballs over time.',
  variables: [
    { id: 'principal', name: 'principal', type: 'number', value: 1000 },
    { id: 'rate', name: 'rate', type: 'number', value: 7 },
    { id: 'years', name: 'years', type: 'number', value: 30 },
    { id: 'final', name: 'final', type: 'number', value: 0, expr: 'principal * (1 + rate / 100) ^ years' },
  ],
  blocks: [
    {
      id: 't1',
      type: 'text',
      markdown:
        'Invest **\\${{ principal }}** once, at an annual return of **{{ rate }}%**, and leave it untouched for **{{ years }} years**. Drag the sliders and watch.',
    },
    { id: 'c1', type: 'control', control: 'slider', variable: 'principal', label: 'Initial investment ($)', min: 100, max: 10000, step: 100 },
    { id: 'c2', type: 'control', control: 'slider', variable: 'rate', label: 'Annual return (%)', min: 0, max: 15, step: 0.5 },
    { id: 'c3', type: 'control', control: 'slider', variable: 'years', label: 'Years invested', min: 1, max: 50, step: 1 },
    {
      id: 't2',
      type: 'text',
      markdown:
        'After {{ years }} years you would have **\\${{ round(final) }}** — that is **{{ round(final / principal * 10) / 10 }}×** your original money.',
    },
    {
      id: 'v1',
      type: 'viz',
      mode: 'function',
      title: 'Balance over time',
      xName: 't',
      xMin: '0',
      xMax: 'years',
      samples: 60,
      curves: [{ label: 'Balance', expr: 'principal * (1 + rate / 100) ^ t' }],
      xLabel: 'Years',
      yLabel: '$',
    },
  ],
}

const sineWave: ExplorableDoc = {
  version: 1,
  title: 'Anatomy of a sine wave',
  description: 'Build intuition for amplitude, frequency and phase.',
  variables: [
    { id: 'A', name: 'A', type: 'number', value: 1 },
    { id: 'f', name: 'f', type: 'number', value: 1 },
    { id: 'phase', name: 'phase', type: 'number', value: 0 },
  ],
  blocks: [
    { id: 'm1', type: 'math', display: true, tex: 'y(x) = {{ A }}\\sin\\!\\left(2\\pi \\cdot {{ f }}\\,x + {{ phase }}\\right)' },
    { id: 'c1', type: 'control', control: 'slider', variable: 'A', label: 'Amplitude (A)', min: 0, max: 3, step: 0.1 },
    { id: 'c2', type: 'control', control: 'slider', variable: 'f', label: 'Frequency (f)', min: 0.1, max: 5, step: 0.1 },
    { id: 'c3', type: 'control', control: 'slider', variable: 'phase', label: 'Phase', min: 0, max: 6.28, step: 0.1 },
    {
      id: 'v1',
      type: 'viz',
      mode: 'function',
      xName: 'x',
      xMin: '0',
      xMax: '2 * pi',
      samples: 160,
      curves: [{ label: 'y(x)', expr: 'A * sin(2 * pi * f * x + phase)' }],
      xLabel: 'x',
    },
  ],
}

const onePercent: ExplorableDoc = {
  version: 1,
  title: '1% better every day',
  description: 'Tiny daily changes compound into staggering differences over a year.',
  variables: [
    { id: 'rate', name: 'rate', type: 'number', value: 1 },
    { id: 'days', name: 'days', type: 'number', value: 365 },
  ],
  blocks: [
    {
      id: 't1',
      type: 'text',
      markdown:
        'Change by just **{{ rate }}%** each day for **{{ days }} days**. Compounded, the gap between getting a little better and a little worse is enormous.',
    },
    { id: 'c1', type: 'control', control: 'slider', variable: 'rate', label: 'Daily change (%)', min: 0.5, max: 3, step: 0.5 },
    { id: 'c2', type: 'control', control: 'slider', variable: 'days', label: 'Days', min: 30, max: 365, step: 5 },
    {
      id: 'v1',
      type: 'viz',
      mode: 'bars',
      title: 'Where you end up (you started at 1.0)',
      yLabel: 'multiplier',
      bars: [
        { label: 'getting worse', expr: '(1 - rate / 100) ^ days' },
        { label: 'no change', expr: '1' },
        { label: 'getting better', expr: '(1 + rate / 100) ^ days' },
      ],
    },
  ],
}

const projectile: ExplorableDoc = {
  version: 1,
  title: 'Projectile motion',
  description: 'Launch angle and speed shape the arc. Can you beat 45° for maximum range?',
  variables: [
    { id: 'v0', name: 'v0', type: 'number', value: 20 },
    { id: 'angle', name: 'angle', type: 'number', value: 45 },
    { id: 'g', name: 'g', type: 'number', value: 9.8 },
    { id: 'rad', name: 'rad', type: 'number', value: 0, expr: 'angle * pi / 180' },
    { id: 'range', name: 'range', type: 'number', value: 0, expr: 'v0 ^ 2 * sin(2 * rad) / g' },
  ],
  blocks: [
    {
      id: 't1',
      type: 'text',
      markdown:
        'Fire a projectile at **{{ angle }}°** and **{{ v0 }} m/s**. It lands **{{ round(range * 10) / 10 }} m** away.',
    },
    { id: 'c1', type: 'control', control: 'slider', variable: 'v0', label: 'Speed (m/s)', min: 5, max: 40, step: 1 },
    { id: 'c2', type: 'control', control: 'slider', variable: 'angle', label: 'Angle (°)', min: 5, max: 85, step: 1 },
    {
      id: 'v1',
      type: 'viz',
      mode: 'function',
      title: 'Trajectory',
      xName: 'x',
      xMin: '0',
      xMax: 'range',
      samples: 80,
      curves: [{ label: 'height', expr: 'x * tan(rad) - g * x ^ 2 / (2 * (v0 * cos(rad)) ^ 2)' }],
      xLabel: 'distance (m)',
      yLabel: 'height (m)',
    },
  ],
}

const normalDistribution: ExplorableDoc = {
  version: 1,
  title: 'The bell curve, up close',
  description: 'How the mean and standard deviation shape a normal distribution.',
  variables: [
    { id: 'mu', name: 'mu', type: 'number', value: 0 },
    { id: 'sigma', name: 'sigma', type: 'number', value: 1 },
  ],
  blocks: [
    {
      id: 't1',
      type: 'text',
      markdown:
        'A normal distribution is set by its mean **μ = {{ mu }}** and standard deviation **σ = {{ sigma }}**. Increase σ and the curve spreads out and flattens.',
    },
    { id: 'c1', type: 'control', control: 'slider', variable: 'mu', label: 'Mean (μ)', min: -5, max: 5, step: 0.5 },
    { id: 'c2', type: 'control', control: 'slider', variable: 'sigma', label: 'Std dev (σ)', min: 0.3, max: 3, step: 0.1 },
    { id: 'm1', type: 'math', tex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}\\,e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
    {
      id: 'v1',
      type: 'viz',
      mode: 'function',
      xName: 'x',
      xMin: '-8',
      xMax: '8',
      samples: 160,
      curves: [{ label: 'density', expr: 'exp(-((x - mu) ^ 2) / (2 * sigma ^ 2)) / (sigma * sqrt(2 * pi))' }],
      xLabel: 'x',
      yLabel: 'density',
    },
  ],
}

export const EXAMPLES: Example[] = [
  { slug: 'compound-interest', doc: compoundInterest },
  { slug: 'one-percent', doc: onePercent },
  { slug: 'projectile', doc: projectile },
  { slug: 'sine-wave', doc: sineWave },
  { slug: 'normal-distribution', doc: normalDistribution },
]

export function getExample(slug: string): Example | undefined {
  return EXAMPLES.find((e) => e.slug === slug)
}
