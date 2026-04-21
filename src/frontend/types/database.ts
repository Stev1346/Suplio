export type SongRequestStatus = 'pending' | 'accepted' | 'rejected' | 'played';
export type EventLifecycleStatus = "draft" | "live" | "ended" | "archived";
export type EventMode ="song_request" | "karaoke";
export type KaraokeRequestStatus = "queued" | "up_next" | "performing_now";
export type RequestStatus = SongRequestStatus | KaraokeRequestStatus;
export type RequestType = "song_request" | "karaoke";

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
          event_mode: EventMode;
          event_date: string | null;
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
          event_mode?: EventMode;
          event_date?: string | null;
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
          status: RequestStatus;
          created_at: string;
          request_type: RequestType;
          performer_name: string | null;
          removed_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          song_name: string;
          artist?: string | null;
          message?: string | null;
          votes?: number;
          status?: RequestStatus;
          created_at?: string;
          request_type: RequestType;
          performer_name: string | null;
          removed_at: string | null;
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