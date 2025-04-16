import React, { useState } from 'react'
import { ThemeProvider } from './components/theme-provider'
import Index from './pages/Index'
import CosmicSoundscape from './components/CosmicSoundscape'
import './App.css'

function App() {
  const [showSoundscape, setShowSoundscape] = useState(false);

  // Simulating a user interaction to enable soundscape
  // In a real implementation, we'd show this after some user interaction
  // to comply with autoplay policies
  setTimeout(() => {
    setShowSoundscape(true);
  }, 3000);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="biozone-ui-theme">
      <div className="app">
        <Index />
        {showSoundscape && <CosmicSoundscape autoplay={false} initialVolume={0.5} />}
      </div>
    </ThemeProvider>
  )
}

export default App