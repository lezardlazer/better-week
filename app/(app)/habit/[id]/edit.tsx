import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { ErrorState } from '../../../../components/ErrorState';
import { HabitForm, type HabitFormValues } from '../../../../components/HabitForm';
import { LoadingState } from '../../../../components/LoadingState';
import { NeumorphicSurface } from '../../../../components/NeumorphicSurface';
import { useArchiveHabit, useDeleteHabit, useHabit, useUpdateHabit } from '../../../../lib/queries/useHabits';
import { goBackOrHome } from '../../../../lib/navigation';
import { colors, spacing, typography } from '../../../../theme/tokens';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitQuery = useHabit(id);
  const updateHabit = useUpdateHabit();
  const archiveHabit = useArchiveHabit();
  const deleteHabit = useDeleteHabit();
  const [isBusy, setIsBusy] = useState(false);

  if (habitQuery.isLoading) {
    return <LoadingState />;
  }

  if (habitQuery.error) {
    return <ErrorState message={(habitQuery.error as Error).message} />;
  }

  if (!habitQuery.data) {
    return <ErrorState message="Habit not found." />;
  }

  const habit = habitQuery.data;

  const handleSubmit = async (values: HabitFormValues) => {
    await updateHabit.mutateAsync({
      id: habit.id,
      patch: {
        name: values.name,
        categoryId: values.categoryId,
        defaultWeeklyTarget: Number(values.target),
        habitType: values.habitType,
        frequency: values.frequency,
      },
    });
    goBackOrHome();
  };

  const handleArchive = async () => {
    setIsBusy(true);
    await archiveHabit.mutateAsync(habit.id);
    setIsBusy(false);
    // Always return to the dashboard rather than back() — the previous
    // screen may have been this habit's own detail page, which no longer
    // makes sense to show once it's archived.
    router.replace('/');
  };

  const handleDelete = async () => {
    const confirmed =
      Platform.OS === 'web'
        ? globalThis.confirm(`Delete "${habit.name}"? This removes all of its history and can't be undone.`)
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Delete habit',
              `Delete "${habit.name}"? This removes all of its history and can't be undone.`,
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
              ]
            );
          });

    if (!confirmed) return;
    setIsBusy(true);
    await deleteHabit.mutateAsync(habit.id);
    setIsBusy(false);
    // Same reasoning as archive: the habit (and its detail screen, if that's
    // where we came from) no longer exists.
    router.replace('/');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base }}
      contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.xxl, gap: spacing.xl }}
    >
      <Text style={{ ...typography.display, color: colors.ink }}>Edit habit</Text>

      <HabitForm
        initialValues={{
          name: habit.name,
          categoryId: habit.category_id,
          habitType: habit.habit_type,
          frequency: habit.frequency,
          target: String(habit.default_weekly_target),
        }}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        isSubmitting={updateHabit.isPending}
      />

      <View style={{ gap: spacing.md }}>
        <Pressable onPress={handleArchive} disabled={isBusy}>
          <NeumorphicSurface variant="pressed" style={{ padding: spacing.lg, alignItems: 'center' }}>
            <Text style={{ color: colors.ink, fontWeight: '600' }}>Archive habit</Text>
          </NeumorphicSurface>
        </Pressable>
        <Pressable onPress={handleDelete} disabled={isBusy}>
          <NeumorphicSurface variant="pressed" style={{ padding: spacing.lg, alignItems: 'center' }}>
            <Text style={{ color: colors.bauhaus.red, fontWeight: '600' }}>Delete habit</Text>
          </NeumorphicSurface>
        </Pressable>
      </View>
    </ScrollView>
  );
}
