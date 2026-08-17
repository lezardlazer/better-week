import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCustomCategory, listCategories, listCategoryPositions, reorderCategories } from '../data/categories';
import { useSessionStore } from '../store/session';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: listCategories });
}

export function useCategoryPositions() {
  return useQuery({ queryKey: ['category-positions'], queryFn: listCategoryPositions });
}

export function useCreateCustomCategory() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.session?.user.id);

  return useMutation({
    mutationFn: (params: { name: string; icon: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return createCustomCategory({ userId, ...params });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderCategories,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['category-positions'] }),
  });
}
