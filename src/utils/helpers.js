/**
 * Formate une valeur numérique en Ouguiya Mauritanien (ex: 450 000 MRU)
 * @param {number} value
 * @returns {string}
 */
export const formatPrice = (value) => {
  if (value === undefined || value === null) return "0 MRU";
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value)} MRU`;
};

/**
 * Formate le kilométrage avec des espaces comme séparateur de milliers (ex: 45 000 km)
 * @param {number} value
 * @returns {string}
 */
export const formatMileage = (value) => {
  if (value === undefined || value === null) return "0 km";
  return `${new Intl.NumberFormat("fr-FR").format(value)} km`;
};

/**
 * Formate une date en format lisible en français (ex: 15 juin 2026)
 * @param {string} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Mappage des carburants du backend vers le français
 */
export const FUEL_TYPE_MAP = {
  'gasoline': 'Essence',
  'diesel': 'Diesel',
  'electric': 'Électrique',
  'hybrid': 'Hybride',
  'Essence': 'Essence',
  'Diesel': 'Diesel',
  'Électrique': 'Électrique',
  'Hybride': 'Hybride',
  'GPL': 'GPL',
};

/**
 * Mappage des transmissions du backend vers le français
 */
export const TRANSMISSION_MAP = {
  'automatic': 'Automatique',
  'manual': 'Manuelle',
  'Automatique': 'Automatique',
  'Manuelle': 'Manuelle',
};
