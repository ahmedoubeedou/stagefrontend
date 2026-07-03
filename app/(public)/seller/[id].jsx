import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCars, getSellerProfile } from '../../../src/services/api';
import CarCard from '../../../src/components/CarCard';

/**
 * SellerProfileScreen — Profil public d'un vendeur
 * Route : /(public)/seller/[id]
 * Affiche les informations du vendeur et la liste de toutes ses annonces actives.
 */
export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [cars, setCars]       = useState([]);
  const [seller, setSeller]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  /**
   * Charge le profil du vendeur et ses annonces via GET /api/seller/{id}
   */
  const loadSellerCars = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getSellerProfile(id);
      if (response.data?.status === 'success') {
        const sellerData = response.data.data;
        setSeller(sellerData);
        setCars(sellerData.cars ?? []);
      }
    } catch (err) {
      setError('Impossible de charger le profil du vendeur.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSellerCars();
  }, [loadSellerCars]);

  const handleCallSeller = (phone) => {
    if (!phone) return;
    const clean = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${clean}`).catch(() =>
      Alert.alert('Erreur', `Impossible d'appeler le ${phone}`)
    );
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadSellerCars}>
          <Text style={styles.retryBtnText}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const sellerName  = seller?.name || `Vendeur #${id}`;
  const sellerPhone = seller?.phone || seller?.contact_phone || null;
  const sellerEmail = seller?.email || null;
  const avatarLetter = sellerName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Configuration Expo Router pour masquer le header natif */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Top Bar Personnalisée Épurée ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profil du vendeur</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CarCard
            car={item}
            onPress={() => router.push(`/(public)/car/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}

        /* ── En-tête : Profil Vendeur Premium ── */
        ListHeaderComponent={
          <View style={styles.profileHeaderContainer}>
            <View style={styles.profileCard}>
              {/* Avatar avec badge vérifié */}
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatarLetter}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>✓</Text>
                </View>
              </View>

              {/* Nom & Tagline */}
              <Text style={styles.sellerName}>{sellerName}</Text>
              
              <View style={styles.verifiedLabelContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.verifiedLabelText}>Vendeur vérifié</Text>
              </View>

              {sellerEmail && (
                <View style={styles.emailContainer}>
                  <Ionicons name="mail-outline" size={14} color="#64748b" />
                  <Text style={styles.emailText}>{sellerEmail}</Text>
                </View>
              )}

              {/* Section Statistiques / Actions en Cartes Badge */}
              <View style={styles.statsGrid}>
                {/* Nombre d'annonces */}
                <View style={styles.statCard}>
                  <Ionicons name="car-sport-outline" size={20} color="#1e3a8a" />
                  <Text style={styles.statCardValue}>{cars.length}</Text>
                  <Text style={styles.statCardLabel}>Annonce{cars.length > 1 ? 's' : ''}</Text>
                </View>

                {/* Statut Vérifié */}
                <View style={styles.statCard}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" />
                  <Text style={[styles.statCardValue, { color: '#10b981' }]}>Actif</Text>
                  <Text style={styles.statCardLabel}>Statut</Text>
                </View>

                {/* Téléphone (Appel direct) */}
                {sellerPhone && (
                  <TouchableOpacity
                    style={[styles.statCard, styles.clickableStatCard]}
                    onPress={() => handleCallSeller(sellerPhone)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={18} color="#2563eb" />
                    <Text style={[styles.statCardValue, styles.clickableText]}>Appeler</Text>
                    <Text style={styles.statCardLabel} numberOfLines={1}>
                      {sellerPhone}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Titre section annonces */}
            <View style={styles.announcesHeader}>
              <Text style={styles.announcesTitle}>Ses annonces en ligne</Text>
              <View style={styles.announcesBadge}>
                <Text style={styles.announcesBadgeText}>{cars.length}</Text>
              </View>
            </View>
          </View>
        }

        /* ── État vide ── */
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Aucune annonce active</Text>
            <Text style={styles.emptySub}>
              Ce vendeur n'a pas d'annonces disponibles pour le moment.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f5f7fa',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ── Top Bar ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  rightPlaceholder: {
    width: 36,
  },

  /* ── FlatList Content ── */
  listContent: {
    paddingBottom: 40,
    backgroundColor: '#f5f7fa',
    flexGrow: 1,
  },

  /* ── Header Container ── */
  profileHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* ── Profile Card ── */
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 24,
  },

  /* ── Avatar ── */
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verifiedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  /* ── Name & Labels ── */
  sellerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    textAlign: 'center',
  },
  verifiedLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 12,
  },
  verifiedLabelText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  emailText: {
    fontSize: 13,
    color: '#64748b',
  },

  /* ── Stats Grid ── */
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  clickableStatCard: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  clickableText: {
    color: '#2563eb',
  },
  statCardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 6,
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },

  /* ── Announces Section Header ── */
  announcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  announcesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  announcesBadge: {
    backgroundColor: '#1e3a8a',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  announcesBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  /* ── Empty State ── */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    backgroundColor: '#f5f7fa',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
