import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { login, register } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer la session au démarrage depuis le stockage local
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({ id: parsedUser.id, name: parsedUser.name, email: parsedUser.email });

          // TODO: BACKEND INTEGRATION — Phase 2 : valider le token et récupérer le profil frais
          // Exemple : const response = await API.get('/user/me');
          // setUser(response.data.data);
        }
      } catch (e) {
        // En cas d'erreur de parsing/stockage, effacer les données corrompues
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  /**
   * Connexion utilisateur
   * TODO: BACKEND INTEGRATION — Connecté à POST /api/login
   */
  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await login(email, password);
      const { token, user: userData } = response.data.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      router.replace('/(private)/dashboard');
      return { success: true };
    } catch (error) {
      let errMsg = 'Adresse e-mail ou mot de passe incorrect.';
      if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      }
      return { success: false, error: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inscription utilisateur
   * TODO: BACKEND INTEGRATION — Connecté à POST /api/register
   */
  const signUp = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await register({ name, email, password });
      const { token, user: userData } = response.data.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      router.replace('/(private)/dashboard');
      return { success: true };
    } catch (error) {
      let errMsg = "L'inscription a échoué. Veuillez réessayer.";
      if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      }
      return { success: false, error: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déconnexion utilisateur
   * TODO: BACKEND INTEGRATION — Optionnel : appel à POST /api/logout pour invalider le token côté serveur
   */
  const signOut = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/(public)');
    } catch (e) {
      // Même en cas d'erreur, déconnecter localement
      setUser(null);
      router.replace('/(public)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
