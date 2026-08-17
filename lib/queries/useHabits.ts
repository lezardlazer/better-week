import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveHabit,
  createHabit,
  deleteHabit,
  getHabitById,
  listActiveHabits,
  listArchivedHabits,
  reorderHabits,
  unarchiveHabit,
  updateHabit,
} from '../data/habits';
import { useSessionStore } from '../store/session';

export function useHabits() {
  return useQuery({ queryKey: ['habits'], queryFn: listActiveHabits });
}

export function useHabit(id: string) {
  return useQuery({ queryKey: ['habits', id], queryFn: () => getHabitById(id), enabled: !!id });
}

export function useArchivedHabits() {
  return useQuery({ queryKey: ['habits', 'archived'], queryFn: listArchivedHabits });
}

function useInvalidateHabitQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['habits'] });
    queryClient.invalidateQueries({ queryKey: ['week'] });
  };
}

export function useCreateHabit() {
  const invalidate = useInvalidateHabitQueries();
  const userId = useSessionStore((s) => s.session?.user.id);

  return useMutation({
    mutationFn: (params: Omit<Parameters<typeof createHabit>[0], 'userId'>) => {
      if (!userId) throw new Error('Not authenticated');
      return createHabit({ userId, ...params });
    },
    onSuccess: invalidate,
  });
}

export function useUpdateHabit() {
  const invalidate = useInvalidateHabitQueries();

  return useMutation({
    mutationFn: (params: {
      id: string;
      patch: Parameters<typeof updateHabit>[1];
    }) => updateHabit(params.id, params.patch),
    onSuccess: invalidate,
  });
}

export function useArchiveHabit() {
  const invalidate = useInvalidateHabitQueries();
  return useMutation({ mutationFn: archiveHabit, onSuccess: invalidate });
}

export function useUnarchiveHabit() {
  const invalidate = useInvalidateHabitQueries();
  return useMutation({ mutationFn: unarchiveHabit, onSuccess: invalidate });
}

export function useDeleteHabit() {
  const invalidate = useInvalidateHabitQueries();
  return useMutation({ mutationFn: deleteHabit, onSuccess: invalidate });
}

export function useReorderHabits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderHabits,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });
}
