export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			baby: {
				Row: {
					created_at: string;
					date_of_birth: string;
					gender: string | null;
					id: string;
					name: string;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					date_of_birth: string;
					gender?: string | null;
					id?: string;
					name: string;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					date_of_birth?: string;
					gender?: string | null;
					id?: string;
					name?: string;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			milestone: {
				Row: {
					baby_id: string;
					created_at: string;
					id: string;
					milestone_text: string;
					month_number: number;
					updated_at: string;
				};
				Insert: {
					baby_id: string;
					created_at?: string;
					id?: string;
					milestone_text: string;
					month_number: number;
					updated_at?: string;
				};
				Update: {
					baby_id?: string;
					created_at?: string;
					id?: string;
					milestone_text?: string;
					month_number?: number;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "milestone_baby_id_fkey";
						columns: ["baby_id"];
						isOneToOne: false;
						referencedRelation: "baby";
						referencedColumns: ["id"];
					},
				];
			};
			photo: {
				Row: {
					baby_id: string;
					created_at: string;
					description: string | null;
					id: string;
					is_video: boolean;
					month_number: number;
					storage_path: string;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					baby_id: string;
					created_at?: string;
					description?: string | null;
					id?: string;
					is_video?: boolean;
					month_number: number;
					storage_path: string;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					baby_id?: string;
					created_at?: string;
					description?: string | null;
					id?: string;
					is_video?: boolean;
					month_number?: number;
					storage_path?: string;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "photo_baby_id_fkey";
						columns: ["baby_id"];
						isOneToOne: false;
						referencedRelation: "baby";
						referencedColumns: ["id"];
					},
				];
			};
			profile: {
				Row: {
					created_at: string;
					email: string;
					full_name: string | null;
					id: string;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					email: string;
					full_name?: string | null;
					id: string;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					email?: string;
					full_name?: string | null;
					id?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			subscription: {
				Row: {
					created_at: string;
					end_date: string | null;
					id: string;
					payment_proof: string | null;
					start_date: string;
					status: string;
					tier: string;
					payment_transaction_id: string | null;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					end_date?: string | null;
					id?: string;
					payment_proof?: string | null;
					start_date?: string;
					status: string;
					tier?: string;
					payment_transaction_id?: string | null;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					end_date?: string | null;
					id?: string;
					payment_proof?: string | null;
					start_date?: string;
					status?: string;
					tier?: string;
					payment_transaction_id?: string | null;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "subscription_payment_transaction_id_fkey";
						columns: ["payment_transaction_id"];
						isOneToOne: false;
						referencedRelation: "payment_transactions";
						referencedColumns: ["id"];
					},
				];
			};
			user_credits: {
				Row: {
					created_at: string;
					credits_balance: number;
					id: string;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					credits_balance?: number;
					id?: string;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					credits_balance?: number;
					id?: string;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			credit_transactions: {
				Row: {
					amount: number;
					created_at: string;
					description: string | null;
					id: string;
					transaction_type: string;
					payment_transaction_id: string | null;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					amount: number;
					created_at?: string;
					description?: string | null;
					id?: string;
					transaction_type: string;
					payment_transaction_id?: string | null;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					amount?: number;
					created_at?: string;
					description?: string | null;
					id?: string;
					transaction_type?: string;
					payment_transaction_id?: string | null;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "credit_transactions_payment_transaction_id_fkey";
						columns: ["payment_transaction_id"];
						isOneToOne: false;
						referencedRelation: "payment_transactions";
						referencedColumns: ["id"];
					},
				];
			};
			payment_transactions: {
				Row: {
					id: string;
					user_id: string;
					amount_in_cents: number;
					currency: string;
					payment_method: string;
					transaction_type: string;
					status: string;
					external_payment_id: string | null;
					payment_proof_url: string | null;
					description: string | null;
					metadata: Json | null;
					verified_by: string | null;
					verified_at: string | null;
					admin_notes: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					amount_in_cents: number;
					currency: string;
					payment_method: string;
					transaction_type: string;
					status?: string;
					external_payment_id?: string | null;
					payment_proof_url?: string | null;
					description?: string | null;
					metadata?: Json | null;
					verified_by?: string | null;
					verified_at?: string | null;
					admin_notes?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					amount_in_cents?: number;
					currency?: string;
					payment_method?: string;
					transaction_type?: string;
					status?: string;
					external_payment_id?: string | null;
					payment_proof_url?: string | null;
					description?: string | null;
					metadata?: Json | null;
					verified_by?: string | null;
					verified_at?: string | null;
					admin_notes?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "payment_transactions_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "payment_transactions_verified_by_fkey";
						columns: ["verified_by"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof Database },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
