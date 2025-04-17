/**
 * FractalDNS Admin Dashboard JavaScript
 * Handles interactive elements and API requests for the dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize server status controls
  initServerControls();
  
  // Initialize zone management
  initZoneManagement();
  
  // Initialize system stats
  initSystemStats();
  
  // Initialize particle background effect
  initParticleBackground();
});

/**
 * Server control functions
 */
function initServerControls() {
  const startServerBtn = document.getElementById('start-server');
  const stopServerBtn = document.getElementById('stop-server');
  
  if (startServerBtn) {
    startServerBtn.addEventListener('click', async () => {
      try {
        startServerBtn.classList.add('loading');
        startServerBtn.disabled = true;
        
        const response = await fetch('/api/start', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'running') {
          showToast('Server started successfully', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast(`Error: ${data.error || 'Failed to start server'}`, 'error');
          startServerBtn.classList.remove('loading');
          startServerBtn.disabled = false;
        }
      } catch (error) {
        console.error('Error starting server:', error);
        showToast('Error starting server. See console for details.', 'error');
        startServerBtn.classList.remove('loading');
        startServerBtn.disabled = false;
      }
    });
  }
  
  if (stopServerBtn) {
    stopServerBtn.addEventListener('click', async () => {
      try {
        stopServerBtn.classList.add('loading');
        stopServerBtn.disabled = true;
        
        const response = await fetch('/api/stop', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'stopped') {
          showToast('Server stopped successfully', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast(`Error: ${data.error || 'Failed to stop server'}`, 'error');
          stopServerBtn.classList.remove('loading');
          stopServerBtn.disabled = false;
        }
      } catch (error) {
        console.error('Error stopping server:', error);
        showToast('Error stopping server. See console for details.', 'error');
        stopServerBtn.classList.remove('loading');
        stopServerBtn.disabled = false;
      }
    });
  }
}

/**
 * Zone management functions
 */
function initZoneManagement() {
  const createZoneBtn = document.getElementById('create-zone-btn');
  const createZoneModal = document.getElementById('create-zone-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const cancelCreateZoneBtn = document.getElementById('cancel-create-zone');
  const createZoneForm = document.getElementById('create-zone-form');
  
  if (createZoneBtn && createZoneModal) {
    createZoneBtn.addEventListener('click', () => {
      createZoneModal.classList.remove('hidden');
    });
    
    const hideModal = () => {
      createZoneModal.classList.add('hidden');
    };
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (cancelCreateZoneBtn) cancelCreateZoneBtn.addEventListener('click', hideModal);
    
    // Close modal when clicking outside
    createZoneModal.addEventListener('click', (e) => {
      if (e.target === createZoneModal) hideModal();
    });
    
    if (createZoneForm) {
      createZoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = createZoneForm.querySelector('button[type="submit"]');
        const tld = document.getElementById('tld').value.trim().toLowerCase();
        
        if (!/^[a-z0-9-]+$/.test(tld)) {
          showToast('TLD can only contain lowercase letters, numbers, and hyphens.', 'error');
          return;
        }
        
        try {
          submitBtn.textContent = 'Creating...';
          submitBtn.disabled = true;
          
          const response = await fetch('/api/zones', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tld })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            showToast(`Zone "${tld}" created successfully!`, 'success');
            window.location.href = `/zones/${tld}`;
          } else {
            showToast(`Error: ${data.error}`, 'error');
            submitBtn.textContent = 'Create Zone';
            submitBtn.disabled = false;
          }
        } catch (error) {
          console.error('Error creating zone:', error);
          showToast('Failed to create zone. See console for details.', 'error');
          submitBtn.textContent = 'Create Zone';
          submitBtn.disabled = false;
        }
      });
    }
  }
  
  // Export zones button
  const exportZonesBtn = document.getElementById('export-zones-btn');
  
  if (exportZonesBtn) {
    exportZonesBtn.addEventListener('click', async () => {
      try {
        exportZonesBtn.classList.add('loading');
        exportZonesBtn.disabled = true;
        
        const response = await fetch('/api/zones/export', { 
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'fractal-dns-zones.zip';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          
          showToast('Zones exported successfully', 'success');
        } else {
          const data = await response.json();
          showToast(`Error: ${data.error || 'Failed to export zones'}`, 'error');
        }
        
        exportZonesBtn.classList.remove('loading');
        exportZonesBtn.disabled = false;
      } catch (error) {
        console.error('Error exporting zones:', error);
        showToast('Error exporting zones. See console for details.', 'error');
        exportZonesBtn.classList.remove('loading');
        exportZonesBtn.disabled = false;
      }
    });
  }
  
  // Sync with peers button
  const syncPeersBtn = document.getElementById('sync-peers-btn');
  
  if (syncPeersBtn) {
    syncPeersBtn.addEventListener('click', async () => {
      try {
        syncPeersBtn.classList.add('loading');
        syncPeersBtn.disabled = true;
        
        const response = await fetch('/api/peers/sync', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          showToast('Sync with peers completed successfully', 'success');
        } else {
          showToast(`Error: ${data.error || 'Failed to sync with peers'}`, 'error');
        }
        
        syncPeersBtn.classList.remove('loading');
        syncPeersBtn.disabled = false;
      } catch (error) {
        console.error('Error syncing with peers:', error);
        showToast('Error syncing with peers. See console for details.', 'error');
        syncPeersBtn.classList.remove('loading');
        syncPeersBtn.disabled = false;
      }
    });
  }
}

/**
 * System stats functions
 */
function initSystemStats() {
  // Poll for system stats every 30 seconds
  updateSystemStats();
  setInterval(updateSystemStats, 30000);
}

async function updateSystemStats() {
  try {
    const response = await fetch('/api/status', { 
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      updateStatsDisplay(data);
    }
  } catch (error) {
    console.error('Error fetching system stats:', error);
  }
}

function updateStatsDisplay(data) {
  // Server status
  const serverStatusElement = document.querySelector('.server-status');
  if (serverStatusElement) {
    serverStatusElement.textContent = data.status === 'running' ? 'Running' : 'Stopped';
    serverStatusElement.className = `server-status text-2xl font-bold text-${data.status === 'running' ? 'green' : 'red'}-400`;
  }
  
  // Uptime
  const uptimeElement = document.querySelector('.server-uptime');
  if (uptimeElement && data.stats) {
    const hours = Math.floor(data.stats.uptime / 60 / 60);
    const minutes = Math.floor((data.stats.uptime / 60) % 60);
    uptimeElement.textContent = `${hours} hours ${minutes} minutes`;
  }
  
  // Zone count
  const zonesElement = document.querySelector('.zones-count');
  if (zonesElement && data.stats) {
    zonesElement.textContent = data.stats.zones;
  }
  
  // Records count
  const recordsElement = document.querySelector('.records-count');
  if (recordsElement && data.stats) {
    recordsElement.textContent = data.stats.records;
  }
  
  // Peers count
  const peersElement = document.querySelector('.peers-count');
  if (peersElement && data.stats) {
    peersElement.textContent = data.stats.peers;
  }
}

/**
 * Particle background effect
 */
function initParticleBackground() {
  const container = document.querySelector('.particle-container');
  if (!container) return;
  
  const particleCount = 15;
  const colors = ['#3b82f6', '#8b5cf6', '#60a5fa', '#a78bfa'];
  
  for (let i = 0; i < particleCount; i++) {
    createParticle(container, colors);
  }
}

function createParticle(container, colors) {
  const particle = document.createElement('div');
  particle.classList.add('particle');
  
  // Random properties
  const size = Math.random() * 10 + 5;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const duration = Math.random() * 60 + 30;
  const delay = Math.random() * 10;
  
  // Apply styles
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.backgroundColor = color;
  particle.style.left = `${left}%`;
  particle.style.top = `${top}%`;
  particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
  
  container.appendChild(particle);
  
  // Custom animation
  const keyframes = `
    @keyframes float {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: ${Math.random() * 0.2 + 0.1};
      }
      100% {
        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
        opacity: ${Math.random() * 0.2 + 0.3};
      }
    }
  `;
  
  const style = document.createElement('style');
  style.innerHTML = keyframes;
  document.head.appendChild(style);
}

/**
 * Toast notification system
 */
function showToast(message, type = 'info') {
  // Check if toast container exists, create if not
  let toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-0 right-0 p-4 z-50 flex flex-col items-end';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  
  // Set appropriate classes based on type
  let typeClasses = 'bg-blue-600';
  let iconPath = '';
  
  switch (type) {
    case 'success':
      typeClasses = 'bg-green-600';
      iconPath = 'M5 13l4 4L19 7';
      break;
    case 'error':
      typeClasses = 'bg-red-600';
      iconPath = 'M6 18L18 6M6 6l12 12';
      break;
    case 'warning':
      typeClasses = 'bg-yellow-600';
      iconPath = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      break;
  }
  
  // Create toast structure
  toast.className = `mb-3 p-4 rounded-md shadow-lg flex items-center ${typeClasses} text-white transform transition-all duration-300 ease-in-out translate-x-full`;
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}" />
    </svg>
    <p>${message}</p>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}