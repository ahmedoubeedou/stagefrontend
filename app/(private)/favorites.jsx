import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getFavorites, removeFavorite } from '../../src/services/api';
import CarCard from '../../src/components/CarCard';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFavorites();
      if (response.data?.status === 'success') {
        setFavorites(response.data.data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger vos favoris. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (carId, carName) => {
    Alert.alert(
      'Retirer des favoris',
      `Retirer "${carName}" de vos favoris ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFavorite(carId);
              setFavorites((prev) => prev.filter((c) => c.id !== carId));
            } catch (e) {
              Alert.alert('Erreur', 'Impossible de retirer ce favori. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };

  if (loading && favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>❤️ Mes favoris</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Chargement des favoris...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>❤️ Mes favoris</Text>
          {favorites.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{favorites.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <CarCard car={item} onPress={() => router.push(`/(public)/car/${item.id}`)} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemoveFavorite(item.id, `${item.brand} ${item.model}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.removeBtnIcon}>💔</Text>
              <Text style={styles.removeBtnText}>Retirer des favoris</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💝</Text>
            <Text style={styles.emptyTitle}>Aucun favori enregistré</Text>
            <Text style={styles.emptySub}>
              Parcourez les annonces et ajoutez vos véhicules préférés à vos favoris en appuyant sur le cœur ❤️.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.replace('/(public)')}
              activeOpacity={0.85}
            >
              <Text style={styles.browseBtnText}>🔍 Explorer les annonces</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    padding: 4,
    flex: 1,
  },
  backBtnText: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#ef4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  headerSpacer: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
    height: 46,
    gap: 6,
  },
  removeBtnIcon: {
    fontSize: 15,
  },
  removeBtnText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  emptySub: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  browseBtn: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
