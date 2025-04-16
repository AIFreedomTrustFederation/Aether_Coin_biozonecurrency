import React from 'react'
import { ThemeProvider } from './components/theme-provider'
import Index from './pages/Index'
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="biozone-ui-theme">
      <div className="app">
        <Index />
      </div>
    </ThemeProvider>
  )
}

export default App