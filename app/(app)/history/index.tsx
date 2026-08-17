import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/ErrorState';
import { LoadingState } from '../../../components/LoadingState';
import { WeekListItem } from '../../../components/WeekListItem';
import { usePastWeeks } from '../../../lib/queries/useHistory';
import { formatWeekRange, getWeekStartISO } from '../../../lib/week';
import { colors, spacing, typography } from '../../../theme/tokens';

export default function HistoryScreen() {
  const weekStartISO = getWeekStartISO();
  const pastWeeksQuery = usePastWeeks(weekStartISO);

  if (pastWeeksQuery.isLoading) {
    return <LoadingState />;
  }

  if (pastWeeksQuery.error) {
    return <ErrorState message={(pastWeeksQuery.error as Error).message} />;
  }

  const weeks = pastWeeksQuery.data ?? [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base }}
      contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.xxl, gap: spacing.xl, paddingBottom: spacing.xxxl }}
    >
      <Text style={{ ...typography.display, color: colors.ink }}>History</Text>

      {weeks.length === 0 ? (
        <EmptyState
          title="No past weeks yet"
          message="Once a week ends, it'll show up here so you can look back."
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {weeks.map((week) => (
            <WeekListItem
              key={week.week_start_date}
              weekRangeLabel={formatWeekRange(week.week_start_date)}
              percent={week.planned > 0 ? week.completed / week.planned : 0}
              doneCount={week.completed}
              plannedCount={week.planned}
              onPress={() => router.push(`/history/${week.week_start_date}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
