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
      blocked_users: {
        Row: {
          blocked_user_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          room_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          room_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          game_id: string | null
          id: string
          name: string | null
          room_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          game_id?: string | null
          id?: string
          name?: string | null
          room_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          game_id?: string | null
          id?: string
          name?: string | null
          room_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          sender_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_progress: {
        Row: {
          created_at: string
          game_id: string
          highest_level_completed: number
          id: string
          total_stars: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          highest_level_completed?: number
          id?: string
          total_stars?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          highest_level_completed?: number
          id?: string
          total_stars?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_progress_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_ratings: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          liked: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          liked?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          liked?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_ratings_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          game_id: string
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          game_id: string
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          game_id?: string
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          component_name: string
          created_at: string | null
          description: string | null
          difficulty: string | null
          genre: Database["public"]["Enums"]["game_genre"]
          how_to_play: string | null
          id: string
          is_active: boolean | null
          thumbnail_url: string | null
          title: string
          total_likes: number | null
          total_plays: number | null
          updated_at: string | null
        }
        Insert: {
          component_name: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          genre: Database["public"]["Enums"]["game_genre"]
          how_to_play?: string | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title: string
          total_likes?: number | null
          total_plays?: number | null
          updated_at?: string | null
        }
        Update: {
          component_name?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          genre?: Database["public"]["Enums"]["game_genre"]
          how_to_play?: string | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title?: string
          total_likes?: number | null
          total_plays?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      healing_music_432hz: {
        Row: {
          artist: string | null
          category: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          storage_path: string
          title: string
        }
        Insert: {
          artist?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          storage_path: string
          title: string
        }
        Update: {
          artist?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          storage_path?: string
          title?: string
        }
        Relationships: []
      }
      nexus_leaderboard: {
        Row: {
          created_at: string | null
          highest_tile: number
          id: string
          level_reached: number
          score: number
          time_played: number
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          highest_tile: number
          id?: string
          level_reached?: number
          score: number
          time_played?: number
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          highest_tile?: number
          id?: string
          level_reached?: number
          score?: number
          time_played?: number
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexus_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          added_at: string | null
          id: string
          music_id: string
          playlist_id: string
          position: number
        }
        Insert: {
          added_at?: string | null
          id?: string
          music_id: string
          playlist_id: string
          position?: number
        }
        Update: {
          added_at?: string | null
          id?: string
          music_id?: string
          playlist_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_music_id_fkey"
            columns: ["music_id"]
            isOneToOne: false
            referencedRelation: "user_music"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: string
          leaderboard_score: number | null
          total_friends: number | null
          total_likes: number | null
          total_messages: number | null
          total_plays: number | null
          updated_at: string | null
          username: string
          wallet_address: string | null
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id: string
          leaderboard_score?: number | null
          total_friends?: number | null
          total_likes?: number | null
          total_messages?: number | null
          total_plays?: number | null
          updated_at?: string | null
          username: string
          wallet_address?: string | null
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          leaderboard_score?: number | null
          total_friends?: number | null
          total_likes?: number | null
          total_messages?: number | null
          total_plays?: number | null
          updated_at?: string | null
          username?: string
          wallet_address?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      user_background_videos: {
        Row: {
          created_at: string | null
          duration: string | null
          file_size: number | null
          id: string
          is_active: boolean | null
          storage_path: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          storage_path: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          storage_path?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_background_videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_music: {
        Row: {
          artist: string | null
          created_at: string
          duration: string | null
          file_size: number | null
          genre: string | null
          id: string
          parent_approved: boolean | null
          pending_approval: boolean | null
          storage_path: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist?: string | null
          created_at?: string
          duration?: string | null
          file_size?: number | null
          genre?: string | null
          id?: string
          parent_approved?: boolean | null
          pending_approval?: boolean | null
          storage_path: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist?: string | null
          created_at?: string
          duration?: string | null
          file_size?: number | null
          genre?: string | null
          id?: string
          parent_approved?: boolean | null
          pending_approval?: boolean | null
          storage_path?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_nexus_stats: {
        Row: {
          created_at: string | null
          daily_streak: number
          games_played: number
          highest_tile: number
          id: string
          last_login_date: string | null
          nexus_tokens: number
          total_score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_streak?: number
          games_played?: number
          highest_tile?: number
          id?: string
          last_login_date?: string | null
          nexus_tokens?: number
          total_score?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_streak?: number
          games_played?: number
          highest_tile?: number
          id?: string
          last_login_date?: string | null
          nexus_tokens?: number
          total_score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_nexus_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          from_user_id: string | null
          gas_fee: number | null
          id: string
          notes: string | null
          status: string | null
          to_user_id: string | null
          token_type: string | null
          transaction_hash: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          from_user_id?: string | null
          gas_fee?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          to_user_id?: string | null
          token_type?: string | null
          transaction_hash?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          from_user_id?: string | null
          gas_fee?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          to_user_id?: string | null
          token_type?: string | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "moderator" | "user"
      game_genre:
        | "adventure"
        | "puzzle"
        | "racing"
        | "educational"
        | "casual"
        | "brain"
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
      app_role: ["admin", "moderator", "user"],
      game_genre: [
        "adventure",
        "puzzle",
        "racing",
        "educational",
        "casual",
        "brain",
      ],
    },
  },
} as const
