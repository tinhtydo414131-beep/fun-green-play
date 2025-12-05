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
      activity_feed: {
        Row: {
          activity_type: string
          content: Json | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          content?: Json | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          content?: Json | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      call_signals: {
        Row: {
          call_id: string
          created_at: string
          id: string
          sender_id: string
          signal_data: Json
          signal_type: string
        }
        Insert: {
          call_id: string
          created_at?: string
          id?: string
          sender_id: string
          signal_data: Json
          signal_type: string
        }
        Update: {
          call_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          signal_data?: Json
          signal_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_signals_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "video_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_signals_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      camly_coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          is_read: boolean | null
          message: string
          pinned_at: string | null
          pinned_by: string | null
          reply_to_message_id: string | null
          room_id: string
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_read?: boolean | null
          message: string
          pinned_at?: string | null
          pinned_by?: string | null
          reply_to_message_id?: string | null
          room_id: string
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_read?: boolean | null
          message?: string
          pinned_at?: string | null
          pinned_by?: string | null
          reply_to_message_id?: string | null
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_pinned_by_fkey"
            columns: ["pinned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
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
      combo_active_periods: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          period_end: string
          period_start: string
          period_type: string
          top_combo: number
          top_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          period_end: string
          period_start: string
          period_type: string
          top_combo?: number
          top_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          period_end?: string
          period_start?: string
          period_type?: string
          top_combo?: number
          top_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combo_active_periods_top_user_id_fkey"
            columns: ["top_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      combo_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          difficulty: string
          icon: string | null
          id: string
          is_active: boolean
          prize_amount: number
          prize_type: string
          required_level: number | null
          target_combo: number
          time_limit_seconds: number | null
          title: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          description: string
          difficulty: string
          icon?: string | null
          id?: string
          is_active?: boolean
          prize_amount?: number
          prize_type?: string
          required_level?: number | null
          target_combo: number
          time_limit_seconds?: number | null
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          difficulty?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          prize_amount?: number
          prize_type?: string
          required_level?: number | null
          target_combo?: number
          time_limit_seconds?: number | null
          title?: string
        }
        Relationships: []
      }
      combo_period_winners: {
        Row: {
          claimed: boolean
          created_at: string
          highest_combo: number
          id: string
          period_end: string
          period_start: string
          period_type: string
          prize_amount: number
          prize_type: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          created_at?: string
          highest_combo: number
          id?: string
          period_end: string
          period_start: string
          period_type: string
          prize_amount?: number
          prize_type?: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          created_at?: string
          highest_combo?: number
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          prize_amount?: number
          prize_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "combo_period_winners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "uploaded_game_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_combo_challenges: {
        Row: {
          challenge_date: string
          challenge_id: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          total_completions: number
        }
        Insert: {
          challenge_date: string
          challenge_id: string
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          total_completions?: number
        }
        Update: {
          challenge_date?: string
          challenge_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          total_completions?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_combo_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "combo_challenges"
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
      game_plays: {
        Row: {
          game_id: string
          id: string
          played_at: string
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          played_at?: string
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          played_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_plays_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "uploaded_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_plays_user_id_fkey"
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
      game_reviews: {
        Row: {
          created_at: string
          game_id: string
          id: string
          notes: string | null
          reviewer_id: string
          status: Database["public"]["Enums"]["game_status"]
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          notes?: string | null
          reviewer_id: string
          status: Database["public"]["Enums"]["game_status"]
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          notes?: string | null
          reviewer_id?: string
          status?: Database["public"]["Enums"]["game_status"]
        }
        Relationships: [
          {
            foreignKeyName: "game_reviews_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "uploaded_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
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
      gold_miner_combos: {
        Row: {
          created_at: string
          highest_combo: number
          id: string
          level_achieved: number
          total_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          highest_combo?: number
          id?: string
          level_achieved?: number
          total_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          highest_combo?: number
          id?: string
          level_achieved?: number
          total_value?: number
          updated_at?: string
          user_id?: string
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
      lovable_games: {
        Row: {
          approved: boolean | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          project_url: string
          title: string
          user_id: string | null
          zip_url: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          project_url: string
          title: string
          user_id?: string | null
          zip_url?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          project_url?: string
          title?: string
          user_id?: string | null
          zip_url?: string | null
        }
        Relationships: []
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          referral_code: string | null
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
          referral_code?: string | null
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
          referral_code?: string | null
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
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount: number
          reward_paid: boolean
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount?: number
          reward_paid?: boolean
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number
          reward_paid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string
          expires_at: string
          id: string
          media_type: string
          media_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_game_comments: {
        Row: {
          comment: string
          created_at: string
          game_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          game_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          game_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_game_comments_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "uploaded_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploaded_game_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_game_ratings: {
        Row: {
          created_at: string
          game_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_game_ratings_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "uploaded_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploaded_game_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_games: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: Database["public"]["Enums"]["game_category"]
          created_at: string
          description: string | null
          download_count: number
          game_file_path: string
          id: string
          play_count: number
          rating: number | null
          rating_count: number
          rejection_note: string | null
          status: Database["public"]["Enums"]["game_status"]
          tags: string[] | null
          thumbnail_path: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category: Database["public"]["Enums"]["game_category"]
          created_at?: string
          description?: string | null
          download_count?: number
          game_file_path: string
          id?: string
          play_count?: number
          rating?: number | null
          rating_count?: number
          rejection_note?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          tags?: string[] | null
          thumbnail_path?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["game_category"]
          created_at?: string
          description?: string | null
          download_count?: number
          game_file_path?: string
          id?: string
          play_count?: number
          rating?: number | null
          rating_count?: number
          rejection_note?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          tags?: string[] | null
          thumbnail_path?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_games_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploaded_games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_challenge_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_combo: number
          daily_challenge_id: string
          highest_combo: number
          id: string
          missed_count: number
          prize_claimed: boolean
          started_at: string | null
          time_taken_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_combo?: number
          daily_challenge_id: string
          highest_combo?: number
          id?: string
          missed_count?: number
          prize_claimed?: boolean
          started_at?: string | null
          time_taken_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_combo?: number
          daily_challenge_id?: string
          highest_combo?: number
          id?: string
          missed_count?: number
          prize_claimed?: boolean
          started_at?: string | null
          time_taken_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_daily_challenge_id_fkey"
            columns: ["daily_challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_combo_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenge_progress_user_id_fkey"
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
      video_calls: {
        Row: {
          call_type: string
          callee_id: string
          caller_id: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          quality_stats: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          call_type?: string
          callee_id: string
          caller_id: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          quality_stats?: Json | null
          started_at?: string | null
          status?: string
        }
        Update: {
          call_type?: string
          callee_id?: string
          caller_id?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          quality_stats?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_calls_callee_id_fkey"
            columns: ["callee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_calls_caller_id_fkey"
            columns: ["caller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_auth_nonces: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          nonce: string
          used: boolean
          wallet_address: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          nonce: string
          used?: boolean
          wallet_address: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          nonce?: string
          used?: boolean
          wallet_address?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          from_user_id: string | null
          gas_fee: number | null
          id: string
          notes: string | null
          recipients_count: number | null
          status: string
          to_user_id: string | null
          token_type: string
          transaction_hash: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_user_id?: string | null
          gas_fee?: number | null
          id?: string
          notes?: string | null
          recipients_count?: number | null
          status?: string
          to_user_id?: string | null
          token_type?: string
          transaction_hash?: string | null
          transaction_type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_user_id?: string | null
          gas_fee?: number | null
          id?: string
          notes?: string | null
          recipients_count?: number | null
          status?: string
          to_user_id?: string | null
          token_type?: string
          transaction_hash?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      web3_reward_transactions: {
        Row: {
          amount: number
          claimed_to_wallet: boolean
          created_at: string
          description: string | null
          id: string
          reward_type: string
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          amount: number
          claimed_to_wallet?: boolean
          created_at?: string
          description?: string | null
          id?: string
          reward_type: string
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          claimed_to_wallet?: boolean
          created_at?: string
          description?: string | null
          id?: string
          reward_type?: string
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "web3_reward_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      web3_rewards: {
        Row: {
          camly_balance: number
          created_at: string
          daily_streak: number
          first_game_claimed: boolean
          first_wallet_claimed: boolean
          id: string
          last_daily_checkin: string | null
          referral_earnings: number
          total_claimed_to_wallet: number
          total_referrals: number
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          camly_balance?: number
          created_at?: string
          daily_streak?: number
          first_game_claimed?: boolean
          first_wallet_claimed?: boolean
          id?: string
          last_daily_checkin?: string | null
          referral_earnings?: number
          total_claimed_to_wallet?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          camly_balance?: number
          created_at?: string
          daily_streak?: number
          first_game_claimed?: boolean
          first_wallet_claimed?: boolean
          id?: string
          last_daily_checkin?: string | null
          referral_earnings?: number
          total_claimed_to_wallet?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "web3_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      cleanup_expired_nonces: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_wallet_balance: {
        Args: { p_amount: number; p_operation?: string; p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      game_category:
        | "action"
        | "puzzle"
        | "adventure"
        | "casual"
        | "educational"
        | "racing"
        | "sports"
        | "arcade"
      game_genre:
        | "adventure"
        | "puzzle"
        | "racing"
        | "educational"
        | "casual"
        | "brain"
      game_status: "pending" | "approved" | "rejected"
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
      game_category: [
        "action",
        "puzzle",
        "adventure",
        "casual",
        "educational",
        "racing",
        "sports",
        "arcade",
      ],
      game_genre: [
        "adventure",
        "puzzle",
        "racing",
        "educational",
        "casual",
        "brain",
      ],
      game_status: ["pending", "approved", "rejected"],
    },
  },
} as const
