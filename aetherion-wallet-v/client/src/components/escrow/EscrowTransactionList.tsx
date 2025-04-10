import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import {
  Package,
  Check,
  X,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  Eye,
  MessageSquare,
  Upload,
  Shield,
  ArrowRightLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

// Import file upload component
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EscrowTransaction = {
  id: number;
  status: string;
  amount: string;
  tokenSymbol: string;
  description: string;
  chain: string;
  sellerId: number;
  buyerId: number;
  sellerWalletId: number;
  buyerWalletId: number;
  createdAt: string;
  updatedAt: string | null;
  expectedDeliveryDate: string | null;
  deliveredAt: string | null;
  confirmedDeliveredAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  escrowFee: string | null;
  sellerName?: string;
  buyerName?: string;
  matrixRoomId?: string | null;
  latestDispute?: {
    id: number;
    status: string;
    description: string;
    resolution: string | null;
  } | null;
  proofs?: {
    id: number;
    escrowTransactionId: number;
    submittedBy: number;
    submittedAt: string;
    fileUrl: string;
    description: string;
    fileType: string;
  }[];
};

type FileUpload = {
  file: File | null;
  description: string;
};

export default function EscrowTransactionList({ userId = 1 }: { userId?: number }) {
  const [activeTransactionId, setActiveTransactionId] = useState<number | null>(null);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [message, setMessage] = useState("");
  const [fileUpload, setFileUpload] = useState<FileUpload>({
    file: null,
    description: "",
  });

  // Fetch escrow transactions
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['/api/escrow', userId],
    queryFn: async () => {
      const response = await fetch(`/api/escrow?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch escrow transactions');
      }
      return response.json();
    },
  });

  // Fetch active transaction details
  const { data: activeTransaction, isLoading: isLoadingTransaction } = useQuery({
    queryKey: ['/api/escrow/transaction', activeTransactionId],
    queryFn: async () => {
      if (!activeTransactionId) return null;
      const response = await fetch(`/api/escrow/${activeTransactionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }
      return response.json();
    },
    enabled: !!activeTransactionId,
  });

  // Mutation to confirm delivery
  const confirmDeliveryMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const response = await fetch(`/api/escrow/${transactionId}/confirm-delivery`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error('Failed to confirm delivery');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Delivery confirmed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow/transaction', activeTransactionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Mutation to mark as delivered
  const markAsDeliveredMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const response = await fetch(`/api/escrow/${transactionId}/mark-delivered`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error('Failed to mark as delivered');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction marked as delivered",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow/transaction', activeTransactionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Mutation to release funds
  const releaseFundsMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const response = await fetch(`/api/escrow/${transactionId}/release`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error('Failed to release funds');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funds released successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow/transaction', activeTransactionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Mutation to refund buyer
  const refundMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const response = await fetch(`/api/escrow/${transactionId}/refund`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error('Failed to process refund');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow/transaction', activeTransactionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Mutation to submit dispute
  const submitDisputeMutation = useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: number, reason: string }) => {
      const response = await fetch(`/api/escrow/${transactionId}/dispute`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error('Failed to submit dispute');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dispute submitted successfully. Mysterion AI will review your case.",
      });
      setDisputeDialogOpen(false);
      setDisputeReason("");
      queryClient.invalidateQueries({ queryKey: ['/api/escrow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow/transaction', activeTransactionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Mutation to submit a proof
  const submitProofMutation = useMutation({
    mutationFn: async ({ transactionId, formData }: { transactionId: number, formData: FormData }) => {
      const response = await fetch(`/api/escrow/${transactionId}/proof`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload proof');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Proof uploaded successfully",
      });
      setProofDialogOpen(false);
      setFileUpload({ file: null, description: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/escrow/transaction', activeTransactionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Mutation to send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ transactionId, message }: { transactionId: number, message: string }) => {
      const response = await fetch(`/api/escrow/${transactionId}/message`, {
        method: "POST",
        body: JSON.stringify({ message }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
      setMessageDialogOpen(false);
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Get Matrix room URL
  const getMatrixRoomUrl = (roomId: string) => {
    if (!roomId) return '#';
    return `https://matrix.to/#/${roomId}`;
  };

  // Handle dispute submission
  const handleDisputeSubmit = () => {
    if (!activeTransactionId) return;
    if (!disputeReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the dispute",
        variant: "destructive",
      });
      return;
    }
    submitDisputeMutation.mutate({ transactionId: activeTransactionId, reason: disputeReason });
  };

  // Handle proof submission
  const handleProofSubmit = () => {
    if (!activeTransactionId || !fileUpload.file) return;
    
    const formData = new FormData();
    formData.append('file', fileUpload.file);
    formData.append('description', fileUpload.description);
    
    submitProofMutation.mutate({ transactionId: activeTransactionId, formData });
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (!activeTransactionId) return;
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate({ transactionId: activeTransactionId, message });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileUpload({
        ...fileUpload,
        file: e.target.files[0],
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Delivered</Badge>;
      case 'completed':
        return <Badge variant="success" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'disputed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">Disputed</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter transactions by role
  const buyerTransactions = transactions.filter((tx: EscrowTransaction) => tx.buyerId === userId);
  const sellerTransactions = transactions.filter((tx: EscrowTransaction) => tx.sellerId === userId);

  // Render transaction card
  const renderTransactionCard = (transaction: EscrowTransaction) => {
    const isBuyer = transaction.buyerId === userId;
    const counterpartyName = isBuyer ? transaction.sellerName : transaction.buyerName;
    
    return (
      <Card key={transaction.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {isBuyer ? 'Purchase from ' : 'Sale to '} 
              {counterpartyName || 'Unknown'}
            </CardTitle>
            {getStatusBadge(transaction.status)}
          </div>
          <CardDescription>
            {transaction.createdAt && (
              <span>Created {formatDistanceToNow(new Date(transaction.createdAt))} ago</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">{transaction.amount} {transaction.tokenSymbol}</span>
          </div>
          <div className="mb-2">
            <span className="text-muted-foreground">Description:</span>
            <p className="line-clamp-2">{transaction.description}</p>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Chain:</span>
            <span>{transaction.chain}</span>
          </div>
          {transaction.latestDispute && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Dispute: {transaction.latestDispute.status}
              </p>
              <p className="text-xs text-red-700 dark:text-red-400">
                {transaction.latestDispute.resolution || transaction.latestDispute.description}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTransactionId(transaction.id)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading escrow transactions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading escrow transactions. Please try again.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="buyer">As Buyer</TabsTrigger>
          <TabsTrigger value="seller">As Seller</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No escrow transactions found.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {transactions.map((tx: EscrowTransaction) => renderTransactionCard(tx))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="buyer">
          {buyerTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No purchases found.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {buyerTransactions.map((tx: EscrowTransaction) => renderTransactionCard(tx))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="seller">
          {sellerTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No sales found.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {sellerTransactions.map((tx: EscrowTransaction) => renderTransactionCard(tx))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Dialog */}
      {activeTransactionId && (
        <Dialog 
          open={!!activeTransactionId} 
          onOpenChange={(open) => !open && setActiveTransactionId(null)}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {isLoadingTransaction ? (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading transaction details...</span>
              </div>
            ) : activeTransaction ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Escrow Transaction Details
                    <div className="ml-auto">
                      {getStatusBadge(activeTransaction.status)}
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    Transaction ID: {activeTransaction.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Participants</h4>
                    <div className="space-y-2 bg-muted p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seller:</span>
                        <span>{activeTransaction.sellerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Buyer:</span>
                        <span>{activeTransaction.buyerName}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-1">Transaction Details</h4>
                    <div className="space-y-2 bg-muted p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">{activeTransaction.amount} {activeTransaction.tokenSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chain:</span>
                        <span>{activeTransaction.chain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fee:</span>
                        <span>{activeTransaction.escrowFee || '0'} {activeTransaction.tokenSymbol}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-1">Description</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p>{activeTransaction.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Dates</h4>
                    <div className="space-y-2 bg-muted p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(activeTransaction.createdAt).toLocaleString()}</span>
                      </div>
                      {activeTransaction.expectedDeliveryDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expected Delivery:</span>
                          <span>{new Date(activeTransaction.expectedDeliveryDate).toLocaleString()}</span>
                        </div>
                      )}
                      {activeTransaction.deliveredAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivered:</span>
                          <span>{new Date(activeTransaction.deliveredAt).toLocaleString()}</span>
                        </div>
                      )}
                      {activeTransaction.confirmedDeliveredAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confirmed:</span>
                          <span>{new Date(activeTransaction.confirmedDeliveredAt).toLocaleString()}</span>
                        </div>
                      )}
                      {activeTransaction.releasedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Released:</span>
                          <span>{new Date(activeTransaction.releasedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {activeTransaction.refundedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Refunded:</span>
                          <span>{new Date(activeTransaction.refundedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-1">Actions</h4>
                    <div className="space-y-2 bg-muted p-3 rounded-md">
                      {/* Matrix room link */}
                      {activeTransaction.matrixRoomId && (
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(getMatrixRoomUrl(activeTransaction.matrixRoomId!), '_blank')}
                            className="w-full"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Open Matrix Chat Room
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Send Matrix message directly */}
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setMessageDialogOpen(true)}
                          className="w-full"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                      
                      {/* Upload proof */}
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setProofDialogOpen(true)}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Proof
                        </Button>
                      </div>
                      
                      {/* Submit dispute */}
                      {['pending', 'delivered'].includes(activeTransaction.status.toLowerCase()) && (
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDisputeDialogOpen(true)}
                            className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Submit Dispute
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status-based action buttons */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-1">Transaction Actions</h4>
                  <div className="space-y-2 bg-muted p-3 rounded-md">
                    <div className="flex gap-2 flex-wrap">
                      {/* Mark as delivered (for seller) */}
                      {activeTransaction.status.toLowerCase() === 'pending' && 
                       activeTransaction.sellerId === userId && (
                        <Button 
                          size="sm"
                          onClick={() => markAsDeliveredMutation.mutate(activeTransaction.id)}
                          disabled={markAsDeliveredMutation.isPending}
                        >
                          {markAsDeliveredMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Delivered
                        </Button>
                      )}
                      
                      {/* Confirm delivery (for buyer) */}
                      {activeTransaction.status.toLowerCase() === 'delivered' && 
                       activeTransaction.buyerId === userId && (
                        <Button 
                          size="sm"
                          onClick={() => confirmDeliveryMutation.mutate(activeTransaction.id)}
                          disabled={confirmDeliveryMutation.isPending}
                        >
                          {confirmDeliveryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <Check className="h-4 w-4 mr-2" />
                          Confirm Delivery
                        </Button>
                      )}
                      
                      {/* Release funds (for buyer or admin) */}
                      {['pending', 'delivered'].includes(activeTransaction.status.toLowerCase()) && 
                       activeTransaction.buyerId === userId && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => releaseFundsMutation.mutate(activeTransaction.id)}
                          disabled={releaseFundsMutation.isPending}
                        >
                          {releaseFundsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Release Funds
                        </Button>
                      )}
                      
                      {/* Refund buyer (for seller or admin) */}
                      {['pending', 'delivered'].includes(activeTransaction.status.toLowerCase()) && 
                       activeTransaction.sellerId === userId && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => refundMutation.mutate(activeTransaction.id)}
                          disabled={refundMutation.isPending}
                        >
                          {refundMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Refund Buyer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Proofs section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-1">Submitted Proofs</h4>
                  <div className="bg-muted p-3 rounded-md">
                    {activeTransaction.proofs && activeTransaction.proofs.length > 0 ? (
                      <div className="space-y-2">
                        {activeTransaction.proofs.map((proof) => (
                          <div key={proof.id} className="flex justify-between items-center p-2 bg-background rounded-md">
                            <div>
                              <p className="text-sm font-medium">{proof.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Submitted by {proof.submittedBy === activeTransaction.buyerId ? 'Buyer' : 'Seller'} - 
                                {new Date(proof.submittedAt).toLocaleString()}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => window.open(proof.fileUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-2">No proofs submitted yet.</p>
                    )}
                  </div>
                </div>

                {/* Disputes section */}
                {activeTransaction.latestDispute && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-1">Dispute Information</h4>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Dispute Status: {activeTransaction.latestDispute.status}</p>
                          <p className="text-sm">{activeTransaction.latestDispute.description}</p>
                        </div>
                        <Badge variant="destructive">Disputed</Badge>
                      </div>
                      
                      {activeTransaction.latestDispute.resolution && (
                        <div className="mt-2 p-2 bg-background rounded-md">
                          <p className="text-sm font-medium">Resolution:</p>
                          <p className="text-sm">{activeTransaction.latestDispute.resolution}</p>
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center text-sm">
                        <Shield className="h-4 w-4 mr-1 text-primary" />
                        <span className="text-muted-foreground">
                          Mysterion AI is analyzing this dispute based on ethical principles and transaction evidence
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setActiveTransactionId(null)}>Close</Button>
                </DialogFooter>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Transaction not found or no longer available.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Proof Dialog */}
      <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Proof</DialogTitle>
            <DialogDescription>
              Provide evidence of product/service delivery or payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="proof-file">File</Label>
              <Input 
                id="proof-file" 
                type="file" 
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </div>
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="proof-description">Description</Label>
              <Textarea 
                id="proof-description" 
                placeholder="Describe what this proof shows..."
                value={fileUpload.description}
                onChange={(e) => setFileUpload({ ...fileUpload, description: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setProofDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleProofSubmit}
              disabled={!fileUpload.file || submitProofMutation.isPending}
            >
              {submitProofMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Upload Proof
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Dispute Dialog */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Submit Dispute
            </DialogTitle>
            <DialogDescription>
              Explain why you're disputing this transaction. Mysterion AI will review your case.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="dispute-reason">Reason for Dispute</Label>
            <Textarea 
              id="dispute-reason" 
              placeholder="Describe the issue in detail..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="h-32"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDisputeSubmit}
              disabled={!disputeReason.trim() || submitDisputeMutation.isPending}
              variant="destructive"
            >
              {submitDisputeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Send Matrix Message
            </DialogTitle>
            <DialogDescription>
              Send a message to the other party through the secure Matrix channel.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="message-content">Message</Label>
            <Textarea 
              id="message-content" 
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-32"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}