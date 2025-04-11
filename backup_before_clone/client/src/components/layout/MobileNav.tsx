import { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fixed button in bottom right */}
      <Button
        variant="default"
        size="lg"
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Full screen overlay when menu is open */}
      {open && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col p-6">
          <div className="flex justify-end mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-10 w-10"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <nav className="flex flex-col space-y-4">
            {appRoutes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                onClick={() => setOpen(false)}
                className="py-3 px-4 text-lg font-medium rounded-lg hover:bg-accent transition-colors"
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}