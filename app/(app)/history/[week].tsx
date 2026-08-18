import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/ErrorState';
import { HabitRow } from '../../../components/HabitRow';
import { LoadingState } from '../../../components/LoadingState';
import { WeekHeader } from '../../../components/WeekHeader';
import { useWeekDetail } from '../../../lib/queries/useHistory';
import { formatWeekRange, getWeekDays } from '../../../lib/week';
import { colors, spacing } from '../../../theme/tokens';

export default function WeekDetailScreen() {
  const { week } = useLocalSearchParams<{ week: string }>();
  const weekDetailQuery = useWeekDetail(week);

  if (weekDetailQuery.isLoading) {
    return <LoadingState />;
  }

  if (weekDetailQuery.error) {
    return <ErrorState message={(weekDetailQuery.error as Error).message} />;
  }

  const records = weekDetailQuery.data ?? [];
  const weekDays = getWeekDays(week);
  const doneCount = records.reduce((sum, r) => {
    return r.habit_type === 'to_avoid' ? sum - r.completed_dates.length : sum + r.completed_dates.length;
  }, 0);
  const plannedCount = records.reduce((sum, r) => {
    return r.habit_type === 'to_avoid' ? sum : sum + r.target_for_week;
  }, 0);
  const percent = plannedCount > 0 ? doneCount / plannedCount : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base }}
      contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.xxl, gap: spacing.xl, paddingBottom: spacing.xxxl }}
    >
      <WeekHeader
        weekRangeLabel={formatWeekRange(week)}
        percent={percent}
        doneCount={doneCount}
        plannedCount={plannedCount}
      />

      {records.length === 0 ? (
        <EmptyState title="Nothing logged" message="No habits had activity this week." />
      ) : (
        <View style={{ gap: spacing.lg }}>
          {records.map((record) => (
            <HabitRow
              key={record.habit_id}
              name={record.habit_name}
              categoryLabel=""
              target={record.target_for_week}
              completedDates={record.completed_dates}
              weekDays={weekDays}
              todayISO=""
              readOnly
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
