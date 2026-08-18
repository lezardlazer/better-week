import { useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NeumorphicSurface } from './NeumorphicSurface';
import { supabase } from '../lib/supabase/client';
import { colors, spacing } from '../theme/tokens';

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
      />
      <Path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18Z"
      />
      <Path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33Z"
      />
      <Path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </Svg>
  );
}

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  // OAuth here relies on a full-page browser redirect back to this same
  // origin, which only works on web — a native build would need
  // expo-web-browser to open the auth session and catch the deep link.
  if (Platform.OS !== 'web') return null;

  const onPress = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <NeumorphicSurface
      variant="raised"
      radius={999}
      style={{
        paddingVertical: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
      >
        <GoogleIcon />
        <Text style={{ color: colors.ink, fontWeight: '600', fontSize: 16 }}>
          {isLoading ? 'Redirecting…' : 'Continue with Google'}
        </Text>
      </Pressable>
    </NeumorphicSurface>
  );
}
