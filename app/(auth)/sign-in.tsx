import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { z } from 'zod';
import { FormField } from '../../components/FormField';
import { NeumorphicSurface } from '../../components/NeumorphicSurface';
import { supabase } from '../../lib/supabase/client';
import { colors, spacing, typography } from '../../theme/tokens';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) setAuthError(error.message);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.base }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg }}>
        <Text style={{ ...typography.display, color: colors.ink }}>Better Week</Text>
        <Text style={{ color: colors.muted, marginTop: -spacing.md }}>Welcome back.</Text>

        <FormField control={control} name="email" label="Email" keyboardType="email-address" error={errors.email?.message} />
        <FormField control={control} name="password" label="Password" secureTextEntry error={errors.password?.message} />

        {authError ? <Text style={{ color: colors.bauhaus.red }}>{authError}</Text> : null}

        <NeumorphicSurface
          variant="raised"
          backgroundColor={colors.bauhaus.blue}
          radius={999}
          style={{ paddingVertical: spacing.lg, alignItems: 'center', opacity: isSubmitting ? 0.6 : 1 }}
        >
          <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Text>
          </Pressable>
        </NeumorphicSurface>

        <Link href="/sign-up" style={{ textAlign: 'center', color: colors.muted }}>
          No account yet? Create one
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
