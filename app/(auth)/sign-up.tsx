import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { z } from 'zod';
import { FormField } from '../../components/FormField';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { NeumorphicSurface } from '../../components/NeumorphicSurface';
import { supabase } from '../../lib/supabase/client';
import { colors, spacing, typography } from '../../theme/tokens';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpScreen() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp(values);
    if (error) {
      setAuthError(error.message);
      return;
    }
    // If email confirmation is required, signUp succeeds but returns no session
    // — the (auth) layout only redirects once a session exists.
    if (!data.session) setNeedsEmailConfirmation(true);
  };

  if (needsEmailConfirmation) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.base, justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ ...typography.title, color: colors.ink }}>Check your email</Text>
        <Text style={{ color: colors.muted }}>
          We sent a confirmation link. Once confirmed, come back and sign in.
        </Text>
        <Link href="/sign-in" style={{ color: colors.bauhaus.blue, marginTop: spacing.md }}>
          Back to sign in
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.base }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg }}>
        <Text style={{ ...typography.display, color: colors.ink }}>Create account</Text>
        <Text style={{ color: colors.muted, marginTop: -spacing.md }}>Start your better week.</Text>

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
              {isSubmitting ? 'Creating…' : 'Create account'}
            </Text>
          </Pressable>
        </NeumorphicSurface>

        <Link href="/sign-in" style={{ textAlign: 'center', color: colors.muted }}>
          Already have an account? Sign in
        </Link>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} />
          <Text style={{ color: colors.muted, fontSize: 12 }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} />
        </View>

        <GoogleSignInButton />
      </View>
    </KeyboardAvoidingView>
  );
}
