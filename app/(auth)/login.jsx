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
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useContext(AuthContext);

  const [errorMessage, setErrorMessage] = useState('');
  const [secureText, setSecureText] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setErrorMessage('');
    const result = await signIn(data.email, data.password);
    if (!result.success) {
      setErrorMessage(result.error || 'Identifiants invalides. Veuillez réessayer.');
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
              <Text style={styles.logoEmoji}>🚗</Text>
            </View>
            <Text style={styles.title}>Bienvenue</Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour gérer vos annonces sur le marché automobile
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
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Mot de passe</Text>
              {/* TODO: BACKEND INTEGRATION — Activer le lien "Mot de passe oublié" → POST /api/password/reset */}
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.alert('La réinitialisation du mot de passe sera disponible prochainement.');
                  } else {
                    Alert.alert('Réinitialisation', 'La réinitialisation du mot de passe sera disponible prochainement.');
                  }
                }}
              >
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>
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
                    placeholder="Entrez votre mot de passe"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={secureText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureText(!secureText)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeText}>{secureText ? '●' : '○'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            {/* Bouton de connexion */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Liens */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.8}>
              <Text style={styles.footerLinkText}>
                Nouveau sur la plateforme ?{' '}
                <Text style={styles.footerLinkHighlight}>Créer un compte</Text>
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
    paddingTop: 40,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 32,
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '600',
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
  submitBtn: {
    backgroundColor: '#1e3a8a',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
    gap: 16,
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
