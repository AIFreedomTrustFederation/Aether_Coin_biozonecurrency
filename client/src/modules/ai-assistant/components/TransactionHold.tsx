import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Clock3, Info, ShieldAlert, X } from 'lucide-react';
import { formatTimeRemaining } from '../utils/formatters';

interface TransactionHoldProps {
  transaction: {
    id: string;
    txHash: string;
    amount: string;
    tokenSymbol: string;
    fromAddress?: string;
    toAddress?: string;
    type?: string;
    timestamp: Date;
  };
  scan: {
    id: string;
    status: string;
    issues: {
      id: string;
      title: string;
      severity: string;
      category: string;
      description: string;
      recommendation: string;
      resolved: boolean;
    }[];
    issueCount?: number;
    riskScore?: number;
  };
  reason: string;
  timeRemaining: number; // in seconds
  onApprove: () => void;
  onReject: () => void;
  onExtendTime?: () => void;
  className?: string;
}

/**
 * A component that displays a transaction on hold due to security concerns
 * Allows users to approve, reject, or extend the hold time
 */
const TransactionHold: React.FC<TransactionHoldProps> = ({
  transaction,
  scan,
  reason,
  timeRemaining,
  onApprove,
  onReject,
  onExtendTime,
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [resolvedIssues, setResolvedIssues] = useState<Record<string, boolean>>({});
  
  // Sort issues by severity
  const sortedIssues = [...scan.issues].sort((a, b) => {
    const severityMap: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
      info: 0
    };
    
    return (severityMap[b.severity] || 0) - (severityMap[a.severity] || 0);
  });
  
  // Count issues by severity
  const issuesBySeverity = sortedIssues.reduce((acc, issue) => {
    const key = issue.severity as keyof typeof acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Format transaction amount
  const formattedAmount = `${transaction.amount} ${transaction.tokenSymbol}`;
  
  // Calculate progress
  const resolvedCount = Object.values(resolvedIssues).filter(Boolean).length;
  const totalIssues = sortedIssues.length;
  const progressPercent = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0;
  
  // Handle issue resolution toggle
  const toggleIssueResolved = (issueId: string) => {
    setResolvedIssues(prev => ({
      ...prev,
      [issueId]: !prev[issueId]
    }));
  };
  
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-amber-500 p-4 flex items-center gap-3">
        <ShieldAlert className="text-white" size={24} />
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">Transaction On Hold</h3>
          <p className="text-white text-sm opacity-90">Security check required</p>
        </div>
        <div className="flex items-center bg-amber-600 px-3 py-1 rounded-full">
          <Clock3 className="text-white mr-2" size={16} />
          <span className="text-white text-sm font-medium">{formatTimeRemaining(timeRemaining)}</span>
        </div>
      </div>
      
      {/* Transaction Details */}
      <div className="p-4 border-b dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Amount</span>
          <span className="font-semibold">{formattedAmount}</span>
        </div>
        
        <div className="flex items-center my-2">
          <div className="w-full max-w-[45%] truncate text-xs text-right text-gray-500">
            {transaction.fromAddress}
          </div>
          <ArrowRight className="mx-2 text-gray-400" size={14} />
          <div className="w-full max-w-[45%] truncate text-xs text-gray-500">
            {transaction.toAddress}
          </div>
        </div>
        
        <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
          <p className="text-amber-800 dark:text-amber-300 text-sm">{reason}</p>
        </div>
      </div>
      
      {/* Issues Summary */}
      <div className="p-4 border-b dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Security Issues</h4>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showDetails ? 'Hide' : 'Show'} details
          </button>
        </div>
        
        <div className="flex gap-2 mb-3">
          {issuesBySeverity.critical && (
            <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 px-2 py-1 rounded text-xs">
              {issuesBySeverity.critical} Critical
            </span>
          )}
          {issuesBySeverity.high && (
            <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 px-2 py-1 rounded text-xs">
              {issuesBySeverity.high} High
            </span>
          )}
          {issuesBySeverity.medium && (
            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 px-2 py-1 rounded text-xs">
              {issuesBySeverity.medium} Medium
            </span>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {resolvedCount} of {totalIssues} issues addressed
        </div>
      </div>
      
      {/* Expanded Issue Details */}
      {showDetails && (
        <div className="p-4 border-b dark:border-slate-700 max-h-60 overflow-y-auto">
          {sortedIssues.map(issue => (
            <div 
              key={issue.id} 
              className={`mb-3 p-3 rounded ${
                resolvedIssues[issue.id] 
                  ? 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20' 
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium text-sm">{issue.title}</h5>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{issue.description}</p>
                  
                  <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex items-start gap-2">
                    <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{issue.recommendation}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleIssueResolved(issue.id)}
                  className={`ml-2 p-1 rounded-full ${
                    resolvedIssues[issue.id] 
                      ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                      : 'text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {resolvedIssues[issue.id] ? (
                    <CheckCircle size={20} />
                  ) : (
                    <X size={20} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReject}
          className="flex-1 px-4 py-2 border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 font-medium rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          Reject Transaction
        </button>
        
        <button
          onClick={onApprove}
          className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          disabled={progressPercent < 100}
        >
          {progressPercent < 100 ? 'Address All Issues' : 'Approve Transaction'}
        </button>
      </div>
      
      {/* Footer */}
      {onExtendTime && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 text-center border-t dark:border-gray-700">
          <button
            onClick={onExtendTime}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Need more time? Extend hold period
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHold;