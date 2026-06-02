import { Link } from 'react-router-dom'
import { BUILTIN_CONSTANTS, BUILTIN_FUNCTIONS } from '../../core'
import { REPO_URL } from '../config'

export function DocsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="es-prose mx-auto max-w-2xl px-4 py-10 text-slate-700 dark:text-slate-300">
        <h1>Documentation</h1>
        <p>
          Explorable Studio lets you build interactive “explorable explanations” by composing
          blocks and wiring them together with variables and simple expressions — no coding
          required.
        </p>

        <h2>Quick start</h2>
        <ol>
          <li>
            Open the <Link to="/edit">editor</Link> and give your explainer a title.
          </li>
          <li>
            In <strong>Variables</strong>, add a number variable, e.g. <code>rate</code>.
          </li>
          <li>
            Add a <strong>Control → Slider</strong> bound to <code>rate</code>.
          </li>
          <li>
            Add a <strong>Text</strong> block: <code>At {'{{ rate }}'}% per year…</code>
          </li>
          <li>
            Add a <strong>Chart</strong> and plot an expression that uses <code>rate</code>. Drag
            the slider and watch everything update.
          </li>
        </ol>

        <h2>Blocks</h2>
        <ul>
          <li>
            <strong>Text</strong> — Markdown prose. Insert a live value anywhere with{' '}
            <code>{'{{ expression }}'}</code>.
          </li>
          <li>
            <strong>Control</strong> — a slider, number field, toggle or dropdown bound to a
            variable. Readers manipulate these.
          </li>
          <li>
            <strong>Chart</strong> — plot one or more functions <code>y = f(x)</code> over a range,
            or compare values as bars. Axis bounds can themselves be expressions.
          </li>
          <li>
            <strong>Math</strong> — a KaTeX formula, with <code>{'{{ }}'}</code> interpolation.
          </li>
        </ul>

        <h2>Variables &amp; expressions</h2>
        <p>
          Variables hold numbers, booleans or text. A variable with a <em>derived expression</em>{' '}
          is computed from other variables (e.g. <code>final = principal * (1 + rate) ^ years</code>
          ). Expressions are evaluated in a safe sandbox — there is no access to JavaScript globals,
          so shared explainers are safe to open.
        </p>
        <p>
          <strong>Operators:</strong> <code>+ - * / %</code>, power <code>^</code>, comparisons{' '}
          <code>{'< <= > >= == !='}</code>, logical <code>{'&& || !'}</code>, and a ternary{' '}
          <code>cond ? a : b</code>. <code>+</code> also concatenates strings.
        </p>
        <p>
          <strong>Constants:</strong> <code>{BUILTIN_CONSTANTS.join(' · ')}</code>
        </p>
        <p>
          <strong>Functions:</strong>{' '}
          {BUILTIN_FUNCTIONS.join(', ')}.
        </p>

        <h2>Sharing &amp; exporting</h2>
        <ul>
          <li>
            <strong>Share link</strong> — the whole explainer is encoded into the URL. No server, no
            account; anyone with the link can view and remix it.
          </li>
          <li>
            <strong>Export HTML</strong> — download a self-contained page that runs offline.
          </li>
          <li>
            <strong>Export / Import JSON</strong> — the portable project format. Contribute great
            explainers back to the gallery via a pull request.
          </li>
        </ul>

        <h2>Privacy</h2>
        <p>
          Everything runs in your browser. Your explainers are saved to this device’s local storage
          and are never uploaded. The hosted site uses only privacy-friendly, cookieless aggregate
          analytics (page views), never the contents of your work.
        </p>

        <h2>Contributing</h2>
        <p>
          Issues and pull requests are welcome — especially new example explainers. See the{' '}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            repository
          </a>
          .
        </p>
      </div>
    </div>
  )
}
