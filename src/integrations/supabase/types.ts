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
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant1_id: string | null
          participant2_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant1_id?: string | null
          participant2_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant1_id?: string | null
          participant2_id?: string | null
        }
        Relationships: []
      }
      favorite_suppliers: {
        Row: {
          created_at: string | null
          id: string
          supplier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          supplier_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      media_items: {
        Row: {
          created_at: string | null
          id: string
          media_type: string | null
          media_url: string
          message_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url: string
          message_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string
          message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_items_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          receiver_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
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
          display_name?: string | null
          email?: string | null
          id: string
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
          display_name?: string | null
          email?: string | null
          id?: string
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
          name: string
          owner_id: string | null
          progress: number | null
          start_date: string | null
          status: string
          updated_at: string | null
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
          name: string
          owner_id?: string | null
          progress?: number | null
          start_date?: string | null
          status: string
          updated_at?: string | null
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
          name?: string
          owner_id?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      supplier_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          supplier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          supplier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          supplier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_ratings_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          avatar: string | null
          category: string
          created_at: string | null
          email: string | null
          id: string
          image: string | null
          location: string
          name: string
          phone: string
          products: string[] | null
          rating: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar?: string | null
          category: string
          created_at?: string | null
          email?: string | null
          id?: string
          image?: string | null
          location: string
          name: string
          phone: string
          products?: string[] | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar?: string | null
          category?: string
          created_at?: string | null
          email?: string | null
          id?: string
          image?: string | null
          location?: string
          name?: string
          phone?: string
          products?: string[] | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_favorite_supplier: {
        Args: { p_user_id: string; p_supplier_id: string }
        Returns: boolean
      }
      add_missing_columns_to_projects: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      admin_delete_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      admin_get_all_projects: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          status: string
          owner_id: string
          image: string
          crop: string
          location: string
          progress: number
          start_date: string
          end_date: string
          is_public: boolean
          created_at: string
          updated_at: string
          user_name: string
          user_email: string
          user_avatar: string
        }[]
      }
      admin_get_all_suppliers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          category: string
          products: string[]
          location: string
          phone: string
          email: string
          website: string
          avatar: string
          rating: number
          user_id: string
          created_at: string
          updated_at: string
          user_name: string
          user_email: string
          user_avatar: string
        }[]
      }
      admin_get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string | null
          avatar: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          phone_number: string | null
          preferences: Json | null
          role: string | null
          updated_at: string | null
        }[]
      }
      admin_update_user_password: {
        Args: { user_id: string; new_password: string }
        Returns: undefined
      }
      admin_verify_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      check_favorite_supplier: {
        Args: { p_user_id: string; p_supplier_id: string }
        Returns: boolean
      }
      create_project: {
        Args: {
          p_name: string
          p_description: string
          p_status: string
          p_owner_id: string
          p_image: string
          p_crop: string
          p_location: string
          p_progress: number
          p_start_date: string
          p_end_date: string
          p_is_public: boolean
        }
        Returns: Json
      }
      create_projects_table_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_test_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_user_profile: {
        Args: {
          user_id: string
          user_email: string
          user_name: string
          user_role?: string
          user_phone?: string
        }
        Returns: undefined
      }
      execute_sql: {
        Args: { sql_query: string }
        Returns: Json
      }
      get_favorite_suppliers: {
        Args: { p_user_id: string }
        Returns: {
          avatar: string | null
          category: string
          created_at: string | null
          email: string | null
          id: string
          image: string | null
          location: string
          name: string
          phone: string
          products: string[] | null
          rating: number | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_supplier_ratings: {
        Args: { p_supplier_id: string }
        Returns: {
          id: string
          rating: number
          comment: string
          user_id: string
          supplier_id: string
          created_at: string
          updated_at: string
          user_name: string
          user_avatar: string
        }[]
      }
      insert_project: {
        Args: {
          p_name: string
          p_description: string
          p_status: string
          p_owner_id: string
          p_image?: string
          p_crop?: string
          p_location?: string
          p_progress?: number
          p_start_date?: string
          p_end_date?: string
          p_is_public?: boolean
        }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      remove_favorite_supplier: {
        Args: { p_user_id: string; p_supplier_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
