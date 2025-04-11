import React, { useState, useEffect } from 'react';
import { ChatInterface, TransactionHold, secureStorage } from '../modules/ai-assistant';

const AIAssistantDemo: React.FC = () => {
  // Chat state
  const [messages, setMessages] = useState<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Transaction hold state
  const [showHold, setShowHold] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  
  // Dummy transaction data
  const dummyTransaction = {
    id: '1',
    txHash: '0x7d8b3a2c1e5f9g8h7i6j5k4l3m2n1o0p9q8r7s6t5u4v3w2x1y0z',
    amount: '1.25',
    tokenSymbol: 'ETH',
    fromAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    toAddress: '0x1f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s',
    timestamp: new Date()
  };
  
  // Dummy scan data
  const dummyScan = {
    id: '1001',
    status: 'suspicious',
    issues: [
      {
        id: '101',
        title: 'Suspicious Contract Interaction',
        severity: 'high',
        category: 'security',
        description: 'This transaction is interacting with a contract that has been flagged for suspicious activity in the past 24 hours.',
        recommendation: 'Verify the contract address through official channels before proceeding.',
        resolved: false
      },
      {
        id: '102',
        title: 'Unusual Gas Price',
        severity: 'medium',
        category: 'optimization',
        description: 'The gas price for this transaction is significantly higher than the current network average.',
        recommendation: 'Consider reducing the gas price to save on transaction fees.',
        resolved: false
      },
      {
        id: '103',
        title: 'New Recipient Address',
        severity: 'low',
        category: 'security',
        description: 'This is the first time you are sending funds to this address.',
        recommendation: 'Double-check the recipient address to ensure it is correct.',
        resolved: false
      }
    ],
    riskScore: 75
  };
  
  // Handle sending a message in the chat
  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      // Check for specific commands
      if (message.toLowerCase().includes('transaction') && message.toLowerCase().includes('suspicious')) {
        response = "I've detected a suspicious transaction. I'll put it on hold for review.";
        setShowHold(true);
      } else if (message.toLowerCase().includes('wallet') || message.toLowerCase().includes('balance')) {
        response = "Your current wallet balance is 3.45 ETH ($6,542.34). You have 3 pending transactions.";
      } else if (message.toLowerCase().includes('help')) {
        response = "I can help you with:\n- Transaction verification and security\n- Wallet monitoring\n- Phishing detection\n- Smart contract analysis\n\nJust let me know what you need!";
      } else {
        response = "I've received your message. As an AI assistant, I'm here to help with your blockchain transactions and security needs. Can you provide more details about what you'd like assistance with?";
      }
      
      // Add AI response
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };
  
  // Simulate countdown for transaction hold
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showHold && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showHold, timeRemaining]);
  
  // Handle transaction approval
  const handleApproveTransaction = () => {
    setShowHold(false);
    
    // Add system message about approval
    const approvalMessage = {
      id: Date.now().toString(),
      role: 'system' as const,
      content: "Transaction approved and submitted to the network.",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, approvalMessage]);
  };
  
  // Handle transaction rejection
  const handleRejectTransaction = () => {
    setShowHold(false);
    
    // Add system message about rejection
    const rejectionMessage = {
      id: Date.now().toString(),
      role: 'system' as const,
      content: "Transaction rejected and cancelled.",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, rejectionMessage]);
  };
  
  // Handle extending hold time
  const handleExtendTime = () => {
    setTimeRemaining(300); // Reset to 5 minutes
    
    // Add system message about extension
    const extensionMessage = {
      id: Date.now().toString(),
      role: 'system' as const,
      content: "Transaction hold time extended by 5 minutes.",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, extensionMessage]);
  };
  
  // Initialize secure storage with a demo key on mount
  useEffect(() => {
    secureStorage.initialize('demo-user-key');
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Aetherion AI Assistant Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Chat Interface</h2>
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            autoFocus={true}
            placeholder="Ask me about your transactions, security, or anything else..."
            className="h-[600px]"
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Transaction Security</h2>
          
          {showHold ? (
            <TransactionHold
              transaction={dummyTransaction}
              scan={dummyScan}
              reason="This transaction has triggered our security checks and has been put on hold for your review."
              timeRemaining={timeRemaining}
              onApprove={handleApproveTransaction}
              onReject={handleRejectTransaction}
              onExtendTime={handleExtendTime}
            />
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 h-[400px] flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Transaction Security Active</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No suspicious transactions detected at the moment. Try asking the AI to check a suspicious transaction.
              </p>
              <button
                onClick={() => handleSendMessage("Can you check a suspicious transaction for me?")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Simulate Suspicious Transaction
              </button>
            </div>
          )}
          
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-3">Security Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Wallet Health</div>
                <div className="text-xl font-semibold">92%</div>
                <div className="text-xs text-green-500">Excellent</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Phishing Protection</div>
                <div className="text-xl font-semibold">Active</div>
                <div className="text-xs text-green-500">12 threats blocked</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantDemo;