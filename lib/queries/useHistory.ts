import { useQuery } from '@tanstack/react-query';
import { getWeekDetail, listHabitHistory, listPastWeeks } from '../data/weeklyRecords';

export function usePastWeeks(currentWeekStartISO: string) {
  return useQuery({
    queryKey: ['history', 'weeks', currentWeekStartISO],
    queryFn: () => listPastWeeks(currentWeekStartISO),
  });
}

export function useWeekDetail(weekStartISO: string) {
  return useQuery({
    queryKey: ['history', 'week-detail', weekStartISO],
    queryFn: () => getWeekDetail(weekStartISO),
    enabled: !!weekStartISO,
  });
}

export function useHabitHistory(habitId: string) {
  return useQuery({
    queryKey: ['history', 'habit', habitId],
    queryFn: () => listHabitHistory(habitId),
    enabled: !!habitId,
  });
}
