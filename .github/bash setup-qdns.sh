#!/bin/bash

echo "Setting up QDNS Manager project structure..."

# Create necessary folders
mkdir -p ./src/components/Qdns
mkdir -p ./src/services
mkdir -p ./src/types
mkdir -p ./src/styles

# Create empty CSS file
touch ./src/styles/qdns-manager.css

# Create service file
cat <<EOL > ./src/services/qdnsApi.ts
// QDNS API Service
export const qdnsApi = {
  getAllTlds: async () => fetchJson('/api/qdns/tlds'),
  getUserDomains: async () => fetchJson('/api/qdns/domains'),
  getPendingTransfers: async () => fetchJson('/api/qdns/transfers/pending'),
  registerDomain: async (data: any) => postJson('/api/qdns/domains', data),
  createTld: async (data: any) => postJson('/api/qdns/tlds', data),
  whoisLookup: async (domain: string) => fetchJson(\`/api/qdns/whois/\${domain}\`),
};

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
EOL

# Create types file
cat <<EOL > ./src/types/qdns.ts
export interface Tld {
  id: number;
  tldName: string;
  status: string;
  dnsSecEnabled: boolean;
  quantumResistant: boolean;
  whoisPrivacyDefault: boolean;
  createdAt: string;
}

export interface Domain {
  id: number;
  domainName: string;
  status: string;
  registrationDate: string;
  expirationDate: string;
  whoisPrivacy: boolean;
  autoRenew: boolean;
  dnsSecEnabled: boolean;
  quantumProtectionEnabled: boolean;
}
EOL

# Create each component
for COMPONENT in DashboardPanel MyDomainsPanel DomainRegistrationPanel TldManagementPanel WhoisLookupPanel PendingTransfersPanel; do
  cat <<EOL > ./src/components/Qdns/$COMPONENT.tsx
import React from 'react';

const $COMPONENT: React.FC = () => {
  return (
    <div>
      <h2>${COMPONENT.replace(/([A-Z])/g, ' \$1').trim()}</h2>
      <p>Coming soon...</p>
    </div>
  );
};

export default $COMPONENT;
EOL
done

# Create QdnsManager main page
cat <<EOL > ./src/pages/QdnsManager.tsx
import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useAuth } from '../hooks/useAuth';
import { qdnsApi } from '../services/qdnsApi';
import DashboardPanel from '../components/Qdns/DashboardPanel';
import MyDomainsPanel from '../components/Qdns/MyDomainsPanel';
import DomainRegistrationPanel from '../components/Qdns/DomainRegistrationPanel';
import TldManagementPanel from '../components/Qdns/TldManagementPanel';
import WhoisLookupPanel from '../components/Qdns/WhoisLookupPanel';
import PendingTransfersPanel from '../components/Qdns/PendingTransfersPanel';
import '../styles/qdns-manager.css';

const QdnsManager: React.FC = () => {
  const { authState } = useAuth();
  const user = authState.user;

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tlds, setTlds] = useState([]);
  const [domains, setDomains] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tldsData, domainsData, transfersData] = await Promise.all([
        qdnsApi.getAllTlds(),
        qdnsApi.getUserDomains(),
        qdnsApi.getPendingTransfers()
      ]);
      setTlds(tldsData.tlds || []);
      setDomains(domainsData.domains || []);
      setPendingTransfers(transfersData.transfers || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  return (
    <div className="qdns-manager">
      <h1>QDNS Manager</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
          <TabList>
            <Tab>Dashboard</Tab>
            <Tab>My Domains</Tab>
            <Tab>Register Domain</Tab>
            {user?.isTrustMember && <Tab>Manage TLDs</Tab>}
            <Tab>WHOIS Lookup</Tab>
            {pendingTransfers.length > 0 && <Tab>Pending Transfers ({pendingTransfers.length})</Tab>}
          </TabList>

          <TabPanel><DashboardPanel /></TabPanel>
          <TabPanel><MyDomainsPanel /></TabPanel>
          <TabPanel><DomainRegistrationPanel /></TabPanel>
          {user?.isTrustMember && <TabPanel><TldManagementPanel /></TabPanel>}
          <TabPanel><WhoisLookupPanel /></TabPanel>
          {pendingTransfers.length > 0 && <TabPanel><PendingTransfersPanel /></TabPanel>}
        </Tabs>
      )}
    </div>
  );
};

export default QdnsManager;
EOL

echo "✅ QDNS Manager structure created successfully!"
echo "Please ensure to install the necessary dependencies for React Tabs and any other required libraries."
echo "You can now start building your QDNS Manager application."
echo "To run the application, use the command: npm start"
echo "Happy coding! 🎉"