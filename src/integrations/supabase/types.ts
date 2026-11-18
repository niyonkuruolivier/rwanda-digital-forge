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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      customer_feedback: {
        Row: {
          author_name: string
          author_photo: string
          created_at: string
          id: string
          message: string
          photos: Json
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          author_name: string
          author_photo?: string
          created_at?: string
          id?: string
          message: string
          photos?: Json
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          author_name?: string
          author_photo?: string
          created_at?: string
          id?: string
          message?: string
          photos?: Json
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_history: {
        Row: {
          created_at: string
          id: string
          new_stock: number
          previous_stock: number
          product_id: string
          reason: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_stock: number
          previous_stock: number
          product_id: string
          reason: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_stock?: number
          previous_stock?: number
          product_id?: string
          reason?: string
          vendor_id?: string
        }
        Relationships: []
      }
      marketplace_content: {
        Row: {
          admin_removed: boolean
          deleted: boolean
          id: string
          kind: string
          record: Json
          updated_at: string
          vendor_id: string
        }
        Insert: {
          admin_removed?: boolean
          deleted?: boolean
          id: string
          kind: string
          record: Json
          updated_at?: string
          vendor_id: string
        }
        Update: {
          admin_removed?: boolean
          deleted?: boolean
          id?: string
          kind?: string
          record?: Json
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          image: string
          name: string
        }
        Insert: {
          created_at?: string
          image?: string
          name: string
        }
        Update: {
          created_at?: string
          image?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string
          city: string
          cover: string
          id: string
          name: string
          phone: string
          photo: string
        }
        Insert: {
          address?: string
          city?: string
          cover?: string
          id: string
          name?: string
          phone?: string
          photo?: string
        }
        Update: {
          address?: string
          city?: string
          cover?: string
          id?: string
          name?: string
          phone?: string
          photo?: string
        }
        Relationships: []
      }
      shared_order_items: {
        Row: {
          id: string
          order_id: string
          record: Json
          vendor_id: string
        }
        Insert: {
          id?: string
          order_id: string
          record: Json
          vendor_id: string
        }
        Update: {
          id?: string
          order_id?: string
          record?: Json
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shared_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_orders: {
        Row: {
          buyer_id: string
          id: string
          record: Json
        }
        Insert: {
          buyer_id: string
          id: string
          record: Json
        }
        Update: {
          buyer_id?: string
          id?: string
          record?: Json
        }
        Relationships: [
          {
            foreignKeyName: "shared_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_ratings: {
        Row: {
          stars: number
          user_id: string
          vendor_id: string
        }
        Insert: {
          stars: number
          user_id: string
          vendor_id: string
        }
        Update: {
          stars?: number
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: []
      }
      vendor_appeals: {
        Row: {
          created_at: string
          id: string
          message: string
          response: string
          status: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          response?: string
          status?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          response?: string
          status?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_appeals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          buyer_id: string
          id: string
          record: Json
          status: string
          submitted_at: string
        }
        Insert: {
          buyer_id: string
          id: string
          record: Json
          status?: string
          submitted_at?: string
        }
        Update: {
          buyer_id?: string
          id?: string
          record?: Json
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_applications_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_moderation: {
        Row: {
          reason: string
          status: string
          suspended_until: string | null
          updated_at: string
          updated_by: string
          vendor_id: string
        }
        Insert: {
          reason?: string
          status?: string
          suspended_until?: string | null
          updated_at?: string
          updated_by: string
          vendor_id: string
        }
        Update: {
          reason?: string
          status?: string
          suspended_until?: string | null
          updated_at?: string
          updated_by?: string
          vendor_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      account_activity_allowed: { Args: never; Returns: boolean }
      can_read_shared_order: { Args: { _id: string }; Returns: boolean }
      create_shared_demo_order: { Args: { _order: Json }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      public_customer_feedback: {
        Args: { _target_id: string; _target_type: string }
        Returns: {
          author_name: string
          author_photo: string
          created_at: string
          id: string
          message: string
          photos: Json
        }[]
      }
      public_store_ratings: {
        Args: never
        Returns: {
          average_rating: number
          rating_count: number
          vendor_id: string
        }[]
      }
      review_shared_purchase: {
        Args: {
          _action: string
          _id: string
          _message?: string
          _photo?: string
        }
        Returns: undefined
      }
      review_vendor_account: {
        Args: { _application_id: string; _status: string }
        Returns: undefined
      }
      review_vendor_account_with_reason: {
        Args: { _application_id: string; _reason: string; _status: string }
        Returns: undefined
      }
      review_vendor_appeal: {
        Args: { _id: string; _response: string; _status: string }
        Returns: undefined
      }
      update_shared_delivery: {
        Args: { _delivery: Json; _id: string; _status: string }
        Returns: undefined
      }
      vendor_trading_statuses: {
        Args: never
        Returns: {
          status: string
          vendor_id: string
        }[]
      }
    }
    Enums: {
      app_role: "buyer" | "vendor" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["buyer", "vendor", "admin"],
    },
  },
} as const
