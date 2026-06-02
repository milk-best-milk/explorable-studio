import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './app/Layout'
import { HomePage } from './app/pages/HomePage'
import { EditorPage } from './app/pages/EditorPage'
import { ViewerPage } from './app/pages/ViewerPage'
import { DocsPage } from './app/pages/DocsPage'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/edit" element={<EditorPage />} />
          <Route path="/edit/:projectId" element={<EditorPage />} />
          <Route path="/view" element={<ViewerPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
