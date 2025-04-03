import React from 'react';
import { formatAddress, formatDate, formatTokenAmount } from '../utils/formatters';
import { TransactionHoldProps } from '../types';

/**
 * TransactionHold component displays a transaction that is being held
 * for security review, allowing users to release or cancel it.
 */
const TransactionHold: React.FC<TransactionHoldProps> = ({ 
  transaction, 
  className = '',
  title = 'Transaction Hold'
}) => {
  // Call these when implemented
  const handleRelease = () => {
    console.log('Release transaction:', transaction.id);
    // Implementation would call API to release transaction
  };
  
  const handleCancel = () => {
    console.log('Cancel transaction:', transaction.id);
    // Implementation would call API to cancel transaction
  };
  
  // Calculate remaining hold time
  const calculateRemainingTime = () => {
    if (!transaction.holdUntil) {
      return 'No hold period';
    }
    
    const now = new Date();
    const holdUntil = new Date(transaction.holdUntil);
    
    if (now > holdUntil) {
      return 'Hold period expired';
    }
    
    const diffMs = holdUntil.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m remaining`;
  };
  
  // Get a badge color based on risk score
  const getRiskBadgeColor = () => {
    const score = transaction.riskScore || 0;
    
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 20) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };
  
  return (
    <div className={`border rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium">{title}</h3>
        
        <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskBadgeColor()}`}>
          Risk Score: {transaction.riskScore || 'Unknown'}
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Transaction details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Transaction ID</div>
          <div className="font-mono text-sm truncate">{transaction.id}</div>
          
          <div className="text-gray-500">Type</div>
          <div className="capitalize">{transaction.type}</div>
          
          <div className="text-gray-500">Amount</div>
          <div className="font-medium">{formatTokenAmount(transaction.amount, 6, transaction.tokenSymbol)}</div>
          
          <div className="text-gray-500">From</div>
          <div className="font-mono text-sm truncate">{formatAddress(transaction.fromAddress)}</div>
          
          <div className="text-gray-500">To</div>
          <div className="font-mono text-sm truncate">{formatAddress(transaction.toAddress)}</div>
          
          <div className="text-gray-500">Network</div>
          <div>{transaction.network || 'Unknown'}</div>
          
          {transaction.fee && (
            <>
              <div className="text-gray-500">Fee</div>
              <div>{transaction.fee}</div>
            </>
          )}
          
          <div className="text-gray-500">Date</div>
          <div>{formatDate(transaction.timestamp)}</div>
        </div>
        
        {/* Hold reason */}
        {transaction.holdReason && (
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
            <div className="font-medium text-amber-800 mb-1">Hold Reason</div>
            <p className="text-amber-700">{transaction.holdReason}</p>
            <div className="mt-2 text-xs text-amber-600 font-medium">{calculateRemainingTime()}</div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-3 justify-end pt-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md 
                      hover:bg-gray-50 transition-colors"
            aria-label="Cancel transaction"
          >
            Cancel
          </button>
          
          <button
            onClick={handleRelease}
            className="px-3 py-1.5 bg-primary text-white text-sm rounded-md 
                      hover:bg-primary/90 transition-colors"
            aria-label="Release transaction"
          >
            Release
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHold;