import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { EmptyState } from '../../../../components/EmptyState';
import { ErrorState } from '../../../../components/ErrorState';
import { LoadingState } from '../../../../components/LoadingState';
import { NeumorphicSurface } from '../../../../components/NeumorphicSurface';
import { useHabit } from '../../../../lib/queries/useHabits';
import { useHabitHistory } from '../../../../lib/queries/useHistory';
import { formatWeekRange } from '../../../../lib/week';
import { colors, spacing, typography } from '../../../../theme/tokens';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitQuery = useHabit(id);
  const historyQuery = useHabitHistory(id);

  if (habitQuery.isLoading || historyQuery.isLoading) {
    return <LoadingState />;
  }

  if (habitQuery.error || historyQuery.error) {
    return <ErrorState message={((habitQuery.error ?? historyQuery.error) as Error).message} />;
  }

  if (!habitQuery.data) {
    return <ErrorState message="Habit not found." />;
  }

  const habit = habitQuery.data;
  const weeks = historyQuery.data ?? [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base }}
      contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.xxl, gap: spacing.xl, paddingBottom: spacing.xxxl }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ ...typography.display, color: colors.ink, flexShrink: 1 }}>{habit.name}</Text>
        <Link href={`/habit/${habit.id}/edit`} asChild>
          <Pressable>
            <Text style={{ color: colors.bauhaus.blue, fontWeight: '600' }}>Edit</Text>
          </Pressable>
        </Link>
      </View>

      {weeks.length === 0 ? (
        <EmptyState title="No history yet" message="Complete a few days to start building history." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {weeks.map((week) => (
            <NeumorphicSurface
              key={week.week_start_date}
              variant="raised"
              style={{
                padding: spacing.lg,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ ...typography.body, color: colors.ink }}>
                {formatWeekRange(week.week_start_date)}
              </Text>
              <Text style={{ color: colors.muted }}>
                {week.completed_count}/{week.target_for_week}
              </Text>
            </NeumorphicSurface>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
