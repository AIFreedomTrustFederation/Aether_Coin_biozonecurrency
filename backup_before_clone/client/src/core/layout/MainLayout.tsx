import { Link } from "wouter";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout component providing consistent layout across the application
 * Includes header navigation and main content area
 */
const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="app-container w-full h-full">
      <header className="flex justify-between items-center p-4 bg-background border-b fixed top-0 left-0 right-0 z-50">
        <Link href="/">
          <h1 className="font-bold text-xl cursor-pointer">Aetherion</h1>
        </Link>
        <nav className="flex space-x-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          <Link href="/wallet">
            <Button variant="ghost" size="sm">Wallet</Button>
          </Link>
          <Link href="/fractal-explorer">
            <Button variant="ghost" size="sm">Fractal Explorer</Button>
          </Link>
          <Link href="/ai-assistant">
            <Button variant="ghost" size="sm">AI Assistant</Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm">Settings</Button>
          </Link>
        </nav>
      </header>
        
      <main className="pt-[60px] h-[calc(100%-60px)] overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;