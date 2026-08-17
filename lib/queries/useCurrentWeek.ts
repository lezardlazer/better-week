import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getHabitStreaks, getWeekDashboard, toggleHabitCompletion, type WeekHabitRecord } from '../data/weeklyRecords';

export function useCurrentWeek(weekStartISO: string) {
  return useQuery({
    queryKey: ['week', weekStartISO],
    queryFn: () => getWeekDashboard(weekStartISO),
  });
}

// Streaks only depend on PAST weeks, never the in-progress current week, so
// this doesn't need to be invalidated when toggleHabitCompletion runs.
export function useHabitStreaks(currentWeekStartISO: string) {
  return useQuery({
    queryKey: ['habit-streaks', currentWeekStartISO],
    queryFn: () => getHabitStreaks(currentWeekStartISO),
  });
}

export function useToggleCompletion(weekStartISO: string) {
  const queryClient = useQueryClient();
  const queryKey = ['week', weekStartISO];

  return useMutation({
    mutationFn: ({ habitId, dateISO }: { habitId: string; dateISO: string }) =>
      toggleHabitCompletion(habitId, dateISO),
    onMutate: async ({ habitId, dateISO }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<WeekHabitRecord[]>(queryKey);

      queryClient.setQueryData<WeekHabitRecord[]>(queryKey, (old) =>
        old?.map((record) => {
          if (record.habit_id !== habitId) return record;
          const isChecked = record.completed_dates.includes(dateISO);
          return {
            ...record,
            completed_dates: isChecked
              ? record.completed_dates.filter((d) => d !== dateISO)
              : [...record.completed_dates, dateISO].sort(),
          };
        })
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
