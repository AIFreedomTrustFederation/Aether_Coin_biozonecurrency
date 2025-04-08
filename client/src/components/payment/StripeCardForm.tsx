import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface StripeCardFormProps {
  onCardNumberChange?: (value: string) => void;
  onExpiryChange?: (value: string) => void;
  onCvcChange?: (value: string) => void;
  onNameChange?: (value: string) => void;
  isQuantumSecured?: boolean;
}

const StripeCardForm: React.FC<StripeCardFormProps> = ({
  onCardNumberChange,
  onExpiryChange,
  onCvcChange,
  onNameChange,
  isQuantumSecured = false
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [focused, setFocused] = useState<'number' | 'expiry' | 'cvc' | 'name' | null>(null);
  
  // Format card number input (add spaces every 4 digits)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    
    return parts.join(' ').trim();
  };
  
  // Format expiry date (MM/YY)
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length <= 2) {
      return v;
    }
    
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  };
  
  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
    if (onCardNumberChange) {
      onCardNumberChange(formattedValue);
    }
  };
  
  // Handle expiry change
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiry(e.target.value);
    setExpiry(formattedValue);
    if (onExpiryChange) {
      onExpiryChange(formattedValue);
    }
  };
  
  // Handle CVC change
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvc(value);
    if (onCvcChange) {
      onCvcChange(value);
    }
  };
  
  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (onNameChange) {
      onNameChange(e.target.value);
    }
  };
  
  // Determine card type based on first digits
  const getCardType = () => {
    const number = cardNumber.replace(/\s+/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    
    return 'unknown';
  };
  
  // Get card type logo
  const getCardTypeLogo = () => {
    const type = getCardType();
    
    switch (type) {
      case 'visa': 
        return <span className="text-blue-700 font-bold text-sm">VISA</span>;
      case 'mastercard': 
        return <span className="text-red-600 font-bold text-sm">MC</span>;
      case 'amex': 
        return <span className="text-blue-500 font-bold text-sm">AMEX</span>;
      case 'discover': 
        return <span className="text-orange-600 font-bold text-sm">DISC</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full">
      <Card className={`p-3 pb-5 ${isQuantumSecured ? 'border-purple-300 relative overflow-hidden' : 'border-gray-200'} rounded-xl`}>
        {/* Quantum security indicator */}
        {isQuantumSecured && (
          <div className="absolute top-0 right-0 bg-purple-100 p-1 px-2 rounded-bl-lg flex items-center gap-1">
            <Shield className="h-3 w-3 text-purple-600" />
            <span className="text-xs text-purple-700">Quantum Secured</span>
          </div>
        )}
        
        {/* Card body with background gradient */}
        <div className={`relative w-full h-full rounded-lg overflow-hidden ${isQuantumSecured ? 'bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100' : 'bg-gray-50'}`}>
          <div className="p-3">
            {/* Card logo and chip */}
            <div className="flex justify-between mb-6">
              <div className="w-12 h-8 flex items-center">
                {getCardTypeLogo() || <span className="text-gray-400 font-medium text-sm">CARD</span>}
              </div>
              <div className={`w-10 h-6 flex ${isQuantumSecured ? 'bg-gradient-to-br from-purple-300 to-indigo-300' : 'bg-gradient-to-br from-yellow-300 to-yellow-400'} rounded-md`}>
                <div className="m-auto w-6 h-4 border border-black/25 rounded-sm bg-yellow-100/80 flex flex-col justify-center items-center">
                  <div className="w-5 h-0.5 bg-black/20 mb-0.5"></div>
                  <div className="w-5 h-0.5 bg-black/20"></div>
                </div>
              </div>
            </div>
            
            {/* Card number input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  onFocus={() => setFocused('number')}
                  onBlur={() => setFocused(null)}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className={`w-full bg-transparent border-b ${focused === 'number' ? isQuantumSecured ? 'border-purple-500' : 'border-blue-500' : 'border-gray-300'} py-1 focus:outline-none text-lg tracking-wider`}
                />
                <label className={`absolute left-0 -top-4 text-xs ${focused === 'number' ? isQuantumSecured ? 'text-purple-600' : 'text-blue-600' : 'text-gray-600'}`}>
                  Card Number
                </label>
              </div>
            </div>
            
            {/* Expiry and CVC inputs */}
            <div className="flex gap-4">
              <div className="w-1/2 relative">
                <input
                  type="text"
                  value={expiry}
                  onChange={handleExpiryChange}
                  onFocus={() => setFocused('expiry')}
                  onBlur={() => setFocused(null)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`w-full bg-transparent border-b ${focused === 'expiry' ? isQuantumSecured ? 'border-purple-500' : 'border-blue-500' : 'border-gray-300'} py-1 focus:outline-none`}
                />
                <label className={`absolute left-0 -top-4 text-xs ${focused === 'expiry' ? isQuantumSecured ? 'text-purple-600' : 'text-blue-600' : 'text-gray-600'}`}>
                  Expiry Date
                </label>
              </div>
              
              <div className="w-1/2 relative">
                <input
                  type="text"
                  value={cvc}
                  onChange={handleCvcChange}
                  onFocus={() => setFocused('cvc')}
                  onBlur={() => setFocused(null)}
                  placeholder="CVC"
                  maxLength={4}
                  className={`w-full bg-transparent border-b ${focused === 'cvc' ? isQuantumSecured ? 'border-purple-500' : 'border-blue-500' : 'border-gray-300'} py-1 focus:outline-none`}
                />
                <label className={`absolute left-0 -top-4 text-xs ${focused === 'cvc' ? isQuantumSecured ? 'text-purple-600' : 'text-blue-600' : 'text-gray-600'}`}>
                  CVC
                </label>
              </div>
            </div>
            
            {/* Cardholder name input */}
            <div className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="CARDHOLDER NAME"
                  className={`w-full bg-transparent border-b ${focused === 'name' ? isQuantumSecured ? 'border-purple-500' : 'border-blue-500' : 'border-gray-300'} py-1 focus:outline-none uppercase`}
                />
                <label className={`absolute left-0 -top-4 text-xs ${focused === 'name' ? isQuantumSecured ? 'text-purple-600' : 'text-blue-600' : 'text-gray-600'}`}>
                  Cardholder Name
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quantum security visual effects (only when enabled) */}
        {isQuantumSecured && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300/5 to-indigo-300/5"></div>
            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent top-1/4 animate-pulse"></div>
            <div className="absolute w-1 h-full bg-gradient-to-b from-transparent via-indigo-400/30 to-transparent left-1/3 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StripeCardForm;