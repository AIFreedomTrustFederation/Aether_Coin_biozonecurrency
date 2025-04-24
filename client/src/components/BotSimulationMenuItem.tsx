import React from 'react';
import { Link } from 'wouter';
import { Bot, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BotSimulationMenuItem: React.FC = () => {
  return (
    <Link to="/bot-simulation" className="group">
      <Button 
        variant="ghost" 
        className="w-full justify-start"
      >
        <div className="flex items-center flex-1">
          <Bot className="mr-2 h-4 w-4" />
          <span>Bot Simulation</span>
          <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Button>
    </Link>
  );
};

export default BotSimulationMenuItem;