// Hand-written to mirror supabase/migrations/0001_init.sql.
// If the schema changes, update this file to match (no CLI-generated types
// in use for this project).

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          icon: string;
          is_predefined: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          icon: string;
          is_predefined?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          name: string;
          icon: string | null;
          default_weekly_target: number;
          habit_type: 'to_do' | 'to_avoid';
          frequency: 'weekly' | 'biweekly' | 'monthly';
          sort_order: number;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          name: string;
          icon?: string | null;
          default_weekly_target: number;
          habit_type?: 'to_do' | 'to_avoid';
          frequency?: 'weekly' | 'biweekly' | 'monthly';
          sort_order?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['habits']['Insert']>;
        Relationships: [];
      };
      category_positions: {
        Row: { user_id: string; category_id: string; position: number };
        Insert: { user_id: string; category_id: string; position?: number };
        Update: Partial<Database['public']['Tables']['category_positions']['Insert']>;
        Relationships: [];
      };
      weekly_records: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          week_start_date: string;
          target_for_week: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          week_start_date: string;
          target_for_week: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['weekly_records']['Insert']>;
        Relationships: [];
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_on: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['habit_completions']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_week_dashboard: {
        Args: { p_week_start: string };
        Returns: {
          habit_id: string;
          target_for_week: number;
          completed_dates: string[];
        }[];
      };
      toggle_habit_completion: {
        Args: { p_habit_id: string; p_date: string };
        Returns: boolean;
      };
      list_past_weeks: {
        Args: { p_before: string };
        Returns: {
          week_start_date: string;
          planned: number;
          completed: number;
        }[];
      };
      get_week_detail: {
        Args: { p_week_start: string };
        Returns: {
          habit_id: string;
          habit_name: string;
          target_for_week: number;
          completed_dates: string[];
        }[];
      };
      get_habit_streaks: {
        Args: { p_current_week_start: string };
        Returns: { habit_id: string; streak_weeks: number }[];
      };
      reorder_habits: {
        Args: { p_habit_ids: string[] };
        Returns: undefined;
      };
      reorder_categories: {
        Args: { p_category_ids: string[] };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
};
