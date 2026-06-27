import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform, SafeAreaView, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addCar, updateCar, getCarById } from '../../src/services/api';
import { FUEL_TYPE_MAP, TRANSMISSION_MAP } from '../../src/utils/helpers';
import MediaUploader from '../../src/components/MediaUploader';

const FUEL_OPTIONS = ['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL'];
const TRANSMISSION_OPTIONS = ['Automatique', 'Manuelle'];
const FUEL_ICONS = {
  'Essence': '⛽', 'Diesel': '🛢️', 'Électrique': '⚡', 'Hybride': '🔋', 'GPL': '💨',
};

export default function AddCarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.carId;

  const [submitting, setSubmitting] = useState(false);
  const [loadingCar, setLoadingCar] = useState(false);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [selectedFuel, setSelectedFuel] = useState(params.fuel || 'Essence');
  const [selectedTransmission, setSelectedTransmission] = useState(params.transmission || 'Automatique');
  const [toast, setToast] = useState({ visible: false, message: '' });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      brand: params.brand || '',
      model: params.model || '',
      year: params.year || '',
      price: params.price || '',
      mileage: params.mileage || '',
      color: params.color || '',
      location: params.location || '',
      description: params.description || '',
    },
  });

  useEffect(() => {
    if (isEditing && params.carId) {
      const fetchCarDetails = async () => {
        setLoadingCar(true);
        try {
          const res = await getCarById(params.carId);
          if (res.data?.status === 'success') {
            const car = res.data.data;
            if (car.images) {
              setImages(car.images.map((img) => (typeof img === 'string' ? { uri: img } : img)));
            }
            if (car.video) {
              setVideo({ uri: car.video });
            }
            if (car.fuel) {
              setSelectedFuel(FUEL_TYPE_MAP[car.fuel] || car.fuel);
            } else if (car.fuel_type) {
              setSelectedFuel(FUEL_TYPE_MAP[car.fuel_type] || car.fuel_type);
            }
            if (car.transmission) {
              setSelectedTransmission(TRANSMISSION_MAP[car.transmission] || car.transmission);
            }
            
            // Populate form values in case some parameters are missing in route
            setValue('brand', car.brand || '');
            setValue('model', car.model || '');
            setValue('year', String(car.year || ''));
            setValue('price', String(car.price || ''));
            setValue('mileage', String(car.mileage || ''));
            setValue('color', car.color || '');
            setValue('location', car.location || '');
            setValue('description', car.description || '');
          }
        } catch (error) {
          if (Platform.OS === 'web') {
            window.alert('Impossible de charger les détails du véhicule.');
          } else {
            Alert.alert('Erreur', 'Impossible de charger les détails du véhicule.');
          }
        } finally {
          setLoadingCar(false);
        }
      };
      fetchCarDetails();
    }
  }, [isEditing, params.carId]);

  const onSubmit = async (values) => {
    if (images.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez sélectionner au moins une photo du véhicule pour publier votre annonce.');
      } else {
        Alert.alert('Photos requises', 'Veuillez sélectionner au moins une photo du véhicule pour publier votre annonce.');
      }
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      // Champs texte
      formData.append('brand', values.brand.trim());
      formData.append('model', values.model.trim());
      formData.append('year', values.year);
      formData.append('price', values.price);
      formData.append('mileage', values.mileage);
      formData.append('color', values.color.trim());
      formData.append('location', values.location.trim() || 'Nouakchott');
      formData.append('description', values.description.trim());
      const FUEL_TO_BACKEND = {
        'Essence': 'gasoline',
        'Diesel': 'diesel',
        'Électrique': 'electric',
        'Hybride': 'hybrid',
        'GPL': 'gasoline',
      };

      const TRANSMISSION_TO_BACKEND = {
        'Automatique': 'automatic',
        'Manuelle': 'manual',
      };

      formData.append('fuel_type', FUEL_TO_BACKEND[selectedFuel] || 'gasoline');
      formData.append('transmission', TRANSMISSION_TO_BACKEND[selectedTransmission] || 'automatic');

      // Helper: convert a blob/local URI to a File object (needed for web)
      const uriToFile = async (uri, fileName, mimeType) => {
        if (Platform.OS === 'web') {
          const response = await fetch(uri);
          const blob = await response.blob();
          return new File([blob], fileName, { type: mimeType });
        }
        // On native, return the RN-style object
        return { uri, type: mimeType, name: fileName };
      };

      // Images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        // Skip images that are already on the server (URL strings from editing)
        if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
          formData.append('images[]', img);
          continue;
        }
        const uri = img.uri || img;
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          formData.append('images[]', uri);
        } else {
          const ext = uri.split('.').pop().toLowerCase().split('?')[0] || 'jpg';
          const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          const fileName = `photo_${i}.${ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpg'}`;
          const file = await uriToFile(uri, fileName, mimeType);
          formData.append('images[]', file);
        }
      }

      // Vidéo
      if (video) {
        const uri = video.uri || video;
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          formData.append('video', uri);
        } else {
          const ext = uri.split('.').pop().toLowerCase().split('?')[0] || 'mp4';
          const mimeType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';
          const file = await uriToFile(uri, `presentation.${ext}`, mimeType);
          formData.append('video', file);
        }
      } else if (isEditing) {
        formData.append('video', 'delete');
      }

      let response;
      if (isEditing) {
        response = await updateCar(params.carId, formData);
      } else {
        response = await addCar(formData);
      }

      if (response.data?.status === 'success') {
        setToast({
          visible: true,
          message: isEditing
            ? '✅ Annonce mise à jour avec succès !'
            : '🚀 Annonce publiée avec succès !',
        });

        setTimeout(() => {
          setToast({ visible: false, message: '' });
          router.replace('/(private)/dashboard');
        }, 2000);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error) {
      const detail = error?.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join('\n')
        : error?.response?.data?.message || 'Veuillez vérifier votre connexion et réessayer.';
      if (Platform.OS === 'web') {
        window.alert(`Erreur de publication\n\n${detail}`);
      } else {
        Alert.alert('Erreur de publication', detail);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  const OptionSelector = ({ options, selected, onSelect, icons = {} }) => (
    <View style={styles.optionRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.optionChip, selected === opt && styles.activeOptionChip]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.8}
        >
          <Text style={[styles.optionChipText, selected === opt && styles.activeOptionChipText]}>
            {icons[opt] ? `${icons[opt]} ` : ''}{opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loadingCar) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Chargement des détails de l'annonce...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* En-tête de formulaire */}
          <View style={styles.formHeader}>
            <Text style={styles.sectionHeader}>
              {isEditing ? '✏️ Modifier l\'annonce' : '🚗 Informations du véhicule'}
            </Text>
            {isEditing && (
              <View style={styles.editingBadge}>
                <Text style={styles.editingBadgeText}>Modification en cours</Text>
              </View>
            )}
          </View>

          <View style={styles.formContainer}>

            {/* Marque */}
            <Text style={styles.label}>Marque <Text style={styles.required}>*</Text></Text>
            <Controller
              control={control}
              name="brand"
              rules={{ required: 'La marque est requise.', minLength: { value: 2, message: 'Minimum 2 caractères.' } }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.brand && styles.inputError]}
                  placeholder="ex : Toyota, BMW, Renault..."
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.brand && <Text style={styles.errorText}>⚠ {errors.brand.message}</Text>}

            {/* Modèle */}
            <Text style={styles.label}>Modèle <Text style={styles.required}>*</Text></Text>
            <Controller
              control={control}
              name="model"
              rules={{ required: 'Le modèle est requis.', minLength: { value: 1, message: 'Champ requis.' } }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.model && styles.inputError]}
                  placeholder="ex : Camry, Série 3, Clio..."
                  placeholderTextColor="#9ca3af"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.model && <Text style={styles.errorText}>⚠ {errors.model.message}</Text>}

            {/* Année + Prix */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Année <Text style={styles.required}>*</Text></Text>
                <Controller
                  control={control}
                  name="year"
                  rules={{
                    required: "L'année est requise.",
                    min: { value: 1980, message: 'Doit être après 1980.' },
                    max: { value: currentYear + 1, message: 'Année invalide.' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.year && styles.inputError]}
                      placeholder={String(currentYear)}
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={4}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.year && <Text style={styles.errorText}>⚠ {errors.year.message}</Text>}
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Prix ($) <Text style={styles.required}>*</Text></Text>
                <Controller
                  control={control}
                  name="price"
                  rules={{
                    required: 'Le prix est requis.',
                    min: { value: 1, message: 'Le prix doit être supérieur à 0.' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.price && styles.inputError]}
                      placeholder="18 500"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.price && <Text style={styles.errorText}>⚠ {errors.price.message}</Text>}
              </View>
            </View>

            {/* Kilométrage + Couleur */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Kilométrage <Text style={styles.required}>*</Text></Text>
                <Controller
                  control={control}
                  name="mileage"
                  rules={{
                    required: 'Le kilométrage est requis.',
                    min: { value: 0, message: 'Le kilométrage doit être positif ou nul.' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.mileage && styles.inputError]}
                      placeholder="45 000"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.mileage && <Text style={styles.errorText}>⚠ {errors.mileage.message}</Text>}
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Couleur <Text style={styles.required}>*</Text></Text>
                <Controller
                  control={control}
                  name="color"
                  rules={{ required: 'La couleur est requise.' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.color && styles.inputError]}
                      placeholder="Blanc, Noir..."
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="sentences"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.color && <Text style={styles.errorText}>⚠ {errors.color.message}</Text>}
              </View>
            </View>

            {/* Localisation */}
            <Text style={styles.label}>Localisation <Text style={styles.required}>*</Text></Text>
            <Controller
              control={control}
              name="location"
              rules={{ required: 'La localisation est requise.' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.location && styles.inputError]}
                  placeholder="ex : Nouakchott, Nouadhibou..."
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.location && <Text style={styles.errorText}>⚠ {errors.location.message}</Text>}

            {/* Type de carburant */}
            <Text style={styles.label}>Type de carburant <Text style={styles.required}>*</Text></Text>
            <OptionSelector
              options={FUEL_OPTIONS}
              selected={selectedFuel}
              onSelect={setSelectedFuel}
              icons={FUEL_ICONS}
            />

            {/* Transmission */}
            <Text style={styles.label}>Transmission <Text style={styles.required}>*</Text></Text>
            <OptionSelector
              options={TRANSMISSION_OPTIONS}
              selected={selectedTransmission}
              onSelect={setSelectedTransmission}
            />

            {/* Description */}
            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
            <Controller
              control={control}
              name="description"
              rules={{
                required: 'La description est requise.',
                minLength: { value: 20, message: 'Minimum 20 caractères pour une description utile.' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.description && styles.inputError]}
                  placeholder="Décrivez l'état du véhicule, son historique d'entretien, les équipements et options inclus..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.description && <Text style={styles.errorText}>⚠ {errors.description.message}</Text>}

            {/* Médias — Photos et Vidéo */}
            <MediaUploader
              images={images}
              setImages={setImages}
              video={video}
              setVideo={setVideo}
            />

            {/* Note sur les champs obligatoires */}
            <Text style={styles.requiredNote}>
              <Text style={styles.required}>*</Text> Champs obligatoires
            </Text>

            {/* Bouton de soumission */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <View style={styles.submitLoadingRow}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Mise à jour en cours...' : 'Publication en cours...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? '✅ Mettre à jour l\'annonce' : '🚀 Publier l\'annonce'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {toast.visible && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  editingBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  editingBadgeText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#fff',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 18,
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  optionChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeOptionChip: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  optionChipText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  activeOptionChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 20,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  toastContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 1000,
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
