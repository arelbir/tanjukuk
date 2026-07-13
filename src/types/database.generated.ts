export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          assigned_to: string | null
          case_file_id: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          enforcement_file_id: string | null
          event_type: string
          id: string
          is_all_day: boolean
          is_completed: boolean
          location: string | null
          priority: string
          reminder_at: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_file_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          enforcement_file_id?: string | null
          event_type: string
          id?: string
          is_all_day?: boolean
          is_completed?: boolean
          location?: string | null
          priority?: string
          reminder_at?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_file_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          enforcement_file_id?: string | null
          event_type?: string
          id?: string
          is_all_day?: boolean
          is_completed?: boolean
          location?: string | null
          priority?: string
          reminder_at?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_case_file_id_fkey"
            columns: ["case_file_id"]
            isOneToOne: false
            referencedRelation: "case_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_enforcement_file_id_fkey"
            columns: ["enforcement_file_id"]
            isOneToOne: false
            referencedRelation: "enforcement_files"
            referencedColumns: ["id"]
          },
        ]
      }
      case_files: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          case_type_id: string | null
          case_value: number | null
          client_id: string
          client_role_id: string | null
          closed_at: string | null
          court_city: string | null
          court_district: string | null
          court_no: string | null
          court_type_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          file_code: string
          file_no: string | null
          file_year: number | null
          id: string
          is_archived: boolean
          lawyer_id: string | null
          lean_result: string | null
          notes: string | null
          opened_at: string | null
          opposing_party: string | null
          status_id: string | null
          updated_at: string
          uyap_file_kind: string
          verdict_against: number | null
          verdict_for: number | null
          verdict_result: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          case_type_id?: string | null
          case_value?: number | null
          client_id: string
          client_role_id?: string | null
          closed_at?: string | null
          court_city?: string | null
          court_district?: string | null
          court_no?: string | null
          court_type_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          file_code: string
          file_no?: string | null
          file_year?: number | null
          id?: string
          is_archived?: boolean
          lawyer_id?: string | null
          lean_result?: string | null
          notes?: string | null
          opened_at?: string | null
          opposing_party?: string | null
          status_id?: string | null
          updated_at?: string
          uyap_file_kind?: string
          verdict_against?: number | null
          verdict_for?: number | null
          verdict_result?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          case_type_id?: string | null
          case_value?: number | null
          client_id?: string
          client_role_id?: string | null
          closed_at?: string | null
          court_city?: string | null
          court_district?: string | null
          court_no?: string | null
          court_type_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          file_code?: string
          file_no?: string | null
          file_year?: number | null
          id?: string
          is_archived?: boolean
          lawyer_id?: string | null
          lean_result?: string | null
          notes?: string | null
          opened_at?: string | null
          opposing_party?: string | null
          status_id?: string | null
          updated_at?: string
          uyap_file_kind?: string
          verdict_against?: number | null
          verdict_for?: number | null
          verdict_result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_files_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_files_case_type_id_fkey"
            columns: ["case_type_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_files_client_role_id_fkey"
            columns: ["client_role_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_files_court_type_id_fkey"
            columns: ["court_type_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_files_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_files_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_files_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      case_status_history: {
        Row: {
          case_file_id: string
          changed_at: string
          changed_by: string | null
          id: string
          new_status_id: string | null
          note: string | null
          old_status_id: string | null
        }
        Insert: {
          case_file_id: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status_id?: string | null
          note?: string | null
          old_status_id?: string | null
        }
        Update: {
          case_file_id?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status_id?: string | null
          note?: string | null
          old_status_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_status_history_case_file_id_fkey"
            columns: ["case_file_id"]
            isOneToOne: false
            referencedRelation: "case_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_status_history_new_status_id_fkey"
            columns: ["new_status_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_status_history_old_status_id_fkey"
            columns: ["old_status_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          archived_at: string | null
          archived_by: string | null
          client_code: string | null
          company_representative: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          national_id: string | null
          notes: string | null
          phone: string | null
          tax_number: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_code?: string | null
          company_representative?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          tax_number?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          archived_by?: string | null
          client_code?: string | null
          company_representative?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          national_id?: string | null
          notes?: string | null
          phone?: string | null
          tax_number?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number | null
          id: string
          mime_type: string | null
          storage_bucket: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          storage_bucket?: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          storage_bucket?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enforcement_files: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          client_id: string
          client_position: string
          closed_at: string | null
          collected_amount: number
          created_at: string
          created_by: string | null
          currency: string
          debtor_party: string | null
          description: string | null
          enforcement_office: string | null
          enforcement_type_id: string | null
          expense_amount: number
          file_code: string
          file_no: string | null
          file_year: number | null
          id: string
          interest_amount: number
          is_archived: boolean
          lawyer_id: string | null
          notes: string | null
          office_city: string | null
          opened_at: string | null
          principal_amount: number
          remaining_amount: number
          status_id: string | null
          total_amount: number
          updated_at: string
          uyap_file_kind: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          client_id: string
          client_position: string
          closed_at?: string | null
          collected_amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          debtor_party?: string | null
          description?: string | null
          enforcement_office?: string | null
          enforcement_type_id?: string | null
          expense_amount?: number
          file_code: string
          file_no?: string | null
          file_year?: number | null
          id?: string
          interest_amount?: number
          is_archived?: boolean
          lawyer_id?: string | null
          notes?: string | null
          office_city?: string | null
          opened_at?: string | null
          principal_amount?: number
          remaining_amount?: number
          status_id?: string | null
          total_amount?: number
          updated_at?: string
          uyap_file_kind?: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          client_id?: string
          client_position?: string
          closed_at?: string | null
          collected_amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          debtor_party?: string | null
          description?: string | null
          enforcement_office?: string | null
          enforcement_type_id?: string | null
          expense_amount?: number
          file_code?: string
          file_no?: string | null
          file_year?: number | null
          id?: string
          interest_amount?: number
          is_archived?: boolean
          lawyer_id?: string | null
          notes?: string | null
          office_city?: string | null
          opened_at?: string | null
          principal_amount?: number
          remaining_amount?: number
          status_id?: string | null
          total_amount?: number
          updated_at?: string
          uyap_file_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "enforcement_files_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enforcement_files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enforcement_files_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enforcement_files_enforcement_type_id_fkey"
            columns: ["enforcement_type_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enforcement_files_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enforcement_files_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      enforcement_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          enforcement_file_id: string
          id: string
          new_status_id: string | null
          note: string | null
          old_status_id: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          enforcement_file_id: string
          id?: string
          new_status_id?: string | null
          note?: string | null
          old_status_id?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          enforcement_file_id?: string
          id?: string
          new_status_id?: string | null
          note?: string | null
          old_status_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enforcement_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enforcement_status_history_enforcement_file_id_fkey"
            columns: ["enforcement_file_id"]
            isOneToOne: false
            referencedRelation: "enforcement_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enforcement_status_history_new_status_id_fkey"
            columns: ["new_status_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enforcement_status_history_old_status_id_fkey"
            columns: ["old_status_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          cancelled_at: string | null
          cancelled_by: string | null
          case_file_id: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          document_ref: string | null
          enforcement_file_id: string | null
          expense_date: string
          id: string
          is_billable_to_client: boolean
          is_reimbursed: boolean
          payment_method_id: string | null
          reimbursed_amount: number
          scope: string
          sub_category_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cancelled_at?: string | null
          cancelled_by?: string | null
          case_file_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          document_ref?: string | null
          enforcement_file_id?: string | null
          expense_date: string
          id?: string
          is_billable_to_client?: boolean
          is_reimbursed?: boolean
          payment_method_id?: string | null
          reimbursed_amount?: number
          scope: string
          sub_category_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          cancelled_by?: string | null
          case_file_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          document_ref?: string | null
          enforcement_file_id?: string | null
          expense_date?: string
          id?: string
          is_billable_to_client?: boolean
          is_reimbursed?: boolean
          payment_method_id?: string | null
          reimbursed_amount?: number
          scope?: string
          sub_category_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_case_file_id_fkey"
            columns: ["case_file_id"]
            isOneToOne: false
            referencedRelation: "case_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_enforcement_file_id_fkey"
            columns: ["enforcement_file_id"]
            isOneToOne: false
            referencedRelation: "enforcement_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      file_counters: {
        Row: {
          last_number: number
          prefix: string
          year: number
        }
        Insert: {
          last_number?: number
          prefix: string
          year: number
        }
        Update: {
          last_number?: number
          prefix?: string
          year?: number
        }
        Relationships: []
      }
      hearing_details: {
        Row: {
          court_room: string | null
          created_at: string
          event_id: string
          hearing_result: string | null
          interim_decision: string | null
          next_hearing_at: string | null
          next_step: string | null
          updated_at: string
        }
        Insert: {
          court_room?: string | null
          created_at?: string
          event_id: string
          hearing_result?: string | null
          interim_decision?: string | null
          next_hearing_at?: string | null
          next_step?: string | null
          updated_at?: string
        }
        Update: {
          court_room?: string | null
          created_at?: string
          event_id?: string
          hearing_result?: string | null
          interim_decision?: string | null
          next_hearing_at?: string | null
          next_step?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hearing_details_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      lookup_values: {
        Row: {
          code: string | null
          created_at: string
          group_key: string
          id: string
          is_active: boolean
          label: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          group_key: string
          id?: string
          is_active?: boolean
          label: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          group_key?: string
          id?: string
          is_active?: boolean
          label?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lookup_values_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          link_url: string | null
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          cancelled_at: string | null
          cancelled_by: string | null
          case_file_id: string | null
          category_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          enforcement_file_id: string | null
          id: string
          payment_date: string
          payment_method_id: string | null
          receivable_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cancelled_at?: string | null
          cancelled_by?: string | null
          case_file_id?: string | null
          category_id?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          enforcement_file_id?: string | null
          id?: string
          payment_date: string
          payment_method_id?: string | null
          receivable_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          cancelled_by?: string | null
          case_file_id?: string | null
          category_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          enforcement_file_id?: string | null
          id?: string
          payment_date?: string
          payment_method_id?: string | null
          receivable_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_case_file_id_fkey"
            columns: ["case_file_id"]
            isOneToOne: false
            referencedRelation: "case_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_enforcement_file_id_fkey"
            columns: ["enforcement_file_id"]
            isOneToOne: false
            referencedRelation: "enforcement_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      receivables: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          case_file_id: string | null
          category_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          due_date: string | null
          enforcement_file_id: string | null
          expected_amount: number
          id: string
          paid_amount: number
          remaining_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          case_file_id?: string | null
          category_id?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          due_date?: string | null
          enforcement_file_id?: string | null
          expected_amount: number
          id?: string
          paid_amount?: number
          remaining_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          case_file_id?: string | null
          category_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          due_date?: string | null
          enforcement_file_id?: string | null
          expected_amount?: number
          id?: string
          paid_amount?: number
          remaining_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivables_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_case_file_id_fkey"
            columns: ["case_file_id"]
            isOneToOne: false
            referencedRelation: "case_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "lookup_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_enforcement_file_id_fkey"
            columns: ["enforcement_file_id"]
            isOneToOne: false
            referencedRelation: "enforcement_files"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_case_file: {
        Args: { target_case_file_id: string }
        Returns: boolean
      }
      can_manage_enforcement_file: {
        Args: { target_enforcement_file_id: string }
        Returns: boolean
      }
      can_manage_finance: { Args: never; Returns: boolean }
      can_manage_operations: { Args: never; Returns: boolean }
      can_view_case_file: {
        Args: { target_case_file_id: string }
        Returns: boolean
      }
      can_view_enforcement_file: {
        Args: { target_enforcement_file_id: string }
        Returns: boolean
      }
      can_view_finance: { Args: never; Returns: boolean }
      current_profile_id: { Args: never; Returns: string }
      current_user_is_active: { Args: never; Returns: boolean }
      current_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_assistant: { Args: never; Returns: boolean }
      is_finance_user: { Args: never; Returns: boolean }
      is_lawyer: { Args: never; Returns: boolean }
      next_file_code: { Args: { file_prefix: string }; Returns: string }
      sync_receivable_payment_totals: {
        Args: { target_receivable_id: string }
        Returns: undefined
      }
      write_audit_log: {
        Args: {
          audit_action: string
          audit_entity_id: string
          audit_entity_type: string
          audit_metadata?: Json
          audit_new_values?: Json
          audit_old_values?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

