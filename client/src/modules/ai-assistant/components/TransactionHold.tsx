import React, { useState } from 'react';
import { TransactionHoldProps } from '../types';
import { formatAddress, formatDate, formatTokenAmount } from '../utils/formatters';
import ProgressCircle from './ProgressCircle';

/**
 * Component to display a held transaction with release options
 */
const TransactionHold: React.FC<TransactionHoldProps> = ({
  transaction,
  className = '',
  title = 'Transaction On Hold'
}) => {
  const [expanded, setExpanded] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  
  // Calculate time remaining if there's a holdUntil date
  const getTimeRemaining = () => {
    if (!transaction.holdUntil) return null;
    
    const now = new Date();
    const holdTime = new Date(transaction.holdUntil);
    const diffMs = holdTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Hold period expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m remaining`;
  };
  
  const handleRelease = async () => {
    setReleasing(true);
    
    try {
      // API call to release transaction would go here
      // await releaseTransaction(transaction.id);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Transaction released:', transaction.id);
      
      // Would normally update state or trigger a refresh
    } catch (error) {
      console.error('Error releasing transaction:', error);
    } finally {
      setReleasing(false);
    }
  };
  
  const handleReject = async () => {
    setRejecting(true);
    
    try {
      // API call to reject transaction would go here
      // await rejectTransaction(transaction.id);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Transaction rejected:', transaction.id);
      
      // Would normally update state or trigger a refresh
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    } finally {
      setRejecting(false);
    }
  };
  
  // Determine the risk level (0-100) based on hold reason
  // In a real implementation, this would come from the AI analysis
  const getRiskLevel = () => {
    if (!transaction.holdReason) return 50;
    
    const reason = transaction.holdReason.toLowerCase();
    
    if (reason.includes('critical')) return 95;
    if (reason.includes('multiple') || reason.includes('high')) return 75;
    if (reason.includes('suspicious')) return 60;
    if (reason.includes('unusual')) return 40;
    
    return 50;
  };
  
  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          <h3 className="font-medium text-yellow-800 dark:text-yellow-300">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-yellow-700 dark:text-yellow-400">
            {getTimeRemaining() || 'Manual review required'}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-yellow-700 dark:text-yellow-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Transaction details */}
      <div className="p-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">{transaction.type}</div>
            <div className="text-2xl font-bold">
              {formatTokenAmount(transaction.amount, transaction.tokenSymbol)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(transaction.timestamp, true)}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <ProgressCircle 
              value={getRiskLevel()} 
              size={50} 
              thresholds={{ low: 30, medium: 60, high: 80 }}
              showLabel
              label="Risk"
            />
          </div>
        </div>
        
        {/* Address information */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">From:</span>
            <span className="font-mono">{formatAddress(transaction.fromAddress)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">To:</span>
            <span className="font-mono">{formatAddress(transaction.toAddress)}</span>
          </div>
        </div>
        
        {/* Hold reason */}
        {transaction.holdReason && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm text-yellow-800 dark:text-yellow-300">
            <div className="font-medium mb-1">Hold Reason:</div>
            <div>{transaction.holdReason}</div>
          </div>
        )}
        
        {/* Additional details when expanded */}
        {expanded && (
          <div className="mt-4 border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Hash:</span>
              <span className="font-mono">{formatAddress(transaction.txHash, 8, 8)}</span>
            </div>
            {transaction.fee && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee:</span>
                <span>{transaction.fee}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span>{transaction.status}</span>
            </div>
            {transaction.blockNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Block:</span>
                <span>{transaction.blockNumber}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleReject}
            disabled={rejecting || releasing}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md font-medium text-sm transition-colors flex items-center justify-center"
          >
            {rejecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Rejecting...
              </>
            ) : (
              'Reject'
            )}
          </button>
          <button
            onClick={handleRelease}
            disabled={rejecting || releasing}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white rounded-md font-medium text-sm transition-colors flex items-center justify-center"
          >
            {releasing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Releasing...
              </>
            ) : (
              'Release Transaction'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHold;