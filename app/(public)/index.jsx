import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Car } from 'lucide-react-native';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getCars } from '../../src/services/api';
import { AuthContext } from '../../src/context/AuthContext';
import CarCard from '../../src/components/CarCard';
import SearchBar from '../../src/components/SearchBar';
import FilterModal from '../../src/components/FilterModal';

const EMPTY_FILTERS = {
  brand: '',
  fuel: '',
  transmission: '',
  minPrice: '',
  maxPrice: '',
  minYear: '',
  maxYear: '',
};

export default function CarListScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [error, setError] = useState(null);

  const fetchCars = useCallback(
    async (currentSearch = search, currentFilters = filters) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCars({ search: currentSearch, ...currentFilters });
        if (response.data?.status === 'success') {
          setCars(response.data.data);
        }
      } catch (err) {
        setError('Impossible de charger les annonces. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    },
    [search, filters]
  );

  useEffect(() => {
    fetchCars();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCars();
    setRefreshing(false);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
    fetchCars(search, newFilters);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setFilterModalVisible(false);
    fetchCars(search, EMPTY_FILTERS);
  };

  const handleSearchSubmit = () => {
    fetchCars(search, filters);
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchCars('', filters);
  };

  const removeFilter = (keys) => {
    const updated = { ...filters };
    keys.forEach((k) => {
      updated[k] = '';
    });
    setFilters(updated);
    fetchCars(search, updated);
  };

  // Construire les chips de filtres actifs
  const activeChips = [];
  if (filters.brand) activeChips.push({ label: `🏷️ ${filters.brand}`, keys: ['brand'] });
  if (filters.fuel) activeChips.push({ label: `⛽ ${filters.fuel}`, keys: ['fuel'] });
  if (filters.transmission) activeChips.push({ label: `⚙️ ${filters.transmission}`, keys: ['transmission'] });
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? `${parseInt(filters.minPrice).toLocaleString('fr-FR')} MRU` : '0 MRU';
    const max = filters.maxPrice ? `${parseInt(filters.maxPrice).toLocaleString('fr-FR')} MRU` : 'Max';
    activeChips.push({ label: `💰 ${min} – ${max}`, keys: ['minPrice', 'maxPrice'] });
  }
  if (filters.minYear || filters.maxYear) {
    activeChips.push({
      label: `📅 ${filters.minYear || 'Tout'} – ${filters.maxYear || 'Tout'}`,
      keys: ['minYear', 'maxYear'],
    });
  }

  const hasActiveFilters = activeChips.length > 0;
  const activeFiltersCount = activeChips.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête principal */}
      <View style={styles.topHeader}>
        <View style={styles.brandInfo}>
          <View style={styles.logoIconWrapper}>
            <Car size={36} color="#123" />
          </View>
          <View>
            <Text style={styles.brandTitle}>Marché Auto</Text>
            <Text style={styles.brandSubtitle}>Trouvez votre voiture idéale</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push(user ? '/(private)/dashboard' : '/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.profileButtonText}>
            {user ? `👤 ${user.name.split(' ')[0]}` : '🔑 Connexion'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche + Bouton filtre */}
      <View style={styles.searchFilterRow}>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClear={handleClearSearch}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.filterIcon}>⊞</Text>
          {hasActiveFilters && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Chips de filtres actifs */}
      {hasActiveFilters && (
        <View style={styles.chipsRow}>
          {activeChips.map((chip, i) => (
            <TouchableOpacity
              key={i}
              style={styles.chip}
              onPress={() => removeFilter(chip.keys)}
              activeOpacity={0.8}
            >
              <Text style={styles.chipText}>{chip.label}</Text>
              <Text style={styles.chipRemove}> ✕</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.clearAllChip}
            onPress={handleResetFilters}
            activeOpacity={0.8}
          >
            <Text style={styles.clearAllText}>Tout effacer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Message d'erreur */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => fetchCars()}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des véhicules */}
      {loading && cars.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Chargement des annonces...</Text>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CarCard car={item} onPress={() => router.push(`/(public)/car/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            cars.length > 0 ? (
              <Text style={styles.resultCount}>
                {cars.length} annonce{cars.length > 1 ? 's' : ''} trouvée{cars.length > 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Aucun véhicule trouvé</Text>
                <Text style={styles.emptySub}>
                  Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                </Text>
                {hasActiveFilters && (
                  <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                    <Text style={styles.resetBtnText}>Réinitialiser les filtres</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  logoIcon: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
  },
  profileButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  profileButtonText: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '700',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    backgroundColor: '#fff',
  },
  searchWrapper: {
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  filterIcon: {
    fontSize: 22,
    color: '#374151',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1e3a8a',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4,
    backgroundColor: '#fff',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  chipText: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  chipRemove: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '700',
  },
  clearAllChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 6,
  },
  clearAllText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fca5a5',
  },
  errorBannerText: {
    fontSize: 13,
    color: '#b91c1c',
    fontWeight: '500',
    flex: 1,
  },
  retryText: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '700',
    marginLeft: 12,
  },
  listContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  resultCount: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 12,
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
    marginBottom: 24,
    lineHeight: 20,
  },
  resetBtn: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
