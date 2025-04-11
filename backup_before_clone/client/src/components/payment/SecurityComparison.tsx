import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Zap, X, Check, Fingerprint, Key, RefreshCw } from 'lucide-react';

interface SecurityComparisonProps {
  className?: string;
}

const SecurityComparison: React.FC<SecurityComparisonProps> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {/* Traditional Security System */}
      <Card className="overflow-hidden border-2">
        <div className="bg-slate-100 p-4 flex items-center gap-2 border-b-2">
          <Lock className="h-5 w-5 text-slate-700" />
          <h3 className="font-semibold text-lg">Traditional Security</h3>
        </div>
        <CardContent className="p-5">
          <div className="mb-4 relative">
            <div className="h-32 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-slate-400 rounded-full flex items-center justify-center">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="w-64 h-20 z-10 relative">
                  {/* Traditional encryption visualization */}
                  <svg viewBox="0 0 250 80" className="w-full h-full">
                    <path d="M10,40 Q50,10 90,40 Q130,70 170,40 Q210,10 240,40" 
                          stroke="#6B7280" 
                          strokeWidth="3" 
                          fill="none" />
                    <path d="M10,40 Q50,70 90,40 Q130,10 170,40 Q210,70 240,40" 
                          stroke="#9CA3AF" 
                          strokeWidth="3" 
                          fill="none" 
                          strokeDasharray="5,5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <ul className="space-y-2 mt-6">
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">Standard SSL/TLS Encryption</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">PCI DSS Compliance</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">2FA Authentication</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <X className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-sm">Vulnerable to Quantum Computers</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <X className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-sm">No Temporal Entanglement</span>
            </li>
          </ul>
          
          <div className="mt-4 pt-4 border-t text-center">
            <span className="px-3 py-1 text-xs rounded-full bg-slate-200 text-slate-700">
              <Lock className="h-3 w-3 inline-block mr-1" />
              Standard Protection
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Quantum Security System */}
      <Card className="overflow-hidden border-2 border-purple-300">
        <div className="bg-purple-100 p-4 flex items-center gap-2 border-b-2 border-purple-300">
          <Shield className="h-5 w-5 text-purple-700" />
          <h3 className="font-semibold text-lg text-purple-900">Quantum Security</h3>
        </div>
        <CardContent className="p-5">
          <div className="mb-4 relative">
            <div className="h-32 rounded-lg bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200 flex items-center justify-center overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="w-64 h-20 z-10 relative">
                  {/* Quantum encryption visualization */}
                  <svg viewBox="0 0 250 80" className="w-full h-full">
                    {/* Complex interwoven paths resembling quantum entanglement */}
                    <path d="M10,40 Q30,20 50,40 Q70,60 90,40 Q110,20 130,40 Q150,60 170,40 Q190,20 210,40 Q230,60 250,40" 
                          stroke="#8B5CF6" 
                          strokeWidth="2" 
                          fill="none" />
                    <path d="M10,20 Q30,40 50,20 Q70,0 90,20 Q110,40 130,20 Q150,0 170,20 Q190,40 210,20 Q230,0 250,20" 
                          stroke="#A78BFA" 
                          strokeWidth="2" 
                          fill="none" />
                    <path d="M10,60 Q30,80 50,60 Q70,40 90,60 Q110,80 130,60 Q150,40 170,60 Q190,80 210,60 Q230,40 250,60" 
                          stroke="#7C3AED" 
                          strokeWidth="2" 
                          fill="none" />
                    
                    {/* Quantum particle effects */}
                    {[20, 60, 100, 140, 180, 220].map((x, i) => (
                      <circle key={i} cx={x} cy={40} r="3" fill="#C4B5FD">
                        <animate 
                          attributeName="opacity" 
                          values="0.3;1;0.3" 
                          dur={`${1 + (i * 0.2)}s`} 
                          repeatCount="indefinite" 
                        />
                      </circle>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <ul className="space-y-2 mt-6">
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">Quantum-Resistant Algorithms</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">Temporal Entanglement Protection</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">Recursive Fractal Encryption</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">Mandelbrot Factor Verification</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-0.5">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">Quantum Bridge Technology</span>
            </li>
          </ul>
          
          <div className="mt-4 pt-4 border-t text-center">
            <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
              <Zap className="h-3 w-3 inline-block mr-1" />
              Superior Quantum Protection
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional security features visualization */}
      <div className="md:col-span-2 grid grid-cols-3 gap-4 mt-2">
        <Card className="p-3 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <Fingerprint className="h-5 w-5 text-purple-600" />
          </div>
          <h4 className="text-sm font-medium">Biometric Verification</h4>
          <p className="text-xs text-muted-foreground mt-1">Unique quantum signature for each transaction</p>
        </Card>
        
        <Card className="p-3 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <Key className="h-5 w-5 text-purple-600" />
          </div>
          <h4 className="text-sm font-medium">Multi-Layer Encryption</h4>
          <p className="text-xs text-muted-foreground mt-1">Post-quantum cryptography algorithms</p>
        </Card>
        
        <Card className="p-3 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
          </div>
          <h4 className="text-sm font-medium">Temporal Verification</h4>
          <p className="text-xs text-muted-foreground mt-1">Time-locked validation ensuring transaction integrity</p>
        </Card>
      </div>
    </div>
  );
};

export default SecurityComparison;