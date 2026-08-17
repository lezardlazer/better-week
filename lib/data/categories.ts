import { supabase } from '../supabase/client';

export type Category = {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  is_predefined: boolean;
};

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, user_id, name, icon, is_predefined')
    .order('is_predefined', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createCustomCategory(params: {
  userId: string;
  name: string;
  icon: string;
}): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: params.userId, name: params.name, icon: params.icon, is_predefined: false })
    .select('id, user_id, name, icon, is_predefined')
    .single();
  if (error) throw error;
  return data;
}

/** Map of category_id -> this user's chosen display position. Categories
 * with no row here (never manually reordered) fall back to alphabetical,
 * sorted after any explicitly positioned ones. */
export async function listCategoryPositions(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('category_positions').select('category_id, position');
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((row) => [row.category_id, row.position]));
}

export async function reorderCategories(orderedCategoryIds: string[]): Promise<void> {
  const { error } = await supabase.rpc('reorder_categories', { p_category_ids: orderedCategoryIds });
  if (error) throw error;
}
