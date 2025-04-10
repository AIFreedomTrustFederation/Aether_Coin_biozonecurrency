import React from 'react';
import { 
  ArrowDownCircle, 
  ShieldCheck, 
  Package, 
  CheckCircle2, 
  Banknote, 
  AlertCircle
} from 'lucide-react';

/**
 * A visually enhanced flow chart for the escrow process
 */
export function EscrowFlowChart() {
  return (
    <div className="w-full py-4">
      {/* Mobile vertical flow chart */}
      <div className="md:hidden">
        <div className="flex flex-col items-center space-y-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center w-full">
            <div className="bg-primary/10 p-3 rounded-full">
              <ArrowDownCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="h-10 w-0.5 bg-border my-1"></div>
            <div className="font-medium">Step 1</div>
            <div className="text-sm text-muted-foreground px-4">
              Buyer creates an escrow transaction
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center w-full">
            <div className="bg-primary/10 p-3 rounded-full">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="h-10 w-0.5 bg-border my-1"></div>
            <div className="font-medium">Step 2</div>
            <div className="text-sm text-muted-foreground px-4">
              Funds are held in secure escrow
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center w-full">
            <div className="bg-primary/10 p-3 rounded-full">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="h-10 w-0.5 bg-border my-1"></div>
            <div className="font-medium">Step 3</div>
            <div className="text-sm text-muted-foreground px-4">
              Seller delivers product/service
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="flex flex-col items-center text-center w-full">
            <div className="bg-primary/10 p-3 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div className="h-10 w-0.5 bg-border my-1"></div>
            <div className="font-medium">Step 4</div>
            <div className="text-sm text-muted-foreground px-4">
              Buyer confirms receipt
            </div>
          </div>
          
          {/* Step 5 */}
          <div className="flex flex-col items-center text-center w-full">
            <div className="bg-primary/10 p-3 rounded-full">
              <Banknote className="h-6 w-6 text-primary" />
            </div>
            <div className="font-medium">Step 5</div>
            <div className="text-sm text-muted-foreground px-4">
              Funds are released to seller
            </div>
          </div>
          
          {/* Dispute path - conditional branch */}
          <div className="w-full mt-6 border-t pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-orange-100 dark:bg-orange-950 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div className="font-medium mt-2">In Case of Dispute</div>
              <div className="text-sm text-muted-foreground px-4 mt-1">
                Mysterion AI analyzes evidence, transaction history, and ethical principles to provide fair resolution
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop horizontal flow chart */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Main flow line */}
          <div className="absolute top-10 left-0 right-0 h-0.5 bg-border"></div>
          
          {/* Steps container */}
          <div className="flex justify-between relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center w-1/5">
              <div className="bg-primary/10 p-3 rounded-full z-10">
                <ArrowDownCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="font-medium mt-4">Step 1</div>
              <div className="text-sm text-muted-foreground">
                Buyer creates an escrow transaction
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center w-1/5">
              <div className="bg-primary/10 p-3 rounded-full z-10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="font-medium mt-4">Step 2</div>
              <div className="text-sm text-muted-foreground">
                Funds are held in secure escrow
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center w-1/5">
              <div className="bg-primary/10 p-3 rounded-full z-10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="font-medium mt-4">Step 3</div>
              <div className="text-sm text-muted-foreground">
                Seller delivers product/service
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center w-1/5">
              <div className="bg-primary/10 p-3 rounded-full z-10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div className="font-medium mt-4">Step 4</div>
              <div className="text-sm text-muted-foreground">
                Buyer confirms receipt
              </div>
            </div>
            
            {/* Step 5 */}
            <div className="flex flex-col items-center text-center w-1/5">
              <div className="bg-primary/10 p-3 rounded-full z-10">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
              <div className="font-medium mt-4">Step 5</div>
              <div className="text-sm text-muted-foreground">
                Funds are released to seller
              </div>
            </div>
          </div>
          
          {/* Dispute path branch */}
          <div className="mt-12 pt-6 border-t">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-950 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <div className="font-medium">In Case of Dispute</div>
                <div className="text-sm text-muted-foreground">
                  Mysterion AI analyzes evidence, transaction history, and ethical principles to provide fair resolution
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EscrowFlowChart;