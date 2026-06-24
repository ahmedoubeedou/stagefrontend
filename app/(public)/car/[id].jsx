import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Linking, Dimensions, SafeAreaView, Alert, Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCarById, addFavorite, removeFavorite, isFavorite } from '../../../src/services/api';
import { formatPrice, formatMileage, formatDate, FUEL_TYPE_MAP, TRANSMISSION_MAP } from '../../../src/utils/helpers';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AuthContext } from '../../../src/context/AuthContext';

const { width } = Dimensions.get('window');

/**
 * Composant lecteur vidéo de présentation
 */
function WalkthroughVideo({ sourceUri }) {
  const player = useVideoPlayer(sourceUri, (p) => {
    p.loop = false;
    p.muted = false;
  });

  return (
    <View style={styles.videoSection}>
      <Text style={styles.sectionTitle}>🎬 Vidéo de présentation</Text>
      <VideoView
        style={styles.videoPlayer}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
      />
    </View>
  );
}

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [imageError, setImageError] = useState({});

  useEffect(() => {
    async function loadCar() {
      try {
        const response = await getCarById(id);
        if (response.data?.status === 'success') {
          setCar(response.data.data);
        }
      } catch (error) {
        Alert.alert(
          'Véhicule introuvable',
          'Impossible de charger les détails de cette annonce.',
          [{ text: 'Retour', onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    }
    if (id) loadCar();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      isFavorite(id).then(setFavorited).catch(() => {});
    }
  }, [user, id]);

  const handleScroll = (event) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slideIndex !== activeImageIndex) setActiveImageIndex(slideIndex);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Connectez-vous pour enregistrer des véhicules en favoris.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    setFavLoading(true);
    try {
      if (favorited) {
        await removeFavorite(id);
        setFavorited(false);
      } else {
        await addFavorite(id);
        setFavorited(true);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de mettre à jour les favoris. Réessayez.');
    } finally {
      setFavLoading(false);
    }
  };

  const handleCall = () => {
    if (car?.seller?.phone) {
      const clean = car.seller.phone.replace(/\s+/g, '');
      Linking.openURL(`tel:${clean}`).catch(() =>
        Alert.alert('Erreur', `Impossible d'appeler le ${car.seller.phone}`)
      );
    } else {
      Alert.alert('Non disponible', 'Le numéro du vendeur n\'est pas disponible.');
    }
  };

  const handleMessage = () => {
    if (car?.seller?.phone) {
      const clean = car.seller.phone.replace(/\s+/g, '');
      const text = `Bonjour ${car.seller.name}, je suis intéressé(e) par votre ${car.brand} ${car.model} ${car.year} (annonce réf. ${id}).`;
      Linking.openURL(`sms:${clean}?body=${encodeURIComponent(text)}`).catch(() =>
        Alert.alert('Erreur', "Impossible d'ouvrir l'application de messagerie.")
      );
    } else {
      Alert.alert('Non disponible', 'Les coordonnées du vendeur ne sont pas disponibles.');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://carmarketplace.demo.com/car/${id}`;
      const firstImage = car.images && car.images[0] ? car.images[0] : null;
      const videoLink = car.video ? car.video : null;

      let message = `🚗 *${car.brand} ${car.model} (${car.year})*\n`;
      message += `💰 Prix : ${formatPrice(car.price)}\n`;
      message += `📍 Localisation : ${car.location}\n`;
      message += `🛣️ Kilométrage : ${formatMileage(car.mileage)}\n`;
      message += `⛽ Carburant : ${car.fuel || 'Essence'}\n`;
      message += `⚙️ Transmission : ${car.transmission || 'Automatique'}\n`;
      message += `🎨 Couleur : ${car.color || 'Non spécifiée'}\n\n`;
      
      message += `💬 Description : ${car.description || ''}\n\n`;

      if (firstImage) {
        message += `📸 Photo : ${firstImage}\n`;
      }
      if (videoLink) {
        message += `🎬 Vidéo de présentation : ${videoLink}\n`;
      }
      
      message += `\n🔗 Plus de détails : ${shareUrl}\n`;
      message += `📞 Contact : ${car.seller?.name || 'Vendeur'} (${car.seller?.phone || ''})`;

      const shareContent = {
        message: message,
        title: `${car.brand} ${car.model} — Marché Auto`,
      };

      if (Platform.OS === 'ios' && firstImage) {
        shareContent.url = firstImage;
      }

      await Share.share(shareContent);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager cette annonce.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Chargement de l'annonce...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorText}>Annonce introuvable</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = car.images && car.images.length > 0 ? car.images : [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop',
  ];

  const fuelValue = car.fuel || car.fuel_type || 'Essence';
  const transmissionValue = car.transmission || 'automatic';

  const specs = [
    { label: 'Année', value: String(car.year), icon: '📅' },
    { label: 'Kilométrage', value: formatMileage(car.mileage), icon: '🛣️' },
    { label: 'Carburant', value: FUEL_TYPE_MAP[fuelValue] || fuelValue, icon: '⛽' },
    { label: 'Transmission', value: TRANSMISSION_MAP[transmissionValue] || 'Automatique', icon: '⚙️' },
    { label: 'Couleur', value: car.color || 'N/A', icon: '🎨' },
    { label: 'Disponibilité', value: 'Disponible', icon: '✅', highlight: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Galerie photos */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {images.map((imgUrl, index) => (
              <Image
                key={index}
                source={{ uri: imgUrl }}
                style={styles.galleryImage}
                resizeMode="cover"
                onError={() => setImageError((prev) => ({ ...prev, [index]: true }))}
                defaultSource={require('../../../assets/icon.png')}
              />
            ))}
          </ScrollView>

          {/* Indicateurs de pagination */}
          {images.length > 1 && (
            <View style={styles.paginationRow}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    activeImageIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Compteur photos */}
          {images.length > 1 && (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {activeImageIndex + 1}/{images.length}
              </Text>
            </View>
          )}

          {/* Bouton favori flottant */}
          <TouchableOpacity
            style={[styles.favBtn, favorited && styles.favBtnActive]}
            onPress={handleToggleFavorite}
            disabled={favLoading}
            activeOpacity={0.85}
          >
            {favLoading ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={styles.favBtnText}>{favorited ? '❤️' : '🤍'}</Text>
            )}
          </TouchableOpacity>

          {/* Bouton partage flottant */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
            <Text style={styles.shareBtnText}>↑</Text>
          </TouchableOpacity>

          {/* Badge vidéo */}
          {car.video && (
            <View style={styles.videoBadge}>
              <Text style={styles.videoBadgeText}>🎬 Vidéo dispo</Text>
            </View>
          )}
        </View>

        {/* Bloc informations principales */}
        <View style={styles.infoBlock}>
          <View style={styles.titleRow}>
            <View style={styles.mainTitles}>
              <Text style={styles.brand}>{car.brand}</Text>
              <Text style={styles.model}>{car.model}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(car.price)}</Text>
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.location}>📍 {car.location}</Text>
            <Text style={styles.date}>Publié le {formatDate(car.createdAt)}</Text>
          </View>

          {/* Caractéristiques */}
          <Text style={styles.sectionTitle}>🔧 Caractéristiques</Text>
          <View style={styles.grid}>
            {specs.map((spec, i) => (
              <View key={i} style={styles.gridCell}>
                <Text style={styles.gridCellLabel}>
                  {spec.icon} {spec.label}
                </Text>
                <Text style={[styles.gridCellValue, spec.highlight && styles.gridCellValueHighlight]}>
                  {spec.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.description}>{car.description}</Text>

          {/* Vidéo de présentation */}
          {car.video && <WalkthroughVideo sourceUri={car.video} />}

          {/* Carte vendeur */}
          <View style={styles.sellerCard}>
            <Text style={styles.sellerSectionLabel}>VENDEUR</Text>
            <View style={styles.sellerProfile}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>
                  {car.seller?.name?.charAt(0).toUpperCase() || 'V'}
                </Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{car.seller?.name || 'Vendeur'}</Text>
                <Text style={styles.sellerSubtitle}>Vendeur vérifié • {car.location}</Text>
                {car.seller?.phone && (
                  <Text style={styles.sellerPhone}>📞 {car.seller.phone}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Point d'intégration backend */}
          {/* TODO: BACKEND INTEGRATION — Afficher ici : évaluations vendeur, nombre d'annonces, date d'inscription */}
        </View>
      </ScrollView>

      {/* Barre de contact fixe en bas */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage} activeOpacity={0.85}>
          <Text style={styles.messageButtonIcon}>💬</Text>
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.85}>
          <Text style={styles.callButtonIcon}>📞</Text>
          <Text style={styles.callButtonText}>Appeler le vendeur</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 17,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
  },
  backBtnText: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  galleryContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: '#f3f4f6',
  },
  galleryImage: {
    width,
    height: 300,
  },
  paginationRow: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.45)',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 20,
    borderRadius: 4,
  },
  photoCounter: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  photoCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  favBtnActive: {
    backgroundColor: '#fff5f5',
  },
  favBtnText: {
    fontSize: 22,
  },
  shareBtn: {
    position: 'absolute',
    top: 66,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  shareBtnText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '700',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  infoBlock: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mainTitles: {
    flex: 1,
    marginRight: 12,
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  model: {
    fontSize: 20,
    fontWeight: '400',
    color: '#4b5563',
    marginTop: 2,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 16,
    marginBottom: 20,
  },
  location: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCell: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  gridCellLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  gridCellValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '700',
  },
  gridCellValueHighlight: {
    color: '#059669',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 24,
  },
  videoSection: {
    marginBottom: 24,
  },
  videoPlayer: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  sellerCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sellerSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sellerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sellerAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  sellerInfo: {
    marginLeft: 14,
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  sellerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sellerPhone: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '600',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  messageButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  messageButtonIcon: {
    fontSize: 16,
  },
  messageButtonText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '700',
  },
  callButton: {
    flex: 1.6,
    height: 50,
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  callButtonIcon: {
    fontSize: 16,
  },
  callButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
});
