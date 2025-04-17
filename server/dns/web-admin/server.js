/**
 * Web Admin Interface for FractalDNS
 * Provides a browser-based management dashboard
 */

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { createLogger } = require('../utils/logger');
const config = require('../config');

// Initialize logger
const logger = createLogger('webAdmin');

class WebAdminServer {
  constructor(dnsServer) {
    this.app = express();
    this.dnsServer = dnsServer;
    this.port = config.webAdmin.port || 8053;
    this.address = config.webAdmin.address || '127.0.0.1';
    this.sessionSecret = config.webAdmin.sessionSecret || 'fractal-dns-secret';
    this.server = null;
    
    this.initializeServer();
  }
  
  initializeServer() {
    // Configure middleware
    this.configureMiddleware();
    
    // Set up routes
    this.setupRoutes();
    
    // Error handling
    this.setupErrorHandling();
    
    logger.info('Web Admin Interface initialized');
  }
  
  configureMiddleware() {
    // Set view engine
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));
    
    // Static files
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // Body parser
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    
    // Session middleware
    this.app.use(session({
      secret: this.sessionSecret,
      resave: false,
      saveUninitialized: true,
      cookie: { 
        secure: config.webAdmin.sslEnabled, 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));
    
    // Log requests
    this.app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.url}`);
      next();
    });
    
    // Authentication middleware
    this.app.use((req, res, next) => {
      // Skip authentication for login page and API
      if (req.path === '/login' || req.path === '/api/auth') {
        return next();
      }
      
      // Check if user is authenticated
      if (!req.session.authenticated) {
        return res.redirect('/login');
      }
      
      next();
    });
  }
  
  setupRoutes() {
    // Dashboard
    this.app.get('/', (req, res) => {
      res.render('dashboard', {
        title: 'FractalDNS Admin',
        serverStatus: this.dnsServer ? 'Running' : 'Stopped',
        user: req.session.user,
        stats: this.getServerStats()
      });
    });
    
    // Login page
    this.app.get('/login', (req, res) => {
      if (req.session.authenticated) {
        return res.redirect('/');
      }
      
      res.render('login', {
        title: 'Login - FractalDNS Admin',
        error: req.query.error
      });
    });
    
    // Authentication API
    this.app.post('/api/auth', async (req, res) => {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.redirect('/login?error=Missing username or password');
      }
      
      // Check credentials
      const isValid = await this.validateCredentials(username, password);
      
      if (!isValid) {
        return res.redirect('/login?error=Invalid username or password');
      }
      
      // Set session
      req.session.authenticated = true;
      req.session.user = { username };
      
      res.redirect('/');
    });
    
    // Logout
    this.app.get('/logout', (req, res) => {
      req.session.destroy();
      res.redirect('/login');
    });
    
    // TLD Zones page
    this.app.get('/zones', (req, res) => {
      const zones = this.dnsServer ? this.dnsServer.getTldZones() : [];
      
      res.render('zones', {
        title: 'TLD Zones - FractalDNS Admin',
        zones,
        user: req.session.user
      });
    });
    
    // Zone records page
    this.app.get('/zones/:tld', async (req, res) => {
      const { tld } = req.params;
      let zoneData = null;
      let records = [];
      
      if (this.dnsServer) {
        const zones = this.dnsServer.getTldZones();
        const zone = zones.find(z => z.name === tld);
        
        if (zone) {
          zoneData = this.dnsServer.zones[tld];
          records = zoneData.records;
        }
      } else {
        // Load from file
        const zonePath = path.join(config.server.zonesPath, `${tld}.json`);
        
        if (fs.existsSync(zonePath)) {
          try {
            const zoneFile = fs.readFileSync(zonePath, 'utf8');
            zoneData = JSON.parse(zoneFile);
            records = zoneData.records;
          } catch (error) {
            logger.error(`Failed to read zone file: ${zonePath}`, error);
          }
        }
      }
      
      if (!zoneData) {
        return res.status(404).render('error', {
          title: 'Zone Not Found - FractalDNS Admin',
          error: `Zone "${tld}" not found`,
          user: req.session.user
        });
      }
      
      res.render('records', {
        title: `${tld} Zone Records - FractalDNS Admin`,
        tld,
        zone: zoneData,
        records,
        user: req.session.user
      });
    });
    
    // API Routes
    this.setupApiRoutes();
  }
  
  setupApiRoutes() {
    const apiRouter = express.Router();
    
    // API Authentication middleware
    apiRouter.use((req, res, next) => {
      if (!req.session.authenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      next();
    });
    
    // Get server status
    apiRouter.get('/status', (req, res) => {
      res.json({
        status: this.dnsServer ? 'running' : 'stopped',
        stats: this.getServerStats()
      });
    });
    
    // Start server
    apiRouter.post('/start', async (req, res) => {
      if (this.dnsServer) {
        return res.json({ status: 'running', message: 'Server is already running' });
      }
      
      try {
        await this.startDnsServer();
        res.json({ status: 'running', message: 'Server started successfully' });
      } catch (error) {
        logger.error('Failed to start DNS server:', error);
        res.status(500).json({ error: 'Failed to start server' });
      }
    });
    
    // Stop server
    apiRouter.post('/stop', async (req, res) => {
      if (!this.dnsServer) {
        return res.json({ status: 'stopped', message: 'Server is already stopped' });
      }
      
      try {
        await this.stopDnsServer();
        res.json({ status: 'stopped', message: 'Server stopped successfully' });
      } catch (error) {
        logger.error('Failed to stop DNS server:', error);
        res.status(500).json({ error: 'Failed to stop server' });
      }
    });
    
    // List zones
    apiRouter.get('/zones', (req, res) => {
      const zones = this.dnsServer ? this.dnsServer.getTldZones() : [];
      res.json({ zones });
    });
    
    // Get zone details
    apiRouter.get('/zones/:tld', async (req, res) => {
      const { tld } = req.params;
      let zoneData = null;
      
      if (this.dnsServer) {
        zoneData = this.dnsServer.zones[tld];
      } else {
        // Load from file
        const zonePath = path.join(config.server.zonesPath, `${tld}.json`);
        
        if (fs.existsSync(zonePath)) {
          try {
            const zoneFile = fs.readFileSync(zonePath, 'utf8');
            zoneData = JSON.parse(zoneFile);
          } catch (error) {
            logger.error(`Failed to read zone file: ${zonePath}`, error);
          }
        }
      }
      
      if (!zoneData) {
        return res.status(404).json({ error: `Zone "${tld}" not found` });
      }
      
      res.json({ zone: zoneData });
    });
    
    // Create a new zone
    apiRouter.post('/zones', async (req, res) => {
      const { tld } = req.body;
      
      if (!tld) {
        return res.status(400).json({ error: 'TLD is required' });
      }
      
      // Clean the TLD
      const cleanTld = tld.trim().toLowerCase().replace(/^\./, '');
      
      if (!cleanTld) {
        return res.status(400).json({ error: 'Invalid TLD' });
      }
      
      // Check if zone already exists
      const zonePath = path.join(config.server.zonesPath, `${cleanTld}.json`);
      
      if (fs.existsSync(zonePath)) {
        return res.status(409).json({ error: `Zone "${cleanTld}" already exists` });
      }
      
      try {
        // Create the zone
        const zoneData = {
          name: cleanTld,
          records: [],
          meta: {
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            quantumSecure: config.security.quantumSecure,
            shardCount: config.security.shardCount
          }
        };
        
        // Ensure zones directory exists
        const zonesDir = config.server.zonesPath;
        if (!fs.existsSync(zonesDir)) {
          fs.mkdirSync(zonesDir, { recursive: true });
        }
        
        // Save the zone file
        fs.writeFileSync(zonePath, JSON.stringify(zoneData, null, 2));
        
        // Reload zones if server is running
        if (this.dnsServer) {
          await this.dnsServer.loadTldZones();
        }
        
        res.status(201).json({ message: `Zone "${cleanTld}" created successfully`, zone: zoneData });
      } catch (error) {
        logger.error(`Failed to create zone: ${cleanTld}`, error);
        res.status(500).json({ error: 'Failed to create zone' });
      }
    });
    
    // Add a record to a zone
    apiRouter.post('/zones/:tld/records', async (req, res) => {
      const { tld } = req.params;
      const { domain, type, value, ttl } = req.body;
      
      if (!domain || !type || !value) {
        return res.status(400).json({ error: 'Domain, type, and value are required' });
      }
      
      // Validate record type
      const validTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];
      if (!validTypes.includes(type.toUpperCase())) {
        return res.status(400).json({ error: `Invalid record type: ${type}` });
      }
      
      try {
        // Load the zone
        const zonePath = path.join(config.server.zonesPath, `${tld}.json`);
        
        if (!fs.existsSync(zonePath)) {
          return res.status(404).json({ error: `Zone "${tld}" not found` });
        }
        
        const zoneFile = fs.readFileSync(zonePath, 'utf8');
        const zoneData = JSON.parse(zoneFile);
        
        // Create the record
        const record = {
          domain,
          type: type.toUpperCase(),
          value,
          ttl: ttl ? parseInt(ttl, 10) : config.server.ttl,
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        };
        
        // Add priority for MX records
        if (type.toUpperCase() === 'MX' && req.body.priority) {
          record.priority = parseInt(req.body.priority, 10);
        }
        
        // Check if record already exists
        const existingIndex = zoneData.records.findIndex(r => 
          r.domain === domain && r.type === type.toUpperCase()
        );
        
        if (existingIndex >= 0) {
          // Update existing record
          zoneData.records[existingIndex] = {
            ...record,
            created: zoneData.records[existingIndex].created
          };
        } else {
          // Add new record
          zoneData.records.push(record);
        }
        
        // Update zone metadata
        zoneData.meta.updated = new Date().toISOString();
        
        // Save the zone file
        fs.writeFileSync(zonePath, JSON.stringify(zoneData, null, 2));
        
        // Reload zones if server is running
        if (this.dnsServer) {
          await this.dnsServer.loadTldZones();
        }
        
        res.status(201).json({ 
          message: `Record ${existingIndex >= 0 ? 'updated' : 'added'} successfully`, 
          record 
        });
      } catch (error) {
        logger.error(`Failed to add record to zone: ${tld}`, error);
        res.status(500).json({ error: 'Failed to add record' });
      }
    });
    
    // Delete a record from a zone
    apiRouter.delete('/zones/:tld/records', async (req, res) => {
      const { tld } = req.params;
      const { domain, type } = req.body;
      
      if (!domain || !type) {
        return res.status(400).json({ error: 'Domain and type are required' });
      }
      
      try {
        // Load the zone
        const zonePath = path.join(config.server.zonesPath, `${tld}.json`);
        
        if (!fs.existsSync(zonePath)) {
          return res.status(404).json({ error: `Zone "${tld}" not found` });
        }
        
        const zoneFile = fs.readFileSync(zonePath, 'utf8');
        const zoneData = JSON.parse(zoneFile);
        
        // Find and remove the record
        const initialCount = zoneData.records.length;
        zoneData.records = zoneData.records.filter(r => 
          !(r.domain === domain && r.type === type.toUpperCase())
        );
        
        if (zoneData.records.length === initialCount) {
          return res.status(404).json({ error: `Record not found: ${domain} (${type})` });
        }
        
        // Update zone metadata
        zoneData.meta.updated = new Date().toISOString();
        
        // Save the zone file
        fs.writeFileSync(zonePath, JSON.stringify(zoneData, null, 2));
        
        // Reload zones if server is running
        if (this.dnsServer) {
          await this.dnsServer.loadTldZones();
        }
        
        res.json({ message: `Record deleted: ${domain} (${type})` });
      } catch (error) {
        logger.error(`Failed to delete record from zone: ${tld}`, error);
        res.status(500).json({ error: 'Failed to delete record' });
      }
    });
    
    // Mount the API router
    this.app.use('/api', apiRouter);
  }
  
  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res, next) => {
      res.status(404).render('error', {
        title: 'Page Not Found - FractalDNS Admin',
        error: 'The page you are looking for does not exist',
        user: req.session.user
      });
    });
    
    // Error handler
    this.app.use((err, req, res, next) => {
      logger.error('Server error:', err);
      
      res.status(500).render('error', {
        title: 'Server Error - FractalDNS Admin',
        error: 'An internal server error occurred',
        user: req.session.user
      });
    });
  }
  
  async validateCredentials(username, password) {
    // Check if username matches
    if (username !== config.webAdmin.username) {
      return false;
    }
    
    // Check if password hash is set
    if (!config.webAdmin.passwordHash) {
      // If no password hash is set, check if password matches default
      return password === 'admin';
    }
    
    // Verify password hash
    try {
      return await bcrypt.compare(password, config.webAdmin.passwordHash);
    } catch (error) {
      logger.error('Error verifying password:', error);
      return false;
    }
  }
  
  getServerStats() {
    if (!this.dnsServer) {
      return {
        running: false,
        uptime: 0,
        zones: 0,
        records: 0
      };
    }
    
    const zones = this.dnsServer.getTldZones();
    const totalRecords = zones.reduce((total, zone) => total + zone.recordCount, 0);
    
    return {
      running: true,
      uptime: process.uptime(),
      zones: zones.length,
      records: totalRecords,
      peers: this.dnsServer.peers ? this.dnsServer.peers.size : 0
    };
  }
  
  async startDnsServer() {
    // Implement logic to start the DNS server
    logger.info('Starting DNS server...');
    
    // This would be implemented to start the DNS server
    // For now, just a placeholder
    
    logger.info('DNS server started');
  }
  
  async stopDnsServer() {
    // Implement logic to stop the DNS server
    logger.info('Stopping DNS server...');
    
    // This would be implemented to stop the DNS server
    // For now, just a placeholder
    
    logger.info('DNS server stopped');
  }
  
  async start() {
    return new Promise((resolve, reject) => {
      try {
        // Create the server
        if (config.webAdmin.sslEnabled && config.webAdmin.sslCertPath && config.webAdmin.sslKeyPath) {
          // Use HTTPS if SSL is enabled
          const options = {
            key: fs.readFileSync(config.webAdmin.sslKeyPath),
            cert: fs.readFileSync(config.webAdmin.sslCertPath)
          };
          
          this.server = https.createServer(options, this.app);
        } else {
          // Use HTTP otherwise
          this.server = http.createServer(this.app);
        }
        
        // Start the server
        this.server.listen(this.port, this.address, () => {
          const protocol = config.webAdmin.sslEnabled ? 'https' : 'http';
          logger.info(`Web Admin Interface listening at ${protocol}://${this.address}:${this.port}`);
          resolve();
        });
      } catch (error) {
        logger.error('Failed to start Web Admin Interface:', error);
        reject(error);
      }
    });
  }
  
  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        logger.info('Web Admin Interface is not running');
        resolve();
        return;
      }
      
      this.server.close((error) => {
        if (error) {
          logger.error('Error closing Web Admin Interface:', error);
          reject(error);
          return;
        }
        
        logger.info('Web Admin Interface stopped');
        this.server = null;
        resolve();
      });
    });
  }
}

module.exports = WebAdminServer;