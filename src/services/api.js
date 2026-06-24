// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { mockCars, mockUser, mockUser1, mockFavorites } from '../data/mockData';

// /**
//  * TODO: BACKEND INTEGRATION
//  * Passer USE_MOCK_API à false et configurer BASE_URL pour connecter le vrai backend.
//  */
// export const USE_MOCK_API = false;

// // ==========================================
// // Configuration Axios
// // CONFIGURÉ : Utilise l'adresse IP locale de la machine pour le développement mobile
// // ==========================================
// const API = axios.create({
//   baseURL: 'http://10.156.186.32:8000/api',
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// // Attachement automatique du jeton JWT à chaque requête
// API.interceptors.request.use(
//   async (config) => {
//     const token = await AsyncStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Gestion expiration JWT (401) — nettoyage automatique du token
// API.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       await AsyncStorage.removeItem('token');
//       await AsyncStorage.removeItem('user');
//     }
//     return Promise.reject(error);
//   }
// );

// // Utilitaire de simulation du délai réseau
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// // Récupérer l'ID de l'utilisateur courant depuis le token stocké
// const getCurrentUserId = async () => {
//   const token = await AsyncStorage.getItem('token');
//   if (token === mockUser.token) return mockUser.id;
//   if (token === mockUser1.token) return mockUser1.id;
//   return null;
// };

// // ==========================================
// // Authentification
// // TODO: BACKEND INTEGRATION — POST /api/login, POST /api/register
// // ==========================================

// export const login = async (email, password) => {
//   if (USE_MOCK_API) {
//     await delay(1000);
//     let found = null;
//     if (email === mockUser.email && password === mockUser.password) found = mockUser;
//     else if (email === mockUser1.email && password === mockUser1.password) found = mockUser1;

//     if (found) {
//       return {
//         data: {
//           status: 'success',
//           data: {
//             user: { id: found.id, name: found.name, email: found.email },
//             token: found.token,
//           },
//           message: 'Connexion réussie',
//         },
//       };
//     } else {
//       throw {
//         response: {
//           data: {
//             status: 'error',
//             message: 'Adresse e-mail ou mot de passe incorrect.',
//             errors: { email: ['Identifiants invalides'] },
//           },
//         },
//       };
//     }
//   }
//   return API.post('/login', { email, password });
// };

// export const register = async (userData) => {
//   if (USE_MOCK_API) {
//     await delay(1200);
//     return {
//       data: {
//         status: 'success',
//         data: {
//           user: { id: 'u_new', name: userData.name, email: userData.email },
//           token: 'mock-jwt-token-new-user',
//         },
//         message: 'Inscription réussie',
//       },
//     };
//   }
//   return API.post('/register', userData);
// };

// // ==========================================
// // Annonces voitures
// // TODO: BACKEND INTEGRATION — GET /api/cars, POST /api/cars, PUT /api/cars/:id, DELETE /api/cars/:id
// // ==========================================

// export const getCars = async (filters = {}) => {
//   if (USE_MOCK_API) {
//     await delay(800);
//     let filteredCars = [...mockCars];

//     if (filters.search) {
//       const q = filters.search.toLowerCase();
//       filteredCars = filteredCars.filter(
//         (car) =>
//           car.brand.toLowerCase().includes(q) ||
//           car.model.toLowerCase().includes(q) ||
//           car.location.toLowerCase().includes(q)
//       );
//     }
//     if (filters.brand) filteredCars = filteredCars.filter((c) => c.brand === filters.brand);
//     if (filters.fuel) filteredCars = filteredCars.filter((c) => c.fuel === filters.fuel);
//     if (filters.transmission) filteredCars = filteredCars.filter((c) => c.transmission === filters.transmission);
//     if (filters.minPrice) filteredCars = filteredCars.filter((c) => c.price >= parseFloat(filters.minPrice));
//     if (filters.maxPrice) filteredCars = filteredCars.filter((c) => c.price <= parseFloat(filters.maxPrice));
//     if (filters.minYear) filteredCars = filteredCars.filter((c) => c.year >= parseInt(filters.minYear));
//     if (filters.maxYear) filteredCars = filteredCars.filter((c) => c.year <= parseInt(filters.maxYear));

//     return {
//       data: {
//         status: 'success',
//         data: filteredCars,
//         message: 'Véhicules récupérés avec succès',
//       },
//     };
//   }
//   return API.get('/cars', { params: filters });
// };

// export const getCarById = async (id) => {
//   if (USE_MOCK_API) {
//     await delay(500);
//     const car = mockCars.find((c) => c.id === id.toString());
//     if (car) {
//       return { data: { status: 'success', data: car, message: 'Détails récupérés' } };
//     } else {
//       throw new Error('Véhicule non trouvé');
//     }
//   }
//   return API.get(`/cars/${id}`);
// };

// export const addCar = async (formData) => {
//   if (USE_MOCK_API) {
//     await delay(2000);
//     const userId = await getCurrentUserId();
//     const currentMockUser = userId === mockUser.id ? mockUser : mockUser1;

//     const getValue = (key) => formData._parts?.find((p) => p[0] === key)?.[1];

//     const brand = getValue('brand') || 'Générique';
//     const model = getValue('model') || 'Voiture';
//     const year = parseInt(getValue('year') || '2026');
//     const price = parseFloat(getValue('price') || '10000');
//     const mileage = parseFloat(getValue('mileage') || '0');
//     const description = getValue('description') || '';
//     const fuel = getValue('fuel') || 'Essence';
//     const transmission = getValue('transmission') || 'Automatique';
//     const color = getValue('color') || 'Non spécifié';
//     const location = getValue('location') || 'Nouakchott';

//     const images = formData._parts
//       ?.filter((p) => p[0].startsWith('images['))
//       .map((p) => {
//         const val = p[1];
//         return (val && typeof val === 'object' && val.uri) ? val.uri : val;
//       }) || [];

//     const videoEntry = formData._parts?.find((p) => p[0] === 'video');
//     const videoVal = videoEntry?.[1];
//     const video = (videoVal === 'delete') ? null : ((videoVal && typeof videoVal === 'object' && videoVal.uri) ? videoVal.uri : (videoVal || null));

//     const newCar = {
//       id: String(Date.now()),
//       brand, model, year, price, mileage, fuel, transmission, color, description, location,
//       images: images.length > 0
//         ? images
//         : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop'],
//       video,
//       seller: { name: currentMockUser.name, phone: '+222 4444 5555' },
//       userId: currentMockUser.id,
//       createdAt: new Date().toISOString().split('T')[0],
//     };

//     mockCars.unshift(newCar);
//     return { data: { status: 'success', data: newCar, message: 'Annonce publiée avec succès' } };
//   }
//   // TODO: BACKEND INTEGRATION — Envoyer le FormData avec les images et la vidéo
//   return API.post('/cars', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
// };

// export const updateCar = async (id, formData) => {
//   if (USE_MOCK_API) {
//     await delay(1500);
//     const index = mockCars.findIndex((c) => c.id === id.toString());
//     if (index === -1) throw new Error('Véhicule non trouvé');

//     const existing = mockCars[index];
//     const getValue = (key) => formData._parts?.find((p) => p[0] === key)?.[1];

//     const updatedCar = {
//       ...existing,
//       brand: getValue('brand') || existing.brand,
//       model: getValue('model') || existing.model,
//       year: getValue('year') ? parseInt(getValue('year')) : existing.year,
//       price: getValue('price') ? parseFloat(getValue('price')) : existing.price,
//       mileage: getValue('mileage') ? parseFloat(getValue('mileage')) : existing.mileage,
//       fuel: getValue('fuel') || existing.fuel,
//       transmission: getValue('transmission') || existing.transmission,
//       color: getValue('color') || existing.color,
//       description: getValue('description') || existing.description,
//     };

//     const newImages = formData._parts
//       ?.filter((p) => p[0].startsWith('images['))
//       .map((p) => {
//         const val = p[1];
//         return (val && typeof val === 'object' && val.uri) ? val.uri : val;
//       });
//     if (newImages && newImages.length > 0) updatedCar.images = newImages;

//     const videoEntry = formData._parts?.find((p) => p[0] === 'video');
//     if (videoEntry) {
//       const videoVal = videoEntry[1];
//       if (videoVal === 'delete') {
//         updatedCar.video = null;
//       } else if (videoVal) {
//         updatedCar.video = (typeof videoVal === 'object' && videoVal.uri) ? videoVal.uri : videoVal;
//       }
//     }

//     mockCars[index] = updatedCar;
//     return { data: { status: 'success', data: updatedCar, message: 'Annonce mise à jour avec succès' } };
//   }
//   // TODO: BACKEND INTEGRATION — PUT /api/cars/:id avec FormData
//   return API.post(`/cars/${id}`, formData, {
//     headers: { 'Content-Type': 'multipart/form-data', 'X-HTTP-Method-Override': 'PUT' },
//   });
// };

// export const getUserCars = async () => {
//   if (USE_MOCK_API) {
//     await delay(1000);
//     const userId = await getCurrentUserId();
//     const userCars = mockCars.filter((car) => car.userId === userId);
//     return { data: { status: 'success', data: userCars, message: 'Annonces récupérées' } };
//   }
//   // TODO: BACKEND INTEGRATION — GET /api/user/cars (route protégée JWT)
//   return API.get('/user/cars');
// };

// export const deleteCar = async (id) => {
//   if (USE_MOCK_API) {
//     await delay(800);
//     const index = mockCars.findIndex((c) => c.id === id.toString());
//     if (index !== -1) mockCars.splice(index, 1);
//     return { data: { status: 'success', message: 'Annonce supprimée avec succès' } };
//   }
//   // TODO: BACKEND INTEGRATION — DELETE /api/cars/:id (route protégée JWT)
//   return API.delete(`/cars/${id}`);
// };

// // ==========================================
// // Favoris
// // TODO: BACKEND INTEGRATION — GET/POST/DELETE /api/user/favorites
// // ==========================================

// export const getFavorites = async () => {
//   if (USE_MOCK_API) {
//     await delay(600);
//     const userId = await getCurrentUserId();
//     if (!userId) throw new Error('Non authentifié');
//     if (!mockFavorites[userId]) mockFavorites[userId] = [];
//     const favCars = mockCars.filter((c) => mockFavorites[userId].includes(c.id));
//     return { data: { status: 'success', data: favCars, message: 'Favoris récupérés' } };
//   }
//   return API.get('/user/favorites');
// };

// export const addFavorite = async (carId) => {
//   if (USE_MOCK_API) {
//     await delay(400);
//     const userId = await getCurrentUserId();
//     if (!userId) throw new Error('Non authentifié');
//     if (!mockFavorites[userId]) mockFavorites[userId] = [];
//     if (!mockFavorites[userId].includes(carId)) {
//       mockFavorites[userId].push(carId);
//     }
//     return { data: { status: 'success', message: 'Ajouté aux favoris' } };
//   }
//   return API.post(`/user/favorites/${carId}`);
// };

// export const removeFavorite = async (carId) => {
//   if (USE_MOCK_API) {
//     await delay(400);
//     const userId = await getCurrentUserId();
//     if (!userId) throw new Error('Non authentifié');
//     if (mockFavorites[userId]) {
//       mockFavorites[userId] = mockFavorites[userId].filter((id) => id !== carId);
//     }
//     return { data: { status: 'success', message: 'Retiré des favoris' } };
//   }
//   return API.delete(`/user/favorites/${carId}`);
// };

// export const isFavorite = async (carId) => {
//   if (USE_MOCK_API) {
//     const userId = await getCurrentUserId();
//     if (!userId || !mockFavorites[userId]) return false;
//     return mockFavorites[userId].includes(carId);
//   }
//   // TODO: BACKEND INTEGRATION — GET /api/user/favorites/:carId
//   return false;
// };

// export default API;
// ===================================================== Abdlhi le code lasli 4ak lvogni iline ivoute ysl7e api 4e 8rk pour le test  test pour data locale le vrie code son un haut sa just pour le test =================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockCars, mockUser, mockUser1, mockFavorites } from '../data/mockData';

// ==========================================
// MODE MOCK UNIQUEMENT — pas d'axios, pas de réseau
// Pour connecter le vrai backend plus tard :
//   1. Réinstaller axios
//   2. Décommenter la config API axios en bas du fichier
//   3. Remplacer chaque bloc mock par l'appel API correspondant
// ==========================================

// Utilitaire de simulation du délai réseau
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Récupérer l'ID de l'utilisateur courant depuis le token stocké
const getCurrentUserId = async () => {
  const token = await AsyncStorage.getItem('token');
  if (token === mockUser.token) return mockUser.id;
  if (token === mockUser1.token) return mockUser1.id;
  return null;
};

// ==========================================
// Authentification
// TODO BACKEND : POST /api/login, POST /api/register
// ==========================================

export const login = async (email, password) => {
  await delay(1000);

  let found = null;
  if (email === mockUser.email && password === mockUser.password) found = mockUser;
  else if (email === mockUser1.email && password === mockUser1.password) found = mockUser1;

  if (found) {
    return {
      data: {
        status: 'success',
        data: {
          user: { id: found.id, name: found.name, email: found.email },
          token: found.token,
        },
        message: 'Connexion réussie',
      },
    };
  } else {
    throw {
      response: {
        data: {
          status: 'error',
          message: 'Adresse e-mail ou mot de passe incorrect.',
          errors: { email: ['Identifiants invalides'] },
        },
      },
    };
  }
};

export const register = async (userData) => {
  await delay(1200);
  return {
    data: {
      status: 'success',
      data: {
        user: { id: 'u_new', name: userData.name, email: userData.email },
        token: 'mock-jwt-token-new-user',
      },
      message: 'Inscription réussie',
    },
  };
};

// ==========================================
// Annonces voitures
// TODO BACKEND : GET /api/cars, POST /api/cars, PUT /api/cars/:id, DELETE /api/cars/:id
// ==========================================

export const getCars = async (filters = {}) => {
  await delay(800);
  let filteredCars = [...mockCars];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    filteredCars = filteredCars.filter(
      (car) =>
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.location.toLowerCase().includes(q)
    );
  }
  if (filters.brand) filteredCars = filteredCars.filter((c) => c.brand === filters.brand);
  if (filters.fuel) filteredCars = filteredCars.filter((c) => c.fuel === filters.fuel);
  if (filters.transmission) filteredCars = filteredCars.filter((c) => c.transmission === filters.transmission);
  if (filters.minPrice) filteredCars = filteredCars.filter((c) => c.price >= parseFloat(filters.minPrice));
  if (filters.maxPrice) filteredCars = filteredCars.filter((c) => c.price <= parseFloat(filters.maxPrice));
  if (filters.minYear) filteredCars = filteredCars.filter((c) => c.year >= parseInt(filters.minYear));
  if (filters.maxYear) filteredCars = filteredCars.filter((c) => c.year <= parseInt(filters.maxYear));

  return {
    data: {
      status: 'success',
      data: filteredCars,
      message: 'Véhicules récupérés avec succès',
    },
  };
};

export const getCarById = async (id) => {
  await delay(500);
  const car = mockCars.find((c) => c.id === id.toString());
  if (car) {
    return { data: { status: 'success', data: car, message: 'Détails récupérés' } };
  } else {
    throw new Error('Véhicule non trouvé');
  }
};

export const addCar = async (formData) => {
  await delay(2000);
  const userId = await getCurrentUserId();
  const currentMockUser = userId === mockUser.id ? mockUser : mockUser1;

  const getValue = (key) => formData._parts?.find((p) => p[0] === key)?.[1];

  const brand = getValue('brand') || 'Générique';
  const model = getValue('model') || 'Voiture';
  const year = parseInt(getValue('year') || '2026');
  const price = parseFloat(getValue('price') || '10000');
  const mileage = parseFloat(getValue('mileage') || '0');
  const description = getValue('description') || '';
  const fuel = getValue('fuel') || 'Essence';
  const transmission = getValue('transmission') || 'Automatique';
  const color = getValue('color') || 'Non spécifié';
  const location = getValue('location') || 'Nouakchott';

  const images = formData._parts
    ?.filter((p) => p[0].startsWith('images['))
    .map((p) => {
      const val = p[1];
      return val && typeof val === 'object' && val.uri ? val.uri : val;
    }) || [];

  const videoEntry = formData._parts?.find((p) => p[0] === 'video');
  const videoVal = videoEntry?.[1];
  const video =
    videoVal === 'delete'
      ? null
      : videoVal && typeof videoVal === 'object' && videoVal.uri
        ? videoVal.uri
        : videoVal || null;

  const newCar = {
    id: String(Date.now()),
    brand, model, year, price, mileage, fuel, transmission, color, description, location,
    images:
      images.length > 0
        ? images
        : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop'],
    video,
    seller: { name: currentMockUser.name, phone: '+222 4444 5555' },
    userId: currentMockUser.id,
    createdAt: new Date().toISOString().split('T')[0],
  };

  mockCars.unshift(newCar);
  return { data: { status: 'success', data: newCar, message: 'Annonce publiée avec succès' } };
};

export const updateCar = async (id, formData) => {
  await delay(1500);
  const index = mockCars.findIndex((c) => c.id === id.toString());
  if (index === -1) throw new Error('Véhicule non trouvé');

  const existing = mockCars[index];
  const getValue = (key) => formData._parts?.find((p) => p[0] === key)?.[1];

  const updatedCar = {
    ...existing,
    brand: getValue('brand') || existing.brand,
    model: getValue('model') || existing.model,
    year: getValue('year') ? parseInt(getValue('year')) : existing.year,
    price: getValue('price') ? parseFloat(getValue('price')) : existing.price,
    mileage: getValue('mileage') ? parseFloat(getValue('mileage')) : existing.mileage,
    fuel: getValue('fuel') || existing.fuel,
    transmission: getValue('transmission') || existing.transmission,
    color: getValue('color') || existing.color,
    description: getValue('description') || existing.description,
  };

  const newImages = formData._parts
    ?.filter((p) => p[0].startsWith('images['))
    .map((p) => {
      const val = p[1];
      return val && typeof val === 'object' && val.uri ? val.uri : val;
    });
  if (newImages && newImages.length > 0) updatedCar.images = newImages;

  const videoEntry = formData._parts?.find((p) => p[0] === 'video');
  if (videoEntry) {
    const videoVal = videoEntry[1];
    if (videoVal === 'delete') {
      updatedCar.video = null;
    } else if (videoVal) {
      updatedCar.video = typeof videoVal === 'object' && videoVal.uri ? videoVal.uri : videoVal;
    }
  }

  mockCars[index] = updatedCar;
  return { data: { status: 'success', data: updatedCar, message: 'Annonce mise à jour avec succès' } };
};

export const getUserCars = async () => {
  await delay(1000);
  const userId = await getCurrentUserId();
  const userCars = mockCars.filter((car) => car.userId === userId);
  return { data: { status: 'success', data: userCars, message: 'Annonces récupérées' } };
};

export const deleteCar = async (id) => {
  await delay(800);
  const index = mockCars.findIndex((c) => c.id === id.toString());
  if (index !== -1) mockCars.splice(index, 1);
  return { data: { status: 'success', message: 'Annonce supprimée avec succès' } };
};

// ==========================================
// Favoris
// TODO BACKEND : GET/POST/DELETE /api/user/favorites
// ==========================================
export const getFavorites = async () => {
  await delay(600);
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Non authentifié');
  if (!mockFavorites[userId]) mockFavorites[userId] = [];
  const favCars = mockCars.filter((c) => mockFavorites[userId].includes(c.id));
  return { data: { status: 'success', data: favCars, message: 'Favoris récupérés' } };
};

export const addFavorite = async (carId) => {
  await delay(400);
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Non authentifié');
  if (!mockFavorites[userId]) mockFavorites[userId] = [];
  if (!mockFavorites[userId].includes(carId)) {
    mockFavorites[userId].push(carId);
  }
  return { data: { status: 'success', message: 'Ajouté aux favoris' } };
};

export const removeFavorite = async (carId) => {
  await delay(400);
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Non authentifié');
  if (mockFavorites[userId]) {
    mockFavorites[userId] = mockFavorites[userId].filter((id) => id !== carId);
  }
  return { data: { status: 'success', message: 'Retiré des favoris' } };
};

export const isFavorite = async (carId) => {
  const userId = await getCurrentUserId();
  if (!userId || !mockFavorites[userId]) return false;
  return mockFavorites[userId].includes(carId);
};

// ==========================================
// TODO BACKEND — Décommenter quand l'API est prête
// ==========================================
// import axios from 'axios';
//
// const API = axios.create({
//   baseURL: 'http://10.156.186.32:8000/api',
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });
//
// API.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// }, (error) => Promise.reject(error));
//
// API.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       await AsyncStorage.removeItem('token');
//       await AsyncStorage.removeItem('user');
//     }
//     return Promise.reject(error);
//   }
// );
//
// export default API;