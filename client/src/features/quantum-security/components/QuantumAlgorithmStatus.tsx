import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Server, Cpu, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AlgorithmStatus {
  name: string;
  status: 'active' | 'testing' | 'development' | 'deprecated';
  progress: number;
  description: string;
  type: 'encryption' | 'signature' | 'key-exchange';
  implementationDate?: string;
  securityLevel: 'high' | 'very-high' | 'maximum';
}

const quantumAlgorithms: AlgorithmStatus[] = [
  {
    name: 'CRYSTAL-Kyber',
    status: 'active',
    progress: 92,
    description: 'Module-lattice-based key encapsulation mechanism, NIST standardized',
    type: 'key-exchange',
    implementationDate: '2023-05-15',
    securityLevel: 'very-high',
  },
  {
    name: 'CRYSTAL-Dilithium',
    status: 'active',
    progress: 88,
    description: 'Lattice-based digital signature algorithm, NIST standardized',
    type: 'signature',
    implementationDate: '2023-06-22',
    securityLevel: 'very-high',
  },
  {
    name: 'SPHINCS+',
    status: 'active',
    progress: 85,
    description: 'Stateless hash-based signature scheme, highly conservative design',
    type: 'signature',
    implementationDate: '2023-07-10',
    securityLevel: 'maximum',
  },
  {
    name: 'Falcon',
    status: 'testing',
    progress: 76,
    description: 'Fast-Fourier lattice-based compact signatures',
    type: 'signature',
    securityLevel: 'very-high',
  },
  {
    name: 'FrodoKEM',
    status: 'testing',
    progress: 72,
    description: 'Simple lattice-based key encapsulation mechanism with conservative parameters',
    type: 'key-exchange',
    securityLevel: 'maximum',
  },
  {
    name: 'BIKE',
    status: 'development',
    progress: 65,
    description: 'Bit flipping key encapsulation based on QC-MDPC codes',
    type: 'key-exchange',
    securityLevel: 'high',
  },
  {
    name: 'HQC',
    status: 'development',
    progress: 58,
    description: 'Hamming Quasi-Cyclic based encryption',
    type: 'encryption',
    securityLevel: 'high',
  },
  {
    name: 'SIKE',
    status: 'deprecated',
    progress: 30,
    description: 'Supersingular isogeny key exchange (vulnerable to recent attacks)',
    type: 'key-exchange',
    securityLevel: 'high',
  },
];

const classicAlgorithms = [
  {
    name: 'AES-256-GCM',
    status: 'active',
    progress: 100,
    description: 'Advanced Encryption Standard with 256-bit key in Galois/Counter Mode',
    type: 'encryption',
    implementationDate: '2020-01-10',
    securityLevel: 'high',
  },
  {
    name: 'ChaCha20-Poly1305',
    status: 'active',
    progress: 100,
    description: 'Stream cipher with Poly1305 authenticator',
    type: 'encryption',
    implementationDate: '2020-03-22',
    securityLevel: 'high',
  },
  {
    name: 'RSA-4096',
    status: 'active',
    progress: 100,
    description: 'RSA with 4096-bit keys (quantum vulnerable)',
    type: 'signature',
    implementationDate: '2019-05-15',
    securityLevel: 'high',
  },
  {
    name: 'ECDSA P-384',
    status: 'active',
    progress: 100,
    description: 'Elliptic Curve Digital Signature Algorithm (quantum vulnerable)',
    type: 'signature',
    implementationDate: '2019-08-30',
    securityLevel: 'high',
  },
];

const getStatusBadge = (status: AlgorithmStatus['status']) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
    case 'testing':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Testing</Badge>;
    case 'development':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Development</Badge>;
    case 'deprecated':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Deprecated</Badge>;
    default:
      return null;
  }
};

const getTypeIcon = (type: AlgorithmStatus['type']) => {
  switch (type) {
    case 'encryption':
      return <Lock className="h-4 w-4" />;
    case 'signature':
      return <CheckCircle className="h-4 w-4" />;
    case 'key-exchange':
      return <Server className="h-4 w-4" />;
    default:
      return null;
  }
};

const getSecurityLevelBadge = (level: AlgorithmStatus['securityLevel']) => {
  switch (level) {
    case 'high':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800">High</Badge>;
    case 'very-high':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800">Very High</Badge>;
    case 'maximum':
      return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">Maximum</Badge>;
    default:
      return null;
  }
};

export function QuantumAlgorithmStatus() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Quantum Security Status
            </CardTitle>
            <CardDescription>
              Current status of post-quantum cryptographic algorithms
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Quantum Secure</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Your system is protected against known quantum computing attacks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quantum" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="quantum" className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              <span>Post-Quantum</span>
            </TabsTrigger>
            <TabsTrigger value="classic" className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              <span>Classic</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quantum" className="space-y-4">
            <div className="grid gap-3">
              {quantumAlgorithms.map((algorithm) => (
                <div key={algorithm.name} className="border rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      <div className="bg-primary/10 p-1.5 rounded">
                        {getTypeIcon(algorithm.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{algorithm.name}</h3>
                        <p className="text-xs text-muted-foreground">{algorithm.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(algorithm.status)}
                      {getSecurityLevelBadge(algorithm.securityLevel)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{algorithm.description}</p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Implementation Progress</span>
                      <span>{algorithm.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`${
                          algorithm.status === 'deprecated' 
                            ? 'bg-red-500' 
                            : algorithm.progress > 90 
                              ? 'bg-green-500' 
                              : algorithm.progress > 70 
                                ? 'bg-blue-500' 
                                : 'bg-yellow-500'
                        } h-2.5 rounded-full`} 
                        style={{ width: `${algorithm.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {algorithm.implementationDate && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Implemented: {algorithm.implementationDate}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 flex items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">About Post-Quantum Cryptography</p>
                <p className="mt-1">
                  These algorithms are designed to be secure against attacks from both classical and quantum computers.
                  The NIST standardization process has selected several algorithms for widespread adoption.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="classic" className="space-y-4">
            <div className="grid gap-3">
              {classicAlgorithms.map((algorithm) => (
                <div key={algorithm.name} className="border rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      <div className="bg-primary/10 p-1.5 rounded">
                        {getTypeIcon(algorithm.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{algorithm.name}</h3>
                        <p className="text-xs text-muted-foreground">{algorithm.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(algorithm.status)}
                      {getSecurityLevelBadge(algorithm.securityLevel)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{algorithm.description}</p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Implementation Progress</span>
                      <span>{algorithm.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${algorithm.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {algorithm.implementationDate && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Implemented: {algorithm.implementationDate}
                    </div>
                  )}
                  
                  {(algorithm.name === 'RSA-4096' || algorithm.name === 'ECDSA P-384') && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Vulnerable to quantum attacks</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3 flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium">Quantum Computing Risk</p>
                <p className="mt-1">
                  Classic public key algorithms like RSA and ECC are vulnerable to attacks by quantum computers
                  using Shor's algorithm. We recommend using hybrid or post-quantum approaches for sensitive data.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}