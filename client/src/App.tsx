import { useEffect } from 'react';
import { realTimeMonitor } from './core/mysterion/real-time-monitor';

function App() {
  // Initialize real-time monitoring when the application starts
  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        await realTimeMonitor.initialize();
        await realTimeMonitor.startMonitoring();
        console.log('Mysterion real-time monitoring initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Mysterion real-time monitoring:', error);
      }
    };

    initializeMonitoring();

    // Clean up on unmount
    return () => {
      realTimeMonitor.stopMonitoring();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Freedom Trust Framework</h1>
        <p>Decentralized AI infrastructure with real-time monitoring and self-improvement</p>
      </header>
      <main>
        <section>
          <h2>System Features</h2>
          <ul>
            <li>Mysterion Knowledge System with self-improvement capabilities</li>
            <li>Autonomous Agent Framework with economic incentives</li>
            <li>Computational Rewards System for CPU/GPU contributions</li>
            <li>Training Data Bridge with Filecoin integration</li>
            <li>Real-time monitoring and automatic code refactoring</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;