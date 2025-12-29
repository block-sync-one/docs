import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DynamicConnector } from './dynamic-connector'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DynamicConnector>
      <App />
    </DynamicConnector>
  </StrictMode>,
)
