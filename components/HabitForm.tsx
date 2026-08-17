import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { CategoryIconPicker } from './CategoryIconPicker';
import { FormField } from './FormField';
import { NeumorphicSurface } from './NeumorphicSurface';
import { SegmentedControl } from './SegmentedControl';
import { colors, spacing, typography } from '../theme/tokens';
import { useCategories } from '../lib/queries/useCategories';
import { AppIcon } from '../lib/icons';

const schema = z.object({
  name: z.string().trim().min(1, 'Name your habit'),
  categoryId: z.string().min(1, 'Choose a category'),
  habitType: z.enum(['to_do', 'to_avoid']),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
  target: z
    .string()
    .min(1, 'Set a weekly target')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, 'Must be a whole number greater than 0'),
});

export type HabitFormValues = z.infer<typeof schema>;

export function HabitForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: {
  initialValues?: Partial<HabitFormValues>;
  onSubmit: (values: HabitFormValues) => void;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const categoriesQuery = useCategories();
  const [pickerVisible, setPickerVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? '',
      categoryId: initialValues?.categoryId ?? '',
      habitType: initialValues?.habitType ?? 'to_do',
      frequency: initialValues?.frequency ?? 'weekly',
      target: initialValues?.target ?? '3',
    },
  });

  const selectedCategoryId = watch('categoryId');
  const frequency = watch('frequency');
  const selectedCategory = (categoriesQuery.data ?? []).find((c) => c.id === selectedCategoryId);

  return (
    <View style={{ gap: spacing.lg }}>
      <FormField control={control} name="name" label="Name" error={errors.name?.message} capitalizeFirst />

      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typography.caption, color: colors.muted }}>CATEGORY</Text>
        <Pressable onPress={() => setPickerVisible(true)}>
          <NeumorphicSurface
            variant="pressed"
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
            }}
          >
            {selectedCategory ? (
              <>
                <AppIcon name={selectedCategory.icon} size={20} color={colors.ink} />
                <Text style={{ fontSize: 16, color: colors.ink }}>{selectedCategory.name}</Text>
              </>
            ) : (
              <Text style={{ fontSize: 16, color: colors.muted }}>Select a category</Text>
            )}
          </NeumorphicSurface>
        </Pressable>
        {errors.categoryId ? (
          <Text style={{ color: colors.bauhaus.red, fontSize: 12 }}>{errors.categoryId.message}</Text>
        ) : null}
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typography.caption, color: colors.muted }}>TYPE</Text>
        <Controller
          control={control}
          name="habitType"
          render={({ field: { onChange, value } }) => (
            <SegmentedControl
              options={[
                { value: 'to_do', label: 'To do' },
                { value: 'to_avoid', label: 'To avoid' },
              ]}
              value={value}
              onChange={onChange}
            />
          )}
        />
        <Text style={{ color: colors.muted, fontSize: 13 }}>Goal: reach X days this week.</Text>
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typography.caption, color: colors.muted }}>FREQUENCY</Text>
        <Controller
          control={control}
          name="frequency"
          render={({ field: { onChange, value } }) => (
            <SegmentedControl
              options={[
                { value: 'weekly', label: 'Every week' },
                { value: 'biweekly', label: 'Every 2 weeks' },
                { value: 'monthly', label: 'Once a month' },
              ]}
              value={value}
              onChange={onChange}
            />
          )}
        />
        {frequency !== 'weekly' ? (
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            Saved, but tracking for this cadence isn't built yet — this habit will keep showing on the
            weekly dashboard for now.
          </Text>
        ) : null}
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...typography.caption, color: colors.muted }}>WEEKLY TARGET</Text>
        <NeumorphicSurface variant="pressed" style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
          <Controller
            control={control}
            name="target"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
                style={{ fontSize: 16, color: colors.ink }}
              />
            )}
          />
        </NeumorphicSurface>
        {errors.target ? (
          <Text style={{ color: colors.bauhaus.red, fontSize: 12 }}>{errors.target.message}</Text>
        ) : null}
      </View>

      <NeumorphicSurface
        variant="raised"
        backgroundColor={colors.bauhaus.blue}
        radius={999}
        style={{ paddingVertical: spacing.lg, alignItems: 'center', opacity: isSubmitting ? 0.6 : 1 }}
      >
        <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Text>
        </Pressable>
      </NeumorphicSurface>

      <CategoryIconPicker
        visible={pickerVisible}
        selectedCategoryId={selectedCategoryId}
        onSelect={(category) => {
          setValue('categoryId', category.id, { shouldValidate: true });
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}
