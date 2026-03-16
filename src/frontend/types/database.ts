export type EventStatus = 'pending' | 'accepted' | 'rejected' | 'played';

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          name: string;
          event_code: string;
          created_at: string;
          allow_requests: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          event_code: string;
          created_at?: string;
          allow_requests?: boolean;
        };
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
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