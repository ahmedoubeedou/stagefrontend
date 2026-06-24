import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';
import { getUserCars, deleteCar } from '../../src/services/api';
import CarCard from '../../src/components/CarCard';
import { formatPrice } from '../../src/utils/helpers';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useContext(AuthContext);

  const [userCars, setUserCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserCars = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserCars();
      if (response.data?.status === 'success') {
        setUserCars(response.data.data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger vos annonces. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserCars();
  }, [fetchUserCars]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserCars();
    setRefreshing(false);
  };

  const handleEditListing = (car) => {
    router.push({
      pathname: '/(private)/add-car',
      params: {
        carId: car.id,
        brand: car.brand,
        model: car.model,
        year: String(car.year),
        price: String(car.price),
        mileage: String(car.mileage),
        color: car.color || '',
        fuel: car.fuel || 'Essence',
        transmission: car.transmission || 'Automatique',
        description: car.description || '',
      },
    });
  };

  const handleDeleteListing = (id, carName) => {
    Alert.alert(
      "Supprimer l'annonce",
      `Êtes-vous sûr de vouloir supprimer l'annonce "${carName}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive', // CORRIGÉ : était "red" (invalide)
          onPress: async () => {
            try {
              const response = await deleteCar(id);
              if (response.data?.status === 'success') {
                setUserCars((prev) => prev.filter((car) => car.id !== id));
                Alert.alert('✅ Supprimée', 'Votre annonce a été supprimée avec succès.');
              }
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer cette annonce. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const totalValue = userCars.reduce((sum, car) => sum + (car.price || 0), 0);
  const activeCount = userCars.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête profil */}
      <View style={styles.profileHeader}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✅ Compte actif</Text>
            </View>
          </View>
        </View>

        {/* Statistiques rapides */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Annonce{activeCount !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {totalValue > 0 ? formatPrice(totalValue) : '—'}
            </Text>
            <Text style={styles.statLabel}>Valeur totale</Text>
          </View>
          <View style={styles.statDivider} />
          {/* TODO: BACKEND INTEGRATION — GET /api/user/stats pour le nombre de vues */}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Vues</Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.replace('/(public)')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnIcon}>🌐</Text>
            <Text style={styles.actionBtnText}>Marketplace</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.favActionBtn]}
            onPress={() => router.push('/(private)/favorites')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnIcon}>❤️</Text>
            <Text style={[styles.actionBtnText, styles.favActionBtnText]}>Favoris</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.logoutActionBtn]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnIcon}>🚪</Text>
            <Text style={[styles.actionBtnText, styles.logoutActionBtnText]}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section annonces */}
      <View style={styles.listingsSection}>
        <View style={styles.listingsHeader}>
          <Text style={styles.listingsTitle}>
            Mes annonces{activeCount > 0 ? ` (${activeCount})` : ''}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(private)/add-car')}
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonText}>＋ Publier</Text>
          </TouchableOpacity>
        </View>

        {loading && userCars.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text style={styles.loadingText}>Chargement de vos annonces...</Text>
          </View>
        ) : (
          <FlatList
            data={userCars}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <CarCard car={item} onPress={() => router.push(`/(public)/car/${item.id}`)} />
                <View style={styles.actionOverlay}>
                  <TouchableOpacity
                    style={styles.editAction}
                    onPress={() => handleEditListing(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editActionText}>✏️ Modifier</Text>
                  </TouchableOpacity>
                  <View style={styles.actionSeparator} />
                  <TouchableOpacity
                    style={styles.deleteAction}
                    onPress={() => handleDeleteListing(item.id, `${item.brand} ${item.model}`)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteActionText}>🗑️ Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🚗</Text>
                <Text style={styles.emptyTitle}>Aucune annonce publiée</Text>
                <Text style={styles.emptySub}>
                  Commencez par publier votre premier véhicule sur le marché !
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => router.push('/(private)/add-car')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyAddBtnText}>＋ Créer ma première annonce</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  verifiedBadge: {
    marginTop: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 3,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  actionBtnIcon: {
    fontSize: 13,
  },
  actionBtnText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '600',
  },
  favActionBtn: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  favActionBtnText: {
    color: '#ef4444',
  },
  logoutActionBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  logoutActionBtnText: {
    color: '#ef4444',
  },
  listingsSection: {
    flex: 1,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listingsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  cardContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionOverlay: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  editAction: {
    flex: 1,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editActionText: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  actionSeparator: {
    width: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },
  deleteAction: {
    flex: 1,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingTop: 80,
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
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyAddBtn: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyAddBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
