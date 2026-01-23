export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";
export type ConversationStatus = "open" | "closed" | "snoozed";
export type MessageDirection = "inbound" | "outbound";
export type MessageChannel = "sms" | "call" | "voicemail";
export type MessageStatus = "queued" | "sent" | "delivered" | "failed" | "received";
export type ReviewRequestStatus = "sent" | "reminded_1" | "reminded_2" | "replied" | "clicked" | "reviewed" | "negative" | "stopped";
export type ReviewCampaignStatus = "draft" | "sending" | "completed" | "paused";
export type ContactSource = "sms" | "call" | "form" | "import" | "manual";

export interface ContractorTemplates {
  missed_call: {
    enabled: boolean;
    message: string;
  };
  review_request: {
    message: string;
  };
  review_positive: {
    message: string;
  };
  review_negative: {
    message: string;
  };
  review_reminder_1: {
    delay_days: number;
    message: string;
  };
  review_reminder_2: {
    delay_days: number;
    message: string;
  };
  review_blast: {
    message: string;
  };
}

export interface Database {
  public: {
    Tables: {
      contractors: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          business_name: string;
          logo_url: string | null;
          timezone: string;
          phone_number: string | null;
          phone_sid: string | null;
          forwarding_number: string | null;
          google_review_link: string | null;
          business_hours_start: string | null;
          business_hours_end: string | null;
          stripe_customer_id: string | null;
          subscription_status: SubscriptionStatus;
          subscription_id: string | null;
          feature_missed_call_text: boolean;
          feature_review_automation: boolean;
          feature_review_drip: boolean;
          feature_ai_responses: boolean;
          feature_campaigns: boolean;
          templates: ContractorTemplates;
          notification_push: boolean;
          notification_email: boolean;
          is_admin: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          business_name: string;
          logo_url?: string | null;
          timezone?: string;
          phone_number?: string | null;
          phone_sid?: string | null;
          forwarding_number?: string | null;
          google_review_link?: string | null;
          business_hours_start?: string | null;
          business_hours_end?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: SubscriptionStatus;
          subscription_id?: string | null;
          feature_missed_call_text?: boolean;
          feature_review_automation?: boolean;
          feature_review_drip?: boolean;
          feature_ai_responses?: boolean;
          feature_campaigns?: boolean;
          templates?: ContractorTemplates;
          notification_push?: boolean;
          notification_email?: boolean;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          business_name?: string;
          logo_url?: string | null;
          timezone?: string;
          phone_number?: string | null;
          phone_sid?: string | null;
          forwarding_number?: string | null;
          google_review_link?: string | null;
          business_hours_start?: string | null;
          business_hours_end?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: SubscriptionStatus;
          subscription_id?: string | null;
          feature_missed_call_text?: boolean;
          feature_review_automation?: boolean;
          feature_review_drip?: boolean;
          feature_ai_responses?: boolean;
          feature_campaigns?: boolean;
          templates?: ContractorTemplates;
          notification_push?: boolean;
          notification_email?: boolean;
          is_admin?: boolean;
        };
      };
      contacts: {
        Row: {
          id: string;
          contractor_id: string;
          created_at: string;
          updated_at: string;
          name: string;
          phone: string;
          email: string | null;
          source: ContactSource;
          tags: string[];
          notes: string | null;
          last_contacted_at: string | null;
          opted_out: boolean;
          has_left_review: boolean;
        };
        Insert: {
          id?: string;
          contractor_id: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          phone: string;
          email?: string | null;
          source?: ContactSource;
          tags?: string[];
          notes?: string | null;
          last_contacted_at?: string | null;
          opted_out?: boolean;
          has_left_review?: boolean;
        };
        Update: {
          id?: string;
          contractor_id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          source?: ContactSource;
          tags?: string[];
          notes?: string | null;
          last_contacted_at?: string | null;
          opted_out?: boolean;
          has_left_review?: boolean;
        };
      };
      conversations: {
        Row: {
          id: string;
          contractor_id: string;
          contact_id: string;
          created_at: string;
          updated_at: string;
          status: ConversationStatus;
          unread_count: number;
          last_message_at: string | null;
          last_message_preview: string | null;
        };
        Insert: {
          id?: string;
          contractor_id: string;
          contact_id: string;
          created_at?: string;
          updated_at?: string;
          status?: ConversationStatus;
          unread_count?: number;
          last_message_at?: string | null;
          last_message_preview?: string | null;
        };
        Update: {
          id?: string;
          contractor_id?: string;
          contact_id?: string;
          created_at?: string;
          updated_at?: string;
          status?: ConversationStatus;
          unread_count?: number;
          last_message_at?: string | null;
          last_message_preview?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          contractor_id: string;
          contact_id: string;
          created_at: string;
          direction: MessageDirection;
          channel: MessageChannel;
          body: string;
          media_urls: string[];
          status: MessageStatus;
          textgrid_sid: string | null;
          delivered_at: string | null;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          contractor_id: string;
          contact_id: string;
          created_at?: string;
          direction: MessageDirection;
          channel: MessageChannel;
          body: string;
          media_urls?: string[];
          status?: MessageStatus;
          textgrid_sid?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          contractor_id?: string;
          contact_id?: string;
          created_at?: string;
          direction?: MessageDirection;
          channel?: MessageChannel;
          body?: string;
          media_urls?: string[];
          status?: MessageStatus;
          textgrid_sid?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
        };
      };
      review_requests: {
        Row: {
          id: string;
          contractor_id: string;
          contact_id: string;
          campaign_id: string | null;
          created_at: string;
          updated_at: string;
          status: ReviewRequestStatus;
          rating: number | null;
          drip_step: number;
          next_drip_at: string | null;
          sent_at: string;
          replied_at: string | null;
          clicked_at: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          contractor_id: string;
          contact_id: string;
          campaign_id?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: ReviewRequestStatus;
          rating?: number | null;
          drip_step?: number;
          next_drip_at?: string | null;
          sent_at?: string;
          replied_at?: string | null;
          clicked_at?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          contractor_id?: string;
          contact_id?: string;
          campaign_id?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: ReviewRequestStatus;
          rating?: number | null;
          drip_step?: number;
          next_drip_at?: string | null;
          sent_at?: string;
          replied_at?: string | null;
          clicked_at?: string | null;
          reviewed_at?: string | null;
        };
      };
      review_campaigns: {
        Row: {
          id: string;
          contractor_id: string;
          created_at: string;
          updated_at: string;
          name: string;
          status: ReviewCampaignStatus;
          contact_filter: Json;
          total_contacts: number;
          sent_count: number;
          reply_count: number;
          review_count: number;
          rate_limit_per_hour: number;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          contractor_id: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          status?: ReviewCampaignStatus;
          contact_filter?: Json;
          total_contacts?: number;
          sent_count?: number;
          reply_count?: number;
          review_count?: number;
          rate_limit_per_hour?: number;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          contractor_id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          status?: ReviewCampaignStatus;
          contact_filter?: Json;
          total_contacts?: number;
          sent_count?: number;
          reply_count?: number;
          review_count?: number;
          rate_limit_per_hour?: number;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          contractor_id: string;
          created_at: string;
          event_type: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          contractor_id: string;
          created_at?: string;
          event_type: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          contractor_id?: string;
          created_at?: string;
          event_type?: string;
          metadata?: Json;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      subscription_status: SubscriptionStatus;
      conversation_status: ConversationStatus;
      message_direction: MessageDirection;
      message_channel: MessageChannel;
      message_status: MessageStatus;
      review_request_status: ReviewRequestStatus;
      review_campaign_status: ReviewCampaignStatus;
      contact_source: ContactSource;
    };
  };
}

// Helper types for easier usage
export type Contractor = Database["public"]["Tables"]["contractors"]["Row"];
export type ContractorInsert = Database["public"]["Tables"]["contractors"]["Insert"];
export type ContractorUpdate = Database["public"]["Tables"]["contractors"]["Update"];

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
export type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];

export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"];
export type ConversationUpdate = Database["public"]["Tables"]["conversations"]["Update"];

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

export type ReviewRequest = Database["public"]["Tables"]["review_requests"]["Row"];
export type ReviewRequestInsert = Database["public"]["Tables"]["review_requests"]["Insert"];
export type ReviewRequestUpdate = Database["public"]["Tables"]["review_requests"]["Update"];

export type ReviewCampaign = Database["public"]["Tables"]["review_campaigns"]["Row"];
export type ReviewCampaignInsert = Database["public"]["Tables"]["review_campaigns"]["Insert"];
export type ReviewCampaignUpdate = Database["public"]["Tables"]["review_campaigns"]["Update"];

export type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];
export type AnalyticsEventInsert = Database["public"]["Tables"]["analytics_events"]["Insert"];
