import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ERPNanoCP from './ERPNanoCP/ERPNanoCP.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode><ERPNanoCP /></StrictMode>
)
