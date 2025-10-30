export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_access_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          created_at: string
          id: string
          model_name: string | null
          prompt_text: string | null
          response_text: string | null
          tenant_id: string
          tokens_used: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          model_name?: string | null
          prompt_text?: string | null
          response_text?: string | null
          tenant_id: string
          tokens_used?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          model_name?: string | null
          prompt_text?: string | null
          response_text?: string | null
          tenant_id?: string
          tokens_used?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tags: {
        Row: {
          course_id: string
          tag_id: string
        }
        Insert: {
          course_id: string
          tag_id: string
        }
        Update: {
          course_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_tags_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      course_versions: {
        Row: {
          content: Json | null
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
          version: number
        }
        Insert: {
          content?: Json | null
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          version: number
        }
        Update: {
          content?: Json | null
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_versions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          instructor_id: string | null
          is_featured: boolean
          level: Database["public"]["Enums"]["course_level"]
          max_students: number | null
          price: number | null
          publish_date: string | null
          slug: string
          status: Database["public"]["Enums"]["course_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          max_students?: number | null
          price?: number | null
          publish_date?: string | null
          slug: string
          status?: Database["public"]["Enums"]["course_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          max_students?: number | null
          price?: number | null
          publish_date?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["course_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_number: string | null
          paid_at: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string | null
          tenant_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_number?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          tenant_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          tenant_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "tenant_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          error_details: Json | null
          id: string
          log_level: string
          message: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          id?: string
          log_level: string
          message: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          id?: string
          log_level?: string
          message?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      tenant_subscriptions: {
        Row: {
          amount: number
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          plan: Database["public"]["Enums"]["subscription_plan_type"]
          start_date: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          plan: Database["public"]["Enums"]["subscription_plan_type"]
          start_date?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          plan?: Database["public"]["Enums"]["subscription_plan_type"]
          start_date?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          max_storage_gb: number
          max_students: number
          name: string
          owner_id: string | null
          plan: Database["public"]["Enums"]["subscription_plan_type"]
          subdomain: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_storage_gb?: number
          max_students?: number
          name: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan_type"]
          subdomain: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_storage_gb?: number
          max_students?: number
          name?: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan_type"]
          subdomain?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          ai_tokens_used: number
          bandwidth_gb: number
          created_at: string
          id: string
          metric_date: string
          storage_used_gb: number
          student_count: number
          tenant_id: string
        }
        Insert: {
          ai_tokens_used?: number
          bandwidth_gb?: number
          created_at?: string
          id?: string
          metric_date?: string
          storage_used_gb?: number
          student_count?: number
          tenant_id: string
        }
        Update: {
          ai_tokens_used?: number
          bandwidth_gb?: number
          created_at?: string
          id?: string
          metric_date?: string
          storage_used_gb?: number
          student_count?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "admin"
      billing_cycle: "monthly" | "yearly"
      course_level: "beginner" | "intermediate" | "advanced" | "all"
      course_status: "draft" | "published" | "scheduled" | "archived"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      subscription_plan_type: "starter" | "standard" | "professional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "teacher", "admin"],
      billing_cycle: ["monthly", "yearly"],
      course_level: ["beginner", "intermediate", "advanced", "all"],
      course_status: ["draft", "published", "scheduled", "archived"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      subscription_plan_type: ["starter", "standard", "professional"],
    },
  },
} as const
