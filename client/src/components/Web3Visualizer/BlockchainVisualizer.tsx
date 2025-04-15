import React, { useState } from "react";
import { Box, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Simplified Blockchain Visualizer
 * 
 * Visual demonstration of how blocks are chained together with cryptographic hashes
 * and how changing data in one block affects the entire chain.
 */
const BlockchainVisualizer: React.FC = () => {
  const [blocks, setBlocks] = useState([
    { id: 0, data: "Genesis Block", hash: "0x123abc...", isValid: true },
    { id: 1, data: "Transaction #1", hash: "0x456def...", isValid: true },
    { id: 2, data: "Transaction #2", hash: "0x789ghi...", isValid: true }
  ]);

  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);

  const modifyBlockData = (id: number, newData: string) => {
    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      const index = newBlocks.findIndex(block => block.id === id);
      
      if (index !== -1) {
        // Update the selected block
        newBlocks[index] = { ...newBlocks[index], data: newData, hash: `0x${Math.random().toString(16).slice(2, 10)}...`, isValid: true };
        
        // Mark all subsequent blocks as invalid
        for (let i = index + 1; i < newBlocks.length; i++) {
          newBlocks[i] = { ...newBlocks[i], isValid: false };
        }
      }
      
      return newBlocks;
    });
  };

  return (
    <div className="w-full flex flex-col items-center p-4">
      <div className="space-y-4 w-full max-w-3xl">
        <h3 className="text-lg font-medium text-center">Blockchain Structure</h3>
        <p className="text-sm text-center text-muted-foreground mb-8">
          Click on a block to modify its data and see how it affects the blockchain's integrity
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-start w-full mb-6">
          {blocks.map((block, index) => (
            <div key={block.id} className="relative w-full md:w-1/3">
              {/* Arrow connecting blocks */}
              {index > 0 && (
                <div className="absolute left-0 top-1/2 transform -translate-x-4 -translate-y-1/2 hidden md:block">
                  <LinkIcon className={`h-5 w-5 ${block.isValid ? 'text-green-500' : 'text-red-500'}`} />
                </div>
              )}
              
              {/* Block card */}
              <div 
                className={`border ${block.isValid ? 'border-green-200 dark:border-green-900' : 'border-red-300 dark:border-red-900'} 
                           rounded-lg p-4 cursor-pointer transition-all
                           ${selectedBlock === block.id ? 'ring-2 ring-blue-500' : ''}
                           ${block.isValid ? 'bg-green-50/50 dark:bg-green-950/30' : 'bg-red-50/50 dark:bg-red-950/30'}`}
                onClick={() => setSelectedBlock(block.id)}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <Box className="mr-2 h-4 w-4" />
                    <div className="text-sm font-medium">Block {block.id}</div>
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded ${block.isValid ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                    {block.isValid ? 'Valid' : 'Invalid'}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs font-medium mb-1">Data:</div>
                  {selectedBlock === block.id ? (
                    <input
                      type="text"
                      value={block.data}
                      onChange={(e) => modifyBlockData(block.id, e.target.value)}
                      className="w-full text-sm p-1 border rounded"
                    />
                  ) : (
                    <div className="text-sm p-1 border border-transparent">{block.data}</div>
                  )}
                </div>
                
                <div>
                  <div className="text-xs font-medium mb-1">Hash:</div>
                  <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded">{block.hash}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => {
            setBlocks([
              { id: 0, data: "Genesis Block", hash: "0x123abc...", isValid: true },
              { id: 1, data: "Transaction #1", hash: "0x456def...", isValid: true },
              { id: 2, data: "Transaction #2", hash: "0x789ghi...", isValid: true }
            ]);
            setSelectedBlock(null);
          }}>
            Reset Chain
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => {
            const newBlockId = blocks.length;
            setBlocks([...blocks, { 
              id: newBlockId, 
              data: `Transaction #${newBlockId}`, 
              hash: `0x${Math.random().toString(16).slice(2, 10)}...`, 
              isValid: true 
            }]);
          }}>
            Add Block
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlockchainVisualizer;