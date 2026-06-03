import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './app/Layout'
import { HomePage } from './app/pages/HomePage'
import { EditorPage } from './app/pages/EditorPage'
import { ViewerPage } from './app/pages/ViewerPage'
import { EmbedPage } from './app/pages/EmbedPage'
import { DocsPage } from './app/pages/DocsPage'

function AppRoutes() {
  const { pathname } = useLocation()
  const routes = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/edit" element={<EditorPage />} />
      <Route path="/edit/:projectId" element={<EditorPage />} />
      <Route path="/view" element={<ViewerPage />} />
      <Route path="/embed" element={<EmbedPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
  // The /embed view is rendered without the app header so it sits cleanly in an iframe.
  return pathname.startsWith('/embed') ? routes : <Layout>{routes}</Layout>
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
