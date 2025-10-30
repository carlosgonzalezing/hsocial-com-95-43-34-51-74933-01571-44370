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
      academic_events: {
        Row: {
          agenda: Json | null
          certificates_available: boolean | null
          created_at: string | null
          current_attendees: number | null
          description: string
          end_date: string | null
          event_type: string
          id: string
          is_free: boolean | null
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_link: string | null
          organizer_contact: string | null
          organizer_name: string | null
          post_id: string
          registration_deadline: string | null
          registration_required: boolean | null
          speakers: Json | null
          sponsors: string[] | null
          start_date: string
          status: string | null
          tags: string[] | null
          target_audience: string[] | null
          ticket_price: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agenda?: Json | null
          certificates_available?: boolean | null
          created_at?: string | null
          current_attendees?: number | null
          description: string
          end_date?: string | null
          event_type: string
          id?: string
          is_free?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          organizer_contact?: string | null
          organizer_name?: string | null
          post_id: string
          registration_deadline?: string | null
          registration_required?: boolean | null
          speakers?: Json | null
          sponsors?: string[] | null
          start_date: string
          status?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          ticket_price?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agenda?: Json | null
          certificates_available?: boolean | null
          created_at?: string | null
          current_attendees?: number | null
          description?: string
          end_date?: string | null
          event_type?: string
          id?: string
          is_free?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          organizer_contact?: string | null
          organizer_name?: string | null
          post_id?: string
          registration_deadline?: string | null
          registration_required?: boolean | null
          speakers?: Json | null
          sponsors?: string[] | null
          start_date?: string
          status?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          ticket_price?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_events_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
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
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      daily_engagement: {
        Row: {
          actions: Json | null
          created_at: string
          date: string
          id: string
          rewards_claimed: string[] | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json | null
          created_at?: string
          date: string
          id?: string
          rewards_claimed?: string[] | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json | null
          created_at?: string
          date?: string
          id?: string
          rewards_claimed?: string[] | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      engagement_hearts: {
        Row: {
          earned_at: string
          hearts_received: number
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          earned_at?: string
          hearts_received?: number
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          earned_at?: string
          hearts_received?: number
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      engagement_metrics: {
        Row: {
          id: string
          last_reset_date: string
          posts_engagement_score: number
          profile_views_today: number
          profile_views_total: number
          social_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          last_reset_date?: string
          posts_engagement_score?: number
          profile_views_today?: number
          profile_views_total?: number
          social_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          last_reset_date?: string
          posts_engagement_score?: number
          profile_views_today?: number
          profile_views_total?: number
          social_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      engagement_rewards_log: {
        Row: {
          description: string
          earned_at: string
          hearts_earned: number | null
          id: string
          metadata: Json | null
          points_earned: number | null
          reward_type: string
          user_id: string
        }
        Insert: {
          description: string
          earned_at?: string
          hearts_earned?: number | null
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          reward_type: string
          user_id: string
        }
        Update: {
          description?: string
          earned_at?: string
          hearts_earned?: number | null
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          reward_type?: string
          user_id?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attendance_status: string | null
          certificate_issued: boolean | null
          check_in_time: string | null
          event_id: string
          feedback_comment: string | null
          feedback_rating: number | null
          id: string
          registered_at: string | null
          registration_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attendance_status?: string | null
          certificate_issued?: boolean | null
          check_in_time?: string | null
          event_id: string
          feedback_comment?: string | null
          feedback_rating?: number | null
          id?: string
          registered_at?: string | null
          registration_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attendance_status?: string | null
          certificate_issued?: boolean | null
          check_in_time?: string | null
          event_id?: string
          feedback_comment?: string | null
          feedback_rating?: number | null
          id?: string
          registered_at?: string | null
          registration_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "academic_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
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
          created_at: string | null
          friend_id: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      hidden_users: {
        Row: {
          created_at: string
          hidden_user_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hidden_user_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hidden_user_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      idea_participants: {
        Row: {
          created_at: string
          id: string
          post_id: string
          profession: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          profession?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
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
      incognito_posts: {
        Row: {
          anonymous_author_name: string
          anonymous_author_number: number
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          anonymous_author_name?: string
          anonymous_author_number: number
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          anonymous_author_name?: string
          anonymous_author_number?: number
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incognito_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_applications: {
        Row: {
          applicant_id: string
          applied_at: string | null
          cover_letter: string | null
          id: string
          internship_id: string
          motivation: string | null
          notes: string | null
          portfolio_url: string | null
          relevant_experience: string | null
          resume_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          applied_at?: string | null
          cover_letter?: string | null
          id?: string
          internship_id: string
          motivation?: string | null
          notes?: string | null
          portfolio_url?: string | null
          relevant_experience?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          applied_at?: string | null
          cover_letter?: string | null
          id?: string
          internship_id?: string
          motivation?: string | null
          notes?: string | null
          portfolio_url?: string | null
          relevant_experience?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_applications_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
      internships: {
        Row: {
          application_deadline: string | null
          company_logo_url: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          current_applications: number | null
          description: string
          duration_months: number | null
          id: string
          is_paid: boolean | null
          is_remote: boolean | null
          location: string | null
          max_applications: number | null
          position_title: string
          post_id: string
          required_careers: string[] | null
          required_semester: string | null
          requirements: string[] | null
          skills_to_develop: string[] | null
          start_date: string | null
          status: string | null
          stipend_amount: number | null
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          company_logo_url?: string | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_applications?: number | null
          description: string
          duration_months?: number | null
          id?: string
          is_paid?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          max_applications?: number | null
          position_title: string
          post_id: string
          required_careers?: string[] | null
          required_semester?: string | null
          requirements?: string[] | null
          skills_to_develop?: string[] | null
          start_date?: string | null
          status?: string | null
          stipend_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          company_logo_url?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_applications?: number | null
          description?: string
          duration_months?: number | null
          id?: string
          is_paid?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          max_applications?: number | null
          position_title?: string
          post_id?: string
          required_careers?: string[] | null
          required_semester?: string | null
          requirements?: string[] | null
          skills_to_develop?: string[] | null
          start_date?: string | null
          status?: string | null
          stipend_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internships_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          applied_at: string
          cover_letter: string | null
          id: string
          job_offer_id: string
          resume_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_offer_id: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_offer_id?: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_offer_id_fkey"
            columns: ["job_offer_id"]
            isOneToOne: false
            referencedRelation: "job_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          application_deadline: string | null
          benefits: string[] | null
          company_logo_url: string | null
          company_name: string
          company_size: string | null
          created_at: string
          experience_level: string | null
          id: string
          industry: string | null
          job_type: string
          location: string
          position_title: string
          post_id: string
          remote_allowed: boolean | null
          requirements: string[] | null
          salary_range: Json | null
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          benefits?: string[] | null
          company_logo_url?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string
          experience_level?: string | null
          id?: string
          industry?: string | null
          job_type: string
          location: string
          position_title: string
          post_id: string
          remote_allowed?: boolean | null
          requirements?: string[] | null
          salary_range?: Json | null
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          benefits?: string[] | null
          company_logo_url?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          experience_level?: string | null
          id?: string
          industry?: string | null
          job_type?: string
          location?: string
          position_title?: string
          post_id?: string
          remote_allowed?: boolean | null
          requirements?: string[] | null
          salary_range?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_post_id_fkey"
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
      marketplace_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          service_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          service_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "marketplace_services"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_services: {
        Row: {
          available_hours: string | null
          average_rating: number | null
          category: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          location: string | null
          location_type: string
          price: number
          price_type: string
          reviews_count: number | null
          skills: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          available_hours?: string | null
          average_rating?: number | null
          category: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          location?: string | null
          location_type?: string
          price?: number
          price_type?: string
          reviews_count?: number | null
          skills?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          available_hours?: string | null
          average_rating?: number | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          location?: string | null
          location_type?: string
          price?: number
          price_type?: string
          reviews_count?: number | null
          skills?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentorship_sessions: {
        Row: {
          created_at: string | null
          duration: number | null
          id: string
          meeting_link: string | null
          mentor_notes: string | null
          mentorship_id: string
          notes: string | null
          scheduled_at: string
          status: string | null
          student_id: string
          student_rating: number | null
          student_review: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          id?: string
          meeting_link?: string | null
          mentor_notes?: string | null
          mentorship_id: string
          notes?: string | null
          scheduled_at: string
          status?: string | null
          student_id: string
          student_rating?: number | null
          student_review?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          id?: string
          meeting_link?: string | null
          mentor_notes?: string | null
          mentorship_id?: string
          notes?: string | null
          scheduled_at?: string
          status?: string | null
          student_id?: string
          student_rating?: number | null
          student_review?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          availability: Json | null
          created_at: string | null
          description: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          max_students_per_session: number | null
          mentor_id: string
          rating: number | null
          session_duration: number | null
          specialties: string[]
          total_reviews: number | null
          total_sessions: number | null
          updated_at: string | null
        }
        Insert: {
          availability?: Json | null
          created_at?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          max_students_per_session?: number | null
          mentor_id: string
          rating?: number | null
          session_duration?: number | null
          specialties?: string[]
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string | null
        }
        Update: {
          availability?: Json | null
          created_at?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          max_students_per_session?: number | null
          mentor_id?: string
          rating?: number | null
          session_duration?: number | null
          specialties?: string[]
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorships_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          shared_post_id: string | null
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
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
          shared_post_id?: string | null
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
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
      premium_hearts: {
        Row: {
          created_at: string
          hearts_given_today: number
          hearts_limit: number
          id: string
          last_reset_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hearts_given_today?: number
          hearts_limit?: number
          id?: string
          last_reset_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hearts_given_today?: number
          hearts_limit?: number
          id?: string
          last_reset_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_incognito_posts: {
        Row: {
          anonymous_name: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          anonymous_name?: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          anonymous_name?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_incognito_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_profile_viewers: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean | null
          profile_id: string
          session_id: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          profile_id: string
          session_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          profile_id?: string
          session_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profile_hearts: {
        Row: {
          created_at: string | null
          giver_id: string
          id: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          giver_id: string
          id?: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          giver_id?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_hearts_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_hearts_profile_id_fkey"
            columns: ["profile_id"]
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
      promo_code_uses: {
        Row: {
          discount_amount: number
          id: string
          payment_id: string | null
          promo_code_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          discount_amount: number
          id?: string
          payment_id?: string | null
          promo_code_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          discount_amount?: number
          id?: string
          payment_id?: string | null
          promo_code_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_uses_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          discount_percentage: number
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          discount_percentage: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: []
      }
      skill_endorsements: {
        Row: {
          comment: string | null
          created_at: string | null
          endorsed_user_id: string
          endorsement_context: string | null
          endorser_id: string
          id: string
          skill_name: string
          strength_level: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          endorsed_user_id: string
          endorsement_context?: string | null
          endorser_id: string
          id?: string
          skill_name: string
          strength_level?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          endorsed_user_id?: string
          endorsement_context?: string | null
          endorser_id?: string
          id?: string
          skill_name?: string
          strength_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_endorsements_endorsed_user_id_fkey"
            columns: ["endorsed_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_endorsements_endorser_id_fkey"
            columns: ["endorser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_levels: {
        Row: {
          benefits: Json | null
          color_from: string
          color_to: string
          created_at: string
          icon_name: string
          id: string
          level_name: string
          max_score: number | null
          min_score: number
        }
        Insert: {
          benefits?: Json | null
          color_from: string
          color_to: string
          created_at?: string
          icon_name: string
          id?: string
          level_name: string
          max_score?: number | null
          min_score: number
        }
        Update: {
          benefits?: Json | null
          color_from?: string
          color_to?: string
          created_at?: string
          icon_name?: string
          id?: string
          level_name?: string
          max_score?: number | null
          min_score?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          end_date: string
          id: string
          payment_method: string
          payment_reference: string | null
          plan_type: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          end_date: string
          id?: string
          payment_method?: string
          payment_reference?: string | null
          plan_type?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          end_date?: string
          id?: string
          payment_method?: string
          payment_reference?: string | null
          plan_type?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_type: string
          created_at: string
          earned_at: string
          id: string
          max_progress: number | null
          progress: number | null
          user_id: string
        }
        Insert: {
          badge_type: string
          created_at?: string
          earned_at?: string
          id?: string
          max_progress?: number | null
          progress?: number | null
          user_id: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          earned_at?: string
          id?: string
          max_progress?: number | null
          progress?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          achievements: Json | null
          badges: string[] | null
          category: string
          completed_mentorships: number | null
          created_at: string | null
          endorsements_given: number | null
          endorsements_received: number | null
          events_attended: number | null
          events_organized: number | null
          id: string
          last_activity_date: string | null
          level_name: string | null
          points: number | null
          reputation_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          badges?: string[] | null
          category: string
          completed_mentorships?: number | null
          created_at?: string | null
          endorsements_given?: number | null
          endorsements_received?: number | null
          events_attended?: number | null
          events_organized?: number | null
          id?: string
          last_activity_date?: string | null
          level_name?: string | null
          points?: number | null
          reputation_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: Json | null
          badges?: string[] | null
          category?: string
          completed_mentorships?: number | null
          created_at?: string | null
          endorsements_given?: number | null
          endorsements_received?: number | null
          events_attended?: number | null
          events_organized?: number | null
          id?: string
          last_activity_date?: string | null
          level_name?: string | null
          points?: number | null
          reputation_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reputation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          role: Database["public"]["Enums"]["app_role"]
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
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usuarios_nuevo: {
        Row: {
          actualizado_en: string | null
          auth_usuario_id: number | null
          contraseña_hash: string
          correo_electronico: string
          creado_en: string | null
          id: number
          nombre_usuario: string
        }
        Insert: {
          actualizado_en?: string | null
          auth_usuario_id?: number | null
          contraseña_hash: string
          correo_electronico: string
          creado_en?: string | null
          id?: number
          nombre_usuario: string
        }
        Update: {
          actualizado_en?: string | null
          auth_usuario_id?: number | null
          contraseña_hash?: string
          correo_electronico?: string
          creado_en?: string | null
          id?: number
          nombre_usuario?: string
        }
        Relationships: []
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
