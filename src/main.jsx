import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './styles/styles.css'
import { initSecurity } from './security.js'

/** GitHub Pages serves 404.html then redirects to /menu/?…; 404 stores the real path here. Sync the address bar before Router mounts so the first paint matches /more (etc.). */
function restoreGithubPagesPath() {
  try {
    const key = 'menuGhPagesPath'
    const saved = sessionStorage.getItem(key)
    if (!saved) return
    sessionStorage.removeItem(key)
    const pathQuery = saved.startsWith('/') ? saved : `/${saved}`
    window.history.replaceState(null, '', `/menu${pathQuery}`)
  } catch {
    /* ignore */
  }
}

restoreGithubPagesPath()
initSecurity()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
