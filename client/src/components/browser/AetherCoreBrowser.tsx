/**
 * AetherCore Browser Component
 * 
 * A secure web browser component that supports both HTTQS and HTTPS protocols.
 * Features quantum-secure navigation, certificate validation, and security indicators.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Lock, ShieldAlert, Shield, Globe, RefreshCw, ArrowLeft, ArrowRight, Home, X, Check, Wifi, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { certificateService, Certificate } from '../../services/security/certificateService';
import { fractalDnsService, DNSResolutionResult } from '../../services/dns/fractalDnsService';

// Tab interface
interface BrowserTab {
  id: string;
  url: string;
  title: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isSecure: boolean;
  isQuantumSecure: boolean;
  certificate: Certificate | null;
}

// Security level enum
type SecurityLevel = 'quantum' | 'standard' | 'insecure' | 'unknown';

export interface AetherCoreBrowserProps {
  initialUrl?: string;
}

const AetherCoreBrowser: React.FC<AetherCoreBrowserProps> = ({ initialUrl = 'httqs://www.AetherCore.trust' }) => {
  // Browser state
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [securityInfo, setSecurityInfo] = useState<{ level: SecurityLevel, message: string }>({ 
    level: 'unknown', 
    message: 'Not connected' 
  });
  const [showCertInfo, setShowCertInfo] = useState<boolean>(false);
  const [isAddressBarFocused, setIsAddressBarFocused] = useState<boolean>(false);
  
  // Browser frame ref - this would be an iframe in a real implementation
  const browserFrameRef = useRef<HTMLDivElement>(null);
  
  // Initialize tabs with initialUrl
  useEffect(() => {
    // Create initial tab with the provided URL
    const newTab = createNewTab(initialUrl);
    setTabs([newTab]);
    setActiveTabId(newTab.id);
    setUrlInput(newTab.url);
    checkSecurity(newTab.url, null);
  }, [initialUrl]);
  
  // Set initial active tab
  useEffect(() => {
    if (tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0].id);
      setUrlInput(tabs[0].url);
    }
  }, [tabs, activeTabId]);
  
  // Create a new browser tab
  function createNewTab(url: string = 'httqs://www.AetherCore.trust'): BrowserTab {
    return {
      id: 'tab_' + Math.random().toString(36).substring(2, 9),
      url: url,
      title: 'New Tab',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isSecure: true,
      isQuantumSecure: true,
      certificate: null
    };
  }
  
  // Get active tab
  const getActiveTab = (): BrowserTab | undefined => {
    return tabs.find(tab => tab.id === activeTabId);
  };
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setUrlInput(tab.url);
      checkSecurity(tab.url, null);
    }
  };
  
  // Add new tab
  const addTab = () => {
    const newTab = createNewTab();
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput(newTab.url);
    checkSecurity(newTab.url, null);
  };
  
  // Close tab
  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't close if it's the last tab
    if (tabs.length <= 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    // If closing the active tab, activate another one
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[0];
      setActiveTabId(newActiveTab.id);
      setUrlInput(newActiveTab.url);
      checkSecurity(newActiveTab.url, null);
    }
  };
  
  // Navigate to URL
  const navigateTo = (url: string) => {
    // Format URL if needed
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('httqs://')) {
      // Check if it's likely a search query
      if (url.includes(' ') || !url.includes('.')) {
        formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      } else {
        // Check if domain is registered in FractalDNS
        const domainToCheck = url.startsWith('www.') ? url : `www.${url}`;
        const isDomainInFractalDNS = fractalDnsService.isDomainRegistered(domainToCheck) || 
                                    fractalDnsService.isDomainRegistered(url);
        
        // Try to determine if it's HTTQS or HTTPS
        if (url.includes('AetherCore.trust') || 
            url.includes('fractalcoin.network') || 
            url.includes('freedomtrust.com') || 
            url.includes('aifreedomtrust.com') ||
            url.includes('atc.aifreedomtrust.com') || // Explicitly handle atc subdomain
            isDomainInFractalDNS) {
          formattedUrl = `httqs://${url}`;
        } else {
          formattedUrl = `https://${url}`;
        }
      }
    }
    
    // Update tab info
    const updatedTabs = tabs.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          url: formattedUrl,
          isLoading: true,
          title: 'Loading...'
        };
      }
      return tab;
    });
    
    setTabs(updatedTabs);
    setUrlInput(formattedUrl);
    
    // Simulate loading with DNS resolution for HTTQS domains
    setTimeout(async () => {
      // Extract domain from URL
      let domain = '';
      try {
        domain = new URL(formattedUrl).hostname;
      } catch (error) {
        console.error('Invalid URL:', error);
        return;
      }
      
      // If it's a HTTQS domain, resolve it using FractalDNS
      let dnsResolution: DNSResolutionResult | null = null;
      if (formattedUrl.startsWith('httqs://')) {
        dnsResolution = await fractalDnsService.resolveDomain(domain);
        
        // If domain resolution failed, show error
        if (!dnsResolution.success) {
          const updatedTabsAfterLoad = tabs.map(tab => {
            if (tab.id === activeTabId) {
              return {
                ...tab,
                url: formattedUrl,
                isLoading: false,
                title: domain,
                canGoBack: true,
                canGoForward: false
              };
            }
            return tab;
          });
          
          setTabs(updatedTabsAfterLoad);
          setSecurityInfo({ 
            level: 'unknown', 
            message: `DNS Resolution Failed: ${dnsResolution.errors?.join(', ') || 'Unknown error'}` 
          });
          return;
        }
      }
      
      const updatedTabsAfterLoad = tabs.map(tab => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            url: formattedUrl,
            isLoading: false,
            title: domain,
            canGoBack: true,
            canGoForward: false
          };
        }
        return tab;
      });
      
      setTabs(updatedTabsAfterLoad);
      
      // Check security of the URL
      checkSecurity(formattedUrl, dnsResolution);
    }, 500);
  };
  
  // Handle URL input
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      navigateTo(urlInput);
    }
  };
  
  // Go back in history
  const goBack = () => {
    const activeTab = getActiveTab();
    if (activeTab && activeTab.canGoBack) {
      // In a real implementation, we would use browser history
      console.log('Going back in history');
    }
  };
  
  // Go forward in history
  const goForward = () => {
    const activeTab = getActiveTab();
    if (activeTab && activeTab.canGoForward) {
      // In a real implementation, we would use browser history
      console.log('Going forward in history');
    }
  };
  
  // Refresh page
  const refreshPage = () => {
    const activeTab = getActiveTab();
    if (activeTab) {
      // Simulate reload
      const updatedTabs = tabs.map(tab => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            isLoading: true
          };
        }
        return tab;
      });
      
      setTabs(updatedTabs);
      
      // Simulate page reload completion
      setTimeout(() => {
        const updatedTabsAfterReload = tabs.map(tab => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              isLoading: false
            };
          }
          return tab;
        });
        
        setTabs(updatedTabsAfterReload);
        
        // Re-check security
        checkSecurity(activeTab.url, null);
      }, 500);
    }
  };
  
  // Check URL security
  const checkSecurity = (url: string, dnsResolution: DNSResolutionResult | null = null) => {
    let securityLevel: SecurityLevel = 'unknown';
    let message = 'Unknown security status';
    let isSecure = false;
    let isQuantumSecure = false;
    let certificate: Certificate | null = null;
    
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol;
      const domain = urlObj.hostname;
      
      // Check if domain is in FractalDNS
      const isDomainInFractalDNS = fractalDnsService.isDomainRegistered(domain);
      
      // Check protocol
      if (protocol === 'httqs:') {
        isSecure = true;
        
        // Special handling for fractal DNS domains
        if (isDomainInFractalDNS) {
          // If we have DNS resolution data
          if (dnsResolution && dnsResolution.success) {
            isQuantumSecure = dnsResolution.quantumSecure;
            securityLevel = isQuantumSecure ? 'quantum' : 'standard';
            message = isQuantumSecure ? 
              'Quantum-secure connection via FractalDNS' : 
              'Secure connection via FractalDNS';
          } else {
            // If no DNS resolution data but we know it's in FractalDNS
            isQuantumSecure = true;
            securityLevel = 'quantum';
            message = 'Quantum-secure connection via FractalDNS';
          }
          
          // Check for domains that we know are important
          if (domain.includes('atc.aifreedomtrust.com')) {
            // Special case for atc.aifreedomtrust.com
            isQuantumSecure = true;
            securityLevel = 'quantum';
            message = 'Quantum-secure connection - Official ATC Domain with Enhanced Security';
          } else if (domain.includes('aifreedomtrust.com') || 
              domain.includes('freedomtrust.com') || 
              domain.includes('AetherCore.trust')) {
            isQuantumSecure = true;
            securityLevel = 'quantum';
            message = 'Quantum-secure connection - Official FractalCoin Domain';
          }
        } else {
          // Standard HTTQS domain (not in FractalDNS)
          isQuantumSecure = true;
          securityLevel = 'quantum';
          message = 'Quantum-secure connection';
        }
        
        // Get HTTQS certificate
        const domainCerts = certificateService.getCertificatesForDomain(domain);
        const httqsCert = domainCerts.find(cert => cert.type === 'httqs' || cert.type === 'hybrid');
        if (httqsCert) {
          certificate = httqsCert;
        } else if (isDomainInFractalDNS) {
          // For FractalDNS domains, create a certificate if one doesn't exist
          const newCertificate = certificateService.createCertificate({
            domain: domain,
            type: 'httqs',
            algorithm: 'hybrid',
            validityDays: 365,
            quantumResistant: true
          });
          certificate = newCertificate;
        }
      } else if (protocol === 'https:') {
        isSecure = true;
        securityLevel = 'standard';
        message = isDomainInFractalDNS ? 
          'Secure connection via traditional HTTPS (upgrade to HTTQS available)' : 
          'Secure connection';
        
        // Get HTTPS certificate
        const domainCerts = certificateService.getCertificatesForDomain(domain);
        const httpsCert = domainCerts.find(cert => cert.type === 'https' || cert.type === 'hybrid');
        if (httpsCert) {
          certificate = httpsCert;
        }
      } else if (protocol === 'http:') {
        securityLevel = 'insecure';
        message = 'Not secure - Your connection to this site is not secure';
      } else {
        securityLevel = 'unknown';
        message = 'Unknown protocol';
      }
      
      // Update security info
      setSecurityInfo({ level: securityLevel, message });
      
      // Update tab security status and certificate
      const updatedTabs = tabs.map(tab => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            isSecure,
            isQuantumSecure,
            certificate
          };
        }
        return tab;
      });
      
      setTabs(updatedTabs);
      
    } catch (error) {
      console.error('Invalid URL:', error);
      setSecurityInfo({ 
        level: 'unknown', 
        message: 'Invalid URL' 
      });
    }
  };
  
  // Get security indicator
  const getSecurityIndicator = () => {
    const activeTab = getActiveTab();
    
    if (!activeTab) return null;
    
    switch (securityInfo.level) {
      case 'quantum':
        return (
          <div className="flex items-center text-primary cursor-pointer" onClick={() => setShowCertInfo(!showCertInfo)}>
            <Shield className="h-4 w-4 mr-1" />
            <span className="text-xs">Quantum Secure</span>
          </div>
        );
      case 'standard':
        return (
          <div className="flex items-center text-green-600 cursor-pointer" onClick={() => setShowCertInfo(!showCertInfo)}>
            <Lock className="h-4 w-4 mr-1" />
            <span className="text-xs">Secure</span>
          </div>
        );
      case 'insecure':
        return (
          <div className="flex items-center text-red-500 cursor-pointer" onClick={() => setShowCertInfo(!showCertInfo)}>
            <ShieldAlert className="h-4 w-4 mr-1" />
            <span className="text-xs">Not Secure</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-400">
            <Globe className="h-4 w-4 mr-1" />
            <span className="text-xs">Unknown</span>
          </div>
        );
    }
  };
  
  // Go to home page
  const goHome = () => {
    navigateTo('httqs://www.AetherCore.trust');
  };
  
  // Render tab content
  const renderTabContent = () => {
    const activeTab = getActiveTab();
    
    if (!activeTab) return <div className="p-4">No tab selected</div>;
    
    // In a real implementation, this would be an iframe loading the actual web content
    return (
      <div className="flex flex-col h-full">
        {/* Certificate info */}
        {showCertInfo && activeTab.certificate && (
          <Alert className="mb-4 bg-gray-100">
            <AlertDescription>
              <div className="text-sm font-medium mb-2">Certificate Information</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>Domain:</div>
                <div>{activeTab.certificate.domain}</div>
                
                <div>Issuer:</div>
                <div>{activeTab.certificate.issuer}</div>
                
                <div>Valid Until:</div>
                <div>{new Date(activeTab.certificate.expiresAt).toLocaleDateString()}</div>
                
                <div>Type:</div>
                <div>{activeTab.certificate.type}</div>
                
                <div>Algorithm:</div>
                <div>{activeTab.certificate.algorithm}</div>
                
                <div>Quantum Resistant:</div>
                <div>{activeTab.certificate.quantumResistant ? 'Yes' : 'No'}</div>
              </div>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={() => setShowCertInfo(false)}>Close</Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Simulated page content */}
        <div 
          ref={browserFrameRef}
          className="flex-1 border border-gray-200 rounded-md p-4 bg-white overflow-auto"
        >
          {activeTab.url.includes('AetherCore.trust') ? (
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-4">Welcome to AetherCore.trust</h1>
              <p className="mb-4">
                This page is secured with HTTQS (HTTP Quantum Secure) protocol, which provides 
                quantum-resistant security on top of traditional TLS.
              </p>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h2 className="text-lg font-semibold mb-2">Security Features</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Quantum-resistant cryptography</li>
                  <li>Post-quantum algorithms (CRYSTALS-Kyber, FALCON, SPHINCS+)</li>
                  <li>Hybrid encryption for maximum security</li>
                  <li>Fractal sharding of content</li>
                  <li>Zero-knowledge proofs for authentication</li>
                </ul>
              </div>
              <Button className="mr-2" onClick={() => navigateTo('https://example.com')}>
                Visit a standard HTTPS site
              </Button>
              <Button variant="outline" onClick={() => navigateTo('http://example.org')}>
                Visit a non-secure HTTP site
              </Button>
              <div className="mt-4">
                <Button onClick={() => navigateTo('httqs://www.atc.aifreedomtrust.com')}>
                  Visit ATC.AIFreedomTrust.com
                </Button>
              </div>
            </div>
          ) : activeTab.url.includes('atc.aifreedomtrust.com') ? (
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-4">AI Freedom Trust - ATC Portal</h1>
              <p className="mb-4">
                Welcome to the AI Freedom Trust ATC Portal. This site is secured with 
                quantum-resistant FractalDNS technology and HTTQS protocol.
              </p>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h2 className="text-lg font-semibold mb-2">ATC Services</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Aetherion Wallet Access</li>
                  <li>Fractal Reserve Banking</li>
                  <li>Quantum-Secure Communications</li>
                  <li>AIcoin Mining Dashboard</li>
                  <li>Decentralized Identity Management</li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-md font-semibold mb-2">Wallet Access</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Access your Aetherion quantum-resistant wallet with fractal sharding security.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Launch Wallet
                  </Button>
                </div>
                <div className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-md font-semibold mb-2">DAPP Portal</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Access decentralized applications secured by the FractalCoin network.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Open DAPP Portal
                  </Button>
                </div>
              </div>
              <Button onClick={() => navigateTo('httqs://www.AetherCore.trust')}>
                Return to AetherCore.trust
              </Button>
            </div>
          ) : activeTab.url.includes('example.com') ? (
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-4">Example.com</h1>
              <p className="mb-4">
                This is a standard HTTPS website with traditional TLS security.
              </p>
              <Button onClick={() => navigateTo('httqs://www.AetherCore.trust')}>
                Return to AetherCore.trust
              </Button>
            </div>
          ) : activeTab.url.includes('example.org') ? (
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-4">Example.org</h1>
              <p className="mb-4 text-red-500">
                This website uses insecure HTTP protocol. Your connection is not private.
              </p>
              <Button onClick={() => navigateTo('httqs://www.AetherCore.trust')}>
                Return to AetherCore.trust
              </Button>
            </div>
          ) : activeTab.url.includes('quantum-dns') ? (
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-4">FractalDNS Management</h1>
              <p className="mb-4">
                This is the management interface for FractalDNS, the quantum-secure domain name system 
                for the FractalCoin Network. Register and manage your quantum-secure domains here.
              </p>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h2 className="text-lg font-semibold mb-2">Registered Domains</h2>
                <div className="space-y-2">
                  {[
                    'www.AetherCore.trust',
                    'www.aifreedomtrust.com',
                    'atc.aifreedomtrust.com',
                    'www.atc.aifreedomtrust.com',
                    'freedomtrust.com',
                    'www.freedomtrust.com'
                  ].map(domain => (
                    <div key={domain} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                      <span className="font-medium">{domain}</span>
                      <Badge className="bg-emerald-500">Quantum Secure</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <h2 className="text-lg font-semibold mb-2">Register New Domain</h2>
                <div className="flex space-x-2">
                  <Input placeholder="Enter domain name" className="flex-1" />
                  <Button>Register Domain</Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  All domains are automatically quantum-secured with post-quantum algorithms.
                </p>
              </div>
              <Button onClick={() => navigateTo('httqs://www.AetherCore.trust')}>
                Return to AetherCore.trust
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading content for {activeTab.url}...</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-md overflow-hidden">
      {/* Browser toolbar */}
      <div className="bg-gray-100 p-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={goBack} 
            disabled={!getActiveTab()?.canGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={goForward} 
            disabled={!getActiveTab()?.canGoForward}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={refreshPage}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={goHome}
          >
            <Home className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 flex items-center relative">
            {getSecurityIndicator()}
            
            <form onSubmit={handleUrlSubmit} className="flex-1 ml-2">
              <div className="relative">
                <Input 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onFocus={() => setIsAddressBarFocused(true)}
                  onBlur={() => setIsAddressBarFocused(false)}
                  className={`pl-8 pr-4 bg-white ${isAddressBarFocused ? 'focus-within:ring-2 focus-within:ring-primary' : ''}`}
                  placeholder="Search or enter website URL"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>
          
          <Button 
            size="sm" 
            className="bg-forest-600 hover:bg-forest-700 text-white"
            onClick={() => {
              const formattedUrl = 'httqs://www.AetherCore.trust/quantum-dns';
              navigateTo(formattedUrl);
            }}
          >
            <Wifi className="h-4 w-4 mr-1" />
            <span className="text-xs">FractalDNS</span>
          </Button>
        </div>
      </div>
      
      {/* Browser tabs */}
      <div className="bg-gray-200 p-1 flex items-center border-b border-gray-300">
        <Tabs 
          value={activeTabId} 
          onValueChange={handleTabChange}
          className="flex-1"
        >
          <TabsList className="bg-transparent">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex items-center ${tab.isLoading ? 'text-gray-500' : ''}`}
              >
                <div className="mr-2 flex items-center">
                  {tab.isQuantumSecure ? (
                    <Shield className="h-3 w-3 text-primary" />
                  ) : tab.isSecure ? (
                    <Lock className="h-3 w-3 text-green-600" />
                  ) : (
                    <Globe className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                <span className="truncate max-w-[100px]">{tab.title}</span>
                <X 
                  className="ml-2 h-3 w-3 text-gray-500 hover:text-gray-800" 
                  onClick={(e) => closeTab(tab.id, e)}
                />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <Button size="icon" variant="ghost" onClick={addTab}>
          <span className="text-lg">+</span>
        </Button>
      </div>
      
      {/* Browser content */}
      <div className="flex-1 p-2 bg-gray-50 overflow-auto">
        {renderTabContent()}
      </div>
      
      {/* Browser status bar */}
      <div className="bg-gray-100 p-1 border-t border-gray-200 flex items-center text-xs text-gray-600">
        <div className="flex items-center">
          {securityInfo.level === 'quantum' && <Check className="h-3 w-3 text-primary mr-1" />}
          {securityInfo.message}
        </div>
        
        <div className="ml-auto">
          {getActiveTab()?.isLoading ? 'Loading...' : 'Ready'}
        </div>
      </div>
    </div>
  );
};

export default AetherCoreBrowser;