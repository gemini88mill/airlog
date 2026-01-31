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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      airlines: {
        Row: {
          active: boolean
          alias: string | null
          callsign: string | null
          country: string
          iata: string | null
          icao: string | null
          id: number
          name: string
        }
        Insert: {
          active?: boolean
          alias?: string | null
          callsign?: string | null
          country: string
          iata?: string | null
          icao?: string | null
          id: number
          name: string
        }
        Update: {
          active?: boolean
          alias?: string | null
          callsign?: string | null
          country?: string
          iata?: string | null
          icao?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      airports: {
        Row: {
          altitude: number
          city: string
          country: string
          created_at: string | null
          dst: string
          iata_code: string | null
          icao_code: string | null
          id: number
          latitude: number
          longitude: number
          name: string
          openflights_id: number
          source: string
          timezone: string
          timezone_offset: number
          type: string
          updated_at: string | null
        }
        Insert: {
          altitude: number
          city: string
          country: string
          created_at?: string | null
          dst: string
          iata_code?: string | null
          icao_code?: string | null
          id?: number
          latitude: number
          longitude: number
          name: string
          openflights_id: number
          source: string
          timezone: string
          timezone_offset: number
          type: string
          updated_at?: string | null
        }
        Update: {
          altitude?: number
          city?: string
          country?: string
          created_at?: string | null
          dst?: string
          iata_code?: string | null
          icao_code?: string | null
          id?: number
          latitude?: number
          longitude?: number
          name?: string
          openflights_id?: number
          source?: string
          timezone?: string
          timezone_offset?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      circle_members: {
        Row: {
          circle_id: string
          created_at: string
          member_role: string
          user_id: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          member_role?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          member_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      flights: {
        Row: {
          airline_iata: string | null
          circle_id: string | null
          created_at: string
          destination_iata: string | null
          flight_date: string
          flight_number: string
          id: string
          note: string | null
          origin_iata: string | null
          role: Database["public"]["Enums"]["airlog_flight_role"]
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["airlog_visibility"]
        }
        Insert: {
          airline_iata?: string | null
          circle_id?: string | null
          created_at?: string
          destination_iata?: string | null
          flight_date: string
          flight_number: string
          id?: string
          note?: string | null
          origin_iata?: string | null
          role?: Database["public"]["Enums"]["airlog_flight_role"]
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["airlog_visibility"]
        }
        Update: {
          airline_iata?: string | null
          circle_id?: string | null
          created_at?: string
          destination_iata?: string | null
          flight_date?: string
          flight_number?: string
          id?: string
          note?: string | null
          origin_iata?: string | null
          role?: Database["public"]["Enums"]["airlog_flight_role"]
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["airlog_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "flights_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      planes: {
        Row: {
          created_at: string | null
          iata_code: string | null
          icao_code: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          iata_code?: string | null
          icao_code?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          iata_code?: string | null
          icao_code?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          airline_code: string
          airline_id: number | null
          codeshare: string | null
          created_at: string | null
          destination_airport_code: string
          destination_airport_id: number | null
          equipment: string | null
          id: string
          source_airport_code: string
          source_airport_id: number | null
          stops: number | null
          updated_at: string | null
        }
        Insert: {
          airline_code: string
          airline_id?: number | null
          codeshare?: string | null
          created_at?: string | null
          destination_airport_code: string
          destination_airport_id?: number | null
          equipment?: string | null
          id?: string
          source_airport_code: string
          source_airport_id?: number | null
          stops?: number | null
          updated_at?: string | null
        }
        Update: {
          airline_code?: string
          airline_id?: number | null
          codeshare?: string | null
          created_at?: string | null
          destination_airport_code?: string
          destination_airport_id?: number | null
          equipment?: string | null
          id?: string
          source_airport_code?: string
          source_airport_id?: number | null
          stops?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_circle_member: {
        Args: { p_circle_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      airlog_flight_role: "passenger" | "crew"
      airlog_visibility: "private" | "shared"
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
      airlog_flight_role: ["passenger", "crew"],
      airlog_visibility: ["private", "shared"],
    },
  },
} as const
