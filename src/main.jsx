import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

async function enableMocking() {
  // Disabled mocks entirely to use real backend database
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser.js')
    return worker.start({ onUnhandledRequest: 'bypass' })
  }
  return Promise.resolve()
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 60 * 1000 },
  },
})

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  )
})
