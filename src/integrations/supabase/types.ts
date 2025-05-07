export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversation_media: {
        Row: {
          created_at: string | null
          id: string
          media_type: string
          media_url: string
          message_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_type: string
          media_url: string
          message_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_type?: string
          media_url?: string
          message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_media_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          fournisseur_id: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fournisseur_id: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fournisseur_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorite_suppliers: {
        Row: {
          created_at: string
          id: string
          supplier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          supplier_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          supplier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      fournisseur_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          fournisseur_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          fournisseur_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          fournisseur_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          id: string
          name: string | null
          phone_number: string | null
          preferences: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id: string
          name?: string | null
          phone_number?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id?: string
          name?: string | null
          phone_number?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          crop: string | null
          description: string | null
          end_date: string | null
          id: string
          image: string | null
          is_public: boolean | null
          location: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          crop?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image?: string | null
          is_public?: boolean | null
          location?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          crop?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image?: string | null
          is_public?: boolean | null
          location?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string | null
          id: string
          price: number | null
          project_id: string | null
          quantity: number | null
          service_id: string | null
          status: string | null
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price?: number | null
          project_id?: string | null
          quantity?: number | null
          service_id?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number | null
          project_id?: string | null
          quantity?: number | null
          service_id?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          availability: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number | null
          supplier_id: string | null
          type: Database["public"]["Enums"]["service_type"] | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          availability?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number | null
          supplier_id?: string | null
          type?: Database["public"]["Enums"]["service_type"] | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          availability?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          supplier_id?: string | null
          type?: Database["public"]["Enums"]["service_type"] | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          category: string | null
          contact_info: string | null
          created_at: string | null
          id: string
          image: string | null
          location: string | null
          name: string
          phone: string | null
          products: string[] | null
          rating: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          contact_info?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          location?: string | null
          name: string
          phone?: string | null
          products?: string[] | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          contact_info?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          products?: string[] | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      training_materials: {
        Row: {
          content_type: string | null
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          type: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          type: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          type?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          message: string | null
          project_id: string | null
          severity: string | null
          start_date: string | null
          type: Database["public"]["Enums"]["weather_alert_type"] | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          message?: string | null
          project_id?: string | null
          severity?: string | null
          start_date?: string | null
          type?: Database["public"]["Enums"]["weather_alert_type"] | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          message?: string | null
          project_id?: string | null
          severity?: string | null
          start_date?: string | null
          type?: Database["public"]["Enums"]["weather_alert_type"] | null
        }
        Relationships: []
      }
    }
    Views: {
      projects_with_users: {
        Row: {
          created_at: string | null
          creator_avatar: string | null
          creator_email: string | null
          creator_name: string | null
          crop: string | null
          description: string | null
          end_date: string | null
          id: string | null
          image: string | null
          is_public: boolean | null
          location: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      public_projects_view: {
        Row: {
          created_at: string | null
          creator: string | null
          creator_avatar: string | null
          description: string | null
          id: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_favorite_supplier: {
        Args: {
          p_user_id: string
          p_supplier_id: string
        }
        Returns: boolean
      }
      admin_cleanup_orphaned_auth: {
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_count: number
          deleted_emails: string[]
        }[]
      }
      admin_create_user: {
        Args: {
          user_name: string
          user_email: string
          user_password: string
          user_role?: string
        }
        Returns: undefined
      }
      admin_delete_auth_user: {
        Args: {
          target_user_id: string
        }
        Returns: undefined
      }
      admin_delete_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      admin_update_user_password: {
        Args: {
          user_id: string
          new_password: string
        }
        Returns: undefined
      }
      admin_verify_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      check_favorite_supplier: {
        Args: {
          p_user_id: string
          p_supplier_id: string
        }
        Returns: boolean
      }
      create_verification_code: {
        Args: {
          p_user_id: string
          p_type?: string
        }
        Returns: string
      }
      exec_sql: {
        Args: {
          sql: string
        }
        Returns: undefined
      }
      force_delete_user: {
        Args: {
          target_user_id: string
        }
        Returns: undefined
      }
      get_all_suppliers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          name: string
          category: string
          rating: number
          location: string
          phone: string
          email: string
          products: string[]
          avatar: string
        }[]
      }
      get_favorite_suppliers: {
        Args: {
          p_user_id: string
        }
        Returns: Json[]
      }
      get_fournisseur_ratings: {
        Args: {
          fournisseur_id: string
        }
        Returns: {
          id: string
          rating: number
          comment: string
          created_at: string
          profiles: Json
        }[]
      }
      get_message_media: {
        Args: {
          p_message_id: string
        }
        Returns: {
          id: string
          message_id: string
          media_type: string
          media_url: string
          created_at: string
        }[]
      }
      insert_conversation_media: {
        Args: {
          p_message_id: string
          p_media_type: string
          p_media_url: string
        }
        Returns: string
      }
      insert_verification_code: {
        Args: {
          p_user_id: string
          p_code: string
          p_type: string
          p_expires_at: string
        }
        Returns: string
      }
      remove_favorite_supplier: {
        Args: {
          p_user_id: string
          p_supplier_id: string
        }
        Returns: boolean
      }
      verify_code: {
        Args: {
          p_user_id: string
          p_code: string
          p_type?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      project_status: "draft" | "active" | "completed" | "cancelled"
      service_type: "equipment" | "seeds" | "fertilizers" | "consulting"
      user_role: "admin" | "farmer" | "supplier"
      weather_alert_type: "rain" | "drought" | "frost" | "heat_wave"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
