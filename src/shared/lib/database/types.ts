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
      chat_settings: {
        Row: {
          api_endpoint: string | null
          api_key: string | null
          api_secret: string | null
          auto_create_contacts: boolean
          config: Json | null
          created_at: string
          enable_notifications: boolean
          id: string
          is_active: boolean
          provider_name: string
          updated_at: string
          webhook_url: string | null
          workspace_id: string
        }
        Insert: {
          api_endpoint?: string | null
          api_key?: string | null
          api_secret?: string | null
          auto_create_contacts?: boolean
          config?: Json | null
          created_at?: string
          enable_notifications?: boolean
          id?: string
          is_active?: boolean
          provider_name?: string
          updated_at?: string
          webhook_url?: string | null
          workspace_id: string
        }
        Update: {
          api_endpoint?: string | null
          api_key?: string | null
          api_secret?: string | null
          auto_create_contacts?: boolean
          config?: Json | null
          created_at?: string
          enable_notifications?: boolean
          id?: string
          is_active?: boolean
          provider_name?: string
          updated_at?: string
          webhook_url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tag_assignments: {
        Row: {
          assigned_at: string | null
          contact_id: string
          tag_id: string
        }
        Insert: {
          assigned_at?: string | null
          contact_id: string
          tag_id: string
        }
        Update: {
          assigned_at?: string | null
          contact_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tag_assignments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "contact_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          created_by: string
          custom_fields: Json | null
          email: string | null
          first_name: string
          id: string
          job_title: string | null
          last_name: string | null
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          source: string | null
          state: string | null
          status: string | null
          twitter_url: string | null
          updated_at: string | null
          website: string | null
          workspace_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by: string
          custom_fields?: Json | null
          email?: string | null
          first_name: string
          id?: string
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
          workspace_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string
          custom_fields?: Json | null
          email?: string | null
          first_name?: string
          id?: string
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          created_by: string | null
          deal_id: string
          description: string | null
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          title: string
          workspace_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          created_by?: string | null
          deal_id: string
          description?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          title: string
          workspace_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          created_by?: string | null
          deal_id?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_contacts: {
        Row: {
          added_at: string | null
          added_by: string | null
          contact_id: string
          deal_id: string
          is_primary: boolean | null
          role: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          contact_id: string
          deal_id: string
          is_primary?: boolean | null
          role?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          contact_id?: string
          deal_id?: string
          is_primary?: boolean | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_contacts_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_contacts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          description: string | null
          expected_close_date: string | null
          id: string
          lost_reason: string | null
          owner_id: string | null
          position: number | null
          primary_contact_id: string | null
          probability: number | null
          source: string | null
          stage_id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          value: number | null
          won_date: string | null
          workspace_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          owner_id?: string | null
          position?: number | null
          primary_contact_id?: string | null
          probability?: number | null
          source?: string | null
          stage_id: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          value?: number | null
          won_date?: string | null
          workspace_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          owner_id?: string | null
          position?: number | null
          primary_contact_id?: string | null
          probability?: number | null
          source?: string | null
          stage_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          value?: number | null
          won_date?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          email: string
          expires_at: string
          id: string
          invited_at: string
          invited_by: string
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          contact_id: string
          content: string
          created_at: string
          external_id: string | null
          id: string
          media_url: string | null
          message_type: Database["public"]["Enums"]["message_type"]
          metadata: Json | null
          read_at: string | null
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type"]
          status: Database["public"]["Enums"]["message_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string
          external_id?: string | null
          id?: string
          media_url?: string | null
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          read_at?: string | null
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type"]
          status?: Database["public"]["Enums"]["message_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string
          external_id?: string | null
          id?: string
          media_url?: string | null
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string
          sender_type?: Database["public"]["Enums"]["sender_type"]
          status?: Database["public"]["Enums"]["message_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          is_closed: boolean | null
          is_won: boolean | null
          metadata: Json | null
          name: string
          probability: number | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_closed?: boolean | null
          is_won?: boolean | null
          metadata?: Json | null
          name: string
          probability?: number | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_closed?: boolean | null
          is_won?: boolean | null
          metadata?: Json | null
          name?: string
          probability?: number | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          logo_storage_path: string | null
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          theme_config: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_storage_path?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          theme_config?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_storage_path?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          theme_config?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_workspace_with_owner: {
        Args: {
          user_id: string
          workspace_name: string
          workspace_slug: string
        }
        Returns: string
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      member_role: "owner" | "admin" | "member"
      message_status: "sent" | "delivered" | "read" | "failed"
      message_type: "text" | "image" | "file" | "audio"
      sender_type: "user" | "contact"
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
      invitation_status: ["pending", "accepted", "declined", "expired"],
      member_role: ["owner", "admin", "member"],
      message_status: ["sent", "delivered", "read", "failed"],
      message_type: ["text", "image", "file", "audio"],
      sender_type: ["user", "contact"],
    },
  },
} as const

// ============================================================================
// Custom Type Definitions (manually maintained)
// ============================================================================

// Contact Types
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type ContactStatus = Contact['status'];

export type CreateContactInput = Database['public']['Tables']['contacts']['Insert'];
export type UpdateContactInput = Partial<Omit<CreateContactInput, 'workspace_id'>>;

export type ContactTag = Database['public']['Tables']['contact_tags']['Row'];

export type ContactWithTags = Contact & {
  tags: ContactTag[];
};

export interface ContactFilters {
  search?: string;
  status?: ContactStatus | 'all';
  tags?: string[];
  sortBy?: 'created_at' | 'first_name' | 'last_name' | 'company' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Contact Tag Types
export type ContactTagRow = Database['public']['Tables']['contact_tags']['Row'];
export type CreateContactTagInput = Database['public']['Tables']['contact_tags']['Insert'];
export type UpdateContactTagInput = Database['public']['Tables']['contact_tags']['Update'];

// Deal Types
export type Deal = Database['public']['Tables']['deals']['Row'];
export type DealStatus = Deal['status'];
export type CreateDealInput = Database['public']['Tables']['deals']['Insert'];
export type UpdateDealInput = Database['public']['Tables']['deals']['Update'];

export type DealActivity = {
  id: string;
  activity_type: string;
  title: string;
  description?: string | null;
  created_at: string | null;
  created_by: string | null;
  deal_id: string;
  workspace_id: string;
  metadata: unknown;
  old_value: unknown;
  new_value: unknown;
  created_by_profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
};

export type DealContact = Contact & { 
  role?: string;
  is_primary?: boolean;
};

export type DealWithRelations = Deal & {
  contacts: DealContact[];
  stage: PipelineStage;
  primary_contact?: Contact | null;
  activities?: DealActivity[];
};

export interface DealFilters {
  search?: string;
  status?: DealStatus | 'all';
  stageId?: string;
  stage_id?: string;
  pipelineId?: string;
  contactId?: string;
  owner_id?: string;
  sortBy?: 'created_at' | 'title' | 'value' | 'expected_close_date';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Pipeline Stage Types
export type PipelineStage = Database['public']['Tables']['pipeline_stages']['Row'];
export type CreatePipelineStageInput = Database['public']['Tables']['pipeline_stages']['Insert'];
export type UpdatePipelineStageInput = Database['public']['Tables']['pipeline_stages']['Update'];

// Workspace Theme Types
export interface WorkspaceTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  theme_mode: 'light' | 'dark';
}

// Message Types (Chat)
export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageStatus = Database['public']['Enums']['message_status'];
export type MessageType = Database['public']['Enums']['message_type'];
export type SenderType = Database['public']['Enums']['sender_type'];

export interface CreateMessageInput {
  workspace_id: string;
  contact_id: string;
  sender_type: SenderType;
  sender_id: string;
  content: string;
  message_type?: MessageType;
  status?: MessageStatus;
  media_url?: string;
  external_id?: string;
  metadata?: Record<string, unknown>;
}

// Message Helper Types
export type MessageWithSender = Message & {
  sender: Contact | { id: string; full_name: string | null; email: string | null; avatar_url?: string | null };
  contact?: Contact;
  sender_profile?: { id: string; full_name: string | null; email: string | null; avatar_url?: string | null } | null;
};

export interface MessageFilters {
  contactId?: string;
  startDate?: string;
  endDate?: string;
  messageType?: MessageType;
  status?: MessageStatus;
  search?: string;
  metadata?: Record<string, unknown>;
}

// Chat Settings Types
export type ChatSettings = Database['public']['Tables']['chat_settings']['Row'];
export type CreateChatSettingsInput = Database['public']['Tables']['chat_settings']['Insert'];
export type UpdateChatSettingsInput = Database['public']['Tables']['chat_settings']['Update'];
