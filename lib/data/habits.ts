import { supabase } from '../supabase/client';

export type HabitType = 'to_do' | 'to_avoid';
export type HabitFrequency = 'weekly' | 'biweekly' | 'monthly';

export type Habit = {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  icon: string | null;
  default_weekly_target: number;
  habit_type: HabitType;
  frequency: HabitFrequency;
  sort_order: number;
  archived_at: string | null;
};

const HABIT_COLUMNS =
  'id, user_id, category_id, name, icon, default_weekly_target, habit_type, frequency, sort_order, archived_at';

export async function listActiveHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select(HABIT_COLUMNS)
    .is('archived_at', null)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

/** Sets sort_order to array position for each id, scoped server-side to the
 * caller's own habits. Only meaningful within a single category — habits
 * are re-numbered per drag-drop within their category's list. */
export async function reorderHabits(orderedHabitIds: string[]): Promise<void> {
  const { error } = await supabase.rpc('reorder_habits', { p_habit_ids: orderedHabitIds });
  if (error) throw error;
}

export async function getHabitById(id: string): Promise<Habit> {
  const { data, error } = await supabase.from('habits').select(HABIT_COLUMNS).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function listArchivedHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select(HABIT_COLUMNS)
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createHabit(params: {
  userId: string;
  categoryId: string;
  name: string;
  icon?: string | null;
  defaultWeeklyTarget: number;
  habitType: HabitType;
  frequency: HabitFrequency;
}): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: params.userId,
      category_id: params.categoryId,
      name: params.name,
      icon: params.icon ?? null,
      default_weekly_target: params.defaultWeeklyTarget,
      habit_type: params.habitType,
      frequency: params.frequency,
    })
    .select(HABIT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateHabit(
  id: string,
  patch: Partial<{
    name: string;
    categoryId: string;
    icon: string | null;
    defaultWeeklyTarget: number;
    habitType: HabitType;
    frequency: HabitFrequency;
  }>
): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.categoryId !== undefined ? { category_id: patch.categoryId } : {}),
      ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
      ...(patch.defaultWeeklyTarget !== undefined
        ? { default_weekly_target: patch.defaultWeeklyTarget }
        : {}),
      ...(patch.habitType !== undefined ? { habit_type: patch.habitType } : {}),
      ...(patch.frequency !== undefined ? { frequency: patch.frequency } : {}),
    })
    .eq('id', id)
    .select(HABIT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function archiveHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').update({ archived_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function unarchiveHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').update({ archived_at: null }).eq('id', id);
  if (error) throw error;
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw error;
}
