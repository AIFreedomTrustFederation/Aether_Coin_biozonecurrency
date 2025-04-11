/**
 * Aetherion Wallet Simple Monitoring Dashboard
 * 
 * A lightweight monitoring dashboard for Aetherion Wallet deployment.
 * This dashboard pulls health status from multiple instances and displays
 * real-time information about the system's health.
 */

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const PORT = process.env.DASHBOARD_PORT || 8090;
const INSTANCES = [
  { name: 'Instance 0', url: 'http://localhost:3000/health' },
  { name: 'Instance 1', url: 'http://localhost:3001/health' },
  { name: 'Instance 2', url: 'http://localhost:3002/health' }
];
const PRODUCTION_URL = 'https://atc.aifreedomtrust.com/dapp/health';
const STAGING_URL = 'https://staging.atc.aifreedomtrust.com/dapp/health';
const REFRESH_INTERVAL = 10000; // 10 seconds

// Create Express app
const app = express();

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create health data endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Get system info
    const systemInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
      loadAvg: os.loadavg(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usedPercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
      },
      cpus: os.cpus(),
      network: os.networkInterfaces()
    };
    
    // Get instance health data
    const instanceData = await Promise.all(
      INSTANCES.map(instance => fetchHealthData(instance.url, instance.name))
    );
    
    // Get production and staging data
    const productionData = await fetchHealthData(PRODUCTION_URL, 'Production');
    const stagingData = await fetchHealthData(STAGING_URL, 'Staging');
    
    // Combine all data
    const healthData = {
      timestamp: new Date().toISOString(),
      system: systemInfo,
      instances: instanceData,
      environments: [productionData, stagingData].filter(Boolean)
    };
    
    res.json(healthData);
  } catch (error) {
    console.error('Error fetching health data:', error);
    res.status(500).json({ error: error.message });
  }
});

// HTML Dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aetherion Wallet Monitoring Dashboard</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f5f7fa;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        header {
          background-color: #2c3e50;
          color: white;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
          margin-top: 0;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .card {
          background: white;
          border-radius: 5px;
          padding: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .status {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 5px;
        }
        .status-ok {
          background-color: #27ae60;
        }
        .status-warning {
          background-color: #f39c12;
        }
        .status-error {
          background-color: #e74c3c;
        }
        .metric {
          margin-bottom: 10px;
        }
        .metric-label {
          font-weight: bold;
          display: inline-block;
          min-width: 150px;
        }
        .metric-value {
          color: #2980b9;
        }
        .progress-bar {
          height: 10px;
          background-color: #ecf0f1;
          border-radius: 5px;
          overflow: hidden;
          margin-top: 5px;
        }
        .progress-value {
          height: 100%;
          background-color: #3498db;
        }
        .instances-list, .environments-list {
          margin-top: 10px;
        }
        .refresh-info {
          text-align: right;
          color: #7f8c8d;
          margin-bottom: 10px;
          font-size: 0.9em;
        }
        .instance-card {
          margin-bottom: 15px;
        }
        .instance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .instance-uptime {
          color: #7f8c8d;
          font-size: 0.9em;
        }
        footer {
          text-align: center;
          margin-top: 40px;
          color: #7f8c8d;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Aetherion Wallet Monitoring Dashboard</h1>
          <p>Real-time monitoring for Aetherion Wallet deployment</p>
        </header>
        
        <div class="refresh-info">
          Auto-refreshing every <span id="refresh-seconds">${REFRESH_INTERVAL/1000}</span> seconds. Last update: <span id="last-update">--</span>
        </div>
        
        <div class="dashboard-grid">
          <div class="card">
            <h2>System Overview</h2>
            <div id="system-metrics">Loading...</div>
          </div>
          
          <div class="card">
            <h2>Memory Usage</h2>
            <div id="memory-metrics">Loading...</div>
          </div>
          
          <div class="card">
            <h2>CPU Load</h2>
            <div id="cpu-metrics">Loading...</div>
          </div>
        </div>
        
        <h2>Instance Status</h2>
        <div class="card">
          <div id="instances-status">Loading...</div>
        </div>
        
        <h2>Environment Status</h2>
        <div class="card">
          <div id="environments-status">Loading...</div>
        </div>
        
        <footer>
          Aetherion Wallet Monitoring Dashboard &copy; ${new Date().getFullYear()} AI Freedom Trust
        </footer>
      </div>
      
      <script>
        // Utility function to format bytes to human-readable values
        function formatBytes(bytes, decimals = 2) {
          if (bytes === 0) return '0 Bytes';
          
          const k = 1024;
          const dm = decimals < 0 ? 0 : decimals;
          const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
          
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          
          return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }
        
        // Utility function to format uptime
        function formatUptime(seconds) {
          const days = Math.floor(seconds / 86400);
          seconds %= 86400;
          const hours = Math.floor(seconds / 3600);
          seconds %= 3600;
          const minutes = Math.floor(seconds / 60);
          seconds = Math.floor(seconds % 60);
          
          const parts = [];
          if (days > 0) parts.push(\`\${days}d\`);
          if (hours > 0) parts.push(\`\${hours}h\`);
          if (minutes > 0) parts.push(\`\${minutes}m\`);
          if (seconds > 0 || parts.length === 0) parts.push(\`\${seconds}s\`);
          
          return parts.join(' ');
        }
        
        // Fetch health data and update dashboard
        function updateDashboard() {
          fetch('/api/health')
            .then(response => response.json())
            .then(data => {
              // Update last update timestamp
              document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
              
              // Update system metrics
              const systemMetrics = document.getElementById('system-metrics');
              systemMetrics.innerHTML = \`
                <div class="metric">
                  <span class="metric-label">Hostname:</span>
                  <span class="metric-value">\${data.system.hostname}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Platform:</span>
                  <span class="metric-value">\${data.system.platform} (\${data.system.arch})</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Uptime:</span>
                  <span class="metric-value">\${formatUptime(data.system.uptime)}</span>
                </div>
              \`;
              
              // Update memory metrics
              const memoryMetrics = document.getElementById('memory-metrics');
              const memoryUsedPercent = parseFloat(data.system.memory.usedPercent);
              let memoryStatusClass = 'status-ok';
              if (memoryUsedPercent > 80) {
                memoryStatusClass = 'status-error';
              } else if (memoryUsedPercent > 60) {
                memoryStatusClass = 'status-warning';
              }
              
              memoryMetrics.innerHTML = \`
                <div class="metric">
                  <span class="status \${memoryStatusClass}"></span>
                  <span class="metric-label">Used:</span>
                  <span class="metric-value">\${memoryUsedPercent}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-value" style="width: \${memoryUsedPercent}%"></div>
                </div>
                <div class="metric">
                  <span class="metric-label">Total:</span>
                  <span class="metric-value">\${formatBytes(data.system.memory.total)}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Used:</span>
                  <span class="metric-value">\${formatBytes(data.system.memory.used)}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Free:</span>
                  <span class="metric-value">\${formatBytes(data.system.memory.free)}</span>
                </div>
              \`;
              
              // Update CPU metrics
              const cpuMetrics = document.getElementById('cpu-metrics');
              const loadAvg1min = data.system.loadAvg[0].toFixed(2);
              const loadAvg5min = data.system.loadAvg[1].toFixed(2);
              const loadAvg15min = data.system.loadAvg[2].toFixed(2);
              const cpuCount = data.system.cpus.length;
              
              let loadStatusClass = 'status-ok';
              if (loadAvg1min > cpuCount) {
                loadStatusClass = 'status-error';
              } else if (loadAvg1min > cpuCount * 0.7) {
                loadStatusClass = 'status-warning';
              }
              
              cpuMetrics.innerHTML = \`
                <div class="metric">
                  <span class="status \${loadStatusClass}"></span>
                  <span class="metric-label">CPU Cores:</span>
                  <span class="metric-value">\${cpuCount}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Load Avg (1m):</span>
                  <span class="metric-value">\${loadAvg1min}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Load Avg (5m):</span>
                  <span class="metric-value">\${loadAvg5min}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Load Avg (15m):</span>
                  <span class="metric-value">\${loadAvg15min}</span>
                </div>
              \`;
              
              // Update instances status
              const instancesStatus = document.getElementById('instances-status');
              if (data.instances && data.instances.length > 0) {
                const instancesHTML = data.instances.map(instance => {
                  const statusClass = instance.error ? 'status-error' : 
                                     (instance.data && instance.data.status === 'ok' ? 'status-ok' : 'status-warning');
                  
                  if (instance.error) {
                    return \`
                      <div class="instance-card">
                        <div class="instance-header">
                          <h3><span class="status \${statusClass}"></span> \${instance.name}</h3>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Status:</span>
                          <span class="metric-value">Error - \${instance.error}</span>
                        </div>
                      </div>
                    \`;
                  } else {
                    return \`
                      <div class="instance-card">
                        <div class="instance-header">
                          <h3><span class="status \${statusClass}"></span> \${instance.name}</h3>
                          <div class="instance-uptime">Uptime: \${formatUptime(instance.data.uptime)}</div>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Status:</span>
                          <span class="metric-value">\${instance.data.status}</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Version:</span>
                          <span class="metric-value">\${instance.data.version || 'N/A'}</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Instance ID:</span>
                          <span class="metric-value">\${instance.data.instance || 'N/A'}</span>
                        </div>
                      </div>
                    \`;
                  }
                }).join('');
                
                instancesStatus.innerHTML = instancesHTML;
              } else {
                instancesStatus.innerHTML = '<p>No instance data available</p>';
              }
              
              // Update environments status
              const environmentsStatus = document.getElementById('environments-status');
              if (data.environments && data.environments.length > 0) {
                const environmentsHTML = data.environments.map(env => {
                  const statusClass = env.error ? 'status-error' : 
                                     (env.data && env.data.status === 'ok' ? 'status-ok' : 'status-warning');
                  
                  if (env.error) {
                    return \`
                      <div class="instance-card">
                        <div class="instance-header">
                          <h3><span class="status \${statusClass}"></span> \${env.name}</h3>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Status:</span>
                          <span class="metric-value">Error - \${env.error}</span>
                        </div>
                      </div>
                    \`;
                  } else {
                    return \`
                      <div class="instance-card">
                        <div class="instance-header">
                          <h3><span class="status \${statusClass}"></span> \${env.name}</h3>
                          <div class="instance-uptime">Uptime: \${formatUptime(env.data.uptime)}</div>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Status:</span>
                          <span class="metric-value">\${env.data.status}</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Version:</span>
                          <span class="metric-value">\${env.data.version || 'N/A'}</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Environment:</span>
                          <span class="metric-value">\${env.data.environment || 'N/A'}</span>
                        </div>
                      </div>
                    \`;
                  }
                }).join('');
                
                environmentsStatus.innerHTML = environmentsHTML;
              } else {
                environmentsStatus.innerHTML = '<p>No environment data available</p>';
              }
            })
            .catch(error => {
              console.error('Error fetching health data:', error);
            });
        }
        
        // Initialize dashboard
        updateDashboard();
        
        // Set up auto-refresh
        setInterval(updateDashboard, ${REFRESH_INTERVAL});
        
        // Countdown timer for next refresh
        let secondsUntilRefresh = ${REFRESH_INTERVAL/1000};
        setInterval(() => {
          secondsUntilRefresh -= 1;
          if (secondsUntilRefresh <= 0) {
            secondsUntilRefresh = ${REFRESH_INTERVAL/1000};
          }
          document.getElementById('refresh-seconds').textContent = secondsUntilRefresh;
        }, 1000);
      </script>
    </body>
    </html>
  `);
});

// Helper function to fetch health data from an endpoint
async function fetchHealthData(url, name) {
  try {
    const response = await new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const request = protocol.get(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Aetherion-Monitoring-Dashboard/1.0' }
      }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
            } else {
              reject(new Error(`HTTP status ${res.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      request.on('error', (err) => {
        reject(err);
      });
      
      request.on('timeout', () => {
        request.abort();
        reject(new Error('Request timed out'));
      });
      
      request.end();
    });
    
    return {
      name,
      data: response.body,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      name,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Create and start the HTTP server
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Monitoring dashboard running on http://0.0.0.0:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down monitoring dashboard');
  server.close(() => {
    console.log('Monitoring dashboard closed');
    process.exit(0);
  });
});