import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

/**
 * SearchBar — Barre de recherche avec bouton de réinitialisation
 */
export default function SearchBar({ value, onChangeText, onSearchSubmit, onClear }) {
  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Rechercher une marque, un modèle..."
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
        />
        {value ? (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
  },
  clearIcon: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '700',
  },
});
