import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius as radiusTokens } from '../theme/tokens';

type Variant = 'raised' | 'pressed';

type Props = {
  children?: React.ReactNode;
  variant?: Variant;
  radius?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
};

// True dual-shadow neumorphism (a light shadow on one side, a dark shadow on
// the other) is straightforward in CSS but has no reliable native RN
// equivalent — a single View only supports one shadow, and Android's
// `elevation` ignores `shadowColor` on most devices. Web gets the real
// effect via `boxShadow`; native falls back to a single soft shadow plus a
// light/dark bevel border, which reads as "raised" or "pressed" without the
// fragility of stacking extra shadow layers.
export function NeumorphicSurface({
  children,
  variant = 'raised',
  radius = radiusTokens.lg,
  backgroundColor = colors.surface,
  style,
}: Props) {
  if (Platform.OS === 'web') {
    const boxShadow =
      variant === 'raised'
        ? `-8px -8px 16px ${colors.shadow.light}, 8px 8px 16px ${colors.shadow.dark}`
        : `inset -6px -6px 12px ${colors.shadow.light}, inset 6px 6px 12px ${colors.shadow.dark}`;

    return (
      <View
        style={[
          { backgroundColor, borderRadius: radius },
          style,
          { boxShadow },
        ]}
      >
        {children}
      </View>
    );
  }

  const isRaised = variant === 'raised';

  return (
    <View
      style={[
        {
          backgroundColor: isRaised ? backgroundColor : darken(backgroundColor),
          borderRadius: radius,
          borderWidth: 1,
          borderTopColor: isRaised ? colors.shadow.light : 'rgba(0,0,0,0.08)',
          borderLeftColor: isRaised ? colors.shadow.light : 'rgba(0,0,0,0.08)',
          borderRightColor: isRaised ? 'rgba(163,163,168,0.35)' : 'rgba(255,255,255,0.4)',
          borderBottomColor: isRaised ? 'rgba(163,163,168,0.35)' : 'rgba(255,255,255,0.4)',
        },
        isRaised && styles.raisedShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function darken(hex: string) {
  return hex === colors.surface ? '#E3E3E7' : hex;
}

const styles = StyleSheet.create({
  raisedShadow: {
    shadowColor: '#8A8A90',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
});
