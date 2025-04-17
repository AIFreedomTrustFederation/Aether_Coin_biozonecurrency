import React, { useState, useEffect } from 'react';
import { 
  fractalDnsService, 
  DnsZone, 
  DnsRecord, 
  RecordType 
} from '../services/dns/fractalDnsService';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { QuantumLoader } from '@/components/ui/quantum-loader';

/**
 * FractalDNS Manager component
 * Provides UI for managing FractalDNS TLD zones and records
 */
const FractalDnsManager: React.FC = () => {
  // State for zones
  const [zones, setZones] = useState<DnsZone[]>([]);
  const [currentZone, setCurrentZone] = useState<DnsZone | null>(null);
  const [records, setRecords] = useState<DnsRecord[]>([]);
  
  // State for form inputs
  const [newTld, setNewTld] = useState('');
  const [newRecord, setNewRecord] = useState<Partial<DnsRecord>>({
    domain: '',
    type: RecordType.A,
    value: '',
    ttl: 3600
  });
  
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [createZoneOpen, setCreateZoneOpen] = useState(false);
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const [confirmDeleteZone, setConfirmDeleteZone] = useState(false);
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState<DnsRecord | null>(null);
  
  // Fetch zones on component mount
  useEffect(() => {
    loadZones();
  }, []);
  
  // Load zones from the server
  const loadZones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const zonesData = await fractalDnsService.getZones();
      setZones(zonesData);
      
      // Load the first zone if available
      if (zonesData.length > 0 && !currentZone) {
        handleSelectZone(zonesData[0]);
      }
    } catch (err) {
      setError('Failed to load DNS zones. Please try again later.');
      console.error('Failed to load zones:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load records for a specific zone
  const loadZoneRecords = async (tld: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fractalDnsService.getZone(tld);
      setRecords(response.records || []);
    } catch (err) {
      setError(`Failed to load records for zone .${tld}`);
      console.error(`Failed to load records for zone .${tld}:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle zone selection
  const handleSelectZone = async (zone: DnsZone) => {
    setCurrentZone(zone);
    await loadZoneRecords(zone.name);
  };
  
  // Create a new zone
  const handleCreateZone = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newTld.trim()) {
        setError('Please enter a valid TLD name');
        return;
      }
      
      await fractalDnsService.createZone(newTld.trim());
      setSuccess(`Zone .${newTld} created successfully`);
      setNewTld('');
      setCreateZoneOpen(false);
      
      // Reload zones
      await loadZones();
    } catch (err) {
      setError(`Failed to create zone .${newTld}`);
      console.error(`Failed to create zone .${newTld}:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a zone
  const handleDeleteZone = async () => {
    try {
      if (!currentZone) return;
      
      setLoading(true);
      setError(null);
      
      await fractalDnsService.deleteZone(currentZone.name);
      setSuccess(`Zone .${currentZone.name} deleted successfully`);
      setConfirmDeleteZone(false);
      
      // Reload zones
      await loadZones();
      setCurrentZone(null);
      setRecords([]);
    } catch (err) {
      setError(`Failed to delete zone .${currentZone?.name}`);
      console.error(`Failed to delete zone .${currentZone?.name}:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new record
  const handleCreateRecord = async () => {
    try {
      if (!currentZone) return;
      
      setLoading(true);
      setError(null);
      
      if (!newRecord.domain || !newRecord.value) {
        setError('Please enter a valid domain and value');
        return;
      }
      
      // Create record
      await fractalDnsService.addRecord(
        currentZone.name, 
        newRecord as DnsRecord
      );
      
      setSuccess(`Record ${newRecord.domain}.${currentZone.name} created successfully`);
      setCreateRecordOpen(false);
      
      // Reset form
      setNewRecord({
        domain: '',
        type: RecordType.A,
        value: '',
        ttl: 3600
      });
      
      // Reload records
      await loadZoneRecords(currentZone.name);
    } catch (err) {
      setError(`Failed to create record ${newRecord.domain}.${currentZone?.name}`);
      console.error(`Failed to create record:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a record
  const handleDeleteRecord = async () => {
    try {
      if (!currentZone || !confirmDeleteRecord) return;
      
      setLoading(true);
      setError(null);
      
      await fractalDnsService.deleteRecord(
        currentZone.name,
        confirmDeleteRecord.domain,
        confirmDeleteRecord.type
      );
      
      setSuccess(`Record ${confirmDeleteRecord.domain}.${currentZone.name} deleted successfully`);
      setConfirmDeleteRecord(null);
      
      // Reload records
      await loadZoneRecords(currentZone.name);
    } catch (err) {
      setError(`Failed to delete record`);
      console.error(`Failed to delete record:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  // Export a zone to BIND format
  const handleExportZone = async () => {
    try {
      if (!currentZone) return;
      
      setLoading(true);
      
      const response = await fractalDnsService.exportZone(currentZone.name);
      
      // Create a download link
      const blob = new Blob([response.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentZone.name}.zone`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess(`Zone .${currentZone.name} exported successfully`);
    } catch (err) {
      setError(`Failed to export zone .${currentZone?.name}`);
      console.error(`Failed to export zone:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render record type badge
  const renderRecordTypeBadge = (type: RecordType) => {
    let badgeColor = '';
    
    switch (type) {
      case RecordType.A:
        badgeColor = 'bg-blue-700/20 text-blue-500';
        break;
      case RecordType.AAAA:
        badgeColor = 'bg-green-700/20 text-green-500';
        break;
      case RecordType.CNAME:
        badgeColor = 'bg-purple-700/20 text-purple-500';
        break;
      case RecordType.MX:
        badgeColor = 'bg-yellow-700/20 text-yellow-500';
        break;
      case RecordType.TXT:
        badgeColor = 'bg-red-700/20 text-red-500';
        break;
      case RecordType.NS:
        badgeColor = 'bg-indigo-700/20 text-indigo-500';
        break;
      default:
        badgeColor = 'bg-gray-700/20 text-gray-500';
    }
    
    return (
      <Badge className={badgeColor}>
        {type}
      </Badge>
    );
  };
  
  // Render message alerts
  const renderAlerts = () => (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-700/20 text-green-500 border-green-700">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </>
  );
  
  if (loading && zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <QuantumLoader variant="cosmos" size="lg" showLabel labelText="Loading FractalDNS Manager..." />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">FractalDNS Manager</h1>
      <p className="text-gray-400 mb-8">
        Manage your quantum-resistant decentralized DNS zones and records.
      </p>
      
      {renderAlerts()}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Zones Sidebar */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>TLD Zones</span>
                <Button 
                  size="sm" 
                  onClick={() => setCreateZoneOpen(true)}
                  className="ml-2"
                >
                  Add Zone
                </Button>
              </CardTitle>
              <CardDescription>
                Top-level domains managed by FractalDNS
              </CardDescription>
            </CardHeader>
            <CardContent>
              {zones.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No zones found.</p>
                  <p>Create your first TLD zone.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {zones.map((zone) => (
                    <Button
                      key={zone.name}
                      variant={currentZone?.name === zone.name ? "default" : "outline"}
                      onClick={() => handleSelectZone(zone)}
                      className="w-full justify-between"
                    >
                      <span>.{zone.name}</span>
                      <Badge>
                        {zone.recordCount} records
                      </Badge>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-9">
          {!currentZone ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>FractalDNS Management Dashboard</CardTitle>
                <CardDescription>
                  Select a zone from the sidebar or create a new one to manage DNS records
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="mb-6">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mx-auto h-16 w-16 text-gray-500 mb-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" 
                    />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">No Zone Selected</h3>
                  <p className="text-gray-500">
                    Select a zone from the sidebar or create a new one to get started
                  </p>
                </div>
                <Button onClick={() => setCreateZoneOpen(true)}>
                  Create New TLD Zone
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>.{currentZone.name} Zone</CardTitle>
                    <CardDescription>
                      Manage DNS records for .{currentZone.name} domain
                    </CardDescription>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleExportZone}
                    >
                      Export
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setConfirmDeleteZone(true)}
                    >
                      Delete Zone
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(currentZone.updated).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total records: {records.length}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setCreateRecordOpen(true)}
                  >
                    Add Record
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                {records.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No records found for this zone.</p>
                    <p>Create your first DNS record.</p>
                  </div>
                ) : (
                  <Table>
                    <TableCaption>DNS Records for .{currentZone.name}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>TTL</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {record.domain}.{currentZone.name}
                          </TableCell>
                          <TableCell>
                            {renderRecordTypeBadge(record.type)}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {record.value}
                          </TableCell>
                          <TableCell>
                            {record.ttl || 3600}s
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setConfirmDeleteRecord(record)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Create Zone Dialog */}
      <Dialog open={createZoneOpen} onOpenChange={setCreateZoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New TLD Zone</DialogTitle>
            <DialogDescription>
              Create a new top-level domain (TLD) zone in the FractalDNS system.
              This will create a quantum-secure, decentralized DNS zone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tld">Top-Level Domain Name</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg">.</span>
                <Input
                  id="tld"
                  placeholder="example"
                  value={newTld}
                  onChange={(e) => setNewTld(e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-500">
                Only lowercase letters, numbers, and hyphens are allowed.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateZoneOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateZone} disabled={loading}>
              {loading ? 'Creating...' : 'Create Zone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Record Dialog */}
      <Dialog open={createRecordOpen} onOpenChange={setCreateRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add DNS Record</DialogTitle>
            <DialogDescription>
              {currentZone && (
                <>Add a new DNS record to the .{currentZone.name} zone.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="domain"
                  placeholder="example"
                  value={newRecord.domain}
                  onChange={(e) => setNewRecord({ ...newRecord, domain: e.target.value })}
                />
                <span className="text-lg">.{currentZone?.name}</span>
              </div>
              <p className="text-sm text-gray-500">
                The domain name without the TLD
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Record Type</Label>
              <Select
                defaultValue={newRecord.type}
                onValueChange={(value) => setNewRecord({ ...newRecord, type: value as RecordType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Record Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RecordType.A}>A - IPv4 Address</SelectItem>
                  <SelectItem value={RecordType.AAAA}>AAAA - IPv6 Address</SelectItem>
                  <SelectItem value={RecordType.CNAME}>CNAME - Canonical Name</SelectItem>
                  <SelectItem value={RecordType.MX}>MX - Mail Exchange</SelectItem>
                  <SelectItem value={RecordType.TXT}>TXT - Text</SelectItem>
                  <SelectItem value={RecordType.NS}>NS - Name Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                placeholder="Value"
                value={newRecord.value}
                onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
              />
              <p className="text-sm text-gray-500">
                {newRecord.type === RecordType.A && 'IPv4 address (e.g. 192.168.1.1)'}
                {newRecord.type === RecordType.AAAA && 'IPv6 address (e.g. 2001:db8::1)'}
                {newRecord.type === RecordType.CNAME && 'Target domain name (e.g. example.com)'}
                {newRecord.type === RecordType.MX && 'Mail server (e.g. mail.example.com)'}
                {newRecord.type === RecordType.TXT && 'Text value (e.g. v=spf1 include:_spf.example.com -all)'}
                {newRecord.type === RecordType.NS && 'Name server (e.g. ns1.example.com)'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ttl">TTL (Time to Live)</Label>
              <Input
                id="ttl"
                type="number"
                placeholder="3600"
                value={newRecord.ttl}
                onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) })}
              />
              <p className="text-sm text-gray-500">
                Time in seconds that resolvers should cache this record
              </p>
            </div>
            
            {newRecord.type === RecordType.MX && (
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="10"
                  value={newRecord.priority || 10}
                  onChange={(e) => setNewRecord({ ...newRecord, priority: parseInt(e.target.value) })}
                />
                <p className="text-sm text-gray-500">
                  Priority for MX records (lower values have higher priority)
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateRecordOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRecord} disabled={loading}>
              {loading ? 'Adding...' : 'Add Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Zone Confirmation Dialog */}
      <Dialog open={confirmDeleteZone} onOpenChange={setConfirmDeleteZone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the .{currentZone?.name} zone?
              This action cannot be undone and will delete all records
              associated with this zone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteZone(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteZone}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Zone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Record Confirmation Dialog */}
      <Dialog 
        open={!!confirmDeleteRecord} 
        onOpenChange={(open) => !open && setConfirmDeleteRecord(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the record 
              {confirmDeleteRecord && (
                <strong> {confirmDeleteRecord.domain}.{currentZone?.name} </strong>
              )}
              of type 
              {confirmDeleteRecord && (
                <strong> {confirmDeleteRecord.type}</strong>
              )}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteRecord(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRecord}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FractalDnsManager;