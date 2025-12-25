import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminPayments, type AdminPaymentFilters } from "@/hooks/useAdminPayments";
import { supabase } from "@/integrations/supabase/client";
import { formatCentsAmount } from "@/utils/currency";
import {
	CreditCard,
	Clock,
	CheckCircle2,
	XCircle,
	RefreshCw,
	Eye,
	Loader2,
	Search,
	Filter,
	Download,
	User,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PaymentTransaction = Database["public"]["Tables"]["payment_transactions"]["Row"];

export const PaymentApproval: React.FC = () => {
	const [filters, setFilters] = useState<AdminPaymentFilters>({
		status: "pending",
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTransaction, setSelectedTransaction] =
		useState<PaymentTransaction | null>(null);
	const [viewingProof, setViewingProof] = useState<{
		url: string;
		loading: boolean;
	} | null>(null);
	const [adminNotes, setAdminNotes] = useState("");
	const [approveDialogOpen, setApproveDialogOpen] = useState(false);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [actionTransaction, setActionTransaction] =
		useState<PaymentTransaction | null>(null);

	const {
		paymentTransactions,
		isLoadingTransactions,
		isErrorLoadingTransactions,
		loadingError,
		paymentStats,
		updatePaymentStatus,
		isUpdatingStatus,
		refetchTransactions,
	} = useAdminPayments(filters);

	// Apply search filter
	useEffect(() => {
		if (searchQuery) {
			setFilters((prev) => ({ ...prev, search: searchQuery }));
		} else {
			setFilters((prev) => {
				const { search, ...rest } = prev;
				return rest;
			});
		}
	}, [searchQuery]);

	const handleViewProof = async (storagePath: string) => {
		setViewingProof({ url: "", loading: true });

		try {
			// Generate a signed URL for the payment proof (1 hour expiry)
			const { data: signedUrlData, error: signedUrlError } =
				await supabase.storage.from("baby_images").createSignedUrl(storagePath, 3600);

			if (signedUrlError) {
				console.error("Error generating signed URL:", signedUrlError);
				toast.error("Failed to load payment proof");
				setViewingProof(null);
				return;
			}

			setViewingProof({ url: signedUrlData.signedUrl, loading: false });
		} catch (error) {
			console.error("Error viewing proof:", error);
			toast.error("Failed to load payment proof");
			setViewingProof(null);
		}
	};

	const handleApprove = (transaction: PaymentTransaction) => {
		setActionTransaction(transaction);
		setAdminNotes(transaction.admin_notes || "");
		setApproveDialogOpen(true);
	};

	const handleReject = (transaction: PaymentTransaction) => {
		setActionTransaction(transaction);
		setAdminNotes(transaction.admin_notes || "");
		setRejectDialogOpen(true);
	};

	const confirmApprove = async () => {
		if (!actionTransaction) return;

		updatePaymentStatus(
			{
				transactionId: actionTransaction.id,
				status: "completed",
				adminNotes: adminNotes || undefined,
			},
			{
				onSuccess: () => {
					setApproveDialogOpen(false);
					setActionTransaction(null);
					setAdminNotes("");
					refetchTransactions();
				},
			},
		);
	};

	const confirmReject = async () => {
		if (!actionTransaction) return;

		updatePaymentStatus(
			{
				transactionId: actionTransaction.id,
				status: "failed",
				adminNotes: adminNotes || undefined,
			},
			{
				onSuccess: () => {
					setRejectDialogOpen(false);
					setActionTransaction(null);
					setAdminNotes("");
					refetchTransactions();
				},
			},
		);
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle2 className="w-4 h-4 text-green-500" />;
			case "pending":
				return <Clock className="w-4 h-4 text-yellow-500" />;
			case "failed":
				return <XCircle className="w-4 h-4 text-red-500" />;
			case "refunded":
				return <RefreshCw className="w-4 h-4 text-blue-500" />;
			default:
				return <Clock className="w-4 h-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "failed":
				return "bg-red-100 text-red-800";
			case "refunded":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatAmount = (amountInCents: number, currency: string) => {
		return formatCentsAmount(amountInCents, currency as "PHP" | "USD");
	};

	const getTransactionMetadata = (transaction: PaymentTransaction) => {
		if (!transaction.metadata) return null;
		const metadata = transaction.metadata as any;
		return {
			credits: metadata.credits,
			tier: metadata.tier,
			billingType: metadata.billingType,
		};
	};

	return (
		<div className="space-y-6">
			{/* Stats Summary */}
			{paymentStats && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold">{paymentStats.total}</div>
							<p className="text-xs text-muted-foreground">Total Transactions</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold text-yellow-600">
								{paymentStats.pending}
							</div>
							<p className="text-xs text-muted-foreground">Pending</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold text-green-600">
								{paymentStats.completed}
							</div>
							<p className="text-xs text-muted-foreground">Completed</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="text-2xl font-bold text-red-600">
								{paymentStats.failed}
							</div>
							<p className="text-xs text-muted-foreground">Failed</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Filters and Search */}
			<Card>
				<CardHeader>
					<CardTitle>Payment Transactions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4 mb-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<Input
								placeholder="Search by transaction ID, description, or external ID..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex gap-2">
							<Button
								variant={filters.status === "pending" ? "default" : "outline"}
								size="sm"
								onClick={() => setFilters({ ...filters, status: "pending" })}
							>
								Pending
							</Button>
							<Button
								variant={filters.status === "completed" ? "default" : "outline"}
								size="sm"
								onClick={() => setFilters({ ...filters, status: "completed" })}
							>
								Completed
							</Button>
							<Button
								variant={filters.status === "failed" ? "default" : "outline"}
								size="sm"
								onClick={() => setFilters({ ...filters, status: "failed" })}
							>
								Failed
							</Button>
							<Button
								variant={!filters.status ? "default" : "outline"}
								size="sm"
								onClick={() => {
									const { status, ...rest } = filters;
									setFilters(rest);
								}}
							>
								All
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => refetchTransactions()}
							>
								<RefreshCw className="w-4 h-4" />
							</Button>
						</div>
					</div>

					{/* Transactions Table */}
					{isLoadingTransactions ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-baby-purple" />
						</div>
					) : isErrorLoadingTransactions ? (
						<div className="text-center py-12">
							<XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
							<p className="text-red-600 font-semibold mb-2">Error loading payments</p>
							<p className="text-sm text-gray-600 mb-4">
								{loadingError instanceof Error 
									? loadingError.message 
									: "Failed to fetch payment transactions"}
							</p>
							<Button onClick={() => refetchTransactions()} variant="outline">
								<RefreshCw className="w-4 h-4 mr-2" />
								Retry
							</Button>
							<p className="text-xs text-gray-500 mt-4">
								Make sure the get-admin-payments edge function is deployed.
							</p>
						</div>
					) : paymentTransactions.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
							<p>No payment transactions found</p>
							<p className="text-sm mt-2">
								{filters.status 
									? `No ${filters.status} transactions found`
									: "Try adjusting your filters"}
							</p>
						</div>
					) : (
						<div className="border rounded-lg">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Transaction ID</TableHead>
										<TableHead>User ID</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Method</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paymentTransactions.map((transaction) => {
										const metadata = getTransactionMetadata(transaction);
										return (
											<TableRow key={transaction.id}>
												<TableCell className="font-mono text-xs">
													{transaction.id.slice(0, 8)}...
												</TableCell>
												<TableCell className="font-mono text-xs">
													{transaction.user_id.slice(0, 8)}...
												</TableCell>
												<TableCell className="font-semibold">
													{formatAmount(
														transaction.amount_in_cents,
														transaction.currency,
													)}
												</TableCell>
												<TableCell>
													<div className="flex flex-col">
														<span className="capitalize">
															{transaction.transaction_type}
														</span>
														{metadata?.credits && (
															<span className="text-xs text-gray-500">
																{metadata.credits} credits
															</span>
														)}
														{metadata?.tier && (
															<span className="text-xs text-gray-500">
																{metadata.tier}
															</span>
														)}
													</div>
												</TableCell>
												<TableCell className="capitalize">
													{transaction.payment_method.replace("_", " ")}
												</TableCell>
												<TableCell>
													<Badge className={getStatusColor(transaction.status)}>
														<div className="flex items-center space-x-1">
															{getStatusIcon(transaction.status)}
															<span className="capitalize">
																{transaction.status}
															</span>
														</div>
													</Badge>
												</TableCell>
												<TableCell className="text-sm">
													{format(
														new Date(transaction.created_at),
														"MMM dd, yyyy",
													)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																setSelectedTransaction(transaction)
															}
														>
															<Eye className="w-3 h-3 mr-1" />
															View
														</Button>
														{transaction.status === "pending" && (
															<>
																<Button
																	variant="default"
																	size="sm"
																	onClick={() => handleApprove(transaction)}
																	disabled={isUpdatingStatus}
																	className="bg-green-600 hover:bg-green-700"
																>
																	<CheckCircle2 className="w-3 h-3 mr-1" />
																	Approve
																</Button>
																<Button
																	variant="destructive"
																	size="sm"
																	onClick={() => handleReject(transaction)}
																	disabled={isUpdatingStatus}
																>
																	<XCircle className="w-3 h-3 mr-1" />
																	Reject
																</Button>
															</>
														)}
													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Transaction Details Dialog */}
			<Dialog
				open={!!selectedTransaction}
				onOpenChange={(open) => !open && setSelectedTransaction(null)}
			>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
					<DialogHeader>
						<DialogTitle>Transaction Details</DialogTitle>
					</DialogHeader>
					{selectedTransaction && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-xs text-muted-foreground">
										Transaction ID
									</Label>
									<p className="font-mono text-sm">{selectedTransaction.id}</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">User ID</Label>
									<p className="font-mono text-sm">
										{selectedTransaction.user_id}
									</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">Amount</Label>
									<p className="font-semibold">
										{formatAmount(
											selectedTransaction.amount_in_cents,
											selectedTransaction.currency,
										)}
									</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">Status</Label>
									<Badge className={getStatusColor(selectedTransaction.status)}>
										<div className="flex items-center space-x-1">
											{getStatusIcon(selectedTransaction.status)}
											<span className="capitalize">
												{selectedTransaction.status}
											</span>
										</div>
									</Badge>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">Type</Label>
									<p className="capitalize">{selectedTransaction.transaction_type}</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">Method</Label>
									<p className="capitalize">
										{selectedTransaction.payment_method.replace("_", " ")}
									</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">
										Created At
									</Label>
									<p className="text-sm">
										{format(
											new Date(selectedTransaction.created_at),
											"MMM dd, yyyy 'at' h:mm a",
										)}
									</p>
								</div>
								{selectedTransaction.verified_at && (
									<div>
										<Label className="text-xs text-muted-foreground">
											Verified At
										</Label>
										<p className="text-sm">
											{format(
												new Date(selectedTransaction.verified_at),
												"MMM dd, yyyy 'at' h:mm a",
											)}
										</p>
									</div>
								)}
							</div>

							{selectedTransaction.description && (
								<div>
									<Label className="text-xs text-muted-foreground">
										Description
									</Label>
									<p className="text-sm">{selectedTransaction.description}</p>
								</div>
							)}

							{selectedTransaction.external_payment_id && (
								<div>
									<Label className="text-xs text-muted-foreground">
										External Payment ID
									</Label>
									<p className="font-mono text-sm">
										{selectedTransaction.external_payment_id}
									</p>
								</div>
							)}

							{selectedTransaction.admin_notes && (
								<div>
									<Label className="text-xs text-muted-foreground">
										Admin Notes
									</Label>
									<p className="text-sm">{selectedTransaction.admin_notes}</p>
								</div>
							)}

							{selectedTransaction.metadata && (
								<div>
									<Label className="text-xs text-muted-foreground">Metadata</Label>
									<pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
										{JSON.stringify(selectedTransaction.metadata, null, 2)}
									</pre>
								</div>
							)}

							{selectedTransaction.payment_proof_url && (
								<div>
									<Label className="text-xs text-muted-foreground">
										Payment Proof
									</Label>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											handleViewProof(selectedTransaction.payment_proof_url!)
										}
										className="mt-2"
									>
										<Eye className="w-4 h-4 mr-2" />
										View Proof
									</Button>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Payment Proof Viewer Dialog */}
			<Dialog
				open={!!viewingProof}
				onOpenChange={(open) => !open && setViewingProof(null)}
			>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
					<DialogHeader>
						<DialogTitle>Payment Proof</DialogTitle>
					</DialogHeader>
					{viewingProof?.loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-baby-purple" />
							<span className="ml-3">Loading proof...</span>
						</div>
					) : viewingProof?.url ? (
						<div className="mt-4">
							{viewingProof.url.toLowerCase().endsWith(".pdf") ? (
								<iframe
									src={viewingProof.url}
									className="w-full h-[70vh] border rounded"
									title="Payment Proof"
								/>
							) : (
								<img
									src={viewingProof.url}
									alt="Payment Proof"
									className="w-full h-auto rounded-lg border"
								/>
							)}
							<div className="mt-4 flex justify-end">
								<Button
									variant="outline"
									onClick={() => window.open(viewingProof.url, "_blank")}
								>
									<Download className="w-4 h-4 mr-2" />
									Open in New Tab
								</Button>
							</div>
						</div>
					) : null}
				</DialogContent>
			</Dialog>

			{/* Approve Confirmation Dialog */}
			<AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Approve Payment</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to approve this payment? This will grant credits
							or activate the subscription automatically.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="space-y-4 py-4">
						{actionTransaction && (
							<div className="bg-gray-50 p-4 rounded-lg space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Amount:</span>
									<span className="font-semibold">
										{formatAmount(
											actionTransaction.amount_in_cents,
											actionTransaction.currency,
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Type:</span>
									<span className="capitalize">
										{actionTransaction.transaction_type}
									</span>
								</div>
								{getTransactionMetadata(actionTransaction)?.credits && (
									<div className="flex justify-between">
										<span className="text-sm text-gray-600">Credits:</span>
										<span className="font-semibold">
											{getTransactionMetadata(actionTransaction)?.credits}
										</span>
									</div>
								)}
							</div>
						)}
						<div>
							<Label htmlFor="admin-notes-approve">Admin Notes (Optional)</Label>
							<Textarea
								id="admin-notes-approve"
								value={adminNotes}
								onChange={(e) => setAdminNotes(e.target.value)}
								placeholder="Add any notes about this approval..."
								className="mt-2"
							/>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmApprove}
							disabled={isUpdatingStatus}
							className="bg-green-600 hover:bg-green-700"
						>
							{isUpdatingStatus ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Approving...
								</>
							) : (
								"Approve Payment"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Reject Confirmation Dialog */}
			<AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Reject Payment</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to reject this payment? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="space-y-4 py-4">
						{actionTransaction && (
							<div className="bg-gray-50 p-4 rounded-lg space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Amount:</span>
									<span className="font-semibold">
										{formatAmount(
											actionTransaction.amount_in_cents,
											actionTransaction.currency,
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600">Type:</span>
									<span className="capitalize">
										{actionTransaction.transaction_type}
									</span>
								</div>
							</div>
						)}
						<div>
							<Label htmlFor="admin-notes-reject">Admin Notes (Required)</Label>
							<Textarea
								id="admin-notes-reject"
								value={adminNotes}
								onChange={(e) => setAdminNotes(e.target.value)}
								placeholder="Please provide a reason for rejection..."
								className="mt-2"
								required
							/>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmReject}
							disabled={isUpdatingStatus || !adminNotes.trim()}
							className="bg-red-600 hover:bg-red-700"
						>
							{isUpdatingStatus ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Rejecting...
								</>
							) : (
								"Reject Payment"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

