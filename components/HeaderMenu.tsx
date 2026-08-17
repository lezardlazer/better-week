import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { NeumorphicSurface } from './NeumorphicSurface';
import { colors, spacing } from '../theme/tokens';
import { AppIcon } from '../lib/icons';

export function HeaderMenu({
  onPressHistory,
  onPressSignOut,
}: {
  onPressHistory: () => void;
  onPressSignOut: () => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable onPress={() => setVisible(true)}>
        <NeumorphicSurface variant="raised" radius={16} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <AppIcon name="menu" size={20} color={colors.ink} />
        </NeumorphicSurface>
      </Pressable>

      <Modal visible={visible} animationType="fade" transparent onRequestClose={() => setVisible(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}
          onPress={() => setVisible(false)}
        >
          <View style={{ position: 'absolute', top: 64, right: spacing.xl }}>
            <NeumorphicSurface variant="raised" style={{ padding: spacing.sm, minWidth: 180 }}>
              <MenuItem
                icon="clock"
                label="History"
                onPress={() => {
                  setVisible(false);
                  onPressHistory();
                }}
              />
              <MenuItem
                icon="log-out"
                label="Sign out"
                onPress={() => {
                  setVisible(false);
                  onPressSignOut();
                }}
              />
            </NeumorphicSurface>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
      }}
    >
      <AppIcon name={icon} size={18} color={colors.ink} />
      <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
