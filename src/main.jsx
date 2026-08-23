import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './styles/styles.css'
// import { initSecurity } from './security.js'

function restoreGithubPagesPath() {
  try {
    const key = 'menuGhPagesPath'
    const saved = sessionStorage.getItem(key)
    if (!saved) return
    sessionStorage.removeItem(key)
    const pathQuery = saved.startsWith('/') ? saved : `/${saved}`
    window.history.replaceState(null, '', `/menu${pathQuery}`)
  } catch {
  }
}

restoreGithubPagesPath()
// if (import.meta.env.PROD) {
//   initSecurity()
// }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
