import React, { useContext, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, AuthContext } from '../src/context/AuthContext';
import { ActivityIndicator, View, StyleSheet, StatusBar } from 'react-native';

function NavigationLayout() {
  const { user, isLoading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inPrivate = segments[0] === '(private)';
    const inAuth = segments[0] === '(auth)';
    if (!user && inPrivate) router.replace('/(auth)/login');
    else if (user && inAuth) router.replace('/(private)/dashboard');
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#1e3a8a',
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#f9fafb' },
        }}
      >
        <Stack.Screen name="(public)/index" options={{ title: '🚗 Marché Auto' }} />
        <Stack.Screen name="(public)/car/[id]" options={{ title: 'Détail du véhicule' }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Connexion', headerBackVisible: false }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Inscription', headerBackVisible: false }} />
        <Stack.Screen name="(private)/dashboard" options={{ title: 'Tableau de bord', headerBackVisible: false }} />
        <Stack.Screen name="(private)/add-car" options={{ title: 'Publier une annonce', headerBackTitle: 'Annuler' }} />
        <Stack.Screen name="(private)/favorites" options={{ title: 'Mes favoris', headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
});
