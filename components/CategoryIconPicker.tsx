import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { NeumorphicSurface } from './NeumorphicSurface';
import { colors, spacing, typography } from '../theme/tokens';
import { useCategories, useCreateCustomCategory } from '../lib/queries/useCategories';
import type { Category } from '../lib/data/categories';
import { AppIcon, CATEGORY_ICON_CHOICES } from '../lib/icons';

export function CategoryIconPicker({
  visible,
  selectedCategoryId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedCategoryId: string | null;
  onSelect: (category: Category) => void;
  onClose: () => void;
}) {
  const categoriesQuery = useCategories();
  const createCategory = useCreateCustomCategory();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState<string>(CATEGORY_ICON_CHOICES[0]);

  // The modal component stays mounted (only `visible` toggles), so its own
  // state would otherwise survive a close — reopening later straight into
  // whatever sub-screen it was last left on instead of the category list.
  useEffect(() => {
    if (!visible) {
      setIsAddingNew(false);
      setNewName('');
      setNewIcon(CATEGORY_ICON_CHOICES[0]);
    }
  }, [visible]);

  const categories = categoriesQuery.data ?? [];
  const predefined = categories.filter((c) => c.is_predefined);
  const custom = categories.filter((c) => !c.is_predefined);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const created = await createCategory.mutateAsync({ name: newName.trim(), icon: newIcon });
    onSelect(created);
    setIsAddingNew(false);
    setNewName('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.base,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: spacing.xl,
            maxHeight: '80%',
          }}
        >
          {isAddingNew ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Pressable onPress={() => setIsAddingNew(false)}>
                <Text style={{ color: colors.bauhaus.blue }}>← Back</Text>
              </Pressable>
              <Text style={{ ...typography.title, color: colors.ink, flex: 1 }}>New category</Text>
              <Pressable onPress={onClose}>
                <Text style={{ color: colors.muted }}>Close</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ ...typography.title, color: colors.ink }}>Choose a category</Text>
              <Pressable onPress={onClose}>
                <Text style={{ color: colors.muted }}>Close</Text>
              </Pressable>
            </View>
          )}

          <ScrollView style={{ marginTop: spacing.lg }} showsVerticalScrollIndicator={false}>
            {isAddingNew ? (
              <View style={{ gap: spacing.lg }}>
                <NeumorphicSurface variant="pressed" style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Category name"
                    placeholderTextColor={colors.muted}
                    style={{ fontSize: 16, color: colors.ink }}
                  />
                </NeumorphicSurface>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                  {CATEGORY_ICON_CHOICES.map((icon) => (
                    <Pressable key={icon} onPress={() => setNewIcon(icon)}>
                      <NeumorphicSurface
                        variant={newIcon === icon ? 'raised' : 'pressed'}
                        backgroundColor={newIcon === icon ? colors.bauhaus.blue : colors.base}
                        radius={16}
                        style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <AppIcon name={icon} size={22} color={newIcon === icon ? '#fff' : colors.ink} />
                      </NeumorphicSurface>
                    </Pressable>
                  ))}
                </View>

                <NeumorphicSurface
                  variant="raised"
                  backgroundColor={colors.bauhaus.blue}
                  radius={999}
                  style={{ paddingVertical: spacing.lg, alignItems: 'center', opacity: newName.trim() ? 1 : 0.5 }}
                >
                  <Pressable onPress={handleCreate} disabled={!newName.trim() || createCategory.isPending}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                      {createCategory.isPending ? 'Creating…' : 'Create category'}
                    </Text>
                  </Pressable>
                </NeumorphicSurface>
              </View>
            ) : (
              <View style={{ gap: spacing.xl }}>
                <CategoryGrid
                  categories={predefined}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={onSelect}
                />
                {custom.length > 0 && (
                  <View style={{ gap: spacing.md }}>
                    <Text style={{ ...typography.caption, color: colors.muted }}>YOUR CATEGORIES</Text>
                    <CategoryGrid
                      categories={custom}
                      selectedCategoryId={selectedCategoryId}
                      onSelect={onSelect}
                    />
                  </View>
                )}
                <Pressable onPress={() => setIsAddingNew(true)}>
                  <NeumorphicSurface variant="pressed" style={{ padding: spacing.lg, alignItems: 'center' }}>
                    <Text style={{ color: colors.bauhaus.blue, fontWeight: '600' }}>+ Create custom category</Text>
                  </NeumorphicSurface>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CategoryGrid({
  categories,
  selectedCategoryId,
  onSelect,
}: {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (category: Category) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
      {categories.map((category) => {
        const isSelected = category.id === selectedCategoryId;
        return (
          <Pressable key={category.id} onPress={() => onSelect(category)} style={{ width: '30%' }}>
            <NeumorphicSurface
              variant={isSelected ? 'raised' : 'pressed'}
              backgroundColor={isSelected ? colors.bauhaus.blue : colors.base}
              style={{ padding: spacing.md, alignItems: 'center', gap: spacing.xs }}
            >
              <AppIcon name={category.icon} size={22} color={isSelected ? '#fff' : colors.ink} />
              <Text
                style={{ fontSize: 12, color: isSelected ? '#fff' : colors.ink, textAlign: 'center' }}
                numberOfLines={1}
              >
                {category.name}
              </Text>
            </NeumorphicSurface>
          </Pressable>
        );
      })}
    </View>
  );
}
