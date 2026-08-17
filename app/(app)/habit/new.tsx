import { ScrollView, Text, View } from 'react-native';
import { HabitForm, type HabitFormValues } from '../../../components/HabitForm';
import { useCreateHabit } from '../../../lib/queries/useHabits';
import { goBackOrHome } from '../../../lib/navigation';
import { colors, spacing, typography } from '../../../theme/tokens';

export default function NewHabitScreen() {
  const createHabit = useCreateHabit();

  const handleSubmit = async (values: HabitFormValues) => {
    await createHabit.mutateAsync({
      name: values.name,
      categoryId: values.categoryId,
      defaultWeeklyTarget: Number(values.target),
      habitType: values.habitType,
      frequency: values.frequency,
    });
    goBackOrHome();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.base }}
      contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.xxl, gap: spacing.xl }}
    >
      <View>
        <Text style={{ ...typography.display, color: colors.ink }}>New habit</Text>
        <Text style={{ color: colors.muted, marginTop: spacing.xs }}>
          Name it and choose how many times a week feels right.
        </Text>
      </View>
      <HabitForm onSubmit={handleSubmit} submitLabel="Add habit" isSubmitting={createHabit.isPending} />
    </ScrollView>
  );
}
