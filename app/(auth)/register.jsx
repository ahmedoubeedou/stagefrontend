import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setErrorMessage('');
    const result = await signUp(data.name, data.email, data.password);
    if (!result.success) {
      setErrorMessage(result.error || "L'inscription a échoué. Veuillez réessayer.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* En-tête */}
          <View style={styles.headerBlock}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>📋</Text>
            </View>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>
              Rejoignez notre marketplace et commencez à vendre votre véhicule dès aujourd'hui
            </Text>
          </View>

          {/* Message d'erreur global */}
          {errorMessage ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorAlertIcon}>⚠️</Text>
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Nom complet */}
            <Text style={styles.label}>Nom complet</Text>
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Le nom complet est requis.',
                minLength: { value: 2, message: 'Le nom doit comporter au moins 2 caractères.' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Jean Dupont"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            {/* Adresse e-mail */}
            <Text style={styles.label}>Adresse e-mail</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "L'adresse e-mail est requise.",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Veuillez saisir une adresse e-mail valide.',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="nom@email.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            {/* Mot de passe */}
            <Text style={styles.label}>Mot de passe</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Le mot de passe est requis.',
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit comporter au moins 6 caractères.',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.passwordInputContainer, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Créez un mot de passe sécurisé"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={secureText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={() => setSecureText(!secureText)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeText}>{secureText ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            {/* Confirmer le mot de passe */}
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Veuillez confirmer votre mot de passe.',
                validate: (value) =>
                  value === passwordVal || 'Les mots de passe ne correspondent pas.',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.passwordInputContainer, errors.confirmPassword && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Répétez votre mot de passe"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={secureConfirm}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureConfirm(!secureConfirm)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeText}>{secureConfirm ? '👁️' : '🙈'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
            )}

            {/* Conditions d'utilisation */}
            <Text style={styles.termsText}>
              En créant un compte, vous acceptez nos{' '}
              <Text style={styles.termsLink}>Conditions d'utilisation</Text>
              {' '}et notre{' '}
              <Text style={styles.termsLink}>Politique de confidentialité</Text>.
            </Text>

            {/* Bouton créer un compte */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Créer mon compte</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Liens */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.8}>
              <Text style={styles.footerLinkText}>
                Vous avez déjà un compte ?{' '}
                <Text style={styles.footerLinkHighlight}>Se connecter</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.browseLink}
              onPress={() => router.replace('/(public)')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseLinkText}>← Retour au marché automobile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorAlertIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorAlertText: {
    flex: 1,
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '500',
  },
  passwordInputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 6,
  },
  eyeText: {
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  termsLink: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#1e3a8a',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnDisabled: {
    backgroundColor: '#93c5fd',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerLinks: {
    alignItems: 'center',
    gap: 14,
  },
  footerLinkText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  footerLinkHighlight: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
  browseLink: {
    padding: 8,
  },
  browseLinkText: {
    color: '#4b5563',
    fontSize: 13,
    fontWeight: '600',
  },
});
