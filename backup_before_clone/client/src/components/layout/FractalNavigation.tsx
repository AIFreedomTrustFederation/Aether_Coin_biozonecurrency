import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'wouter';
import { FractalNode } from '@/types/wallet';

interface FractalNavigationProps {
  className?: string;
}

const FractalNavigation = ({ className }: FractalNavigationProps) => {
  const [location] = useLocation();
  const [activeNode, setActiveNode] = useState<FractalNode | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [animateTraverse, setAnimateTraverse] = useState(false);

  const fractalNodes: FractalNode[] = [
    { id: 'dashboard', name: 'Dashboard', path: '/', x: 50, y: 10, connections: ['assets', 'transactions', 'whitepaper', 'fractal-explorer'] },
    { id: 'assets', name: 'Assets', path: '/assets', x: 25, y: 30, connections: ['defi', 'nfts', 'whitepaper'] },
    { id: 'transactions', name: 'Transactions', path: '/transactions', x: 75, y: 30, connections: ['staking', 'contracts', 'whitepaper'] },
    { id: 'defi', name: 'DeFi', path: '/defi', x: 15, y: 60, connections: ['settings'] },
    { id: 'nfts', name: 'NFTs', path: '/nfts', x: 40, y: 60, connections: [] },
    { id: 'staking', name: 'Staking', path: '/staking', x: 65, y: 60, connections: [] },
    { id: 'contracts', name: 'Contracts', path: '/contracts', x: 85, y: 60, connections: ['security'] },
    { id: 'whitepaper', name: 'White Paper', path: '/whitepaper', x: 50, y: 40, connections: ['contracts', 'assets', 'fractal-explorer'] },
    { id: 'fractal-explorer', name: 'Fractal Explorer', path: '/fractal-explorer', x: 50, y: 70, connections: ['whitepaper', 'settings', 'security'] },
    { id: 'settings', name: 'Settings', path: '/settings', x: 30, y: 80, connections: ['fractal-explorer'] },
    { id: 'security', name: 'Security', path: '/security', x: 70, y: 80, connections: ['fractal-explorer'] },
  ];

  // Find the active node based on current location
  useEffect(() => {
    const currentPath = location === '/' ? '/' : `/${location.split('/')[1]}`;
    const current = fractalNodes.find(node => node.path === currentPath) || fractalNodes[0];
    
    // Generate path to this node from dashboard (for animation)
    if (current.id !== 'dashboard') {
      const nodePath = findPathToNode('dashboard', current.id);
      setHighlightedPath(nodePath);
      setAnimateTraverse(true);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setAnimateTraverse(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    setActiveNode(current);
  }, [location]);

  // Find a path from one node to another through the fractal tree
  const findPathToNode = (startId: string, endId: string): string[] => {
    const visited = new Set<string>();
    const pathMap = new Map<string, string>();
    const queue: string[] = [startId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (currentId === endId) {
        // Reconstruct path
        const path: string[] = [endId];
        let current = endId;
        
        while (current !== startId) {
          current = pathMap.get(current)!;
          path.unshift(current);
        }
        
        return path;
      }
      
      const currentNode = fractalNodes.find(n => n.id === currentId);
      if (!currentNode) continue;
      
      for (const connectionId of currentNode.connections) {
        if (!visited.has(connectionId)) {
          visited.add(connectionId);
          pathMap.set(connectionId, currentId);
          queue.push(connectionId);
        }
      }
    }
    
    return [startId]; // No path found, return just the start node
  };

  const [_, navigate] = useLocation();
  
  const handleNodeClick = (node: FractalNode) => {
    // Use wouter navigation to prevent full page reload
    navigate(node.path);
  };

  // Check if a connection should be highlighted
  const isConnectionHighlighted = (fromId: string, toId: string): boolean => {
    if (!animateTraverse) return false;
    
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      if (
        (highlightedPath[i] === fromId && highlightedPath[i + 1] === toId) ||
        (highlightedPath[i] === toId && highlightedPath[i + 1] === fromId)
      ) {
        return true;
      }
    }
    
    return false;
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

          const isHighlighted = isConnectionHighlighted(node.id, targetId);

          return (
            <motion.div 
              key={`${node.id}-${targetId}`}
              className={`fractal-line absolute h-[1px] ${
                isHighlighted 
                  ? 'bg-gradient-to-r from-primary to-blue-500'
                  : 'bg-gradient-to-r from-primary/30 to-blue-500/30'
              }`}
              style={{
                top: y1,
                left: x1,
                width: `${length}%`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: 'left',
                zIndex: isHighlighted ? 2 : 1
              }}
              animate={isHighlighted ? { 
                height: ['1px', '2px', '1px'],
                opacity: [0.3, 1, 0.3]
              } : {}}
              transition={{ duration: 1, repeat: isHighlighted ? Infinity : 0 }}
            />
          );
        })
      ))}

      {/* Draw nodes */}
      {fractalNodes.map(node => {
        const isActive = activeNode?.id === node.id;
        const isInPath = highlightedPath.includes(node.id);
        
        return (
          <div
            key={node.id}
            onClick={() => handleNodeClick(node)}
            className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 cursor-pointer ${
              isActive ? 'active' : ''
            }`}
            style={{ 
              top: `${node.y}%`, 
              left: `${node.x}%`,
              zIndex: isActive || isInPath ? 10 : 5
            }}
          >
            <motion.div 
              className={`fractal-node absolute w-2.5 h-2.5 rounded-full bg-primary transition-all duration-300 ${
                isActive ? 'bg-blue-500 shadow-glow' : ''
              }`}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: isActive ? 1.2 : isInPath && animateTraverse ? 1.1 : 1,
                backgroundColor: isActive ? '#4682B4' : isInPath && animateTraverse ? '#8A2BE2' : '#6A5ACD'
              }}
              whileHover={{ scale: 1.3 }}
            />
            
            {/* Name tooltip on hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-background/80 px-2 py-0.5 rounded text-xs whitespace-nowrap">
              {node.name}
            </div>
            
            {/* Pulse animation for active node */}
            {isActive && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-blue-500/50"
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            {/* Animation for nodes in the active path */}
            {isInPath && animateTraverse && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-purple-500/70"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 0.8] }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            )}
          </div>
        );
      })}

      {/* "You are here" label with animation */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 text-xs text-center text-muted-foreground"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        You are here: <motion.span 
          className="text-foreground font-medium"
          animate={{ 
            color: ["#6A5ACD", "#8A2BE2", "#6A5ACD"] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        >
          {activeNode?.name || 'Dashboard'}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default FractalNavigation;
