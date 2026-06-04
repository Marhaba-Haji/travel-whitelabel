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
      admin_user_permissions: {
        Row: {
          access_level: string
          admin_user_id: string
          id: string
          module: string
        }
        Insert: {
          access_level?: string
          admin_user_id: string
          id?: string
          module: string
        }
        Update: {
          access_level?: string
          admin_user_id?: string
          id?: string
          module?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_user_permissions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          must_change_password: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_clusters: {
        Row: {
          created_at: string
          description: string | null
          featured_snippet_targets: string[] | null
          id: string
          name: string
          paa_queries: string[] | null
          related_searches: string[] | null
          slug: string
          target_keyword: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          featured_snippet_targets?: string[] | null
          id?: string
          name: string
          paa_queries?: string[] | null
          related_searches?: string[] | null
          slug: string
          target_keyword: string
        }
        Update: {
          created_at?: string
          description?: string | null
          featured_snippet_targets?: string[] | null
          id?: string
          name?: string
          paa_queries?: string[] | null
          related_searches?: string[] | null
          slug?: string
          target_keyword?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          ai_summary: string | null
          author_name: string | null
          category: string | null
          cluster_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image_url: string | null
          paa_target: string | null
          pillar_post_id: string | null
          post_type: string
          primary_keyword: string | null
          published_at: string | null
          reading_time_minutes: number | null
          search_intent: string | null
          slug: string
          snippet_type: string | null
          speakable_selector: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          ai_summary?: string | null
          author_name?: string | null
          category?: string | null
          cluster_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image_url?: string | null
          paa_target?: string | null
          pillar_post_id?: string | null
          post_type?: string
          primary_keyword?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          search_intent?: string | null
          slug: string
          snippet_type?: string | null
          speakable_selector?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          ai_summary?: string | null
          author_name?: string | null
          category?: string | null
          cluster_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image_url?: string | null
          paa_target?: string | null
          pillar_post_id?: string | null
          post_type?: string
          primary_keyword?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          search_intent?: string | null
          slug?: string
          snippet_type?: string | null
          speakable_selector?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "blog_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_pillar_post_id_fkey"
            columns: ["pillar_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_enquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          intent: string | null
          landing_page: string | null
          message: string
          name: string
          phone: string | null
          referrer: string | null
          session_id: string | null
          status: string
          updated_at: string
          utm: Json | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          intent?: string | null
          landing_page?: string | null
          message: string
          name: string
          phone?: string | null
          referrer?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
          utm?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          intent?: string | null
          landing_page?: string | null
          message?: string
          name?: string
          phone?: string | null
          referrer?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
          utm?: Json | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applicable_plans: string[] | null
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          times_used: number
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applicable_plans?: string[] | null
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          times_used?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applicable_plans?: string[] | null
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          times_used?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      demo_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          country_code: string
          created_at: string
          email: string | null
          full_name: string
          google_event_id: string | null
          id: string
          meet_link: string | null
          notes: string | null
          notifications_sent_at: string | null
          session_id: string | null
          status: string
          timezone: string
          updated_at: string
          utm: Json | null
          whatsapp_number: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          country_code: string
          created_at?: string
          email?: string | null
          full_name: string
          google_event_id?: string | null
          id?: string
          meet_link?: string | null
          notes?: string | null
          notifications_sent_at?: string | null
          session_id?: string | null
          status?: string
          timezone?: string
          updated_at?: string
          utm?: Json | null
          whatsapp_number: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          country_code?: string
          created_at?: string
          email?: string | null
          full_name?: string
          google_event_id?: string | null
          id?: string
          meet_link?: string | null
          notes?: string | null
          notifications_sent_at?: string | null
          session_id?: string | null
          status?: string
          timezone?: string
          updated_at?: string
          utm?: Json | null
          whatsapp_number?: string
        }
        Relationships: []
      }
      demo_schedule_settings: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_holiday: boolean | null
          start_time: string
          unavailable_ranges: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_holiday?: boolean | null
          start_time: string
          unavailable_ranges?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_holiday?: boolean | null
          start_time?: string
          unavailable_ranges?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          active: boolean
          created_at: string
          cta_text: string | null
          cta_url: string | null
          description: string | null
          display_order: number
          id: string
          section_key: string
          subtitle: string
          subtitle_color: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          display_order?: number
          id?: string
          section_key?: string
          subtitle: string
          subtitle_color?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          display_order?: number
          id?: string
          section_key?: string
          subtitle?: string
          subtitle_color?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_images: {
        Row: {
          active: boolean
          alt_text: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          section_key: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          alt_text: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          section_key?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          alt_text?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          section_key?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      home_faqs: {
        Row: {
          active: boolean
          answer: string
          created_at: string
          display_order: number
          id: string
          question: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          created_at?: string
          display_order?: number
          id?: string
          question: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          created_at?: string
          display_order?: number
          id?: string
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      indexing_logs: {
        Row: {
          action: string
          created_at: string
          error: string | null
          id: string
          response: Json | null
          service: string
          status_code: number | null
          url: string
        }
        Insert: {
          action?: string
          created_at?: string
          error?: string | null
          id?: string
          response?: Json | null
          service: string
          status_code?: number | null
          url: string
        }
        Update: {
          action?: string
          created_at?: string
          error?: string | null
          id?: string
          response?: Json | null
          service?: string
          status_code?: number | null
          url?: string
        }
        Relationships: []
      }
      lead_magnet_downloads: {
        Row: {
          created_at: string
          email: string
          id: string
          magnet_id: string | null
          name: string | null
          session_id: string | null
          source: string | null
          utm: Json | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          magnet_id?: string | null
          name?: string | null
          session_id?: string | null
          source?: string | null
          utm?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          magnet_id?: string | null
          name?: string | null
          session_id?: string | null
          source?: string | null
          utm?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_magnet_downloads_magnet_id_fkey"
            columns: ["magnet_id"]
            isOneToOne: false
            referencedRelation: "lead_magnets"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_magnets: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          downloads_count: number
          file_url: string | null
          gated: boolean
          id: string
          is_active: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number
          file_url?: string | null
          gated?: boolean
          id?: string
          is_active?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          downloads_count?: number
          file_url?: string | null
          gated?: boolean
          id?: string
          is_active?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          email: string
          id: string
          last_email_opened_at: string | null
          preferred_categories: string[] | null
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          utm: Json | null
        }
        Insert: {
          email: string
          id?: string
          last_email_opened_at?: string | null
          preferred_categories?: string[] | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          utm?: Json | null
        }
        Update: {
          email?: string
          id?: string
          last_email_opened_at?: string | null
          preferred_categories?: string[] | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          utm?: Json | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean
          color_badge: string
          created_at: string
          display_order: number
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          color_badge?: string
          created_at?: string
          display_order?: number
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          color_badge?: string
          created_at?: string
          display_order?: number
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_gateway_responses: {
        Row: {
          gateway: string
          id: string
          payment_id: string | null
          raw_response: Json
          received_at: string
          response_type: string
          status: string | null
          txn_id: string | null
        }
        Insert: {
          gateway?: string
          id?: string
          payment_id?: string | null
          raw_response: Json
          received_at?: string
          response_type?: string
          status?: string | null
          txn_id?: string | null
        }
        Update: {
          gateway?: string
          id?: string
          payment_id?: string | null
          raw_response?: Json
          received_at?: string
          response_type?: string
          status?: string | null
          txn_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateway_responses_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bank_ref_num: string | null
          created_at: string
          currency: string
          error_code: string | null
          error_message: string | null
          failure_url: string | null
          id: string
          payment_mode: string | null
          payu_mihpayid: string | null
          product_info: string | null
          registration_id: string | null
          status: string
          success_url: string | null
          txn_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          bank_ref_num?: string | null
          created_at?: string
          currency?: string
          error_code?: string | null
          error_message?: string | null
          failure_url?: string | null
          id?: string
          payment_mode?: string | null
          payu_mihpayid?: string | null
          product_info?: string | null
          registration_id?: string | null
          status?: string
          success_url?: string | null
          txn_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_ref_num?: string | null
          created_at?: string
          currency?: string
          error_code?: string | null
          error_message?: string | null
          failure_url?: string | null
          id?: string
          payment_mode?: string | null
          payu_mihpayid?: string | null
          product_info?: string | null
          registration_id?: string | null
          status?: string
          success_url?: string | null
          txn_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          city: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          last_reminder_at: string | null
          password_hash: string | null
          phone: string
          plan_name: string | null
          recovered_at: string | null
          recovery_attempts: number
          session_id: string | null
          status: string
          terms_accepted: boolean
          updated_at: string
          utm: Json | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          last_reminder_at?: string | null
          password_hash?: string | null
          phone: string
          plan_name?: string | null
          recovered_at?: string | null
          recovery_attempts?: number
          session_id?: string | null
          status?: string
          terms_accepted?: boolean
          updated_at?: string
          utm?: Json | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_reminder_at?: string | null
          password_hash?: string | null
          phone?: string
          plan_name?: string | null
          recovered_at?: string | null
          recovery_attempts?: number
          session_id?: string | null
          status?: string
          terms_accepted?: boolean
          updated_at?: string
          utm?: Json | null
        }
        Relationships: []
      }
      saved_itineraries: {
        Row: {
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          days: Json
          destination: string | null
          end_date: string | null
          guests: Json
          id: string
          share_id: string
          start_date: string | null
          title: string | null
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          days?: Json
          destination?: string | null
          end_date?: string | null
          guests?: Json
          id?: string
          share_id?: string
          start_date?: string | null
          title?: string | null
          total_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          days?: Json
          destination?: string | null
          end_date?: string | null
          guests?: Json
          id?: string
          share_id?: string
          start_date?: string | null
          title?: string | null
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      search_queries: {
        Row: {
          created_at: string
          id: string
          page_path: string | null
          query: string
          results_count: number | null
          session_id: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path?: string | null
          query: string
          results_count?: number | null
          session_id?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string | null
          query?: string
          results_count?: number | null
          session_id?: string | null
          source?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_order: number | null
          id: string
          name: string
          rating: number
          review: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          name: string
          rating: number
          review: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          name?: string
          rating?: number
          review?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tracking_scripts: {
        Row: {
          code: string
          created_at: string
          id: string
          is_enabled: boolean
          load_strategy: string
          name: string
          notes: string | null
          placement: string
          provider: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          load_strategy?: string
          name: string
          notes?: string | null
          placement?: string
          provider?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          load_strategy?: string
          name?: string
          notes?: string | null
          placement?: string
          provider?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          country: string | null
          device: string | null
          first_seen_at: string
          id: string
          landing_page: string | null
          last_seen_at: string
          page_views: number
          referrer: string | null
          session_id: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          country?: string | null
          device?: string | null
          first_seen_at?: string
          id?: string
          landing_page?: string | null
          last_seen_at?: string
          page_views?: number
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          country?: string | null
          device?: string | null
          first_seen_at?: string
          id?: string
          landing_page?: string | null
          last_seen_at?: string
          page_views?: number
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      voice_ai_lead_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          lead_email: string
          mime_type: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          lead_email: string
          mime_type?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          lead_email?: string
          mime_type?: string | null
        }
        Relationships: []
      }
      voice_ai_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      voice_ai_sessions: {
        Row: {
          connected_at: string | null
          conversation_summary: string | null
          created_at: string
          id: string
          itinerary_state: Json | null
          last_active_at: string
          message_count: number
          session_id: string
          source: string
          tool_calls: Json
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          connected_at?: string | null
          conversation_summary?: string | null
          created_at?: string
          id?: string
          itinerary_state?: Json | null
          last_active_at?: string
          message_count?: number
          session_id: string
          source?: string
          tool_calls?: Json
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          connected_at?: string | null
          conversation_summary?: string | null
          created_at?: string
          id?: string
          itinerary_state?: Json | null
          last_active_at?: string
          message_count?: number
          session_id?: string
          source?: string
          tool_calls?: Json
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
      webinar_registrations: {
        Row: {
          amount_inr: number
          city: string | null
          confirmation_email_sent_at: string | null
          confirmation_whatsapp_sent_at: string | null
          country_code: string | null
          created_at: string
          currency: string
          dial_code: string | null
          email: string
          full_name: string
          id: string
          payu_mihpayid: string | null
          phone_e164: string
          session_id: string | null
          status: string
          txnid: string | null
          updated_at: string
          utm: Json
        }
        Insert: {
          amount_inr?: number
          city?: string | null
          confirmation_email_sent_at?: string | null
          confirmation_whatsapp_sent_at?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string
          dial_code?: string | null
          email: string
          full_name: string
          id?: string
          payu_mihpayid?: string | null
          phone_e164: string
          session_id?: string | null
          status?: string
          txnid?: string | null
          updated_at?: string
          utm?: Json
        }
        Update: {
          amount_inr?: number
          city?: string | null
          confirmation_email_sent_at?: string | null
          confirmation_whatsapp_sent_at?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string
          dial_code?: string | null
          email?: string
          full_name?: string
          id?: string
          payu_mihpayid?: string | null
          phone_e164?: string
          session_id?: string | null
          status?: string
          txnid?: string | null
          updated_at?: string
          utm?: Json
        }
        Relationships: []
      }
      webinar_settings: {
        Row: {
          agenda: Json
          bonuses: Json
          created_at: string
          currency: string
          duration_minutes: number
          eyebrow: string
          faqs: Json
          host_bio_markdown: string
          host_name: string
          host_photo_url: string | null
          host_title: string
          id: string
          is_free: boolean
          is_published: boolean
          join_url: string | null
          learning_points: Json
          price_inr: number
          scheduled_at: string
          seats_reserved_buffer: number
          seats_total: number
          singleton: boolean
          subtitle: string
          timezone: string
          title: string
          updated_at: string
          whatsapp_group_url: string | null
          who_for_beginner: Json
          who_for_scaler: Json
        }
        Insert: {
          agenda?: Json
          bonuses?: Json
          created_at?: string
          currency?: string
          duration_minutes?: number
          eyebrow?: string
          faqs?: Json
          host_bio_markdown?: string
          host_name?: string
          host_photo_url?: string | null
          host_title?: string
          id?: string
          is_free?: boolean
          is_published?: boolean
          join_url?: string | null
          learning_points?: Json
          price_inr?: number
          scheduled_at?: string
          seats_reserved_buffer?: number
          seats_total?: number
          singleton?: boolean
          subtitle?: string
          timezone?: string
          title?: string
          updated_at?: string
          whatsapp_group_url?: string | null
          who_for_beginner?: Json
          who_for_scaler?: Json
        }
        Update: {
          agenda?: Json
          bonuses?: Json
          created_at?: string
          currency?: string
          duration_minutes?: number
          eyebrow?: string
          faqs?: Json
          host_bio_markdown?: string
          host_name?: string
          host_photo_url?: string | null
          host_title?: string
          id?: string
          is_free?: boolean
          is_published?: boolean
          join_url?: string | null
          learning_points?: Json
          price_inr?: number
          scheduled_at?: string
          seats_reserved_buffer?: number
          seats_total?: number
          singleton?: boolean
          subtitle?: string
          timezone?: string
          title?: string
          updated_at?: string
          whatsapp_group_url?: string | null
          who_for_beginner?: Json
          who_for_scaler?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_must_change_password: { Args: never; Returns: undefined }
      has_admin_edit: {
        Args: { _module: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_blog_views: { Args: { _slug: string }; Returns: undefined }
      increment_lead_magnet_downloads: {
        Args: { _magnet_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "user"
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
      app_role: ["superadmin", "admin", "user"],
    },
  },
} as const
