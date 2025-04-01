import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { FractalNode } from '@/types/wallet';

interface FractalNavigationProps {
  className?: string;
}

const FractalNavigation = ({ className }: FractalNavigationProps) => {
  const [location] = useLocation();
  const [activeNode, setActiveNode] = useState<FractalNode | null>(null);

  const fractalNodes: FractalNode[] = [
    { id: 'dashboard', name: 'Dashboard', path: '/', x: 50, y: 10, connections: ['assets', 'transactions'] },
    { id: 'assets', name: 'Assets', path: '/assets', x: 25, y: 30, connections: ['defi', 'nfts'] },
    { id: 'transactions', name: 'Transactions', path: '/transactions', x: 75, y: 30, connections: ['staking', 'contracts'] },
    { id: 'defi', name: 'DeFi', path: '/defi', x: 15, y: 60, connections: ['settings'] },
    { id: 'nfts', name: 'NFTs', path: '/nfts', x: 40, y: 60, connections: [] },
    { id: 'staking', name: 'Staking', path: '/staking', x: 65, y: 60, connections: [] },
    { id: 'contracts', name: 'Contracts', path: '/contracts', x: 85, y: 60, connections: ['security'] },
    { id: 'settings', name: 'Settings', path: '/settings', x: 30, y: 80, connections: [] },
    { id: 'security', name: 'Security', path: '/security', x: 70, y: 80, connections: [] },
  ];

  // Find the active node based on current location
  useEffect(() => {
    const currentPath = location === '/' ? '/' : `/${location.split('/')[1]}`;
    const current = fractalNodes.find(node => node.path === currentPath) || fractalNodes[0];
    setActiveNode(current);
  }, [location]);

  const handleNodeClick = (node: FractalNode) => {
    window.location.href = node.path;
  };

  return (
    <div className={`relative h-48 w-full mb-2 ${className}`}>
      {/* Draw connection lines between nodes */}
      {fractalNodes.map(node => (
        node.connections.map(targetId => {
          const target = fractalNodes.find(n => n.id === targetId);
          if (!target) return null;

          // Calculate line properties
          const x1 = `${node.x}%`;
          const y1 = `${node.y}%`;
          const x2 = `${target.x}%`;
          const y2 = `${target.y}%`;

          // Calculate length and angle for transform
          const length = Math.sqrt(Math.pow(target.x - node.x, 2) + Math.pow(target.y - node.y, 2));
          const angle = Math.atan2(target.y - node.y, target.x - node.x) * (180 / Math.PI);

          return (
            <div 
              key={`${node.id}-${targetId}`}
              className="fractal-line absolute h-[1px] bg-gradient-to-r from-primary/30 to-blue-500/30"
              style={{
                top: y1,
                left: x1,
                width: `${length}%`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: 'left',
              }}
            />
          );
        })
      ))}

      {/* Draw nodes */}
      {fractalNodes.map(node => (
        <div
          key={node.id}
          onClick={() => handleNodeClick(node)}
          className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 cursor-pointer ${
            activeNode?.id === node.id ? 'active' : ''
          }`}
          style={{ top: `${node.y}%`, left: `${node.x}%` }}
        >
          <motion.div 
            className={`fractal-node absolute w-2.5 h-2.5 rounded-full bg-primary transition-all duration-300 ${
              activeNode?.id === node.id ? 'bg-blue-500 shadow-glow' : ''
            }`}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: activeNode?.id === node.id ? 1.2 : 1,
              backgroundColor: activeNode?.id === node.id ? '#4682B4' : '#6A5ACD'
            }}
            whileHover={{ scale: 1.3 }}
          />
          
          {/* Pulse animation for active node */}
          {activeNode?.id === node.id && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-blue-500/50"
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      ))}

      {/* "You are here" label */}
      <div className="absolute bottom-0 left-0 right-0 text-xs text-center text-muted-foreground">
        You are here: <span className="text-foreground font-medium">
          {activeNode?.name || 'Dashboard'}
        </span>
      </div>
    </div>
  );
};

export default FractalNavigation;
