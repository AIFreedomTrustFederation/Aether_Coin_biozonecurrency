import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useWallets } from "@/hooks/use-wallets";
import { useUsers } from "@/hooks/use-users";

// Escrow creation schema for validation
const escrowSchema = z.object({
  sellerId: z.number({
    required_error: "Seller is required",
  }),
  buyerId: z.number({
    required_error: "Buyer is required",
  }),
  sellerWalletId: z.number({
    required_error: "Seller wallet is required",
  }),
  buyerWalletId: z.number({
    required_error: "Buyer wallet is required",
  }),
  amount: z.string().min(1, "Amount is required"),
  tokenSymbol: z.string().min(1, "Token symbol is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  chain: z.string().min(1, "Blockchain is required"),
  deliveryDeadline: z.string().optional(),
  autoReleaseDays: z.string().optional(),
  releaseTerms: z.string().optional(),
  cancellationTerms: z.string().optional(),
  disputeResolutionTerms: z.string().optional(),
  matrixRoomEnabled: z.boolean().default(true),
  additionalNotes: z.string().optional(),
});

export type EscrowFormValues = z.infer<typeof escrowSchema>;

export default function EscrowCreationForm() {
  const [userId, setUserId] = useState<number>(1);
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { wallets, isLoading: isLoadingWallets } = useWallets(userId);
  const [sellerWallets, setSellerWallets] = useState<Set<any>>(new Set());
  const [buyerWallets, setBuyerWallets] = useState<Set<any>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EscrowFormValues>({
    resolver: zodResolver(escrowSchema),
    defaultValues: {
      sellerId: 0,
      buyerId: 0,
      sellerWalletId: 0,
      buyerWalletId: 0,
      amount: "",
      tokenSymbol: "AETH",
      description: "",
      chain: "aetherion",
      deliveryDeadline: "",
      autoReleaseDays: "7",
      releaseTerms: "Funds will be released upon confirmation of product/service delivery.",
      cancellationTerms: "Either party may cancel before delivery with mutual agreement.",
      disputeResolutionTerms: "Disputes resolved by Mysterion AI based on evidence and ethics.",
      matrixRoomEnabled: true,
      additionalNotes: "",
    },
  });

  const watchSellerId = form.watch("sellerId");
  const watchBuyerId = form.watch("buyerId");

  // Update wallets when seller or buyer changes
  useEffect(() => {
    if (watchSellerId) {
      fetchWalletsForUser(Number(watchSellerId)).then(setSellerWallets);
    } else {
      setSellerWallets(new Set());
    }
  }, [watchSellerId]);

  useEffect(() => {
    if (watchBuyerId) {
      fetchWalletsForUser(Number(watchBuyerId)).then(setBuyerWallets);
    } else {
      setBuyerWallets(new Set());
    }
  }, [watchBuyerId]);

  async function fetchWalletsForUser(userId: number): Promise<Set<any>> {
    try {
      const response = await fetch(`/api/wallets?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch wallets");
      }
      const wallets = await response.json();
      return new Set(wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch wallets for user",
        variant: "destructive",
      });
      return new Set();
    }
  }

  async function onSubmit(values: EscrowFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/escrow", {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create escrow transaction");
      }

      const result = await response.json();
      
      // Invalidate escrow transactions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/escrow'] });
      
      toast({
        title: "Success",
        description: "Escrow transaction created successfully!",
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error("Error creating escrow:", error);
      toast({
        title: "Error",
        description: "Failed to create escrow transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-4 bg-card border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Create New Escrow Transaction</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seller */}
            <FormField
              control={form.control}
              name="sellerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller</FormLabel>
                  <Select
                    disabled={isLoadingUsers}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a seller" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buyer */}
            <FormField
              control={form.control}
              name="buyerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer</FormLabel>
                  <Select
                    disabled={isLoadingUsers}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a buyer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seller Wallet */}
            <FormField
              control={form.control}
              name="sellerWalletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller's Wallet</FormLabel>
                  <Select
                    disabled={sellerWallets.size === 0}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select seller's wallet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from(sellerWallets).map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id.toString()}>
                          {wallet.name} ({wallet.balance} {wallet.tokenSymbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buyer Wallet */}
            <FormField
              control={form.control}
              name="buyerWalletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer's Wallet</FormLabel>
                  <Select
                    disabled={buyerWallets.size === 0}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select buyer's wallet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from(buyerWallets).map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id.toString()}>
                          {wallet.name} ({wallet.balance} {wallet.tokenSymbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Token Symbol */}
            <FormField
              control={form.control}
              name="tokenSymbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AETH">AETH (Aetherion)</SelectItem>
                      <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                      <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="DAI">DAI</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Blockchain */}
            <FormField
              control={form.control}
              name="chain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blockchain</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blockchain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aetherion">Aetherion Mainnet</SelectItem>
                      <SelectItem value="aetherion-testnet">Aetherion Testnet</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Deadline */}
            <FormField
              control={form.control}
              name="deliveryDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Deadline</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto-Release Days */}
            <FormField
              control={form.control}
              name="autoReleaseDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auto-Release After (Days)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="1" max="60" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the goods or services being exchanged"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Release Terms */}
          <FormField
            control={form.control}
            name="releaseTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Terms</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Specify the conditions under which funds will be released"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cancellation Terms */}
            <FormField
              control={form.control}
              name="cancellationTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Terms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify cancellation policy"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dispute Resolution Terms */}
            <FormField
              control={form.control}
              name="disputeResolutionTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispute Resolution Terms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify how disputes will be resolved"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional Notes */}
          <FormField
            control={form.control}
            name="additionalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional details or requirements"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Matrix Room Enabled */}
          <FormField
            control={form.control}
            name="matrixRoomEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 rounded border-gray-300 dark:border-gray-700"
                    checked={field.value}
                    onChange={field.onChange}
                    title="Enable Matrix Communication Room"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable Matrix Communication Room</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Create a secure Matrix room for buyer and seller to communicate
                  </p>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Escrow Transaction"}
          </Button>
        </form>
      </Form>
    </div>
  );
}