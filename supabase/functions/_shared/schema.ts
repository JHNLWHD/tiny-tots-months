// Drizzle ORM schema definitions
import { pgTable, uuid, text, integer, timestamp, jsonb, boolean } from "https://esm.sh/drizzle-orm@0.34.0/pg-core";

export const paymentTransactions = pgTable("payment_transactions", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull(),
	amountInCents: integer("amount_in_cents").notNull(),
	currency: text("currency").notNull(),
	paymentMethod: text("payment_method").notNull(),
	transactionType: text("transaction_type").notNull(),
	status: text("status").notNull(),
	externalPaymentId: text("external_payment_id"),
	paymentProofUrl: text("payment_proof_url"),
	description: text("description"),
	metadata: jsonb("metadata"),
	verifiedBy: uuid("verified_by"),
	verifiedAt: timestamp("verified_at"),
	adminNotes: text("admin_notes"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userCredits = pgTable("user_credits", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().unique(),
	creditsBalance: integer("credits_balance").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creditTransactions = pgTable("credit_transactions", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull(),
	amount: integer("amount").notNull(),
	transactionType: text("transaction_type").notNull(),
	description: text("description"),
	paymentTransactionId: uuid("payment_transaction_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscription", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull(),
	status: text("status").notNull(),
	tier: text("tier").notNull(),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date"),
	paymentProof: text("payment_proof"),
	paymentTransactionId: uuid("payment_transaction_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

