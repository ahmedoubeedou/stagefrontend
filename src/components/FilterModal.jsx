import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const BRANDS = ['Toyota', 'Tesla', 'Ford', 'BMW', 'Mercedes-Benz', 'Honda', 'Hyundai'];
const FUELS = ['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL'];
const TRANSMISSIONS = ['Automatique', 'Manuelle'];

const FUEL_ICONS = {
  'Essence': '⛽',
  'Diesel': '🛢️',
  'Électrique': '⚡',
  'Hybride': '🔋',
  'GPL': '💨',
};

/**
 * FilterModal — Panneau de filtres avancés
 * S'ouvre depuis le bas en glissant vers le haut (slide animation)
 */
export default function FilterModal({ visible, onClose, filters, onApplyFilters, onResetFilters }) {
  const [selectedBrand, setSelectedBrand] = useState(filters.brand || '');
  const [selectedFuel, setSelectedFuel] = useState(filters.fuel || '');
  const [selectedTransmission, setSelectedTransmission] = useState(filters.transmission || '');
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
  const [minYear, setMinYear] = useState(filters.minYear || '');
  const [maxYear, setMaxYear] = useState(filters.maxYear || '');

  // Synchroniser l'état local avec les filtres externes lorsque la modale s'ouvre
  useEffect(() => {
    setSelectedBrand(filters.brand || '');
    setSelectedFuel(filters.fuel || '');
    setSelectedTransmission(filters.transmission || '');
    setMinPrice(filters.minPrice || '');
    setMaxPrice(filters.maxPrice || '');
    setMinYear(filters.minYear || '');
    setMaxYear(filters.maxYear || '');
  }, [filters, visible]);

  const hasLocalFilters =
    selectedBrand || selectedFuel || selectedTransmission ||
    minPrice || maxPrice || minYear || maxYear;

  const handleApply = () => {
    onApplyFilters({
      brand: selectedBrand,
      fuel: selectedFuel,
      transmission: selectedTransmission,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
    });
  };

  const handleReset = () => {
    setSelectedBrand('');
    setSelectedFuel('');
    setSelectedTransmission('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    onResetFilters();
  };

  const ChipSelector = ({ options, selected, onSelect, allLabel = 'Tous', icons = {} }) => (
    <View style={styles.chipContainer}>
      <TouchableOpacity
        style={[styles.chip, selected === '' && styles.activeChip]}
        onPress={() => onSelect('')}
        activeOpacity={0.8}
      >
        <Text style={[styles.chipText, selected === '' && styles.activeChipText]}>{allLabel}</Text>
      </TouchableOpacity>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selected === opt && styles.activeChip]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.8}
        >
          <Text style={[styles.chipText, selected === opt && styles.activeChipText]}>
            {icons[opt] ? `${icons[opt]} ` : ''}{opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Tap en dehors pour fermer */}
        <TouchableOpacity style={styles.backdropTouchable} onPress={onClose} activeOpacity={1} />

        <View style={styles.modalContent}>
          <SafeAreaView style={styles.safeContainer}>
            {/* En-tête de la modale */}
            <View style={styles.header}>
              <View style={styles.headerDragBar} />
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>⊞ Filtres avancés</Text>
                {hasLocalFilters ? (
                  <TouchableOpacity onPress={handleReset} style={styles.resetLink}>
                    <Text style={styles.resetLinkText}>Tout effacer</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView
              style={styles.scrollBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Marque */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏷️ Marque</Text>
                <ChipSelector
                  options={BRANDS}
                  selected={selectedBrand}
                  onSelect={setSelectedBrand}
                  allLabel="Toutes les marques"
                />
              </View>

              {/* Type de carburant */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⛽ Type de carburant</Text>
                <ChipSelector
                  options={FUELS}
                  selected={selectedFuel}
                  onSelect={setSelectedFuel}
                  allLabel="Tous"
                  icons={FUEL_ICONS}
                />
              </View>

              {/* Transmission */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚙️ Transmission</Text>
                <ChipSelector
                  options={TRANSMISSIONS}
                  selected={selectedTransmission}
                  onSelect={setSelectedTransmission}
                  allLabel="Toutes"
                />
              </View>

              {/* Fourchette de prix */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💰 Fourchette de prix (USD)</Text>
                <View style={styles.inputRangeRow}>
                  <View style={styles.rangeInputWrapper}>
                    <Text style={styles.rangeInputLabel}>Min</Text>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={minPrice}
                      onChangeText={setMinPrice}
                      placeholderTextColor="#9ca3af"
                      returnKeyType="done"
                    />
                  </View>
                  <View style={styles.rangeDividerWrapper}>
                    <Text style={styles.rangeDivider}>—</Text>
                  </View>
                  <View style={styles.rangeInputWrapper}>
                    <Text style={styles.rangeInputLabel}>Max</Text>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder="Illimité"
                      keyboardType="numeric"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      placeholderTextColor="#9ca3af"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>

              {/* Année */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 Année de fabrication</Text>
                <View style={styles.inputRangeRow}>
                  <View style={styles.rangeInputWrapper}>
                    <Text style={styles.rangeInputLabel}>De</Text>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder="ex : 2015"
                      keyboardType="numeric"
                      maxLength={4}
                      value={minYear}
                      onChangeText={setMinYear}
                      placeholderTextColor="#9ca3af"
                      returnKeyType="done"
                    />
                  </View>
                  <View style={styles.rangeDividerWrapper}>
                    <Text style={styles.rangeDivider}>—</Text>
                  </View>
                  <View style={styles.rangeInputWrapper}>
                    <Text style={styles.rangeInputLabel}>À</Text>
                    <TextInput
                      style={styles.rangeInput}
                      placeholder="ex : 2026"
                      keyboardType="numeric"
                      maxLength={4}
                      value={maxYear}
                      onChangeText={setMaxYear}
                      placeholderTextColor="#9ca3af"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>

              {/* Espace en bas pour le bouton */}
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Pied de page avec boutons d'action */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
                activeOpacity={0.85}
              >
                <Text style={styles.applyButtonText}>
                  Appliquer les filtres
                  {hasLocalFilters ? ' ✓' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  safeContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerDragBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  resetLink: {
    padding: 4,
  },
  resetLinkText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  scrollBody: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeChip: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  chipText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  inputRangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  rangeInputWrapper: {
    flex: 1,
  },
  rangeInputLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 6,
  },
  rangeInput: {
    height: 48,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
  },
  rangeDividerWrapper: {
    paddingBottom: 12,
  },
  rangeDivider: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '300',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    height: 50,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
});
