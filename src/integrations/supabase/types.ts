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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      canales: {
        Row: {
          created_at: string | null
          es_privado: boolean
          id: string
          nombre: string | null
        }
        Insert: {
          created_at?: string | null
          es_privado?: boolean
          id?: string
          nombre?: string | null
        }
        Update: {
          created_at?: string | null
          es_privado?: boolean
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hidden_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hidden_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_participants: {
        Row: {
          id: string
          joined_at: string
          post_id: string
          profession: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          post_id: string
          profession?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          post_id?: string
          profession?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_participants_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mensajes: {
        Row: {
          contenido: string
          created_at: string | null
          id: string
          id_autor: string | null
          id_canal: string | null
        }
        Insert: {
          contenido: string
          created_at?: string | null
          id?: string
          id_autor?: string | null
          id_canal?: string | null
        }
        Update: {
          contenido?: string
          created_at?: string | null
          id?: string
          id_autor?: string | null
          id_canal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_id_canal_fkey"
            columns: ["id_canal"]
            isOneToOne: false
            referencedRelation: "canales"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string | null
          content: string
          created_at: string | null
          group_id: string | null
          id: string
          media_type: string | null
          media_url: string | null
          user_id: string
        }
        Insert: {
          chat_id?: string | null
          content: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string | null
          content?: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros_canal: {
        Row: {
          id: number
          id_canal: string | null
          id_usuario: string | null
        }
        Insert: {
          id?: number
          id_canal?: string | null
          id_usuario?: string | null
        }
        Update: {
          id?: number
          id_canal?: string | null
          id_usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "miembros_canal_id_canal_fkey"
            columns: ["id_canal"]
            isOneToOne: false
            referencedRelation: "canales"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          achievement_notifications: boolean | null
          career_opportunities: boolean | null
          created_at: string | null
          event_recommendations: boolean | null
          id: string
          internship_matches: boolean | null
          mentorship_reminders: boolean | null
          mentorship_requests: boolean | null
          skill_endorsements: boolean | null
          updated_at: string | null
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          achievement_notifications?: boolean | null
          career_opportunities?: boolean | null
          created_at?: string | null
          event_recommendations?: boolean | null
          id?: string
          internship_matches?: boolean | null
          mentorship_reminders?: boolean | null
          mentorship_requests?: boolean | null
          skill_endorsements?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          achievement_notifications?: boolean | null
          career_opportunities?: boolean | null
          created_at?: string | null
          event_recommendations?: boolean | null
          id?: string
          internship_matches?: boolean | null
          mentorship_reminders?: boolean | null
          mentorship_requests?: boolean | null
          skill_endorsements?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          message: string | null
          post_id: string | null
          read: boolean | null
          receiver_id: string
          sender_id: string | null
          type: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          post_id?: string | null
          read?: boolean | null
          receiver_id: string
          sender_id?: string | null
          type: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          post_id?: string | null
          read?: boolean | null
          receiver_id?: string
          sender_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interests: {
        Row: {
          created_at: string
          id: string
          interest_level: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_level: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_level?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interests_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      post_shares: {
        Row: {
          created_at: string
          id: string
          post_id: string
          share_comment: string | null
          share_type: string
          shared_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          share_comment?: string | null
          share_type?: string
          shared_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          share_comment?: string | null
          share_type?: string
          shared_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          background_color: string | null
          content: string | null
          content_style: Json | null
          created_at: string
          group_id: string | null
          id: string
          idea: Json | null
          is_pinned: boolean | null
          marketplace: Json | null
          media_type: string | null
          media_url: string | null
          opportunity_type: string | null
          poll: Json | null
          post_type: string | null
          project_status: string | null
          shared_from: string | null
          shared_post_id: string | null
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          background_color?: string | null
          content?: string | null
          content_style?: Json | null
          created_at?: string
          group_id?: string | null
          id?: string
          idea?: Json | null
          is_pinned?: boolean | null
          marketplace?: Json | null
          media_type?: string | null
          media_url?: string | null
          opportunity_type?: string | null
          poll?: Json | null
          post_type?: string | null
          project_status?: string | null
          shared_from?: string | null
          shared_post_id?: string | null
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          background_color?: string | null
          content?: string | null
          content_style?: Json | null
          created_at?: string
          group_id?: string | null
          id?: string
          idea?: Json | null
          is_pinned?: boolean | null
          marketplace?: Json | null
          media_type?: string | null
          media_url?: string | null
          opportunity_type?: string | null
          poll?: Json | null
          post_type?: string | null
          project_status?: string | null
          shared_from?: string | null
          shared_post_id?: string | null
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_shared_post_id_fkey"
            columns: ["shared_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          ip_address: unknown
          profile_id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown
          profile_id: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown
          profile_id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_role: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          career: string | null
          cover_url: string | null
          created_at: string
          id: string
          institution_name: string | null
          last_seen: string | null
          relationship_status: string | null
          semester: string | null
          status: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          academic_role?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          career?: string | null
          cover_url?: string | null
          created_at?: string
          id: string
          institution_name?: string | null
          last_seen?: string | null
          relationship_status?: string | null
          semester?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          academic_role?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          career?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          institution_name?: string | null
          last_seen?: string | null
          relationship_status?: string | null
          semester?: string | null
          status?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      project_interests: {
        Row: {
          contact_info: string | null
          created_at: string
          id: string
          interest_type: string
          interested_user_id: string
          message: string | null
          project_showcase_id: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          id?: string
          interest_type: string
          interested_user_id: string
          message?: string | null
          project_showcase_id: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          id?: string
          interest_type?: string
          interested_user_id?: string
          message?: string | null
          project_showcase_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_interests_project_showcase_id_fkey"
            columns: ["project_showcase_id"]
            isOneToOne: false
            referencedRelation: "project_showcases"
            referencedColumns: ["id"]
          },
        ]
      }
      project_joins: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_joins_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      project_showcases: {
        Row: {
          achievements: string[] | null
          business_model: string | null
          collaboration_roles: string[] | null
          created_at: string
          demo_url: string | null
          duration_months: number | null
          funding_needed: number | null
          github_url: string | null
          id: string
          images_urls: string[] | null
          industry: string | null
          post_id: string
          project_description: string
          project_status: string
          project_title: string
          project_url: string | null
          revenue_generated: number | null
          seeking_collaborators: boolean | null
          seeking_investment: boolean | null
          team_size: number | null
          technologies_used: string[] | null
          updated_at: string
          user_base: number | null
        }
        Insert: {
          achievements?: string[] | null
          business_model?: string | null
          collaboration_roles?: string[] | null
          created_at?: string
          demo_url?: string | null
          duration_months?: number | null
          funding_needed?: number | null
          github_url?: string | null
          id?: string
          images_urls?: string[] | null
          industry?: string | null
          post_id: string
          project_description: string
          project_status: string
          project_title: string
          project_url?: string | null
          revenue_generated?: number | null
          seeking_collaborators?: boolean | null
          seeking_investment?: boolean | null
          team_size?: number | null
          technologies_used?: string[] | null
          updated_at?: string
          user_base?: number | null
        }
        Update: {
          achievements?: string[] | null
          business_model?: string | null
          collaboration_roles?: string[] | null
          created_at?: string
          demo_url?: string | null
          duration_months?: number | null
          funding_needed?: number | null
          github_url?: string | null
          id?: string
          images_urls?: string[] | null
          industry?: string | null
          post_id?: string
          project_description?: string
          project_status?: string
          project_title?: string
          project_url?: string | null
          revenue_generated?: number | null
          seeking_collaborators?: boolean | null
          seeking_investment?: boolean | null
          team_size?: number | null
          technologies_used?: string[] | null
          updated_at?: string
          user_base?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_showcases_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      project_views: {
        Row: {
          id: string
          post_id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          post_id: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_reaction_optimized: {
        Args: {
          p_comment_id?: string
          p_post_id?: string
          p_reaction_type?: string
        }
        Returns: Json
      }
      award_daily_login_bonus: { Args: never; Returns: undefined }
      calculate_social_score: {
        Args: { user_id_param: string }
        Returns: number
      }
      check_column_exists: {
        Args: { column_name: string; table_name: string }
        Returns: boolean
      }
      check_user_premium_status: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      confirm_payment_and_activate_subscription: {
        Args: { admin_user_id_param?: string; payment_id_param: string }
        Returns: Json
      }
      convert_idea_to_project: {
        Args: { new_status?: string; post_id_param: string }
        Returns: Json
      }
      create_academic_event_atomic: {
        Args: {
          end_date: string
          event_description: string
          event_title: string
          event_type: string
          is_virtual: boolean
          location: string
          max_attendees: number
          meeting_link: string
          post_content: string
          post_visibility: Database["public"]["Enums"]["post_visibility"]
          start_date: string
          user_id_param: string
        }
        Returns: Json
      }
      create_group_atomic: {
        Args: {
          category: string
          creator_id: string
          group_description: string
          group_name: string
          group_slug: string
          is_private: boolean
          rules: string
          tags: string[]
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_comment_id?: string
          p_message?: string
          p_post_id?: string
          p_receiver_id: string
          p_sender_id: string
          p_type: string
        }
        Returns: string
      }
      create_reaction:
        | { Args: never; Returns: undefined }
        | {
            Args: { p_post_id: number; p_reaction_type?: string }
            Returns: {
              error_message: string
              reaction_data: Json
            }[]
          }
      create_university_group: {
        Args: { institution_id: string; institution_name: string }
        Returns: string
      }
      debug_reactions: {
        Args: never
        Returns: {
          all_reactions: Json
          recent_posts: Json
          session_user_email: string
          session_user_id: string
          user_reactions: Json
        }[]
      }
      get_anonymous_number: { Args: never; Returns: number }
      get_career_filters: {
        Args: never
        Returns: {
          career: string
        }[]
      }
      get_engagement_metrics_for_system: {
        Args: { target_user_id: string }
        Returns: {
          id: string
          last_reset_date: string
          posts_engagement_score: number
          profile_views_today: number
          profile_views_total: number
          social_score: number
          updated_at: string
          user_id: string
        }[]
      }
      get_friend_requests_data: {
        Args: { user_id_param: string }
        Returns: {
          friends: Json
          pending_requests: Json
          sent_requests: Json
          suggestions: Json
        }[]
      }
      get_group_by_slug_or_id: {
        Args: { slug_or_id_param: string }
        Returns: {
          avatar_url: string
          category: string
          cover_url: string
          created_at: string
          created_by: string
          created_by_avatar_url: string
          created_by_username: string
          description: string
          id: string
          is_private: boolean
          member_count: number
          name: string
          post_count: number
          rules: string
          slug: string
          tags: string[]
          updated_at: string
        }[]
      }
      get_hearts_limit: { Args: { user_id_param: string }; Returns: number }
      get_popular_users: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          career: string
          followers_count: number
          hearts_count: number
          id: string
          semester: string
          username: string
        }[]
      }
      get_post_pin_status: { Args: { post_id: string }; Returns: boolean }
      get_project_viewers: {
        Args: { p_limit?: number; p_post_id: string }
        Returns: {
          avatar_url: string
          username: string
          viewed_at: string
          viewer_id: string
        }[]
      }
      get_project_views_count: { Args: { p_post_id: string }; Returns: number }
      get_public_groups: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          category: string
          created_at: string
          description: string
          id: string
          is_private: boolean
          member_count: number
          name: string
          post_count: number
          slug: string
          tags: string[]
        }[]
      }
      get_public_profile_fields: {
        Args: never
        Returns: {
          academic_role: string
          avatar_url: string
          career: string
          cover_url: string
          created_at: string
          id: string
          institution_name: string
          last_seen: string
          semester: string
          status: string
          username: string
        }[]
      }
      get_saved_posts: {
        Args: {
          limit_count?: number
          offset_count?: number
          user_id_param: string
        }
        Returns: {
          avatar_url: string
          comments_count: number
          content: string
          created_at: string
          id: string
          is_liked: boolean
          likes_count: number
          media_urls: string[]
          saved_at: string
          updated_at: string
          user_id: string
          username: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }[]
      }
      get_social_level: {
        Args: { score_param: number }
        Returns: {
          benefits: Json
          color_from: string
          color_to: string
          icon_name: string
          level_name: string
          max_score: number
          min_score: number
        }[]
      }
      get_university_friend_suggestions: {
        Args: { limit_param?: number; user_id_param: string }
        Returns: {
          avatar_url: string
          career: string
          connection_reason: string
          id: string
          institution_name: string
          relevance_score: number
          semester: string
          username: string
        }[]
      }
      get_university_stats: {
        Args: { institution_param: string }
        Returns: {
          active_this_week: number
          top_careers: Json
          total_groups: number
          total_posts: number
          total_students: number
        }[]
      }
      get_user_groups: {
        Args: { user_id_param: string }
        Returns: {
          created_at: string
          group_avatar_url: string
          group_description: string
          group_id: string
          group_name: string
          group_slug: string
          is_private: boolean
          joined_at: string
          member_count: number
          post_count: number
          role: string
        }[]
      }
      get_user_story_privacy: {
        Args: { user_id_input: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_profile_view: {
        Args: { profile_id_param: string; viewer_id_param?: string }
        Returns: undefined
      }
      is_group_creator: {
        Args: { group_id_param: string; user_id_param: string }
        Returns: boolean
      }
      is_premium_user: { Args: { user_id_param: string }; Returns: boolean }
      mark_notifications_read: {
        Args: { notification_ids?: string[] }
        Returns: undefined
      }
      mark_users_offline: { Args: never; Returns: undefined }
      reject_payment: {
        Args: { payment_id_param: string; rejection_reason?: string }
        Returns: Json
      }
      reset_daily_hearts: { Args: never; Returns: undefined }
      save_user_story_privacy: {
        Args: { privacy_setting: string; user_id_input: string }
        Returns: boolean
      }
      toggle_post_pin: {
        Args: { pin_status: boolean; post_id: string }
        Returns: boolean
      }
      toggle_saved_post: { Args: { post_id_param: string }; Returns: boolean }
      track_premium_profile_view: {
        Args: {
          is_anonymous_param?: boolean
          profile_id_param: string
          viewer_id_param?: string
        }
        Returns: undefined
      }
      update_user_streak: {
        Args: { streak_type_param: string; user_id_param: string }
        Returns: undefined
      }
      validate_promo_code: {
        Args: { code_param: string; user_id_param?: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      post_visibility: "public" | "friends" | "private" | "incognito"
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
      post_visibility: ["public", "friends", "private", "incognito"],
    },
  },
} as const
