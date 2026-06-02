import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { parseDoc } from './core'
import { StandaloneViewer } from './viewer/StandaloneViewer'

declare global {
  interface Window {
    __EXPLORABLE_DOC__?: string
    __EXPLORABLE_REMIX_URL__?: string
  }
}

const rootEl = document.getElementById('root')!
const embedded = window.__EXPLORABLE_DOC__

createRoot(rootEl).render(
  <StrictMode>
    {embedded ? (
      <StandaloneViewer doc={parseDoc(embedded)} remixUrl={window.__EXPLORABLE_REMIX_URL__} />
    ) : (
      <App />
    )}
  </StrictMode>,
)
