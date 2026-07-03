import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Taille maximale autorisée (en octets)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 Mo
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 Mo

// Types MIME autorisés
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/mov'];
/**
 * Détermine le type MIME à partir de l'URI
 */
const getMimeType = (uri) => {
  const ext = uri.split('.').pop().toLowerCase().split('?')[0];
  const imageMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const videoMap = { mp4: 'video/mp4', mov: 'video/quicktime', qt: 'video/quicktime' };
  return imageMap[ext] || videoMap[ext] || null;
};

/**
 * Valide un fichier image avant de l'ajouter
 */
const validateImage = (asset) => {
  const mimeType = asset.mimeType || getMimeType(asset.uri);
  if (mimeType && !ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return `Format non supporté : ${mimeType}. Utilisez JPG, PNG ou WebP.`;
  }
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
    return `L'image dépasse la taille maximale de 10 Mo.`;
  }
  return null;
};

/**
 * Valide un fichier vidéo avant de l'ajouter
 */
const validateVideo = (asset) => {
  const mimeType = asset.mimeType || getMimeType(asset.uri);
  if (mimeType && !ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return `Format vidéo non supporté : ${mimeType}. Utilisez MP4 ou MOV.`;
  }
  if (asset.fileSize && asset.fileSize > MAX_VIDEO_SIZE) {
    return `La vidéo dépasse la taille maximale de 100 Mo.`;
  }
  return null;
};

export default function MediaUploader({ images, setImages, video, setVideo }) {

  /**
   * Demande les permissions et sélectionne des photos depuis la galerie
   */
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "L'accès à votre galerie est nécessaire pour ajouter des photos à votre annonce."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      exif: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      const errors = [];
      const validAssets = [];

      for (const asset of result.assets) {
        const error = validateImage(asset);
        if (error) {
          errors.push(error);
        } else {
          validAssets.push(asset);
        }
      }

      if (errors.length > 0) {
        Alert.alert('Fichier(s) rejeté(s)', errors.join('\n'));
      }

      if (validAssets.length > 0) {
        setImages((prev) => [...prev, ...validAssets]);
      }
    }
  };

  /**
   * Demande les permissions et ouvre l'appareil photo
   */
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "L'accès à l'appareil photo est nécessaire pour prendre une photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      exif: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const error = validateImage(asset);
      if (error) {
        Alert.alert('Photo rejetée', error);
        return;
      }
      setImages((prev) => [...prev, asset]);
    }
  };

  /**
   * Demande les permissions et sélectionne une vidéo depuis la galerie
   * CORRECTION : Utilisation de la nouvelle API (mediaTypes: ['videos'])
   * au lieu de l'API dépréciée ImagePicker.MediaTypeOptions.Videos
   */
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "L'accès à votre galerie est nécessaire pour ajouter une vidéo à votre annonce."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      // Note: allowsEditing retiré — provoquait un blocage de l'interface sur certains appareils
      quality: 1,
      videoMaxDuration: 120, // 2 minutes max
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const error = validateVideo(asset);
      if (error) {
        Alert.alert('Vidéo rejetée', error);
        return;
      }
      setVideo(asset);
    }
  };

  /**
   * Supprime une photo de la liste par son index
   */
  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  /**
   * Supprime la vidéo sélectionnée
   */
  const removeVideo = () => {
    Alert.alert(
      'Supprimer la vidéo',
      'Voulez-vous retirer la vidéo de présentation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => setVideo(null) },
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const getVideoDuration = (asset) => {
    if (asset.duration) {
      const secs = Math.round(asset.duration / 1000);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Médias du véhicule</Text>
      <Text style={styles.hint}>
        Photos : JPG, PNG, WebP — max 10 Mo chacune{'\n'}
        Vidéo : MP4, MOV — max 100 Mo, 2 min
      </Text>

      {/* Boutons d'upload */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImages} activeOpacity={0.8}>
          <Text style={styles.mediaButtonIcon}>🖼️</Text>
          <Text style={styles.mediaButtonText}>Galerie</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mediaButton} onPress={takePhoto} activeOpacity={0.8}>
          <Text style={styles.mediaButtonIcon}>📷</Text>
          <Text style={styles.mediaButtonText}>Appareil photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mediaButton, video && styles.activeMediaButton]}
          onPress={pickVideo}
          activeOpacity={0.8}
        >
          <Text style={styles.mediaButtonIcon}>🎬</Text>
          <Text style={[styles.mediaButtonText, video && styles.activeMediaButtonText]}>
            {video ? 'Changer la vidéo' : 'Ajouter une vidéo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Photos sélectionnées */}
      {images.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos sélectionnées</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{images.length}</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.thumbnail} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeBadge}
                  onPress={() => removeImage(index)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeBadgeText}>✕</Text>
                </TouchableOpacity>
                {index === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Principal</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          <Text style={styles.photoHint}>La première photo sera l'image principale de l'annonce.</Text>
        </View>
      )}

      {/* Section Vidéo sélectionnée */}
      {video && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vidéo de présentation</Text>
          <View style={styles.videoPreviewContainer}>
            {/* Vignette visuelle de la vidéo */}
            <View style={styles.videoThumbnail}>
              <View style={styles.videoThumbnailOverlay}>
                <View style={styles.playIconCircle}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </View>
              {/* Infos en bas de la vignette */}
              <View style={styles.videoInfoOverlay}>
                <Text style={styles.videoFileName} numberOfLines={1}>
                  {video.fileName || `video_presentation.${(video.uri || '').split('.').pop().split('?')[0] || 'mp4'}`}
                </Text>
                <Text style={styles.videoMetaText}>
                  {[
                    getVideoDuration(video) ? `${getVideoDuration(video)}` : null,
                    formatFileSize(video.fileSize) ? `${formatFileSize(video.fileSize)}` : null,
                    video.uri && (video.uri.startsWith('http://') || video.uri.startsWith('https://'))
                      ? '✅ Enregistrée'
                      : '✅ Prête',
                  ].filter(Boolean).join('  •  ')}
                </Text>
              </View>
            </View>

            {/* Bouton de suppression ✕ flottant */}
            <TouchableOpacity
              style={styles.removeVideoX}
              onPress={() => setVideo(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.removeVideoXText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton secondaire : choisir une autre vidéo */}
          <TouchableOpacity style={styles.changeVideoBtn} onPress={pickVideo} activeOpacity={0.8}>
            <Text style={styles.changeVideoBtnText}>🔄 Changer la vidéo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* État vide */}
      {images.length === 0 && !video && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📸</Text>
          <Text style={styles.emptyStateText}>Aucun média sélectionné</Text>
          <Text style={styles.emptyStateHint}>Au moins une photo est requise pour publier votre annonce.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  hint: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 14,
    lineHeight: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  activeMediaButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderStyle: 'solid',
  },
  mediaButtonIcon: {
    fontSize: 22,
    marginBottom: 5,
  },
  mediaButtonText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeMediaButtonText: {
    color: '#1d4ed8',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  countBadge: {
    marginLeft: 8,
    backgroundColor: '#1e3a8a',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  carousel: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  removeBadge: {
    position: 'absolute',
    top: -7,
    right: -7,
    backgroundColor: '#ef4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  removeBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 58, 138, 0.85)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 3,
    alignItems: 'center',
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  photoHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8,
  },
  videoPreviewContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  videoThumbnail: {
    height: 120,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 4,
  },
  videoInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  videoFileName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  videoMetaText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
  },
  removeVideoX: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  removeVideoXText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  changeVideoBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  changeVideoBtnText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptyStateHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
