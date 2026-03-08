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
      ai_health_check_logs: {
        Row: {
          ai_analysis: string | null
          check_id: string
          checks: Json
          created_at: string | null
          created_by: string | null
          execution_time: number
          failed_checks: number
          id: string
          overall_status: string
          passed_checks: number
          recommendations: Json | null
          total_checks: number
          warning_checks: number
        }
        Insert: {
          ai_analysis?: string | null
          check_id: string
          checks: Json
          created_at?: string | null
          created_by?: string | null
          execution_time: number
          failed_checks: number
          id?: string
          overall_status: string
          passed_checks: number
          recommendations?: Json | null
          total_checks: number
          warning_checks: number
        }
        Update: {
          ai_analysis?: string | null
          check_id?: string
          checks?: Json
          created_at?: string | null
          created_by?: string | null
          execution_time?: number
          failed_checks?: number
          id?: string
          overall_status?: string
          passed_checks?: number
          recommendations?: Json | null
          total_checks?: number
          warning_checks?: number
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
      assignment_submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          file_urls: string[] | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          status: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submission_text: string | null
          submitted_at: string
          tenant_id: string | null
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          file_urls?: string[] | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submission_text?: string | null
          submitted_at?: string
          tenant_id?: string | null
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          file_urls?: string[] | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id?: string
          submission_text?: string | null
          submitted_at?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          allow_late_submission: boolean
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          instructions: string | null
          max_score: number
          status: Database["public"]["Enums"]["assignment_status"]
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_late_submission?: boolean
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          max_score?: number
          status?: Database["public"]["Enums"]["assignment_status"]
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_late_submission?: boolean
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          max_score?: number
          status?: Database["public"]["Enums"]["assignment_status"]
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      at_risk_learners: {
        Row: {
          course_id: string | null
          created_at: string
          current_progress: number | null
          days_inactive: number | null
          enrollment_id: string | null
          id: string
          last_activity_at: string | null
          notes: string | null
          notification_sent: boolean | null
          notification_sent_at: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          risk_factors: Json | null
          risk_level: string
          risk_score: number | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          current_progress?: number | null
          days_inactive?: number | null
          enrollment_id?: string | null
          id?: string
          last_activity_at?: string | null
          notes?: string | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_factors?: Json | null
          risk_level?: string
          risk_score?: number | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          current_progress?: number | null
          days_inactive?: number | null
          enrollment_id?: string | null
          id?: string
          last_activity_at?: string | null
          notes?: string | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_factors?: Json | null
          risk_level?: string
          risk_score?: number | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "at_risk_learners_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "at_risk_learners_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "at_risk_learners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string
          check_in_time: string | null
          content_id: string | null
          course_id: string
          created_at: string
          id: string
          ip_address: unknown
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attendance_date?: string
          check_in_time?: string | null
          content_id?: string | null
          course_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attendance_date?: string
          check_in_time?: string | null
          content_id?: string | null
          course_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_details: {
        Row: {
          absence_reason: string | null
          approved_at: string | null
          approved_by: string | null
          attendance_id: string
          created_at: string
          early_leave_minutes: number | null
          excuse_document_url: string | null
          id: string
          late_minutes: number | null
        }
        Insert: {
          absence_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attendance_id: string
          created_at?: string
          early_leave_minutes?: number | null
          excuse_document_url?: string | null
          id?: string
          late_minutes?: number | null
        }
        Update: {
          absence_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attendance_id?: string
          created_at?: string
          early_leave_minutes?: number | null
          excuse_document_url?: string | null
          id?: string
          late_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_details_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs_v2: {
        Row: {
          action: string
          actor_user_id: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          impersonated_by: string | null
          ip_address: unknown
          metadata: Json | null
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          impersonated_by?: string | null
          ip_address?: unknown
          metadata?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          impersonated_by?: string | null
          ip_address?: unknown
          metadata?: Json | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_v2_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_billing_settings: {
        Row: {
          ai_token_addon_price: number
          auto_charge_on_limit: boolean
          billing_email: string | null
          billing_name: string | null
          created_at: string
          enabled: boolean
          id: string
          storage_addon_price: number
          student_addon_price: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          ai_token_addon_price?: number
          auto_charge_on_limit?: boolean
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          storage_addon_price?: number
          student_addon_price?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          ai_token_addon_price?: number
          auto_charge_on_limit?: boolean
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          storage_addon_price?: number
          student_addon_price?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_billing_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_encouragement_rules: {
        Row: {
          created_at: string
          days_threshold: number
          id: string
          is_active: boolean
          message_template: string
          progress_threshold: number | null
          rule_name: string
          target_role: string
          tenant_id: string | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_threshold?: number
          id?: string
          is_active?: boolean
          message_template: string
          progress_threshold?: number | null
          rule_name: string
          target_role?: string
          tenant_id?: string | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_threshold?: number
          id?: string
          is_active?: boolean
          message_template?: string
          progress_threshold?: number | null
          rule_name?: string
          target_role?: string
          tenant_id?: string | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_type: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          tenant_id: string | null
        }
        Insert: {
          badge_type: string
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          tenant_id?: string | null
        }
        Update: {
          badge_type?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_history: {
        Row: {
          amount: number
          billing_date: string
          billing_period_end: string
          billing_period_start: string
          created_at: string
          id: string
          invoice_number: string
          metadata: Json | null
          payment_method: string | null
          plan_name: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          billing_date?: string
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          id?: string
          invoice_number: string
          metadata?: Json | null
          payment_method?: string | null
          plan_name: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_date?: string
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          id?: string
          invoice_number?: string
          metadata?: Json | null
          payment_method?: string | null
          plan_name?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_transactions: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          order_id: string
          payment_key: string | null
          payment_method: string | null
          quantity: number
          status: string
          tenant_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id: string
          payment_key?: string | null
          payment_method?: string | null
          quantity?: number
          status?: string
          tenant_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id?: string
          payment_key?: string | null
          payment_method?: string | null
          quantity?: number
          status?: string
          tenant_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      captcha_verifications: {
        Row: {
          attempts: number | null
          captcha_type: string | null
          challenge: string
          content_id: string | null
          course_id: string | null
          created_at: string
          expected_answer: string
          id: string
          is_verified: boolean | null
          tenant_id: string | null
          user_answer: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          captcha_type?: string | null
          challenge: string
          content_id?: string | null
          course_id?: string | null
          created_at?: string
          expected_answer: string
          id?: string
          is_verified?: boolean | null
          tenant_id?: string | null
          user_answer?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          captcha_type?: string | null
          challenge?: string
          content_id?: string | null
          course_id?: string | null
          created_at?: string
          expected_answer?: string
          id?: string
          is_verified?: boolean | null
          tenant_id?: string | null
          user_answer?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "captcha_verifications_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "course_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captcha_verifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captcha_verifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cart: {
        Row: {
          course_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      certificates: {
        Row: {
          certificate_number: string
          certificate_url: string | null
          created_at: string
          enrollment_id: string
          id: string
          issued_at: string
          metadata: Json | null
        }
        Insert: {
          certificate_number: string
          certificate_url?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          issued_at?: string
          metadata?: Json | null
        }
        Update: {
          certificate_number?: string
          certificate_url?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          issued_at?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_analysis: {
        Row: {
          active_users: number
          analysis_date: string
          avg_completion_time_days: number | null
          avg_engagement_score: number | null
          cohort_definition: Json
          cohort_name: string
          completed_users: number
          course_id: string | null
          created_at: string
          dropped_users: number
          id: string
          metrics: Json | null
          retention_rate_week1: number | null
          retention_rate_week2: number | null
          retention_rate_week4: number | null
          tenant_id: string | null
          total_users: number
        }
        Insert: {
          active_users?: number
          analysis_date?: string
          avg_completion_time_days?: number | null
          avg_engagement_score?: number | null
          cohort_definition: Json
          cohort_name: string
          completed_users?: number
          course_id?: string | null
          created_at?: string
          dropped_users?: number
          id?: string
          metrics?: Json | null
          retention_rate_week1?: number | null
          retention_rate_week2?: number | null
          retention_rate_week4?: number | null
          tenant_id?: string | null
          total_users?: number
        }
        Update: {
          active_users?: number
          analysis_date?: string
          avg_completion_time_days?: number | null
          avg_engagement_score?: number | null
          cohort_definition?: Json
          cohort_name?: string
          completed_users?: number
          course_id?: string | null
          created_at?: string
          dropped_users?: number
          id?: string
          metrics?: Json | null
          retention_rate_week1?: number | null
          retention_rate_week2?: number | null
          retention_rate_week4?: number | null
          tenant_id?: string | null
          total_users?: number
        }
        Relationships: [
          {
            foreignKeyName: "cohort_analysis_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_analysis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          course_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohorts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          likes_count: number
          parent_comment_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          likes_count?: number
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          likes_count?: number
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          comments_count: number
          content: string
          course_id: string
          created_at: string
          id: string
          is_pinned: boolean
          likes_count: number
          post_type: Database["public"]["Enums"]["post_type"]
          status: Database["public"]["Enums"]["post_status"]
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id: string
          comments_count?: number
          content: string
          course_id: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          likes_count?: number
          post_type?: Database["public"]["Enums"]["post_type"]
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string
          comments_count?: number
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          likes_count?: number
          post_type?: Database["public"]["Enums"]["post_type"]
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      completion_criteria: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          min_assignment_score: number | null
          min_attendance_rate: number | null
          min_progress_percent: number
          min_quiz_score: number | null
          require_all_assignments: boolean | null
          require_all_quizzes: boolean | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          min_assignment_score?: number | null
          min_attendance_rate?: number | null
          min_progress_percent?: number
          min_quiz_score?: number | null
          require_all_assignments?: boolean | null
          require_all_quizzes?: boolean | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          min_assignment_score?: number | null
          min_attendance_rate?: number | null
          min_progress_percent?: number
          min_quiz_score?: number | null
          require_all_assignments?: boolean | null
          require_all_quizzes?: boolean | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "completion_criteria_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_criteria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      completion_results: {
        Row: {
          assignment_average_score: number | null
          attendance_rate: number | null
          completed_at: string | null
          course_id: string | null
          created_at: string
          enrollment_id: string | null
          evaluation_details: Json | null
          id: string
          is_completed: boolean | null
          progress_percent: number | null
          quiz_average_score: number | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_average_score?: number | null
          attendance_rate?: number | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          enrollment_id?: string | null
          evaluation_details?: Json | null
          id?: string
          is_completed?: boolean | null
          progress_percent?: number | null
          quiz_average_score?: number | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_average_score?: number | null
          attendance_rate?: number | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          enrollment_id?: string | null
          evaluation_details?: Json | null
          id?: string
          is_completed?: boolean | null
          progress_percent?: number | null
          quiz_average_score?: number | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completion_results_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_results_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: true
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          content_id: string
          id: string
          last_accessed_at: string
          last_position_seconds: number | null
          progress_percentage: number
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          content_id: string
          id?: string
          last_accessed_at?: string
          last_position_seconds?: number | null
          progress_percentage?: number
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          content_id?: string
          id?: string
          last_accessed_at?: string
          last_position_seconds?: number | null
          progress_percentage?: number
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "course_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_progress_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contracts: {
        Row: {
          ai_tokens_monthly: number | null
          billing_cycle: string
          business_registration_number: string | null
          contract_amount: number
          contract_document_url: string | null
          contract_end_date: string
          contract_number: string
          contract_start_date: string
          created_at: string
          created_by: string | null
          customer_name: string
          customer_requirements: Json | null
          id: string
          max_storage_gb: number | null
          max_students: number | null
          notes: string | null
          payment_method: string | null
          plan: string
          representative_contact: string
          representative_email: string
          representative_name: string
          sales_representative: string | null
          status: string
          technical_representative: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          ai_tokens_monthly?: number | null
          billing_cycle?: string
          business_registration_number?: string | null
          contract_amount?: number
          contract_document_url?: string | null
          contract_end_date: string
          contract_number: string
          contract_start_date: string
          created_at?: string
          created_by?: string | null
          customer_name: string
          customer_requirements?: Json | null
          id?: string
          max_storage_gb?: number | null
          max_students?: number | null
          notes?: string | null
          payment_method?: string | null
          plan: string
          representative_contact: string
          representative_email: string
          representative_name: string
          sales_representative?: string | null
          status?: string
          technical_representative?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          ai_tokens_monthly?: number | null
          billing_cycle?: string
          business_registration_number?: string | null
          contract_amount?: number
          contract_document_url?: string | null
          contract_end_date?: string
          contract_number?: string
          contract_start_date?: string
          created_at?: string
          created_by?: string | null
          customer_name?: string
          customer_requirements?: Json | null
          id?: string
          max_storage_gb?: number | null
          max_students?: number | null
          notes?: string | null
          payment_method?: string | null
          plan?: string
          representative_contact?: string
          representative_email?: string
          representative_name?: string
          sales_representative?: string | null
          status?: string
          technical_representative?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      counseling_logs: {
        Row: {
          counseling_date: string
          counseling_type: string
          counselor_advice: string | null
          counselor_id: string
          course_id: string | null
          created_at: string
          follow_up_date: string | null
          follow_up_needed: boolean | null
          id: string
          is_confidential: boolean | null
          student_concerns: string | null
          student_id: string
          summary: string
          updated_at: string
        }
        Insert: {
          counseling_date?: string
          counseling_type: string
          counselor_advice?: string | null
          counselor_id: string
          course_id?: string | null
          created_at?: string
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          is_confidential?: boolean | null
          student_concerns?: string | null
          student_id: string
          summary: string
          updated_at?: string
        }
        Update: {
          counseling_date?: string
          counseling_type?: string
          counselor_advice?: string | null
          counselor_id?: string
          course_id?: string | null
          created_at?: string
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          is_confidential?: boolean | null
          student_concerns?: string | null
          student_id?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "counseling_logs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_chat_messages: {
        Row: {
          course_id: string
          created_at: string
          id: string
          message: string
          user_id: string
          user_role: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          message: string
          user_id: string
          user_role: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          message?: string
          user_id?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_chat_messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_contents: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_preview: boolean
          is_published: boolean
          order_index: number
          tenant_id: string | null
          title: string
          updated_at: string
          video_provider: Database["public"]["Enums"]["video_provider"] | null
          video_url: string | null
        }
        Insert: {
          content_type?: Database["public"]["Enums"]["content_type"]
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean
          is_published?: boolean
          order_index?: number
          tenant_id?: string | null
          title: string
          updated_at?: string
          video_provider?: Database["public"]["Enums"]["video_provider"] | null
          video_url?: string | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean
          is_published?: boolean
          order_index?: number
          tenant_id?: string | null
          title?: string
          updated_at?: string
          video_provider?: Database["public"]["Enums"]["video_provider"] | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_contents_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_contents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          enrollment_id: string
          id: string
          last_accessed_at: string
          lesson_id: string
          time_spent_minutes: number | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          enrollment_id: string
          id?: string
          last_accessed_at?: string
          lesson_id: string
          time_spent_minutes?: number | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          enrollment_id?: string
          id?: string
          last_accessed_at?: string
          lesson_id?: string
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
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
          course_type: string
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          instructor_id: string | null
          is_featured: boolean
          level: Database["public"]["Enums"]["course_level"]
          live_meeting_provider: string | null
          live_meeting_url: string | null
          live_scheduled_at: string | null
          max_students: number | null
          price: number | null
          publish_date: string | null
          slug: string
          status: Database["public"]["Enums"]["course_status"]
          tenant_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category_id?: string | null
          course_type?: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          live_meeting_provider?: string | null
          live_meeting_url?: string | null
          live_scheduled_at?: string | null
          max_students?: number | null
          price?: number | null
          publish_date?: string | null
          slug: string
          status?: Database["public"]["Enums"]["course_status"]
          tenant_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category_id?: string | null
          course_type?: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          live_meeting_provider?: string | null
          live_meeting_url?: string | null
          live_scheduled_at?: string | null
          max_students?: number | null
          price?: number | null
          publish_date?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["course_status"]
          tenant_id?: string | null
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
          {
            foreignKeyName: "courses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_learning_goals: {
        Row: {
          completed_lessons: number
          completed_minutes: number
          created_at: string
          goal_achieved: boolean
          goal_date: string
          id: string
          target_lessons: number
          target_minutes: number
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_lessons?: number
          completed_minutes?: number
          created_at?: string
          goal_achieved?: boolean
          goal_date?: string
          id?: string
          target_lessons?: number
          target_minutes?: number
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_lessons?: number
          completed_minutes?: number
          created_at?: string
          goal_achieved?: boolean
          goal_date?: string
          id?: string
          target_lessons?: number
          target_minutes?: number
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_learning_goals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dropout_records: {
        Row: {
          created_at: string
          documents: Json | null
          dropout_date: string
          dropout_reason: string
          enrollment_id: string
          id: string
          interview_notes: string | null
          processed_at: string | null
          processed_by: string | null
          reason_category: string
          refund_amount: number | null
          refund_status: string | null
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          dropout_date?: string
          dropout_reason: string
          enrollment_id: string
          id?: string
          interview_notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason_category: string
          refund_amount?: number | null
          refund_status?: string | null
        }
        Update: {
          created_at?: string
          documents?: Json | null
          dropout_date?: string
          dropout_reason?: string
          enrollment_id?: string
          id?: string
          interview_notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason_category?: string
          refund_amount?: number | null
          refund_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dropout_records_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      encouragement_logs: {
        Row: {
          id: string
          metadata: Json | null
          notification_id: string | null
          rule_id: string | null
          sent_at: string
          trigger_reason: string | null
          user_id: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          rule_id?: string | null
          sent_at?: string
          trigger_reason?: string | null
          user_id: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          rule_id?: string | null
          sent_at?: string
          trigger_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encouragement_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encouragement_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "auto_encouragement_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          cohort_id: string | null
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress: number | null
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          cohort_id?: string | null
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          cohort_id?: string | null
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_status: {
        Row: {
          created_at: string | null
          error_count: number | null
          feature_category: string
          feature_name: string
          id: string
          last_checked_at: string | null
          metadata: Json | null
          status: string
          status_message: string | null
          tenant_id: string | null
          updated_at: string | null
          uptime_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          error_count?: number | null
          feature_category: string
          feature_name: string
          id?: string
          last_checked_at?: string | null
          metadata?: Json | null
          status: string
          status_message?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          error_count?: number | null
          feature_category?: string
          feature_name?: string
          id?: string
          last_checked_at?: string | null
          metadata?: Json | null
          status?: string
          status_message?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_status_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_premium: boolean | null
          key: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          key: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          key?: string
          name?: string
        }
        Relationships: []
      }
      government_training_info: {
        Row: {
          course_id: string
          created_at: string
          hrd_net_course_id: string | null
          id: string
          is_government_supported: boolean | null
          metadata: Json | null
          practical_hours: number | null
          required_attendance_rate: number | null
          required_exam_score: number | null
          theory_hours: number | null
          total_training_hours: number | null
          training_allowance: number | null
          training_number: string | null
          training_provider: string | null
          training_type: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          hrd_net_course_id?: string | null
          id?: string
          is_government_supported?: boolean | null
          metadata?: Json | null
          practical_hours?: number | null
          required_attendance_rate?: number | null
          required_exam_score?: number | null
          theory_hours?: number | null
          total_training_hours?: number | null
          training_allowance?: number | null
          training_number?: string | null
          training_provider?: string | null
          training_type: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          hrd_net_course_id?: string | null
          id?: string
          is_government_supported?: boolean | null
          metadata?: Json | null
          practical_hours?: number | null
          required_attendance_rate?: number | null
          required_exam_score?: number | null
          theory_hours?: number | null
          total_training_hours?: number | null
          training_allowance?: number | null
          training_number?: string | null
          training_provider?: string | null
          training_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "government_training_info_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          assignment_id: string | null
          created_at: string
          enrollment_id: string
          grade_type: string
          graded_at: string
          graded_by: string | null
          id: string
          max_score: number
          notes: string | null
          percentage: number | null
          score: number
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          enrollment_id: string
          grade_type: string
          graded_at?: string
          graded_by?: string | null
          id?: string
          max_score: number
          notes?: string | null
          percentage?: number | null
          score: number
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          enrollment_id?: string
          grade_type?: string
          graded_at?: string
          graded_by?: string | null
          id?: string
          max_score?: number
          notes?: string | null
          percentage?: number | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "grades_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      health_check_results: {
        Row: {
          ai_analysis: string | null
          check_id: string
          created_at: string | null
          details: Json
          executed_by: string | null
          execution_time_ms: number | null
          failed_checks: number
          id: string
          overall_status: string
          passed_checks: number
          recommendations: Json | null
          tenant_id: string | null
          total_checks: number
          updated_at: string | null
          warning_checks: number
        }
        Insert: {
          ai_analysis?: string | null
          check_id?: string
          created_at?: string | null
          details?: Json
          executed_by?: string | null
          execution_time_ms?: number | null
          failed_checks?: number
          id?: string
          overall_status: string
          passed_checks?: number
          recommendations?: Json | null
          tenant_id?: string | null
          total_checks?: number
          updated_at?: string | null
          warning_checks?: number
        }
        Update: {
          ai_analysis?: string | null
          check_id?: string
          created_at?: string | null
          details?: Json
          executed_by?: string | null
          execution_time_ms?: number | null
          failed_checks?: number
          id?: string
          overall_status?: string
          passed_checks?: number
          recommendations?: Json | null
          tenant_id?: string | null
          total_checks?: number
          updated_at?: string | null
          warning_checks?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_check_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hrd_features: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          feature_key: string
          feature_name: string
          icon_name: string | null
          id: string
          is_enabled: boolean | null
          role: string
          route_path: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          feature_key: string
          feature_name: string
          icon_name?: string | null
          id?: string
          is_enabled?: boolean | null
          role: string
          route_path?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          feature_key?: string
          feature_name?: string
          icon_name?: string | null
          id?: string
          is_enabled?: boolean | null
          role?: string
          route_path?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      impersonation_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean
          operator_id: string
          reason: string
          session_token: string
          started_at: string
          target_tenant_id: string
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          operator_id: string
          reason: string
          session_token: string
          started_at?: string
          target_tenant_id: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          operator_id?: string
          reason?: string
          session_token?: string
          started_at?: string
          target_tenant_id?: string
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impersonation_sessions_target_tenant_id_fkey"
            columns: ["target_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kdt_compliance_logs: {
        Row: {
          content_id: string | null
          course_id: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          content_id?: string | null
          course_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string | null
          course_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      learner_risk_analysis: {
        Row: {
          course_id: string | null
          created_at: string
          dropout_probability: number | null
          factors: Json
          id: string
          intervention_notes: string | null
          intervention_required: boolean
          intervention_taken: boolean
          last_analyzed_at: string
          recommendations: string[] | null
          risk_level: string
          risk_score: number
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          dropout_probability?: number | null
          factors?: Json
          id?: string
          intervention_notes?: string | null
          intervention_required?: boolean
          intervention_taken?: boolean
          last_analyzed_at?: string
          recommendations?: string[] | null
          risk_level: string
          risk_score?: number
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          dropout_probability?: number | null
          factors?: Json
          id?: string
          intervention_notes?: string | null
          intervention_required?: boolean
          intervention_taken?: boolean
          last_analyzed_at?: string
          recommendations?: string[] | null
          risk_level?: string
          risk_score?: number
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_risk_analysis_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learner_risk_analysis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_analytics: {
        Row: {
          at_risk_score: number | null
          course_id: string
          created_at: string
          engagement_score: number | null
          id: string
          last_activity_at: string | null
          learning_pattern: Json | null
          lessons_completed: number | null
          total_time_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          at_risk_score?: number | null
          course_id: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          last_activity_at?: string | null
          learning_pattern?: Json | null
          lessons_completed?: number | null
          total_time_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          at_risk_score?: number | null
          course_id?: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          last_activity_at?: string | null
          learning_pattern?: Json | null
          lessons_completed?: number | null
          total_time_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_steps: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string
          description: string | null
          estimated_minutes: number
          id: string
          is_required: boolean
          learning_path_id: string
          step_order: number
          title: string
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number
          id?: string
          is_required?: boolean
          learning_path_id: string
          step_order: number
          title: string
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number
          id?: string
          is_required?: boolean
          learning_path_id?: string
          step_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_steps_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string
          estimated_hours: number
          id: string
          is_active: boolean
          learning_objectives: string[] | null
          prerequisites: Json | null
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level: string
          estimated_hours?: number
          id?: string
          is_active?: boolean
          learning_objectives?: string[] | null
          prerequisites?: Json | null
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string
          estimated_hours?: number
          id?: string
          is_active?: boolean
          learning_objectives?: string[] | null
          prerequisites?: Json | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_pattern_analysis: {
        Row: {
          analysis_period: string
          avg_session_duration_minutes: number | null
          completion_rate: number | null
          consistency_score: number | null
          created_at: string
          engagement_score: number | null
          id: string
          insights: Json | null
          learning_velocity: number | null
          peak_learning_day: number | null
          peak_learning_hour: number | null
          period_end: string
          period_start: string
          preferred_content_types: Json | null
          tenant_id: string | null
          total_learning_time_minutes: number
          user_id: string
        }
        Insert: {
          analysis_period: string
          avg_session_duration_minutes?: number | null
          completion_rate?: number | null
          consistency_score?: number | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          insights?: Json | null
          learning_velocity?: number | null
          peak_learning_day?: number | null
          peak_learning_hour?: number | null
          period_end: string
          period_start: string
          preferred_content_types?: Json | null
          tenant_id?: string | null
          total_learning_time_minutes?: number
          user_id: string
        }
        Update: {
          analysis_period?: string
          avg_session_duration_minutes?: number | null
          completion_rate?: number | null
          consistency_score?: number | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          insights?: Json | null
          learning_velocity?: number | null
          peak_learning_day?: number | null
          peak_learning_hour?: number | null
          period_end?: string
          period_start?: string
          preferred_content_types?: Json | null
          tenant_id?: string | null
          total_learning_time_minutes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_pattern_analysis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_predictions: {
        Row: {
          actual_value: Json | null
          confidence_score: number | null
          course_id: string | null
          created_at: string
          id: string
          model_version: string | null
          predicted_value: Json
          prediction_accuracy: number | null
          prediction_date: string
          prediction_type: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          actual_value?: Json | null
          confidence_score?: number | null
          course_id?: string | null
          created_at?: string
          id?: string
          model_version?: string | null
          predicted_value: Json
          prediction_accuracy?: number | null
          prediction_date?: string
          prediction_type: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          actual_value?: Json | null
          confidence_score?: number | null
          course_id?: string | null
          created_at?: string
          id?: string
          model_version?: string | null
          predicted_value?: Json
          prediction_accuracy?: number | null
          prediction_date?: string
          prediction_type?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_predictions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_predictions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_recommendations: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          ai_model: string | null
          created_at: string
          id: string
          reason: string | null
          recommendation_score: number
          recommendation_type: string
          recommended_item_id: string | null
          recommended_item_type: string | null
          tenant_id: string | null
          user_data_snapshot: Json | null
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          ai_model?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          recommendation_score?: number
          recommendation_type: string
          recommended_item_id?: string | null
          recommended_item_type?: string | null
          tenant_id?: string | null
          user_data_snapshot?: Json | null
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          ai_model?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          recommendation_score?: number
          recommendation_type?: string
          recommended_item_id?: string | null
          recommended_item_type?: string | null
          tenant_id?: string | null
          user_data_snapshot?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_recommendations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_reminders: {
        Row: {
          created_at: string
          days_of_week: number[]
          id: string
          is_active: boolean
          message: string | null
          reminder_time: string
          reminder_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          message?: string | null
          reminder_time?: string
          reminder_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          message?: string | null
          reminder_time?: string
          reminder_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          completed: boolean
          content_id: string | null
          course_id: string | null
          created_at: string
          duration_minutes: number
          ended_at: string | null
          focus_score: number | null
          id: string
          notes: string | null
          session_type: string
          started_at: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          content_id?: string | null
          course_id?: string | null
          created_at?: string
          duration_minutes: number
          ended_at?: string | null
          focus_score?: number | null
          id?: string
          notes?: string | null
          session_type?: string
          started_at?: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          content_id?: string | null
          course_id?: string | null
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          focus_score?: number | null
          id?: string
          notes?: string | null
          session_type?: string
          started_at?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "course_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_streaks: {
        Row: {
          created_at: string
          goal_achieved: boolean
          id: string
          lessons_completed: number
          minutes_learned: number
          streak_date: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_achieved?: boolean
          id?: string
          lessons_completed?: number
          minutes_learned?: number
          streak_date: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          goal_achieved?: boolean
          id?: string
          lessons_completed?: number
          minutes_learned?: number
          streak_date?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_streaks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_participants: {
        Row: {
          id: string
          is_online: boolean | null
          joined_at: string | null
          left_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          instructor_id: string
          max_participants: number | null
          meeting_url: string | null
          scheduled_at: string
          started_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          instructor_id: string
          max_participants?: number | null
          meeting_url?: string | null
          scheduled_at: string
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          instructor_id?: string
          max_participants?: number | null
          meeting_url?: string | null
          scheduled_at?: string
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          metadata: Json | null
          role: Database["public"]["Enums"]["membership_role"]
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          metadata?: Json | null
          role?: Database["public"]["Enums"]["membership_role"]
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          metadata?: Json | null
          role?: Database["public"]["Enums"]["membership_role"]
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_relationships: {
        Row: {
          course_id: string | null
          created_at: string
          end_date: string | null
          id: string
          mentee_id: string
          mentor_id: string
          notes: string | null
          start_date: string
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          mentee_id: string
          mentor_id: string
          notes?: string | null
          start_date?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          mentee_id?: string
          mentor_id?: string
          notes?: string | null
          start_date?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_relationships_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_relationships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_sessions: {
        Row: {
          agenda: string | null
          created_at: string
          duration_minutes: number
          feedback_mentee: string | null
          feedback_mentor: string | null
          id: string
          meeting_link: string | null
          notes: string | null
          rating_mentee: number | null
          rating_mentor: number | null
          relationship_id: string
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          agenda?: string | null
          created_at?: string
          duration_minutes?: number
          feedback_mentee?: string | null
          feedback_mentor?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          rating_mentee?: number | null
          rating_mentor?: number | null
          relationship_id: string
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          agenda?: string | null
          created_at?: string
          duration_minutes?: number
          feedback_mentee?: string | null
          feedback_mentor?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          rating_mentee?: number | null
          rating_mentor?: number | null
          relationship_id?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_sessions_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "mentoring_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_order: {
        Row: {
          created_at: string
          id: string
          menu_items: Json
          updated_at: string
          user_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_items: Json
          updated_at?: string
          user_role: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_items?: Json
          updated_at?: string
          user_role?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          achievement_notifications: boolean
          assignment_reminders: boolean
          course_updates: boolean
          created_at: string
          email_enabled: boolean
          encouragement_messages: boolean
          id: string
          push_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_notifications?: boolean
          assignment_reminders?: boolean
          course_updates?: boolean
          created_at?: string
          email_enabled?: boolean
          encouragement_messages?: boolean
          id?: string
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_notifications?: boolean
          assignment_reminders?: boolean
          course_updates?: boolean
          created_at?: string
          email_enabled?: boolean
          encouragement_messages?: boolean
          id?: string
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          read_at: string | null
          tenant_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          tenant_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          tenant_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offline_downloads: {
        Row: {
          access_count: number
          content_id: string
          created_at: string
          download_size_mb: number | null
          download_status: string
          downloaded_at: string | null
          expires_at: string | null
          id: string
          last_accessed_at: string | null
          user_id: string
        }
        Insert: {
          access_count?: number
          content_id: string
          created_at?: string
          download_size_mb?: number | null
          download_status?: string
          downloaded_at?: string | null
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          user_id: string
        }
        Update: {
          access_count?: number
          content_id?: string
          created_at?: string
          download_size_mb?: number | null
          download_status?: string
          downloaded_at?: string | null
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_downloads_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "course_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_tenant_access: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          operator_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          operator_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          operator_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operator_tenant_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          max_members: number | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_members?: number | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_members?: number | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          order_id: string
          payment_key: string | null
          payment_method: string | null
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id: string
          payment_key?: string | null
          payment_method?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id?: string
          payment_key?: string | null
          payment_method?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      peer_feedback: {
        Row: {
          assignment_id: string | null
          comments: string | null
          created_at: string
          id: string
          improvements: string | null
          is_helpful: boolean | null
          rating: number | null
          reviewee_id: string
          reviewer_id: string
          strengths: string | null
          submission_id: string | null
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          improvements?: string | null
          is_helpful?: boolean | null
          rating?: number | null
          reviewee_id: string
          reviewer_id: string
          strengths?: string | null
          submission_id?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          improvements?: string | null
          is_helpful?: boolean | null
          rating?: number | null
          reviewee_id?: string
          reviewer_id?: string
          strengths?: string | null
          submission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_feedback_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_feedback_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assignment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_recommendations: {
        Row: {
          acted_at: string | null
          created_at: string
          effectiveness_score: number | null
          id: string
          priority_score: number
          reasoning: string | null
          recommendation_data: Json
          recommendation_type: string
          status: string
          tenant_id: string | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          acted_at?: string | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          priority_score?: number
          reasoning?: string | null
          recommendation_data: Json
          recommendation_type: string
          status?: string
          tenant_id?: string | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          acted_at?: string | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          priority_score?: number
          reasoning?: string | null
          recommendation_data?: Json
          recommendation_type?: string
          status?: string
          tenant_id?: string | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personalized_recommendations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean | null
          is_default: boolean | null
          limits: Json
          name: string
          price_monthly: number
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          limits?: Json
          name: string
          price_monthly?: number
          tier?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          limits?: Json
          name?: string
          price_monthly?: number
          tier?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      platform_versions: {
        Row: {
          breaking_changes: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          features: Json
          id: string
          is_published: boolean
          release_date: string
          release_type: string
          tech_changes: Json | null
          title: string
          version: string
        }
        Insert: {
          breaking_changes?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_published?: boolean
          release_date?: string
          release_type?: string
          tech_changes?: Json | null
          title: string
          version: string
        }
        Update: {
          breaking_changes?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_published?: boolean
          release_date?: string
          release_type?: string
          tech_changes?: Json | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      point_history: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          points: number
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          points: number
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          demo_approved: boolean | null
          demo_approved_at: string | null
          demo_approved_by: string | null
          demo_requested_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          rejection_reason: string | null
          suspended_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          demo_approved?: boolean | null
          demo_approved_at?: string | null
          demo_approved_by?: string | null
          demo_requested_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          rejection_reason?: string | null
          suspended_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          demo_approved?: boolean | null
          demo_approved_at?: string | null
          demo_approved_by?: string | null
          demo_requested_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          rejection_reason?: string | null
          suspended_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answered_at: string | null
          attempt_id: string | null
          id: string
          is_correct: boolean | null
          points_earned: number | null
          question_id: string | null
          selected_answer: Json | null
        }
        Insert: {
          answered_at?: string | null
          attempt_id?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string | null
          selected_answer?: Json | null
        }
        Update: {
          answered_at?: string | null
          attempt_id?: string | null
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string | null
          selected_answer?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          browser_warnings: Json | null
          created_at: string
          id: string
          max_score: number | null
          passed: boolean | null
          quiz_id: string | null
          score: number | null
          started_at: string
          status: string | null
          submitted_at: string | null
          tab_switch_count: number | null
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          browser_warnings?: Json | null
          created_at?: string
          id?: string
          max_score?: number | null
          passed?: boolean | null
          quiz_id?: string | null
          score?: number | null
          started_at?: string
          status?: string | null
          submitted_at?: string | null
          tab_switch_count?: number | null
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          browser_warnings?: Json | null
          created_at?: string
          id?: string
          max_score?: number | null
          passed?: boolean | null
          quiz_id?: string | null
          score?: number | null
          started_at?: string
          status?: string | null
          submitted_at?: string | null
          tab_switch_count?: number | null
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_question_pool: {
        Row: {
          created_at: string
          id: string
          question_id: string | null
          quiz_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          question_id?: string | null
          quiz_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string | null
          quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_question_pool_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_question_pool_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          category: string | null
          correct_answer: string | null
          course_id: string | null
          created_at: string
          created_by: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          is_active: boolean | null
          options: Json | null
          points: number
          question_text: string
          question_type: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          correct_answer?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json | null
          points?: number
          question_text: string
          question_type?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          correct_answer?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json | null
          points?: number
          question_text?: string
          question_type?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_published: boolean | null
          max_attempts: number | null
          pass_score: number
          question_count: number
          show_correct_answers: boolean | null
          shuffle_options: boolean | null
          shuffle_questions: boolean | null
          tenant_id: string | null
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          max_attempts?: number | null
          pass_score?: number
          question_count?: number
          show_correct_answers?: boolean | null
          shuffle_options?: boolean | null
          shuffle_questions?: boolean | null
          tenant_id?: string | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          max_attempts?: number | null
          pass_score?: number
          question_count?: number
          show_correct_answers?: boolean | null
          shuffle_options?: boolean | null
          shuffle_questions?: boolean | null
          tenant_id?: string | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_logs: {
        Row: {
          created_at: string
          function_name: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      satisfaction_responses: {
        Row: {
          id: string
          responses: Json
          submitted_at: string
          survey_id: string
          user_id: string
        }
        Insert: {
          id?: string
          responses?: Json
          submitted_at?: string
          survey_id: string
          user_id: string
        }
        Update: {
          id?: string
          responses?: Json
          submitted_at?: string
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "satisfaction_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      satisfaction_surveys: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          questions: Json
          start_date: string | null
          survey_type: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          questions?: Json
          start_date?: string | null
          survey_type: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          questions?: Json
          start_date?: string | null
          survey_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_surveys_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_usage: {
        Row: {
          created_at: string
          document_bytes: number
          file_count: number
          id: string
          image_bytes: number
          last_calculated_at: string
          tenant_id: string | null
          total_bytes: number
          updated_at: string
          user_id: string | null
          video_bytes: number
        }
        Insert: {
          created_at?: string
          document_bytes?: number
          file_count?: number
          id?: string
          image_bytes?: number
          last_calculated_at?: string
          tenant_id?: string | null
          total_bytes?: number
          updated_at?: string
          user_id?: string | null
          video_bytes?: number
        }
        Update: {
          created_at?: string
          document_bytes?: number
          file_count?: number
          id?: string
          image_bytes?: number
          last_calculated_at?: string
          tenant_id?: string | null
          total_bytes?: number
          updated_at?: string
          user_id?: string | null
          video_bytes?: number
        }
        Relationships: []
      }
      student_activity_status: {
        Row: {
          cohort_id: string | null
          created_at: string
          current_content_id: string | null
          current_course_id: string | null
          id: string
          is_focus: boolean | null
          is_online: boolean | null
          last_active_at: string | null
          last_heartbeat_at: string | null
          progress_percentage: number | null
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cohort_id?: string | null
          created_at?: string
          current_content_id?: string | null
          current_course_id?: string | null
          id?: string
          is_focus?: boolean | null
          is_online?: boolean | null
          last_active_at?: string | null
          last_heartbeat_at?: string | null
          progress_percentage?: number | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cohort_id?: string | null
          created_at?: string
          current_content_id?: string | null
          current_course_id?: string | null
          id?: string
          is_focus?: boolean | null
          is_online?: boolean | null
          last_active_at?: string | null
          last_heartbeat_at?: string | null
          progress_percentage?: number | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_activity_status_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activity_status_current_content_id_fkey"
            columns: ["current_content_id"]
            isOneToOne: false
            referencedRelation: "course_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activity_status_current_course_id_fkey"
            columns: ["current_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activity_status_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      student_activity_tracking: {
        Row: {
          cohort_id: string | null
          course_id: string | null
          created_at: string | null
          current_content_id: string | null
          id: string
          is_focused: boolean | null
          is_online: boolean | null
          last_activity_at: string | null
          last_mouse_movement_at: string | null
          session_start_at: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cohort_id?: string | null
          course_id?: string | null
          created_at?: string | null
          current_content_id?: string | null
          id?: string
          is_focused?: boolean | null
          is_online?: boolean | null
          last_activity_at?: string | null
          last_mouse_movement_at?: string | null
          session_start_at?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cohort_id?: string | null
          course_id?: string | null
          created_at?: string | null
          current_content_id?: string | null
          id?: string
          is_focused?: boolean | null
          is_online?: boolean | null
          last_activity_at?: string | null
          last_mouse_movement_at?: string | null
          session_start_at?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_activity_tracking_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activity_tracking_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activity_tracking_current_content_id_fkey"
            columns: ["current_content_id"]
            isOneToOne: false
            referencedRelation: "course_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activity_tracking_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "study_group_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_group_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "study_group_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          last_active_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          last_active_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          last_active_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_posts: {
        Row: {
          attachments: Json | null
          author_id: string
          comments_count: number
          content: string
          created_at: string
          group_id: string
          id: string
          is_pinned: boolean
          likes_count: number
          post_type: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          comments_count?: number
          content: string
          created_at?: string
          group_id: string
          id?: string
          is_pinned?: boolean
          likes_count?: number
          post_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          comments_count?: number
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          is_pinned?: boolean
          likes_count?: number
          post_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          is_public: boolean
          max_members: number
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          max_members?: number
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          max_members?: number
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_groups_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string | null
          tenant_id: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
      tech_stack: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          documentation_url: string | null
          id: string
          is_core: boolean | null
          name: string
          purpose: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          documentation_url?: string | null
          id?: string
          is_core?: boolean | null
          name: string
          purpose?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          documentation_url?: string | null
          id?: string
          is_core?: boolean | null
          name?: string
          purpose?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          preview_url: string | null
          style_config: Json
          template_key: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          preview_url?: string | null
          style_config?: Json
          template_key: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          preview_url?: string | null
          style_config?: Json
          template_key?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_access_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          reason: string | null
          tenant_id: string
          user_ip: unknown
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          reason?: string | null
          tenant_id: string
          user_ip?: unknown
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          reason?: string | null
          tenant_id?: string
          user_ip?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "tenant_access_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_config_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          tenant_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          tenant_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_config_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          ssl_status: string | null
          tenant_id: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          ssl_status?: string | null
          tenant_id: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          ssl_status?: string | null
          tenant_id?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_features: {
        Row: {
          config: Json | null
          created_at: string
          enabled: boolean | null
          feature_id: string
          tenant_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          feature_id: string
          tenant_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          feature_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_sections: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_visible: boolean
          section_type: string
          settings: Json | null
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          section_type: string
          settings?: Json | null
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          section_type?: string
          settings?: Json | null
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          created_at: string
          custom_styles: Json | null
          id: string
          template_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_styles?: Json | null
          id?: string
          template_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_styles?: Json | null
          id?: string
          template_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          billing_status: string | null
          branding: Json | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          custom_domain: string | null
          enabled_features: string[] | null
          features_enabled: Json | null
          id: string
          is_active: boolean
          last_payment_date: string | null
          max_bandwidth_gb: number | null
          max_storage_gb: number
          max_students: number | null
          metadata: Json | null
          name: string
          owner_id: string | null
          plan: Database["public"]["Enums"]["subscription_plan_type"]
          plan_id: string | null
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["tenant_status"] | null
          subdomain: string
          suspended_reason: string | null
          trial_end_date: string | null
          updated_at: string
        }
        Insert: {
          billing_status?: string | null
          branding?: Json | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          custom_domain?: string | null
          enabled_features?: string[] | null
          features_enabled?: Json | null
          id?: string
          is_active?: boolean
          last_payment_date?: string | null
          max_bandwidth_gb?: number | null
          max_storage_gb?: number
          max_students?: number | null
          metadata?: Json | null
          name: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan_type"]
          plan_id?: string | null
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"] | null
          subdomain: string
          suspended_reason?: string | null
          trial_end_date?: string | null
          updated_at?: string
        }
        Update: {
          billing_status?: string | null
          branding?: Json | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          custom_domain?: string | null
          enabled_features?: string[] | null
          features_enabled?: Json | null
          id?: string
          is_active?: boolean
          last_payment_date?: string | null
          max_bandwidth_gb?: number | null
          max_storage_gb?: number
          max_students?: number | null
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan_type"]
          plan_id?: string | null
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"] | null
          subdomain?: string
          suspended_reason?: string | null
          trial_end_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      training_logs: {
        Row: {
          content_summary: string
          course_id: string
          created_at: string
          homework: string | null
          id: string
          instructor_id: string
          materials_used: string | null
          notes: string | null
          training_date: string
          training_hours: number
          training_method: string | null
          updated_at: string
        }
        Insert: {
          content_summary: string
          course_id: string
          created_at?: string
          homework?: string | null
          id?: string
          instructor_id: string
          materials_used?: string | null
          notes?: string | null
          training_date: string
          training_hours?: number
          training_method?: string | null
          updated_at?: string
        }
        Update: {
          content_summary?: string
          course_id?: string
          created_at?: string
          homework?: string | null
          id?: string
          instructor_id?: string
          materials_used?: string | null
          notes?: string | null
          training_date?: string
          training_hours?: number
          training_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_logs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_counters: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric: string
          period_end: string
          period_start: string
          tenant_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric: string
          period_end: string
          period_start: string
          tenant_id: string
          value?: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric?: string
          period_end?: string
          period_start?: string
          tenant_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_counters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      user_activity_logs: {
        Row: {
          activity_description: string | null
          activity_type: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          created_at: string
          experience_points: number
          id: string
          last_activity_date: string | null
          level: number
          streak_days: number
          tenant_id: string | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_points?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          tenant_id?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_points?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          tenant_id?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_path_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          score: number | null
          started_at: string | null
          status: string
          step_id: string
          time_spent_minutes: number | null
          updated_at: string
          user_learning_path_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          score?: number | null
          started_at?: string | null
          status?: string
          step_id: string
          time_spent_minutes?: number | null
          updated_at?: string
          user_learning_path_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          score?: number | null
          started_at?: string | null
          status?: string
          step_id?: string
          time_spent_minutes?: number | null
          updated_at?: string
          user_learning_path_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_path_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "learning_path_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_path_progress_user_learning_path_id_fkey"
            columns: ["user_learning_path_id"]
            isOneToOne: false
            referencedRelation: "user_learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_paths: {
        Row: {
          ai_recommended: boolean
          completed_at: string | null
          created_at: string
          current_step_id: string | null
          estimated_completion_date: string | null
          id: string
          learning_path_id: string
          progress_percentage: number
          recommendation_reason: string | null
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommended?: boolean
          completed_at?: string | null
          created_at?: string
          current_step_id?: string | null
          estimated_completion_date?: string | null
          id?: string
          learning_path_id: string
          progress_percentage?: number
          recommendation_reason?: string | null
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommended?: boolean
          completed_at?: string | null
          created_at?: string
          current_step_id?: string | null
          estimated_completion_date?: string | null
          id?: string
          learning_path_id?: string
          progress_percentage?: number
          recommendation_reason?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_paths_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "learning_path_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_paths_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          id: string
          joined_at: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_heartbeat_at: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_heartbeat_at?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_heartbeat_at?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          level: number | null
          rank: number | null
          tenant_id: string | null
          total_points: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      award_points: {
        Args: {
          p_action_type: string
          p_description?: string
          p_points: number
          p_tenant_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      calculate_learner_risk: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: Json
      }
      check_and_award_badges: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          p_function_name: string
          p_identifier: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
      check_storage_limit: {
        Args: { p_file_size: number; p_tenant_id: string }
        Returns: boolean
      }
      check_tenant_access: { Args: { p_tenant_id: string }; Returns: Json }
      check_usage_limit_block: {
        Args: { p_limit_type: string; p_tenant_id: string }
        Returns: boolean
      }
      cleanup_expired_impersonation_sessions: {
        Args: never
        Returns: undefined
      }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_rate_limit_logs: { Args: never; Returns: undefined }
      create_default_tenant_sections: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_metadata?: Json
          p_priority?: string
          p_tenant_id: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      decrypt_text: {
        Args: { encrypted_text: string; encryption_key?: string }
        Returns: string
      }
      encrypt_text: {
        Args: { encryption_key?: string; plain_text: string }
        Returns: string
      }
      generate_contract_number: { Args: never; Returns: string }
      get_counseling_logs: {
        Args: {
          p_counselor_id?: string
          p_course_id?: string
          p_student_id?: string
        }
        Returns: {
          counseling_date: string
          counseling_type: string
          counselor_advice: string
          counselor_id: string
          course_id: string
          created_at: string
          follow_up_date: string
          follow_up_needed: boolean
          id: string
          is_confidential: boolean
          student_concerns: string
          student_id: string
          summary: string
          updated_at: string
        }[]
      }
      get_dropout_records: {
        Args: { p_course_id?: string; p_refund_status?: string }
        Returns: {
          created_at: string
          documents: Json
          dropout_date: string
          dropout_reason: string
          enrollment_id: string
          id: string
          interview_notes: string
          processed_at: string
          processed_by: string
          reason_category: string
          refund_amount: number
          refund_status: string
        }[]
      }
      get_my_profile: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          phone_number: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_accessible_tenants: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      get_user_tenant_ids: { Args: { _user_id: string }; Returns: string[] }
      has_membership_role: {
        Args: {
          _role: Database["public"]["Enums"]["membership_role"]
          _tenant_id: string
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_in_tenant: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _tenant_id: string
          _user_id: string
        }
        Returns: boolean
      }
      insert_counseling_log: {
        Args: {
          p_counseling_date: string
          p_counseling_type: string
          p_counselor_advice: string
          p_course_id: string
          p_follow_up_date: string
          p_follow_up_needed: boolean
          p_is_confidential: boolean
          p_student_concerns: string
          p_student_id: string
          p_summary: string
        }
        Returns: string
      }
      insert_dropout_record: {
        Args: {
          p_documents: Json
          p_dropout_date: string
          p_dropout_reason: string
          p_enrollment_id: string
          p_interview_notes: string
          p_reason_category: string
          p_refund_amount: number
          p_refund_status: string
        }
        Returns: string
      }
      is_enrolled_or_admin: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: boolean
      }
      is_operator: { Args: { _user_id: string }; Returns: boolean }
      is_platform_operator: { Args: { _user_id: string }; Returns: boolean }
      log_user_activity: {
        Args: {
          p_activity_type: string
          p_description: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_user_id: string
        }
        Returns: string
      }
      operator_has_tenant_access: {
        Args: { _operator_id: string; _tenant_id: string }
        Returns: boolean
      }
      trigger_usage_collection: { Args: never; Returns: undefined }
      update_content_progress: {
        Args: {
          p_content_id: string
          p_last_position_seconds?: number
          p_progress_percentage: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_daily_goal_progress: {
        Args: { p_lessons: number; p_minutes: number; p_user_id: string }
        Returns: undefined
      }
      update_profile: {
        Args: { p_full_name: string; p_phone_number?: string }
        Returns: undefined
      }
      update_streak: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "admin" | "operator"
      approval_status: "pending" | "approved" | "rejected" | "suspended"
      assignment_status: "draft" | "published" | "closed"
      attendance_status: "present" | "late" | "absent" | "excused"
      billing_cycle: "monthly" | "yearly"
      content_type: "video" | "document" | "quiz" | "assignment"
      course_level: "beginner" | "intermediate" | "advanced" | "all"
      course_status: "draft" | "published" | "scheduled" | "archived"
      membership_role: "student" | "instructor" | "admin" | "operator"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      plan_tier: "free" | "basic" | "pro" | "enterprise"
      post_status: "active" | "closed" | "pinned" | "deleted"
      post_type: "discussion" | "question" | "announcement" | "notice"
      submission_status: "submitted" | "graded" | "returned" | "late"
      subscription_plan_type: "starter" | "standard" | "professional"
      tenant_status: "active" | "suspended" | "terminated" | "trial"
      video_provider: "youtube" | "vimeo" | "direct"
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
      app_role: ["student", "teacher", "admin", "operator"],
      approval_status: ["pending", "approved", "rejected", "suspended"],
      assignment_status: ["draft", "published", "closed"],
      attendance_status: ["present", "late", "absent", "excused"],
      billing_cycle: ["monthly", "yearly"],
      content_type: ["video", "document", "quiz", "assignment"],
      course_level: ["beginner", "intermediate", "advanced", "all"],
      course_status: ["draft", "published", "scheduled", "archived"],
      membership_role: ["student", "instructor", "admin", "operator"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      plan_tier: ["free", "basic", "pro", "enterprise"],
      post_status: ["active", "closed", "pinned", "deleted"],
      post_type: ["discussion", "question", "announcement", "notice"],
      submission_status: ["submitted", "graded", "returned", "late"],
      subscription_plan_type: ["starter", "standard", "professional"],
      tenant_status: ["active", "suspended", "terminated", "trial"],
      video_provider: ["youtube", "vimeo", "direct"],
    },
  },
} as const
