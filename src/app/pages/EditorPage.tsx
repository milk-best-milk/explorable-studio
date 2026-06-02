import { useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { decodeDocFromUrl, uid } from '../../core'
import { useEditor } from '../../editor/store'
import { Editor } from '../../editor/Editor'
import { getExample } from '../../examples'
import { getLastProjectId, getProject, saveProject } from '../storage'

export function EditorPage() {
  const { projectId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const load = useEditor((s) => s.load)
  const newProject = useEditor((s) => s.newProject)
  const handled = useRef<string>('')

  useEffect(() => {
    const d = params.get('d')
    const ex = params.get('ex')
    const key = `${d ?? ''}|${ex ?? ''}|${projectId ?? ''}`
    if (handled.current === key) return
    handled.current = key

    // Import from a shared link.
    if (d) {
      try {
        const doc = decodeDocFromUrl(d)
        const id = uid('p_')
        load(doc, id)
        saveProject(id, doc)
        navigate(`/edit/${id}`, { replace: true })
      } catch {
        navigate('/edit', { replace: true })
      }
      return
    }

    // Open a built-in example.
    if (ex) {
      const example = getExample(ex)
      if (example) {
        const id = uid('p_')
        load(example.doc, id)
        saveProject(id, example.doc)
        navigate(`/edit/${id}`, { replace: true })
      } else {
        navigate('/edit', { replace: true })
      }
      return
    }

    // Open a saved project by id.
    if (projectId) {
      if (projectId !== useEditor.getState().projectId) {
        const p = getProject(projectId)
        if (p) load(p.doc, p.id)
        else navigate('/', { replace: true })
      }
      return
    }

    // No params: resume current/last project, or start a new one.
    const current = useEditor.getState().projectId
    if (getProject(current)) {
      navigate(`/edit/${current}`, { replace: true })
      return
    }
    const last = getLastProjectId()
    const lastProject = last ? getProject(last) : undefined
    if (lastProject) {
      load(lastProject.doc, lastProject.id)
      navigate(`/edit/${lastProject.id}`, { replace: true })
      return
    }
    const id = newProject()
    navigate(`/edit/${id}`, { replace: true })
  }, [params, projectId, load, newProject, navigate])

  return <Editor />
}
