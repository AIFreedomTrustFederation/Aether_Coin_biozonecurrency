import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useAuth } from '../hooks/useAuth';
import {
  DomainStatus,
  NameserverStatus
} from '../../shared/qdns-schema';
import qdnsApi from '../services/qdnsApi'; // assuming you move API to services (optional, but cleaner)

const QdnsManager: React.FC = () => {
  const { authState } = useAuth();
  const user = authState.user;

  const [activeTab, setActiveTab] = useState(0);
  const [tlds, setTlds] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const tldsResponse = await qdnsApi.getAllTlds();
      setTlds(tldsResponse.tlds || []);

      if (user) {
        const domainsResponse = await qdnsApi.getUserDomains();
        setDomains(domainsResponse.domains || []);

        const transfersResponse = await qdnsApi.getPendingTransfers();
        setPendingTransfers(transfersResponse.transfers || []);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching QDNS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDomainRegistration = async (domainName: string) => {
    try {
      setSuccess(null);
      await qdnsApi.registerDomain({ domainName });
      setSuccess(`Domain ${domainName} registered successfully.`);
      await fetchData(); // refresh domains
    } catch (err: any) {
      setError(err.message || 'Failed to register domain');
    }
  };

  const handleCreateTld = async (newTldName: string) => {
    try {
      setSuccess(null);
      await qdnsApi.createTld({ tldName: newTldName });
      setSuccess(`TLD .${newTldName} created successfully.`);
      await fetchData(); // refresh TLDs
    } catch (err: any) {
      setError(err.message || 'Failed to create TLD');
    }
  };

  return (
    <div className="qdns-manager">
      <h1>QDNS Manager</h1>
      <p>Manage your domains and TLDs with Quantum DNS</p>

      {loading ? (
        <div className="loading">Loading QDNS data...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : (
        <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
          <TabList>
            <Tab>Dashboard</Tab>
            <Tab>My Domains</Tab>
            <Tab>Domain Registration</Tab>
            {user?.isTrustMember && <Tab>TLD Management</Tab>}
            <Tab>WHOIS Lookup</Tab>
            {pendingTransfers.length > 0 && (
              <Tab>Pending Transfers ({pendingTransfers.length})</Tab>
            )}
          </TabList>

          <TabPanel>
            <DashboardPanel tlds={tlds} domains={domains} pendingTransfers={pendingTransfers} />
          </TabPanel>
          <TabPanel>
            <MyDomainsPanel domains={domains} />
          </TabPanel>
          <TabPanel>
            <DomainRegistrationPanel tlds={tlds} />
          </TabPanel>
          {user?.isTrustMember && (
            <TabPanel>
              <TldManagementPanel tlds={tlds} />
            </TabPanel>
          )}
          <TabPanel>
            <WhoisLookupPanel />
          </TabPanel>
          {pendingTransfers.length > 0 && (
            <TabPanel>
              <PendingTransfersPanel transfers={pendingTransfers} />
            </TabPanel>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default QdnsManager;
