import { Link, router } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { HabitsGrid, type GridHabit } from '../../components/HabitsGrid';
import { HeaderMenu } from '../../components/HeaderMenu';
import { LoadingState } from '../../components/LoadingState';
import { NeumorphicSurface } from '../../components/NeumorphicSurface';
import { WeekHeader } from '../../components/WeekHeader';
import { supabase } from '../../lib/supabase/client';
import { useCategories } from '../../lib/queries/useCategories';
import { useCurrentWeek, useHabitStreaks, useToggleCompletion } from '../../lib/queries/useCurrentWeek';
import { useHabits } from '../../lib/queries/useHabits';
import { formatWeekRange, getWeekDays, getWeekStartISO, todayISO } from '../../lib/week';
import { colors, spacing } from '../../theme/tokens';

export default function DashboardScreen() {
  const weekStartISO = getWeekStartISO();
  const weekDays = getWeekDays(weekStartISO);
  const today = todayISO();

  const habitsQuery = useHabits();
  const categoriesQuery = useCategories();
  const weekQuery = useCurrentWeek(weekStartISO);
  const streaksQuery = useHabitStreaks(weekStartISO);
  const toggleCompletion = useToggleCompletion(weekStartISO);

  const isLoading =
    habitsQuery.isLoading || categoriesQuery.isLoading || weekQuery.isLoading || streaksQuery.isLoading;
  const error = habitsQuery.error || categoriesQuery.error || weekQuery.error || streaksQuery.error;

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={(error as Error).message} />;
  }

  const habits = habitsQuery.data ?? [];
  const categoryById = new Map((categoriesQuery.data ?? []).map((c) => [c.id, c]));
  const recordByHabitId = new Map((weekQuery.data ?? []).map((r) => [r.habit_id, r]));
  const streakByHabitId = new Map((streaksQuery.data ?? []).map((s) => [s.habit_id, s.streak_weeks]));

  // weekQuery returns every weekly_records row for this week, including ones
  // belonging to habits archived after the row was created — totals must
  // only count currently-active habits, so filter through the active set.
  const activeHabitIds = new Set(habits.map((h) => h.id));
  const activeRecords = (weekQuery.data ?? []).filter((r) => activeHabitIds.has(r.habit_id));

  const doneCount = activeRecords.reduce((sum, r) => sum + r.completed_dates.length, 0);
  const plannedCount = activeRecords.reduce((sum, r) => sum + r.target_for_week, 0);
  const percent = plannedCount > 0 ? doneCount / plannedCount : 0;

  const gridHabits: GridHabit[] = habits.map((habit) => {
    const record = recordByHabitId.get(habit.id);
    const category = categoryById.get(habit.category_id);
    return {
      id: habit.id,
      name: habit.name,
      habitType: habit.habit_type,
      categoryId: habit.category_id,
      categoryName: category?.name ?? '',
      categoryIcon: category?.icon ?? 'star',
      target: record?.target_for_week ?? habit.default_weekly_target,
      completedDates: record?.completed_dates ?? [],
      streakWeeks: streakByHabitId.get(habit.id) ?? 0,
    };
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base }}
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxxl }}
    >
      <WeekHeader
        weekRangeLabel={formatWeekRange(weekStartISO)}
        percent={percent}
        doneCount={doneCount}
        plannedCount={plannedCount}
        headerRight={
          <HeaderMenu
            onPressHistory={() => router.push('/history')}
            onPressSignOut={() => supabase.auth.signOut()}
          />
        }
      />

      {habits.length === 0 ? (
        <EmptyState
          title="No habits yet"
          message="Add your first habit to start tracking your better week."
        />
      ) : (
        <HabitsGrid
          habits={gridHabits}
          weekDays={weekDays}
          todayISO={today}
          onToggleDay={(habitId, dateISO) => toggleCompletion.mutate({ habitId, dateISO })}
          onPressHabit={(habitId) => router.push(`/habit/${habitId}`)}
        />
      )}

      <Link href="/habit/new" asChild>
        <Pressable>
          <NeumorphicSurface
            variant="raised"
            backgroundColor={colors.bauhaus.blue}
            radius={999}
            style={{ paddingVertical: spacing.lg, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>+ New habit</Text>
          </NeumorphicSurface>
        </Pressable>
      </Link>
    </ScrollView>
  );
}
