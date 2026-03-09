import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Onboarding from './components/Onboarding/Onboarding';
import Preview from './components/Preview/Preview';
import Collection from './components/Collection/Collection';
import UploadModal from './components/Upload/UploadModal';
import ProfileModal from './components/Modals/ProfileModal';
import CollectionModal from './components/Modals/CollectionModal';
import FavoritesModal from './components/Modals/FavoritesModal';
import PlanModal from './components/Modals/PlanModal';
import VideoModal from './components/Modals/VideoModal';
import StylistModal from './components/Modals/StylistModal';
import { generateRemixBackground } from './services/geminiService';
import { runMagicWandGeneration } from './services/magicWandService';
import { runPromptTryOnGeneration } from './services/promptTryOnService';
import {
  createVideoFavorite,
  downloadVideoFromUrl,
  isVideoFavorited,
  runVideoGeneration,
  shouldRevokePreviousVideoUrl
} from './services/videoFeatureService';
import {
  cacheVideoFavoriteBlob,
  createVideoPosterFromUrl,
  deleteVideoFavoriteBlob,
  getVideoFavoriteObjectUrl
} from './services/videoStorageService';
import drapeLogo from './assets/drape-logo.svg';

const STORAGE_KEY = 'drape_profile';
const COLLECTION_KEY = 'drape_collection';
const FAVORITES_KEY = 'drape_favorites';
const WEEK_PLAN_KEY = 'drape_week_plan';
const WEEK_PLAN_META_KEY = 'drape_week_plan_meta';
const WEEK_PLAN_PRESET_KEY = 'drape_week_plan_preset';
const WEAR_HISTORY_KEY = 'drape_wear_history';
const PLAN_PRESETS = ['Work', 'Smart Casual', 'Evening'];
const WEEK_DAYS = [
  { key: 'Monday', label: 'Mon' },
  { key: 'Tuesday', label: 'Tues' },
  { key: 'Wednesday', label: 'Weds' },
  { key: 'Thursday', label: 'Thurs' },
  { key: 'Friday', label: 'Fri' },
  { key: 'Saturday', label: 'Sat' },
  { key: 'Sunday', label: 'Sun' }
];
const createItemId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const serializeFavoritesForStorage = (favorites) => {
  return favorites.map((fav) => {
    if (fav.type === 'video') {
      return {
        id: fav.id,
        type: 'video',
        storageId: fav.storageId || fav.id,
        poster: fav.poster || null,
        date: fav.date
      };
    }
    return {
      id: fav.id,
      type: 'image',
      image: fav.url,
      date: fav.date
    };
  });
};

const persistFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(serializeFavoritesForStorage(favorites)));
};

const persistWeekPlan = (weekPlan, weekMeta, setWeekPlanState, setWeekPlanMetaState) => {
  setWeekPlanState(weekPlan);
  localStorage.setItem(WEEK_PLAN_KEY, JSON.stringify(weekPlan));
  if (weekMeta) {
    setWeekPlanMetaState(weekMeta);
    localStorage.setItem(WEEK_PLAN_META_KEY, JSON.stringify(weekMeta));
  }
};

const withTimeout = (promise, timeoutMs, fallbackValue) => {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallbackValue), timeoutMs))
  ]);
};

const buildSelectionSignature = (selectedItemIds = []) => selectedItemIds.slice().sort().join('|');

const buildPlanCategoryWeights = (intentText, preset = 'Work', dayKey = '') => {
  const intent = String(intentText || '').toLowerCase();
  const isWeekend = dayKey === 'Saturday' || dayKey === 'Sunday';
  const has = (word) => intent.includes(word);

  if (preset === 'Evening') {
    return {
      Dress: has('dinner') || has('night') || has('evening') ? 5 : 3,
      Suit: has('dinner') || has('night') || has('evening') ? 5 : 3,
      Jacket: 4,
      Shirt: 3,
      Skirt: 4,
      Pants: 2,
      Shoes: 3,
      Accessory: 2
    };
  }

  if (preset === 'Smart Casual') {
    return {
      Dress: isWeekend ? 3 : 2,
      Suit: 2,
      Jacket: 4,
      Shirt: 4,
      Skirt: 3,
      Pants: 4,
      Shoes: 3,
      Accessory: 2
    };
  }

  return {
    Dress: has('meeting') ? 2 : 1,
    Suit: has('work') || has('office') || has('meeting') ? 5 : 3,
    Jacket: 4,
    Shirt: 4,
    Skirt: 3,
    Pants: 4,
    Shoes: 3,
    Accessory: 2
  };
};

const selectItemsForPlanDay = (collection, intentText, preset, dayKey, avoidSignatures = new Set()) => {
  if (!Array.isArray(collection) || collection.length === 0) return [];
  const weights = buildPlanCategoryWeights(intentText, preset, dayKey);
  const scoreItem = (item) => {
    const category = item?.category || 'Other';
    const normalized = category.endsWith('s') ? category.slice(0, -1) : category;
    return weights[normalized] || weights[category] || 1;
  };

  const ranked = [...collection].sort((a, b) => scoreItem(b) - scoreItem(a));
  const maxItems = Math.min(4, ranked.length);

  const pickWithOffset = (offset = 0) => {
    const picked = [];
    const usedCategories = new Set();
    for (let i = 0; i < ranked.length; i += 1) {
      const item = ranked[(i + offset) % ranked.length];
      const category = item?.category || 'Other';
      if (!usedCategories.has(category) || picked.length < 2) {
        picked.push(item.id);
        usedCategories.add(category);
      }
      if (picked.length >= maxItems) break;
    }
    return picked;
  };

  let fallback = [];
  for (let attempt = 0; attempt < Math.min(8, ranked.length); attempt += 1) {
    const selected = pickWithOffset(attempt);
    if (!selected.length) continue;
    const signature = buildSelectionSignature(selected);
    if (!fallback.length) fallback = selected;
    if (!avoidSignatures.has(signature)) return selected;
  }

  return fallback;
};

const getCurrentWeekId = (date = new Date()) => {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const formatDateAsICS = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

const getCurrentWeekDateMap = (referenceDate = new Date()) => {
  const base = new Date(referenceDate);
  const day = base.getDay(); // 0 Sun .. 6 Sat
  const mondayDiff = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(base.getDate() + mondayDiff);

  return WEEK_DAYS.reduce((acc, dayInfo, idx) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + idx);
    acc[dayInfo.key] = date;
    return acc;
  }, {});
};

const buildPlanCalendarICS = ({ weekPlan, planPreset, weekId }) => {
  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const weekDates = getCurrentWeekDateMap(now);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Drape//Weekly Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  weekPlan.forEach((entry) => {
    const date = weekDates[entry.day];
    if (!date) return;
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const dateStr = formatDateAsICS(date);
    const nextDateStr = formatDateAsICS(nextDay);
    const dayLabel = WEEK_DAYS.find((d) => d.key === entry.day)?.label || entry.day;
    const uid = `${weekId || getCurrentWeekId()}-${entry.day}-${entry.id}@drape`;
    const description = [
      `Preset: ${planPreset}`,
      `Day: ${entry.day}`,
      'Generated in Drape weekly planner.',
      'Open Drape to view the associated look image.'
    ].join('\\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`SUMMARY:Drape Plan - ${dayLabel}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
    lines.push(`DTEND;VALUE=DATE:${nextDateStr}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

const selectItemsForStylistIntent = (collection, intentText) => {
  if (!Array.isArray(collection) || collection.length === 0) return [];

  const intent = String(intentText || '').toLowerCase();
  const has = (word) => intent.includes(word);
  const words = intent.split(/\s+/).filter(Boolean);

  const normalizeValue = (value) => String(value || '').toLowerCase().trim();
  const normalizeCategory = (value) => {
    const normalized = normalizeValue(value);
    const singularMap = {
      suits: 'suit',
      jackets: 'jacket',
      shirts: 'shirt',
      pants: 'pants',
      trousers: 'pants',
      skirts: 'skirt',
      dresses: 'dress',
      shoes: 'shoe',
      accessories: 'accessory'
    };
    return singularMap[normalized] || normalized;
  };
  const colorMatches = (itemColor, requestedColorValue) => {
    if (!requestedColorValue) return true;
    const normalizedColor = normalizeValue(itemColor);
    if (!normalizedColor) return false;
    return (
      normalizedColor === requestedColorValue
      || normalizedColor.includes(requestedColorValue)
      || requestedColorValue.includes(normalizedColor)
    );
  };

  const colorTerms = ['black', 'white', 'blue', 'navy', 'red', 'green', 'gray', 'grey', 'brown', 'beige', 'cream'];
  const requestedColor = colorTerms.find((term) => words.includes(term)) || null;

  const categoryTermMap = {
    shirt: 'Shirt',
    tee: 'Shirt',
    tshirt: 'Shirt',
    jacket: 'Jacket',
    blazer: 'Jacket',
    suit: 'Suit',
    pant: 'Pants',
    pants: 'Pants',
    trouser: 'Pants',
    trousers: 'Pants',
    skirt: 'Skirt',
    dress: 'Dress',
    shoe: 'Shoe',
    shoes: 'Shoe',
    accessory: 'Accessory'
  };
  const matchedCategoryTerm = Object.keys(categoryTermMap).find((term) => words.includes(term));
  const requestedCategory = matchedCategoryTerm ? categoryTermMap[matchedCategoryTerm] : null;

  const explicitSingleRequest = /\b(a|an|one|single|just)\b/.test(intent) || (requestedCategory && !has('outfit'));

  const exactMatches = collection.filter((item) => {
    const categoryOk = requestedCategory
      ? normalizeCategory(item?.category) === normalizeCategory(requestedCategory)
      : true;
    const colorOk = requestedColor ? colorMatches(item?.color, requestedColor) : true;
    return categoryOk && colorOk;
  });

  if (requestedCategory && requestedColor && exactMatches.length > 0) {
    return [exactMatches[0].id];
  }

  if (explicitSingleRequest && exactMatches.length > 0) {
    return [exactMatches[0].id];
  }

  if (explicitSingleRequest && requestedColor && requestedCategory && exactMatches.length === 0) {
    return [];
  }

  const occasionWeights = {
    Dress: has('dinner') || has('date') || has('night') ? 4 : 1,
    Suit: has('dinner') || has('formal') || has('event') ? 4 : 1,
    Jacket: has('dinner') || has('night') || has('formal') ? 3 : 1,
    Shirt: 2,
    Skirt: has('dinner') || has('date') ? 3 : 1,
    Pants: has('dinner') || has('work') ? 2 : 1,
    Shoes: 2,
    Accessory: 1
  };

  const scoreItem = (item) => {
    const category = item?.category || 'Other';
    const normalized = category.endsWith('s') ? category.slice(0, -1) : category;
    const base = occasionWeights[normalized] || occasionWeights[category] || 1;
    const itemColor = normalizeValue(item?.color);
    const itemCategory = normalizeCategory(item?.category);
    const categoryMatch = requestedCategory
      ? itemCategory === normalizeCategory(requestedCategory)
      : false;
    const colorMatch = requestedColor ? colorMatches(itemColor, requestedColor) : false;
    const colorPenalty = requestedColor && !colorMatch ? -12 : 0;
    return base + (categoryMatch ? 20 : 0) + (colorMatch ? 24 : 0) + colorPenalty;
  };

  const ranked = [...collection].sort((a, b) => scoreItem(b) - scoreItem(a));

  if (explicitSingleRequest) {
    const best = ranked[0];
    return best ? [best.id] : [];
  }

  const picked = [];
  const usedCategories = new Set();

  for (const item of ranked) {
    const category = item?.category || 'Other';
    if (!usedCategories.has(category) || picked.length < 2) {
      picked.push(item.id);
      usedCategories.add(category);
    }
    if (picked.length >= 4) break;
  }

  return picked.length ? picked : collection.slice(0, Math.min(4, collection.length)).map((item) => item.id);
};

function App() {
  const [profile, setProfile] = useState(null);
  const [collection, setCollection] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collection');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfitUrl, setGeneratedOutfitUrl] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [weekPlan, setWeekPlan] = useState([]);
  const [weekPlanMeta, setWeekPlanMeta] = useState(null);
  const [planError, setPlanError] = useState('');
  const [planPreset, setPlanPreset] = useState('Work');
  const [wearHistory, setWearHistory] = useState([]);
  const autoPlanAttemptRef = useRef('');

  useEffect(() => {
    const load = async () => {
      try {
        const savedProfile = localStorage.getItem(STORAGE_KEY);
        const savedCollection = localStorage.getItem(COLLECTION_KEY);
        const savedFavorites = localStorage.getItem(FAVORITES_KEY);
        const savedWeekPlan = localStorage.getItem(WEEK_PLAN_KEY);
        const savedWeekPlanMeta = localStorage.getItem(WEEK_PLAN_META_KEY);
        const savedPlanPreset = localStorage.getItem(WEEK_PLAN_PRESET_KEY);
        const savedWearHistory = localStorage.getItem(WEAR_HISTORY_KEY);

        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
          setIsComplete(true);
        }
        if (savedCollection) {
          const parsedCollection = JSON.parse(savedCollection);
          const normalizedCollection = parsedCollection.map((item) => (
            item.id ? item : { ...item, id: createItemId() }
          ));
          setCollection(normalizedCollection);
          if (normalizedCollection.some((item, index) => item.id !== parsedCollection[index]?.id)) {
            localStorage.setItem(COLLECTION_KEY, JSON.stringify(normalizedCollection));
          }
        }
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          const normalizedFavorites = parsedFavorites.map((fav) => {
            if (fav.type === 'video') {
              return {
                id: fav.id,
                type: 'video',
                storageId: fav.storageId || fav.id,
                poster: fav.poster || null,
                date: fav.date || new Date().toISOString()
              };
            }
            return {
              id: fav.id,
              type: 'image',
              url: fav.url || fav.image,
              date: fav.date || new Date().toISOString()
            };
          });

          const hydratedFavorites = await Promise.all(normalizedFavorites.map(async (fav) => {
            if (fav.type !== 'video') return fav;
            const runtimeUrl = await withTimeout(
              getVideoFavoriteObjectUrl(fav.storageId).catch(() => null),
              1800,
              null
            );
            let poster = fav.poster || null;
            if (!poster && runtimeUrl) {
              poster = await withTimeout(
                createVideoPosterFromUrl(runtimeUrl).catch(() => null),
                1200,
                null
              );
            }
            return {
              ...fav,
              poster,
              runtimeUrl
            };
          }));

          setFavorites(hydratedFavorites);
          persistFavorites(hydratedFavorites);
        }
        if (savedWeekPlan) {
          const parsedWeekPlan = JSON.parse(savedWeekPlan);
          if (Array.isArray(parsedWeekPlan)) {
            setWeekPlan(parsedWeekPlan);
          }
        }
        if (savedWeekPlanMeta) {
          const parsedWeekPlanMeta = JSON.parse(savedWeekPlanMeta);
          if (parsedWeekPlanMeta?.weekId) {
            setWeekPlanMeta(parsedWeekPlanMeta);
          }
        }
        if (savedPlanPreset && PLAN_PRESETS.includes(savedPlanPreset)) {
          setPlanPreset(savedPlanPreset);
        }
        if (savedWearHistory) {
          const parsedWearHistory = JSON.parse(savedWearHistory);
          if (Array.isArray(parsedWearHistory)) {
            setWearHistory(parsedWearHistory);
          }
        }
      } catch (error) {
        console.error('App boot hydration failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const bootFailsafe = setTimeout(() => setLoading(false), 3000);
    load().finally(() => clearTimeout(bootFailsafe));
  }, []);

  useEffect(() => {
    return () => {
      if (generatedVideoUrl) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [generatedVideoUrl]);

  const saveProfile = (data) => {
    const mergedProfile = { ...(profile || {}), ...(data || {}) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedProfile));
    setProfile(mergedProfile);
    setIsComplete(true);
  };

  const skipOnboarding = () => {
    if (profile) {
      setIsComplete(true);
      setActiveTab('collection');
      return;
    }

    const fallbackProfile = {
      gender: 'Other',
      photo: null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackProfile));
    setProfile(fallbackProfile);
    setIsComplete(true);
    setActiveTab('collection');
  };

  const clearProfile = () => {
    if (window.confirm("Are you sure you want to reset everything? This will delete your profile, collection, and favorites.")) {
      localStorage.clear(); // Wipe everything for a truly clean slate
      window.location.reload();
    }
  };

  const addItem = (item) => {
    const newItem = { ...item, id: item.id || createItemId() };
    const newCollection = [...collection, newItem];
    setCollection(newCollection);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(newCollection));
  };

  const removeItem = (id) => {
    const newCollection = collection.filter(item => item.id !== id);
    setCollection(newCollection);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(newCollection));
    setSelectedItems(selectedItems.filter(itemId => itemId !== id));
  };

  const addFavorite = (image) => {
    const newFavorite = { id: Date.now(), type: 'image', url: image, date: new Date().toISOString() };
    const newFavorites = [newFavorite, ...favorites];
    setFavorites(newFavorites);
    persistFavorites(newFavorites);
  };

  const addImagesToFavorites = (images = []) => {
    const normalized = images.filter(Boolean);
    if (!normalized.length) return 0;
    const existing = new Set(favorites.filter((f) => f.type === 'image').map((f) => f.url));
    const additions = normalized
      .filter((img) => !existing.has(img))
      .map((img, index) => ({ id: Date.now() + index, type: 'image', url: img, date: new Date().toISOString() }));
    if (!additions.length) return 0;
    const newFavorites = [...additions, ...favorites];
    setFavorites(newFavorites);
    persistFavorites(newFavorites);
    return additions.length;
  };

  const addVideoFavorite = async (videoUrl) => {
    if (!videoUrl) return null;

    const existingFavorite = favorites.find(
      (fav) => fav.type === 'video' && (fav.url === videoUrl || fav.runtimeUrl === videoUrl)
    );
    if (existingFavorite) {
      return existingFavorite;
    }

    const newFavorite = {
      ...createVideoFavorite(videoUrl),
      storageId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      runtimeUrl: videoUrl,
      poster: null
    };

    setFavorites((currentFavorites) => {
      const alreadySaved = currentFavorites.find(
        (fav) => fav.type === 'video' && (fav.url === videoUrl || fav.runtimeUrl === videoUrl)
      );
      if (alreadySaved) {
        return currentFavorites;
      }

      const nextFavorites = [newFavorite, ...currentFavorites];
      persistFavorites(nextFavorites);
      return nextFavorites;
    });

    cacheVideoFavoriteBlob(newFavorite.storageId, videoUrl).catch((error) => {
      console.error('Failed to persist video favorite:', error);
    });

    createVideoPosterFromUrl(videoUrl)
      .then((poster) => {
        if (!poster) return;
        setFavorites((currentFavorites) => {
          const nextFavorites = currentFavorites.map((fav) => (
            fav.id === newFavorite.id ? { ...fav, poster } : fav
          ));
          persistFavorites(nextFavorites);
          return nextFavorites;
        });
      })
      .catch((error) => {
        console.error('Failed to create video favorite poster:', error);
      });

    return newFavorite;
  };

  const removeFavorite = async (id) => {
    const removedFavorite = favorites.find((fav) => fav.id === id);
    if (removedFavorite?.type === 'video') {
      if (removedFavorite.runtimeUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(removedFavorite.runtimeUrl);
      }
      await deleteVideoFavoriteBlob(removedFavorite.storageId || removedFavorite.id).catch(() => null);
    }
    const newFavorites = favorites.filter((fav) => fav.id !== id);
    setFavorites(newFavorites);
    persistFavorites(newFavorites);
  };

  const handleToggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleMagicWandClick = async () => {
    setIsGenerating(true);
    try {
      const result = await runMagicWandGeneration({
        profilePhoto: profile?.photo,
        collection,
        selectedItemIds: selectedItems
      });

      if (result.ok) {
        setGeneratedOutfitUrl(result.image);
      } else {
        if (result.reason === "NO_COLLECTION") {
          alert("Please add some items to your collection first!");
        } else if (result.reason === "NO_PROFILE_PHOTO") {
          alert("Please upload a profile photo first.");
        } else {
          alert("Styling failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Magic Wand failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUndoOutfit = () => setGeneratedOutfitUrl(null);

  const handleRemixOutfit = async () => {
    if (!generatedOutfitUrl) return;
    setIsGenerating(true);
    try {
      const remixedImage = await generateRemixBackground(generatedOutfitUrl);
      if (remixedImage) {
        setGeneratedOutfitUrl(remixedImage);
      } else {
        alert("Background remix failed. Please try again.");
      }
    } catch (error) {
      console.error("Remix failed:", error);
      alert("Background remix failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentPreviewImage = generatedOutfitUrl || profile?.photo;
  const isCurrentFavorite = favorites?.some(fav => fav.type === 'image' && fav.url === currentPreviewImage);
  const isCurrentVideoFavorite = isVideoFavorited(
    favorites,
    generatedVideoUrl
  ) || favorites?.some((fav) => fav.type === 'video' && fav.runtimeUrl === generatedVideoUrl);

  const handleFavorite = (image) => {
    if (!isCurrentFavorite) addFavorite(image);
    setIsFavoritesOpen(true);
  };

  const handleSelectFavorite = (item) => {
    if (item.type === 'video') {
      setGeneratedVideoUrl(item.runtimeUrl || item.url);
      setIsVideoOpen(true);
      setIsFavoritesOpen(false);
      return;
    }

    setGeneratedOutfitUrl(item.url || item.image);
    setIsFavoritesOpen(false);
  };

  const handleDownload = async () => {
    if (!generatedOutfitUrl) return;
    const link = document.createElement('a');
    link.href = generatedOutfitUrl;
    link.download = `drape-outfit-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!generatedOutfitUrl) return;
    if (navigator.share) {
      try {
        const response = await fetch(generatedOutfitUrl);
        const blob = await response.blob();
        const file = new File([blob], 'outfit.jpg', { type: 'image/jpeg' });
        await navigator.share({
          files: [file],
          title: 'My Drape Outfit',
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert("Sharing not supported in this browser.");
    }
  };

  const handleVideo = () => {
    if (!generatedOutfitUrl) return;
    const run = async () => {
      setIsGenerating(true);
      try {
        const result = await runVideoGeneration({ sourceImage: generatedOutfitUrl });
        if (!result.ok) {
          alert("Video generation failed. Please try again.");
          return;
        }

        if (shouldRevokePreviousVideoUrl(generatedVideoUrl, favorites)) {
          URL.revokeObjectURL(generatedVideoUrl);
        }
        setGeneratedVideoUrl(result.videoUrl);
        setIsVideoOpen(true);
      } catch (error) {
        console.error("Video generation failed:", error);
        alert(`Video generation failed: ${error?.message || "Please try again."}`);
      } finally {
        setIsGenerating(false);
      }
    };

    run();
  };

  const handleCloseVideoModal = () => {
    setIsVideoOpen(false);
  };

  const handleSaveVideo = () => {
    downloadVideoFromUrl(generatedVideoUrl);
  };

  const handleShareVideo = async () => {
    if (!generatedVideoUrl) return;
    if (!navigator.share) {
      alert("Sharing not supported in this browser.");
      return;
    }

    try {
      const response = await fetch(generatedVideoUrl);
      const blob = await response.blob();
      const fileType = blob.type || 'video/mp4';
      const extension = fileType.includes('webm') ? 'webm' : 'mp4';
      const file = new File([blob], `drape-video-${Date.now()}.${extension}`, { type: fileType });

      await navigator.share({
        files: [file],
        title: 'My Drape Video Look'
      });
    } catch (error) {
      console.error("Video share failed:", error);
      alert("Video sharing failed. Please try again.");
    }
  };

  const handleFavoriteVideo = async () => {
    if (!generatedVideoUrl) return;
    setIsVideoOpen(false);
    if (!isCurrentVideoFavorite) {
      addVideoFavorite(generatedVideoUrl).catch((error) => {
        console.error('Video favorite failed:', error);
      });
    }
  };

  const handlePromptSendClick = async () => {
    setIsGenerating(true);
    try {
      const result = await runPromptTryOnGeneration({
        profilePhoto: profile?.photo,
        collection,
        selectedItemIds: selectedItems,
        userPrompt: customPrompt
      });

      if (result.ok) {
        setGeneratedOutfitUrl(result.image);
      } else {
        if (result.reason === "NO_COLLECTION") {
          alert("Please add some items to your collection first!");
        } else if (result.reason === "NO_SELECTED_ITEMS") {
          alert("Select at least one item from your collection to try on.");
        } else if (result.reason === "NO_PROMPT") {
          alert("Add stylist instructions, then press send.");
        } else if (result.reason === "NO_PROFILE_PHOTO") {
          alert("Please upload a profile photo first.");
        } else {
          alert("Prompt styling failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Prompt styling failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStylistCreateOutfit = async (intentText) => {
    if (!profile?.photo) {
      alert('Please upload a profile photo first.');
      return false;
    }
    if (!collection.length) {
      alert('Please add some items to your collection first.');
      return false;
    }

    const stylistSelectedIds = selectItemsForStylistIntent(collection, intentText);
    if (!stylistSelectedIds.length) return false;

    const selectedItems = collection.filter((item) => stylistSelectedIds.includes(item.id));
    const selectedItemSummary = selectedItems
      .map((item, index) => `item ${index + 1}: ${item.color || 'unknown color'} ${item.category || 'item'}`)
      .join(', ');

    setIsGenerating(true);
    setSelectedItems(stylistSelectedIds);
    try {
      const result = await runPromptTryOnGeneration({
        profilePhoto: profile.photo,
        collection,
        selectedItemIds: stylistSelectedIds,
        userPrompt: `User request: "${intentText}". Selected collection items: ${selectedItemSummary}. Use only these selected collection items. Do not introduce additional garments. Do not swap colors. Do not replace one selected item with another collection item. Do not invent missing pieces. If only one item is selected, that exact selected item must be the hero garment and must appear exactly as selected, preserving its color, silhouette, print, and visual identity. Keep the person identity unchanged. The final image must have a full-bleed solid pure black background edge-to-edge. Never use white background, gray side bars, side panels, studio flats, borders, frames, or extra background objects.`
      });

      if (result.ok) {
        setGeneratedOutfitUrl(result.image);
        setActiveTab('collection');
        return true;
      }

      alert('Stylist could not generate an outfit yet. Please try again.');
      return false;
    } catch (error) {
      console.error('Stylist outfit generation failed:', error);
      alert('Stylist outfit generation failed. Please try again.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWeekPlan = useCallback(async (targetWeekId = getCurrentWeekId()) => {
    setPlanError('');
    if (!profile?.photo) {
      setPlanError('Upload a profile photo first to generate your plan.');
      return;
    }
    if (!collection.length) {
      setPlanError('Add collection items first to generate your plan.');
      return;
    }

    setIsGenerating(true);
    const nextPlan = [];
    const failedDays = [];
    const recentSignatures = new Set(
      wearHistory
        .slice(-84)
        .map((entry) => entry?.signature)
        .filter(Boolean)
    );
    const lockedByDay = new Map(
      weekPlan
        .filter((entry) => entry?.locked && entry?.image)
        .map((entry) => [entry.day, entry])
    );
    try {
      for (const day of WEEK_DAYS) {
        if (lockedByDay.has(day.key)) {
          const locked = lockedByDay.get(day.key);
          if (locked?.selectedItemIds?.length) {
            recentSignatures.add(buildSelectionSignature(locked.selectedItemIds));
          }
          nextPlan.push({
            ...locked,
            day: day.key,
            dayLabel: day.label,
            createdAt: locked.createdAt || new Date().toISOString()
          });
          continue;
        }

        const dayIntent = `${planPreset} outfit for ${day.key}`;
        const selectedForDay = selectItemsForPlanDay(collection, dayIntent, planPreset, day.key, recentSignatures);
        if (!selectedForDay.length) {
          failedDays.push(day.label);
          continue;
        }

        const dayPrompt = `Create a polished ${planPreset.toLowerCase()} outfit suitable for ${day.key} using only these selected collection items. Keep styling cohesive, modern, and wearable. Keep the person identity unchanged and maintain a clean solid black background.`;
        try {
          const result = await runPromptTryOnGeneration({
            profilePhoto: profile.photo,
            collection,
            selectedItemIds: selectedForDay,
            userPrompt: dayPrompt
          });

          if (result.ok && result.image) {
            nextPlan.push({
              id: `${day.key}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              day: day.key,
              dayLabel: day.label,
              locked: false,
              image: result.image,
              selectedItemIds: selectedForDay,
              prompt: dayPrompt,
              createdAt: new Date().toISOString()
            });
            recentSignatures.add(buildSelectionSignature(selectedForDay));
          } else {
            failedDays.push(day.label);
          }
        } catch (error) {
          console.error(`Plan day generation failed for ${day.key}:`, error);
          failedDays.push(day.label);
        }
      }

      if (!nextPlan.length) {
        setPlanError('Plan generation failed. Try again.');
        return;
      }

      const nextMeta = {
        weekId: targetWeekId,
        generatedAt: new Date().toISOString()
      };
      persistWeekPlan(nextPlan, nextMeta, setWeekPlan, setWeekPlanMeta);
      const historyEntries = nextPlan
        .filter((entry) => entry?.selectedItemIds?.length)
        .map((entry) => ({
          weekId: targetWeekId,
          day: entry.day,
          preset: planPreset,
          signature: buildSelectionSignature(entry.selectedItemIds),
          createdAt: new Date().toISOString()
        }));
      if (historyEntries.length) {
        const mergedHistory = [...wearHistory, ...historyEntries].slice(-300);
        setWearHistory(mergedHistory);
        localStorage.setItem(WEAR_HISTORY_KEY, JSON.stringify(mergedHistory));
      }
      if (failedDays.length === 0) {
        setPlanError('');
      } else if (failedDays.length < WEEK_DAYS.length) {
        setPlanError(`Partial plan generated. Missing: ${failedDays.join(', ')}.`);
      } else {
        setPlanError('Plan generation failed. Try again.');
      }
    } catch (error) {
      console.error('Week plan generation failed:', error);
      setPlanError('Plan generation failed. Try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [profile?.photo, collection, weekPlan, wearHistory, planPreset]);

  const handleRegeneratePlanDay = useCallback(async (dayKey) => {
    if (!dayKey) return;
    setPlanError('');
    if (!profile?.photo) {
      setPlanError('Upload a profile photo first to regenerate a day.');
      return;
    }
    if (!collection.length) {
      setPlanError('Add collection items first to regenerate a day.');
      return;
    }

    const dayInfo = WEEK_DAYS.find((day) => day.key === dayKey);
    if (!dayInfo) return;

    setIsGenerating(true);
    try {
      const selectedForDay = selectItemsForPlanDay(collection, `${planPreset} outfit for ${dayKey}`, planPreset, dayKey, new Set(
        wearHistory.slice(-84).map((entry) => entry?.signature).filter(Boolean)
      ));
      if (!selectedForDay.length) {
        setPlanError(`Unable to regenerate ${dayInfo.label}.`);
        return;
      }

      const dayPrompt = `Create a polished ${planPreset.toLowerCase()} outfit suitable for ${dayKey} using only these selected collection items. Keep styling cohesive, modern, and wearable. Keep the person identity unchanged and maintain a clean solid black background.`;
      const result = await runPromptTryOnGeneration({
        profilePhoto: profile.photo,
        collection,
        selectedItemIds: selectedForDay,
        userPrompt: dayPrompt
      });

      if (!result.ok || !result.image) {
        setPlanError(`Unable to regenerate ${dayInfo.label}.`);
        return;
      }

      const updatedPlan = WEEK_DAYS.map((day) => {
        if (day.key === dayKey) {
          const existing = weekPlan.find((entry) => entry.day === day.key);
          return {
            id: existing?.id || `${day.key}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            day: day.key,
            dayLabel: day.label,
            image: result.image,
            selectedItemIds: selectedForDay,
            prompt: dayPrompt,
            locked: false,
            createdAt: new Date().toISOString()
          };
        }
        return weekPlan.find((entry) => entry.day === day.key) || null;
      }).filter(Boolean);

      const nextMeta = {
        weekId: weekPlanMeta?.weekId || getCurrentWeekId(),
        generatedAt: new Date().toISOString()
      };
      persistWeekPlan(updatedPlan, nextMeta, setWeekPlan, setWeekPlanMeta);
      if (selectedForDay.length) {
        const mergedHistory = [
          ...wearHistory,
          {
            weekId: nextMeta.weekId,
            day: dayKey,
            preset: planPreset,
            signature: buildSelectionSignature(selectedForDay),
            createdAt: new Date().toISOString()
          }
        ].slice(-300);
        setWearHistory(mergedHistory);
        localStorage.setItem(WEAR_HISTORY_KEY, JSON.stringify(mergedHistory));
      }
      setPlanError('');
    } catch (error) {
      console.error(`Regenerate day failed for ${dayKey}:`, error);
      setPlanError(`Unable to regenerate ${dayInfo.label}.`);
    } finally {
      setIsGenerating(false);
    }
  }, [profile?.photo, collection, weekPlan, weekPlanMeta?.weekId, wearHistory, planPreset]);

  const handleToggleLockPlanDay = useCallback((dayKey) => {
    const updatedPlan = weekPlan.map((entry) => (
      entry.day === dayKey ? { ...entry, locked: !entry.locked } : entry
    ));
    const nextMeta = {
      weekId: weekPlanMeta?.weekId || getCurrentWeekId(),
      generatedAt: weekPlanMeta?.generatedAt || new Date().toISOString()
    };
    persistWeekPlan(updatedPlan, nextMeta, setWeekPlan, setWeekPlanMeta);
  }, [weekPlan, weekPlanMeta?.generatedAt, weekPlanMeta?.weekId]);

  const handleAddAllPlanToFavorites = useCallback(() => {
    const addedCount = addImagesToFavorites(weekPlan.map((entry) => entry.image));
    if (addedCount === 0) {
      setPlanError('All plan looks are already in Favorites.');
      return;
    }
    setPlanError('');
    setIsFavoritesOpen(true);
  }, [weekPlan, favorites]);

  const handleExportPlanCalendar = useCallback(() => {
    if (!weekPlan.length) {
      setPlanError('Generate a plan first, then export calendar.');
      return;
    }
    try {
      const weekId = weekPlanMeta?.weekId || getCurrentWeekId();
      const icsContent = buildPlanCalendarICS({ weekPlan, planPreset, weekId });
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drape-plan-${weekId}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setPlanError('');
    } catch (error) {
      console.error('Calendar export failed:', error);
      setPlanError('Calendar export failed. Try again.');
    }
  }, [weekPlan, planPreset, weekPlanMeta?.weekId]);

  const handleChangePlanPreset = useCallback((nextPreset) => {
    if (!PLAN_PRESETS.includes(nextPreset)) return;
    setPlanPreset(nextPreset);
    localStorage.setItem(WEEK_PLAN_PRESET_KEY, nextPreset);
  }, []);

  useEffect(() => {
    if (weekPlan.length >= WEEK_DAYS.length && !isGenerating && planError) {
      setPlanError('');
    }
  }, [weekPlan.length, isGenerating, planError]);

  const handleSelectPlanLook = (planItem) => {
    if (!planItem?.image) return;
    setGeneratedOutfitUrl(planItem.image);
    setActiveTab('collection');
    setIsPlanOpen(false);
  };

  useEffect(() => {
    if (!isPlanOpen || !isComplete || isGenerating) return;
    if (!profile?.photo || !collection.length) return;

    const currentWeekId = getCurrentWeekId();
    const isCurrentWeekReady = weekPlanMeta?.weekId === currentWeekId && weekPlan.length > 0;
    if (isCurrentWeekReady) return;
    if (autoPlanAttemptRef.current === currentWeekId) return;

    autoPlanAttemptRef.current = currentWeekId;
    handleGenerateWeekPlan(currentWeekId);
  }, [
    isPlanOpen,
    isComplete,
    isGenerating,
    profile?.photo,
    collection.length,
    weekPlanMeta?.weekId,
    weekPlan.length,
    handleGenerateWeekPlan
  ]);

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', opacity: 0.85 }}>
          <img src={drapeLogo} alt="Drape" className="app-logo" style={{ marginBottom: '1rem' }} />
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!isComplete) {
    return <Onboarding onComplete={(data) => {
      saveProfile(data);
      setActiveTab('collection');
    }} onSkip={skipOnboarding} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <img src={drapeLogo} alt="Drape" className="app-logo" />
        </div>
      </header>

      <main className="workspace-layout">
        <aside className="sidebar-column">
          <nav className="nav-menu">
            <div className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => setActiveTab('shop')}>Shop</div>
            <div className={`nav-item ${activeTab === 'collection' ? 'active' : ''}`} onClick={() => setActiveTab('collection')}>Collection</div>
            <div className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setIsFavoritesOpen(true)}>Favorites</div>
            <div className={`nav-item ${isPlanOpen ? 'active' : ''}`} onClick={() => setIsPlanOpen(true)}>Plan</div>
            <div className="nav-divider" style={{ margin: '1rem 0', opacity: 0.1, borderTop: '1px solid currentColor' }} />
            <div className="nav-item" onClick={() => setIsCollectionOpen(true)}>Collection Items</div>
            <div className="nav-item nav-item-with-icon" onClick={() => setIsStylistOpen(true)}>
              <span>Stylist</span>
              <span className="action-icon sidebar-inline-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
                  <path d="M19 12a7 7 0 0 1-14 0" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </span>
            </div>
            <div className="nav-item" onClick={() => setIsProfileOpen(true)}>Profile</div>
            <div className="nav-item">Settings</div>
            <div className="reset-container" style={{ marginTop: 'auto', padding: '1rem' }}>
              <button className="reset-link-btn reset-icon-btn action-icon" onClick={clearProfile} title="Reset Onboarding" aria-label="Reset Onboarding">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18 9 12l6-6" />
                </svg>
              </button>
            </div>
          </nav>
        </aside>

        <section className="main-column">
          {activeTab !== 'shop' && (
            <Preview
              photo={currentPreviewImage}
              isGenerating={isGenerating}
              hasGeneratedOutfit={!!generatedOutfitUrl}
              onUndo={handleUndoOutfit}
              onRemix={handleRemixOutfit}
              onVideo={handleVideo}
              onDownload={handleDownload}
              onShare={handleShare}
              onFavorite={generatedOutfitUrl ? handleFavorite : null}
              isFavorite={isCurrentFavorite}
              isVideoFavorite={isCurrentVideoFavorite}
            />
          )}
        </section>

        <aside className="stylist-column">
          {activeTab === 'collection' ? (
            <>
              <div className="stylist-header">
                <div className="header-top" style={{ gap: '1rem' }}>
                  <button className="action-icon" onClick={handleMagicWandClick} disabled={isGenerating}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M15 9h0M17.8 6.2 19 5M3 21 12-9M12.2 6.2 11 5" />
                    </svg>
                  </button>
                  <button className="action-icon" onClick={() => setIsUploadOpen(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8 12 3 7 8M12 3v12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="scroll-area">
                <Collection
                  collection={collection}
                  onRemove={removeItem}
                  selectedItems={selectedItems}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
              <div className="custom-prompt-container">
                <textarea
                  className="stylist-prompt-input"
                  placeholder="Select pieces from your collection, then add styling instructions..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
                <button className="stylist-send-btn action-icon" onClick={handlePromptSendClick} disabled={isGenerating}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>Coming soon...</div>
          )}
        </aside>
      </main>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onAdd={addItem} gender={profile?.gender} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} profile={profile} onSave={saveProfile} ev={true} />
      <CollectionModal isOpen={isCollectionOpen} onClose={() => setIsCollectionOpen(false)} collection={collection} onRemove={removeItem} onAddClick={() => { setIsCollectionOpen(false); setIsUploadOpen(true); }} />
      <FavoritesModal isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} favorites={favorites} onRemove={removeFavorite} onSelect={handleSelectFavorite} />
      <PlanModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        weekPlan={weekPlan}
        onGenerate={handleGenerateWeekPlan}
        onRegenerateDay={handleRegeneratePlanDay}
        onToggleLockDay={handleToggleLockPlanDay}
        onAddAllToFavorites={handleAddAllPlanToFavorites}
        onExportCalendar={handleExportPlanCalendar}
        planPreset={planPreset}
        presets={PLAN_PRESETS}
        onPresetChange={handleChangePlanPreset}
        isGenerating={isGenerating}
        onSelect={handleSelectPlanLook}
        planError={planError}
        days={WEEK_DAYS}
      />
      <StylistModal
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        collection={collection}
        profile={profile}
        onCreateOutfitFromIntent={handleStylistCreateOutfit}
      />
      <VideoModal
        isOpen={isVideoOpen}
        onClose={handleCloseVideoModal}
        videoUrl={generatedVideoUrl}
        onDownload={handleSaveVideo}
        onShare={handleShareVideo}
        onFavorite={handleFavoriteVideo}
        isFavorite={isCurrentVideoFavorite}
      />
    </div>
  );
}

export default App;
