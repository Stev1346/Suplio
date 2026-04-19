export type EventStatus = 'pending' | 'accepted' | 'rejected' | 'played';
export type EventLifecycleStatus = "draft" | "live" | "ended" | "archived";
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          name: string;
          event_code: string;
          dj_id: string;
          created_at: string;
          allow_requests: boolean;
          lifecycle_status: EventLifecycleStatus;
          live_entered_at: string | null;
          ended_entered_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          event_code: string;
          dj_id: string;
          created_at?: string;
          allow_requests?: boolean;
          lifecycle_status: EventLifecycleStatus;
          live_entered_at?: string | null;
          ended_entered_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      dj_profiles: {
        Row: {
          user_id: string;
          stage_name: string;
          bio: string | null;
          avatar_url: string | null;
          website: string | null;
          social_links: Json | null;
          contact_info: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          stage_name: string;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          social_links?: Json | null;
          contact_info?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["dj_profiles"]["Insert"]>;
      };
      requests: {
        Row: {
          id: string;
          event_id: string;
          song_name: string;
          artist: string | null;
          message: string | null;
          votes: number;
          status: EventStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          song_name: string;
          artist?: string | null;
          message?: string | null;
          votes?: number;
          status?: EventStatus;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['requests']['Insert']>;
      };
      votes: {
        Row: {
          id: string;
          request_id: string;
          created_at: string;
          voter_id: string | null;
        };
        Insert: {
          id?: string;
          request_id: string;
          created_at?: string;
          voter_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['votes']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}