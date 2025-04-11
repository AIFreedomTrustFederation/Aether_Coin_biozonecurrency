import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  BarChart4,
  Calendar,
  List,
  ArrowUpCircle,
  ArrowDownCircle,
  ExternalLink,
  Search,
  Info
} from 'lucide-react';
import { formatDate, formatDuration } from '../utils/formatters';
import { useAI } from '../contexts/AIContext';
import { SecurityHistoryProps } from '../types';
import ProgressCircle from './ProgressCircle';

/**
 * SecurityHistory component displays a history of AI-powered security scans
 * and allows users to view issues and take action on them.
 */
const SecurityHistory: React.FC<SecurityHistoryProps> = ({ className = '' }) => {
  const { state, resolveSecurityIssue } = useAI();
  const { securityScans } = state;
  const [activeTab, setActiveTab] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  
  // Format scanType to more readable form
  const formatScanType = (scanType: string): string => {
    return scanType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };
  
  // Get badge variant based on issue severity
  const getSeverityBadge = (severity: string) => {
    const severityMap: Record<string, { variant: string, icon: React.ReactNode }> = {
      critical: { 
        variant: 'destructive', 
        icon: <AlertCircle className="h-3 w-3 mr-1" /> 
      },
      high: { 
        variant: 'destructive', 
        icon: <ArrowUpCircle className="h-3 w-3 mr-1" /> 
      },
      medium: { 
        variant: 'default', 
        icon: <Info className="h-3 w-3 mr-1" /> 
      },
      low: { 
        variant: 'secondary', 
        icon: <ArrowDownCircle className="h-3 w-3 mr-1" /> 
      },
      info: { 
        variant: 'outline', 
        icon: <Info className="h-3 w-3 mr-1" /> 
      }
    };
    
    const config = severityMap[severity.toLowerCase()] || severityMap.info;
    
    return (
      <Badge variant={config.variant as any} className="capitalize">
        {config.icon}
        {severity}
      </Badge>
    );
  };
  
  // Calculate statistics from scans
  const stats = useMemo(() => {
    // Count total scans
    const totalScans = securityScans.length;
    
    // Count total issues
    const totalIssues = securityScans.reduce((acc, scan) => 
      acc + scan.issues.length, 0
    );
    
    // Count resolved issues
    const resolvedIssues = securityScans.reduce((acc, scan) => 
      acc + scan.issues.filter(issue => issue.resolved).length, 0
    );
    
    // Count by severity
    const issuesBySeverity = securityScans.reduce((acc, scan) => {
      scan.issues.forEach(issue => {
        const severity = issue.severity.toLowerCase();
        acc[severity] = (acc[severity] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    // Last scan date
    const lastScanDate = securityScans.length > 0 
      ? new Date(Math.max(...securityScans.map(s => new Date(s.timestamp).getTime())))
      : null;
    
    return {
      totalScans,
      totalIssues,
      resolvedIssues,
      issuesBySeverity,
      lastScanDate,
      resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0
    };
  }, [securityScans]);
  
  // Sort scans by timestamp (newest first)
  const sortedScans = [...securityScans].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Filter scans based on active tab
  const filteredScans = useMemo(() => {
    if (activeTab === 'all') return sortedScans;
    return sortedScans.filter(scan => scan.type.toLowerCase() === activeTab.toLowerCase());
  }, [sortedScans, activeTab]);
  
  // Open scan details dialog
  const openScanDetails = (scan: any) => {
    setSelectedScan(scan);
    setDialogOpen(true);
  };
  
  // Handle issue resolution
  const handleResolveIssue = () => {
    if (!selectedScan || !selectedIssue) return;
    
    resolveSecurityIssue(selectedScan.id, selectedIssue.id);
    setSelectedIssue(null);
  };
  
  // Get severity count badge color
  const getSeverityCountColor = (severity: string): string => {
    const colorMap: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      info: 'bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-300'
    };
    
    return colorMap[severity.toLowerCase()] || 'bg-slate-100 text-slate-800';
  };
  
  // Render overview cards
  const renderOverviewCards = () => {
    if (securityScans.length === 0) {
      return (
        <div className="text-center py-8">
          <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Security Scans Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            When AI completes security scans of your wallet and transactions, 
            the results will appear here.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Scans Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Scans
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.totalScans}
                </h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Search className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last scan {stats.lastScanDate ? formatDate(stats.lastScanDate, false, true) : 'never'}
            </p>
          </CardContent>
        </Card>
        
        {/* Issues Found Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Issues Found
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.totalIssues}
                </h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(stats.issuesBySeverity).map(([severity, count]) => (
                <span 
                  key={severity}
                  className={`px-2 py-0.5 rounded-full text-xs ${getSeverityCountColor(severity)}`}
                >
                  {severity}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Resolution Rate Card */}
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Resolution Rate
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {Math.round(stats.resolutionRate)}%
              </h3>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.resolvedIssues} of {stats.totalIssues} issues resolved
              </p>
            </div>
            <ProgressCircle 
              percentage={stats.resolutionRate}
              size={60}
              strokeWidth={8}
              color={stats.resolutionRate > 70 ? 'var(--primary)' : 'var(--warning)'}
            >
              <div className="text-sm font-medium">
                {Math.round(stats.resolutionRate)}%
              </div>
            </ProgressCircle>
          </CardContent>
        </Card>
        
        {/* Security Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Security Status
                </p>
                <h3 className="text-2xl font-bold mt-1 flex items-center">
                  {stats.totalIssues === 0 ? (
                    <>
                      <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                      Secure
                    </>
                  ) : stats.issuesBySeverity.critical || stats.issuesBySeverity.high ? (
                    <>
                      <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
                      At Risk
                    </>
                  ) : (
                    <>
                      <Info className="h-5 w-5 text-yellow-500 mr-2" />
                      Attention Needed
                    </>
                  )}
                </h3>
              </div>
              <div className={`p-2 rounded-full ${
                stats.totalIssues === 0 
                  ? 'bg-green-100 dark:bg-green-950' 
                  : stats.issuesBySeverity.critical || stats.issuesBySeverity.high
                    ? 'bg-red-100 dark:bg-red-950'
                    : 'bg-yellow-100 dark:bg-yellow-950'
              }`}>
                {stats.totalIssues === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : stats.issuesBySeverity.critical || stats.issuesBySeverity.high ? (
                  <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.totalIssues === 0 
                ? 'No security issues detected'
                : stats.issuesBySeverity.critical 
                  ? `${stats.issuesBySeverity.critical || 0} critical issues found`
                  : stats.issuesBySeverity.high
                    ? `${stats.issuesBySeverity.high || 0} high severity issues found`
                    : `${stats.totalIssues} minor issues found`
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render scan table
  const renderScanTable = () => {
    if (filteredScans.length === 0) {
      return (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <Search className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Scans Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {activeTab === 'all' 
              ? "No security scans have been performed yet."
              : `No ${formatScanType(activeTab)} scans have been performed yet.`
            }
          </p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Focus</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Issues</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredScans.map((scan, index) => {
            // Count issues by severity
            const issueCount = {
              total: scan.issues.length,
              resolved: scan.issues.filter(issue => issue.resolved).length,
              critical: scan.issues.filter(c => c.severity.toLowerCase() === 'critical').length,
              high: scan.issues.filter(c => c.severity.toLowerCase() === 'high').length,
              medium: scan.issues.filter(c => c.severity.toLowerCase() === 'medium').length,
              low: scan.issues.filter(c => c.severity.toLowerCase() === 'low').length,
              info: scan.issues.filter(c => c.severity.toLowerCase() === 'info').length
            };
            
            return (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">
                    {formatDate(scan.timestamp, false)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(scan.timestamp, true, false)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {formatScanType(scan.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="truncate block max-w-[120px]">
                    {scan.focus}
                  </span>
                </TableCell>
                <TableCell>
                  {formatDuration(scan.durationMs)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {issueCount.critical > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {issueCount.critical}
                      </Badge>
                    )}
                    {issueCount.high > 0 && (
                      <Badge variant="default" className="text-xs">
                        {issueCount.high}
                      </Badge>
                    )}
                    {issueCount.medium + issueCount.low + issueCount.info > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {issueCount.medium + issueCount.low + issueCount.info}
                      </Badge>
                    )}
                    {issueCount.total === 0 && (
                      <Badge variant="outline" className="text-xs">
                        0
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-1">
                      {issueCount.resolved > 0 && `(${issueCount.resolved} fixed)`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {scan.status === 'completed' ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                      <Clock className="h-3 w-3 mr-1" />
                      {scan.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openScanDetails(scan)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };
  
  // Render scan details dialog
  const renderScanDetailsDialog = () => {
    if (!selectedScan) return null;
    
    // Count issues by severity
    const issueCount = {
      total: selectedScan.issues.length,
      resolved: selectedScan.issues.filter((issue: any) => issue.resolved).length,
      pending: selectedScan.issues.filter((issue: any) => !issue.resolved).length
    };
    
    // Group issues by category
    const issuesByCategory = selectedScan.issues.reduce((groups: any, issue: any) => {
      const category = issue.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(issue);
      return groups;
    }, {});
    
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Security Scan Details
            </DialogTitle>
            <DialogDescription>
              {formatScanType(selectedScan.type)} scan performed on {formatDate(selectedScan.timestamp)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Scan Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Focus</span>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="font-medium">{selectedScan.focus}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Duration</span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="font-medium">{formatDuration(selectedScan.durationMs)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Issues</span>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="font-medium">
                    {issueCount.total} found, {issueCount.resolved} resolved
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <BarChart4 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="font-medium capitalize">{selectedScan.status}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Issues List */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <List className="h-5 w-5" />
                Issues ({issueCount.total})
              </h3>
              
              {selectedScan.issues.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                    <p className="text-muted-foreground">
                      No security issues were detected during this scan.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="all">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="all">
                        All ({issueCount.total})
                      </TabsTrigger>
                      <TabsTrigger value="pending">
                        Pending ({issueCount.pending})
                      </TabsTrigger>
                      <TabsTrigger value="resolved">
                        Resolved ({issueCount.resolved})
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="space-y-6">
                    {Object.entries(issuesByCategory).map(([category, issues]: [string, any]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium mb-3 text-muted-foreground">{category}</h4>
                        <div className="space-y-3">
                          {issues.map((issue: any) => (
                            <Card key={issue.id} className={issue.resolved ? 'border-green-200 dark:border-green-800/40 bg-green-50/50 dark:bg-green-950/20' : ''}>
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-base">{issue.title}</CardTitle>
                                  {getSeverityBadge(issue.severity)}
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0 pb-2">
                                <CardDescription className="text-foreground/80">
                                  {issue.description}
                                </CardDescription>
                              </CardContent>
                              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {issue.resolved 
                                    ? `Resolved ${formatDate(issue.resolvedAt, false, true)}`
                                    : `Detected ${formatDate(issue.detectedAt, false, true)}`
                                  }
                                </div>
                                {issue.resolved ? (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolved
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedIssue(issue)}
                                  >
                                    Mark as Resolved
                                  </Button>
                                )}
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="pending" className="space-y-3">
                    {selectedScan.issues.filter((issue: any) => !issue.resolved).length === 0 ? (
                      <div className="text-center py-12 border rounded-md">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">All Issues Resolved</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          All security issues from this scan have been resolved.
                        </p>
                      </div>
                    ) : (
                      selectedScan.issues.filter((issue: any) => !issue.resolved).map((issue: any) => (
                        <Card key={issue.id}>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{issue.title}</CardTitle>
                              {getSeverityBadge(issue.severity)}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 pb-2">
                            <CardDescription className="text-foreground/80">
                              {issue.description}
                            </CardDescription>
                            
                            <div className="mt-3 bg-muted/50 p-3 rounded-md">
                              <div className="text-sm font-medium mb-1">Recommendation:</div>
                              <div className="text-sm">{issue.recommendation}</div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-2 flex justify-between items-center">
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Detected {formatDate(issue.detectedAt, false, true)}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedIssue(issue)}
                            >
                              Mark as Resolved
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="resolved" className="space-y-3">
                    {selectedScan.issues.filter((issue: any) => issue.resolved).length === 0 ? (
                      <div className="text-center py-12 border rounded-md">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Resolved Issues</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          None of the security issues from this scan have been resolved yet.
                        </p>
                      </div>
                    ) : (
                      selectedScan.issues.filter((issue: any) => issue.resolved).map((issue: any) => (
                        <Card key={issue.id} className="border-green-200 dark:border-green-800/40 bg-green-50/50 dark:bg-green-950/20">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{issue.title}</CardTitle>
                              {getSeverityBadge(issue.severity)}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 pb-2">
                            <CardDescription className="text-foreground/80">
                              {issue.description}
                            </CardDescription>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between items-center">
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Resolved {formatDate(issue.resolvedAt, false, true)}
                            </div>
                            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render confirmation dialog
  const renderConfirmationDialog = () => {
    if (!selectedIssue) return null;
    
    return (
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Mark Issue as Resolved
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this issue as resolved?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3">
            <div className="bg-muted p-3 rounded-md mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{selectedIssue.title}</h3>
                {getSeverityBadge(selectedIssue.severity)}
              </div>
              <p className="text-sm">{selectedIssue.description}</p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              If you've addressed this issue according to the recommendations, 
              you can mark it as resolved. This action can be verified in future security scans.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedIssue(null)}>
              Cancel
            </Button>
            <Button onClick={handleResolveIssue}>
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Security History</h2>
      </div>
      
      {renderOverviewCards()}
      
      <div>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All Scans</TabsTrigger>
              <TabsTrigger value="wallet_scan">Wallet</TabsTrigger>
              <TabsTrigger value="transaction_scan">Transactions</TabsTrigger>
              <TabsTrigger value="smart_contract_scan">Smart Contracts</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {renderScanTable()}
          </TabsContent>
          
          <TabsContent value="wallet_scan" className="mt-0">
            {renderScanTable()}
          </TabsContent>
          
          <TabsContent value="transaction_scan" className="mt-0">
            {renderScanTable()}
          </TabsContent>
          
          <TabsContent value="smart_contract_scan" className="mt-0">
            {renderScanTable()}
          </TabsContent>
        </Tabs>
      </div>
      
      {renderScanDetailsDialog()}
      {renderConfirmationDialog()}
    </div>
  );
};

export default SecurityHistory;