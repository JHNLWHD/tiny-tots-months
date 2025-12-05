import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePaymentTracking } from "@/hooks/usePaymentTracking";
import { formatCentsAmount, fromCents } from "@/utils/currency";
import { 
	CreditCard, 
	Clock, 
	CheckCircle2, 
	XCircle, 
	RefreshCw,
	Download,
	Eye
} from "lucide-react";
import { format } from "date-fns";

type PaymentHistoryProps = {
	showSummary?: boolean;
	limit?: number;
};

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ 
	showSummary = true, 
	limit 
}) => {
	const { 
		paymentTransactions, 
		isLoadingTransactions, 
		paymentSummary,
		refetchTransactions 
	} = usePaymentTracking();

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

	const getPaymentMethodIcon = (method: string) => {
		switch (method) {
			case "gcash":
				return "💳";
			case "stripe":
				return "💳";
			case "legacy_migration":
				return "📋";
			default:
				return "💳";
		}
	};

	const formatAmount = (amountInCents: number, currency: string) => {
		return formatCentsAmount(amountInCents, currency as "PHP" | "USD");
	};

	const displayTransactions = limit 
		? paymentTransactions?.slice(0, limit) 
		: paymentTransactions;

	if (isLoadingTransactions) {
		return (
			<Card className="p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-4 bg-gray-200 rounded w-1/4"></div>
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex items-center space-x-4">
								<div className="h-10 w-10 bg-gray-200 rounded-full"></div>
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-gray-200 rounded w-3/4"></div>
									<div className="h-3 bg-gray-200 rounded w-1/2"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Payment Summary */}
			{showSummary && paymentSummary && (
				<Card className="p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold">Payment Summary</h3>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => refetchTransactions()}
						>
							<RefreshCw className="w-4 h-4 mr-2" />
							Refresh
						</Button>
					</div>
					
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{paymentSummary.completedTransactions}
							</div>
							<div className="text-sm text-gray-600">Completed</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-yellow-600">
								{paymentSummary.pendingTransactions}
							</div>
							<div className="text-sm text-gray-600">Pending</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{(() => {
									// Use totalSpentByCurrency if available, otherwise fall back to legacy totalSpent
									const totalsByCurrency = paymentSummary.totalSpentByCurrency || {};
									const currencies = Object.keys(totalsByCurrency) as ("PHP" | "USD")[];
									
									if (currencies.length === 0) {
										// Fallback to legacy totalSpent with primaryCurrency
										return formatCentsAmount(
											paymentSummary.totalSpent, 
											paymentSummary.primaryCurrency || "PHP"
										);
									} else if (currencies.length === 1) {
										// Single currency - display normally
										return formatCentsAmount(
											totalsByCurrency[currencies[0]], 
											currencies[0]
										);
									} else {
										// Multiple currencies - display both
										return (
											<div className="space-y-0.5">
												{currencies.map((currency) => (
													<div key={currency} className="text-lg">
														{formatCentsAmount(totalsByCurrency[currency], currency)}
													</div>
												))}
											</div>
										);
									}
								})()}
							</div>
							<div className="text-sm text-gray-600">Total Spent</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{paymentSummary.totalTransactions}
							</div>
							<div className="text-sm text-gray-600">All Transactions</div>
						</div>
					</div>
				</Card>
			)}

			{/* Payment Transactions */}
			<Card className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">
						Payment History
						{limit && paymentTransactions && paymentTransactions.length > limit && (
							<span className="text-sm text-gray-500 ml-2">
								(Showing {limit} of {paymentTransactions.length})
							</span>
						)}
					</h3>
					{!showSummary && (
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => refetchTransactions()}
						>
							<RefreshCw className="w-4 h-4 mr-2" />
							Refresh
						</Button>
					)}
				</div>

				{!displayTransactions || displayTransactions.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p>No payment transactions yet</p>
						<p className="text-sm">Your payment history will appear here</p>
					</div>
				) : (
					<div className="space-y-4">
						{displayTransactions.map((transaction) => (
							<div 
								key={transaction.id} 
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
							>
								<div className="flex items-center space-x-4">
									<div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
										<span className="text-lg">
											{getPaymentMethodIcon(transaction.payment_method)}
										</span>
									</div>
									
									<div className="flex-1">
										<div className="flex items-center space-x-2">
											<h4 className="font-medium capitalize">
												{transaction.payment_method.replace('_', ' ')} Payment
											</h4>
											<Badge className={getStatusColor(transaction.status)}>
												<div className="flex items-center space-x-1">
													{getStatusIcon(transaction.status)}
													<span className="capitalize">{transaction.status}</span>
												</div>
											</Badge>
										</div>
										
										<div className="text-sm text-gray-600 space-y-1">
											<p>{transaction.description}</p>
											<p>
												{format(new Date(transaction.created_at), "MMM dd, yyyy 'at' h:mm a")}
											</p>
											{transaction.external_payment_id && (
												<p className="font-mono text-xs">
													ID: {transaction.external_payment_id}
												</p>
											)}
										</div>
									</div>
								</div>

								<div className="text-right space-y-2">
								<div className="text-lg font-semibold">
									{formatAmount(transaction.amount_in_cents, transaction.currency)}
								</div>
									
									<div className="flex items-center space-x-2">
										{transaction.payment_proof_url && (
											<Button variant="outline" size="sm">
												<Eye className="w-3 h-3 mr-1" />
												View Proof
											</Button>
										)}
										
										{transaction.status === "completed" && (
											<Button variant="outline" size="sm">
												<Download className="w-3 h-3 mr-1" />
												Receipt
											</Button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>
		</div>
	);
};
