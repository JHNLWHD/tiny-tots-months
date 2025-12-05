import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePaymentIntegration, type PaymentRequest, type PaymentMethod } from "@/hooks/usePaymentIntegration";
import { usePaymentProofUpload } from "@/hooks/usePaymentProofUpload";
import { CreditCard, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

type PaymentFlowProps = {
	request: PaymentRequest;
	onSuccess: (paymentId: string) => void;
	onCancel: () => void;
};

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
	request,
	onSuccess,
	onCancel,
}) => {
	const {
		isProcessing,
		selectedMethod,
		setSelectedMethod,
		getAvailablePaymentMethods,
		processPayment,
		validatePaymentAmount,
		formatPaymentInstructions,
	} = usePaymentIntegration();

	const { uploadPaymentProof, isUploading } = usePaymentProofUpload();

	const [step, setStep] = useState<"method" | "details" | "proof" | "processing" | "success">("method");
	const [proofFile, setProofFile] = useState<File | null>(null);
	const [notes, setNotes] = useState("");
	const [paymentResult, setPaymentResult] = useState<any>(null);

	const availableMethods = getAvailablePaymentMethods(request.currency);

	const handleMethodSelect = (methodType: string) => {
		const method = availableMethods.find(m => m.type === methodType);
		if (method) {
			setSelectedMethod(method);
			setStep("details");
		}
	};

	const handleProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type and size
			const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
			if (!validTypes.includes(file.type)) {
				toast.error("Please upload a JPG, PNG, or PDF file");
				return;
			}
			
			if (file.size > 10 * 1024 * 1024) { // 10MB limit
				toast.error("File size must be less than 10MB");
				return;
			}
			
			setProofFile(file);
		}
	};

	const handlePayment = async () => {
		if (!selectedMethod) return;

		// Validate amount
		if (!validatePaymentAmount(request.amount, request.currency)) {
			toast.error("Invalid payment amount");
			return;
		}

		setStep("processing");

		try {
			let uploadedProofPath: string | undefined;

			// Upload proof if required and provided
			if (proofFile && selectedMethod.type !== "stripe") {
				uploadedProofPath = await new Promise<string>((resolve, reject) => {
					uploadPaymentProof(proofFile, {
						description: `Payment proof for ${request.description}`,
						onSuccess: resolve,
						onError: reject,
					});
				});
			}

			// Process the payment
			const result = await processPayment(request, selectedMethod, proofFile);
			
			setPaymentResult(result);

			if (result.success) {
				setStep("success");
				toast.success(result.instructions || "Payment processed successfully!");
				setTimeout(() => {
					onSuccess(result.paymentId || "");
				}, 2000);
			} else {
				toast.error(result.error || "Payment failed");
				setStep(result.requiresProof ? "proof" : "details");
			}
		} catch (error) {
			console.error("Payment error:", error);
			toast.error("Payment processing failed. Please try again.");
			setStep("details");
		}
	};

	const renderMethodSelection = () => (
		<Card className="p-6">
			<h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
			<div className="space-y-4">
				<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
					<div className="flex justify-between items-center mb-2">
						<span className="font-semibold">Payment Details</span>
						<Badge variant="outline">{request.currency}</Badge>
					</div>
					<p className="text-sm text-gray-600 mb-1">{request.description}</p>
					<p className="text-2xl font-bold text-baby-purple">
						{request.currency === "PHP" ? "₱" : "$"}{request.amount}
					</p>
				</div>

				<RadioGroup onValueChange={handleMethodSelect}>
					{availableMethods.map((method) => (
						<div key={method.type} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
							<RadioGroupItem value={method.type} id={method.type} />
							<Label htmlFor={method.type} className="flex-1 cursor-pointer">
								<div className="flex items-center justify-between">
									<div>
										<div className="font-medium">{method.name}</div>
										<div className="text-sm text-gray-600">{method.description}</div>
									</div>
									<CreditCard className="w-5 h-5 text-gray-400" />
								</div>
							</Label>
						</div>
					))}
				</RadioGroup>
			</div>
			
			<div className="flex gap-3 mt-6">
				<Button variant="outline" onClick={onCancel} className="flex-1">
					Cancel
				</Button>
			</div>
		</Card>
	);

	const renderPaymentDetails = () => (
		<Card className="p-6">
			<h3 className="text-lg font-semibold mb-4">Payment Instructions</h3>
			
			<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
				<div className="flex items-start gap-3">
					<AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
					<div>
						<p className="font-medium text-yellow-800 mb-1">Payment Instructions</p>
						<p className="text-sm text-yellow-700">
							{formatPaymentInstructions(selectedMethod!, request.amount, request.currency)}
						</p>
					</div>
				</div>
			</div>

			{selectedMethod?.type !== "stripe" && (
				<div className="space-y-4">
					<div>
						<Label htmlFor="proof">Upload Payment Receipt/Proof *</Label>
						<Input
							id="proof"
							type="file"
							accept="image/*,.pdf"
							onChange={handleProofUpload}
							className="mt-1"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Accepted formats: JPG, PNG, PDF (max 10MB)
						</p>
					</div>

					<div>
						<Label htmlFor="notes">Additional Notes (Optional)</Label>
						<Textarea
							id="notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Any additional information about your payment..."
							className="mt-1"
						/>
					</div>
				</div>
			)}

			<div className="flex gap-3 mt-6">
				<Button variant="outline" onClick={() => setStep("method")} className="flex-1">
					Back
				</Button>
				<Button 
					onClick={handlePayment}
					disabled={selectedMethod?.type !== "stripe" && !proofFile}
					className="flex-1"
				>
					{selectedMethod?.type === "stripe" ? "Pay Now" : "Submit Payment"}
				</Button>
			</div>
		</Card>
	);

	const renderProcessing = () => (
		<Card className="p-8 text-center">
			<Loader2 className="w-12 h-12 text-baby-purple mx-auto mb-4 animate-spin" />
			<h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
			<p className="text-gray-600">
				{selectedMethod?.type === "stripe" 
					? "Securely processing your payment..."
					: "Uploading payment proof and submitting for verification..."
				}
			</p>
		</Card>
	);

	const renderSuccess = () => (
		<Card className="p-8 text-center">
			<CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
			<h3 className="text-lg font-semibold mb-2">Payment Submitted Successfully!</h3>
			<p className="text-gray-600 mb-4">
				{paymentResult?.instructions || "Your payment has been processed successfully."}
			</p>
			{selectedMethod?.type !== "stripe" && (
				<div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm">
					<p className="font-medium text-blue-800 mb-1">What happens next?</p>
					<p className="text-blue-700">
						We'll verify your payment within 24 hours and activate your purchase. 
						You'll receive an email confirmation once it's complete.
					</p>
				</div>
			)}
		</Card>
	);

	return (
		<div className="max-w-md mx-auto">
			{step === "method" && renderMethodSelection()}
			{step === "details" && renderPaymentDetails()}
			{step === "processing" && renderProcessing()}
			{step === "success" && renderSuccess()}
		</div>
	);
};
