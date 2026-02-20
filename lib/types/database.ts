// AUTO-GENERATED — do not edit by hand.
// Run: npx supabase gen types typescript --project-id "$PROJECT_ID" > lib/types/database.ts
//
// Manual placeholder until Supabase project is connected.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          title: string | null;
          notes: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          title?: string | null;
          notes?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          title?: string | null;
          notes?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      interactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string | null;
          content: string | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title?: string | null;
          content?: string | null;
          occurred_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string | null;
          content?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      interaction_contacts: {
        Row: {
          interaction_id: string;
          contact_id: string;
          user_id: string;
        };
        Insert: {
          interaction_id: string;
          contact_id: string;
          user_id: string;
        };
        Update: {
          interaction_id?: string;
          contact_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      follow_ups: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string;
          title: string;
          description: string | null;
          due_date: string;
          priority: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact_id: string;
          title: string;
          description?: string | null;
          due_date: string;
          priority?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contact_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string;
          priority?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string | null;
        };
        Relationships: [];
      };
      contact_tags: {
        Row: {
          contact_id: string;
          tag_id: string;
          user_id: string;
        };
        Insert: {
          contact_id: string;
          tag_id: string;
          user_id: string;
        };
        Update: {
          contact_id?: string;
          tag_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

// Shared client type for query/action functions.
// Manual Database types don't satisfy @supabase/supabase-js v2.97.0 complex generics.
// Regenerate this file via `supabase gen types` for full type safety.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbClient = any;
