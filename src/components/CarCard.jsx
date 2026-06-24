import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { formatPrice, formatMileage, FUEL_TYPE_MAP, TRANSMISSION_MAP } from '../utils/helpers';

/**
 * CarCard — Carte d'affichage d'un véhicule dans la liste
 * Affiche l'image principale, le prix, les specs clés et les métadonnées
 */
export default function CarCard({ car, onPress }) {
  const thumbnail =
    car.images && car.images.length > 0
      ? { uri: car.images[0] }
      : { uri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop' };

  const fuelValue = car.fuel || car.fuel_type || 'Essence';
  const fuelLabel = FUEL_TYPE_MAP[fuelValue] || fuelValue;
  const fuelIcon = {
    'Essence': '⛽',
    'Diesel': '🛢️',
    'Électrique': '⚡',
    'Hybride': '🔋',
    'GPL': '💨',
  }[fuelLabel] || '⛽';

  const transmissionValue = car.transmission || 'automatic';
  const transmissionLabel = TRANSMISSION_MAP[transmissionValue] || 'Automatique';
  const transmissionIcon = transmissionLabel === 'Manuelle' ? '🕹️' : '🤖';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      {/* Image avec badges superposés */}
      <View style={styles.imageContainer}>
        <Image source={thumbnail} style={styles.image} resizeMode="cover" />
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formatPrice(car.price)}</Text>
        </View>
        {car.video && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>🎬 Vidéo</Text>
          </View>
        )}
        {/* Badge "Nouveau" si annonce publiée récemment (< 7 jours) */}
        {isRecentListing(car.createdAt) && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NOUVEAU</Text>
          </View>
        )}
      </View>

      {/* Détails du véhicule */}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {car.brand} <Text style={styles.model}>{car.model}</Text>
        </Text>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Text style={styles.specText}>📅 {car.year}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specText}>🛣️ {formatMileage(car.mileage)}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specText}>{fuelIcon} {fuelLabel}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.transmissionText}>
              {transmissionIcon} {transmissionLabel}
            </Text>
            <Text style={styles.locationText}>📍 {car.location}</Text>
          </View>
          <Text style={styles.dateText}>
            {formatRelativeDate(car.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Vérifie si l'annonce a été publiée dans les 7 derniers jours
 */
function isRecentListing(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = (now - date) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

/**
 * Formate la date de manière relative et lisible
 */
function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  imageContainer: {
    position: 'relative',
    height: 190,
    width: '100%',
    backgroundColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  priceText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  videoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  details: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  model: {
    fontWeight: '400',
    color: '#4b5563',
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  specItem: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  specText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
    marginTop: 4,
  },
  footerLeft: {
    gap: 3,
  },
  transmissionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dateText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
