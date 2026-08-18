import { supabase } from '../supabase/client';
import { addDaysToISO } from '../week';

export type WeekHabitRecord = {
  habit_id: string;
  target_for_week: number;
  completed_dates: string[];
};

export async function getWeekDashboard(weekStartISO: string): Promise<WeekHabitRecord[]> {
  const { data, error } = await supabase.rpc('get_week_dashboard', { p_week_start: weekStartISO });
  if (error) throw error;
  return data ?? [];
}

export type HabitStreak = { habit_id: string; streak_weeks: number };

export async function getHabitStreaks(currentWeekStartISO: string): Promise<HabitStreak[]> {
  const { data, error } = await supabase.rpc('get_habit_streaks', {
    p_current_week_start: currentWeekStartISO,
  });
  if (error) throw error;
  return data ?? [];
}

/** Returns the new checked/unchecked state for that day. */
export async function toggleHabitCompletion(habitId: string, dateISO: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('toggle_habit_completion', {
    p_habit_id: habitId,
    p_date: dateISO,
  });
  if (error) throw error;
  return data as boolean;
}

export type PastWeekSummary = {
  week_start_date: string;
  planned: number;
  completed: number;
};

export async function listPastWeeks(beforeISO: string): Promise<PastWeekSummary[]> {
  const { data, error } = await supabase.rpc('list_past_weeks', { p_before: beforeISO });
  if (error) throw error;
  return data ?? [];
}

export type WeekHabitDetail = WeekHabitRecord & { habit_name: string; habit_type: 'to_do' | 'to_avoid' };

export async function getWeekDetail(weekStartISO: string): Promise<WeekHabitDetail[]> {
  const { data, error } = await supabase.rpc('get_week_detail', { p_week_start: weekStartISO });
  if (error) throw error;
  return data ?? [];
}

export type HabitWeekSummary = {
  week_start_date: string;
  target_for_week: number;
  completed_count: number;
};

export async function listHabitHistory(habitId: string): Promise<HabitWeekSummary[]> {
  const [{ data: records, error: recordsError }, { data: completions, error: completionsError }] =
    await Promise.all([
      supabase
        .from('weekly_records')
        .select('week_start_date, target_for_week')
        .eq('habit_id', habitId)
        .order('week_start_date', { ascending: false }),
      supabase.from('habit_completions').select('completed_on').eq('habit_id', habitId),
    ]);

  if (recordsError) throw recordsError;
  if (completionsError) throw completionsError;

  const completedDates = (completions ?? []).map((c) => c.completed_on);

  return (records ?? []).map((r) => {
    const weekEnd = addDaysToISO(r.week_start_date, 6);
    const completed_count = completedDates.filter((d) => d >= r.week_start_date && d <= weekEnd).length;
    return { week_start_date: r.week_start_date, target_for_week: r.target_for_week, completed_count };
  });
}
