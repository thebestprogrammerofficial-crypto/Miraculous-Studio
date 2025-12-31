
import { Show, Episode, UserSettings } from '../types';

const STORAGE_KEY = 'miraculous_studio_shows_v3';
const SETTINGS_KEY = 'miraculous_studio_settings_v1';

// Default Settings
const DEFAULT_SETTINGS: UserSettings = {
    useAutoKey: true,
    customApiKey: '',
    scriptModel: 'gemini-3-flash-preview',
    imageModel: 'gemini-2.5-flash-image',
    userName: 'Guardian',
    darkMode: false,
    accentColor: 'red'
};

// Helper to migrate old data if needed
const migrateData = (data: any[]): Show[] => {
  return data.map(d => ({
    ...d,
    maxSeason: d.maxSeason || d.season || 1,
    isFavorite: d.isFavorite || false, // Default to false if missing
    episodes: d.episodes.map((e: any, idx: number) => ({
      ...e,
      seasonNumber: e.seasonNumber || 1,
      order: e.order || idx + 1,
      postCreditScene: e.postCreditScene || '',
      imageUrl: e.imageUrl || undefined,
      imagePrompt: e.imagePrompt || undefined
    }))
  }));
};

export const getShows = (): Show[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return migrateData(parsed);
  } catch (error) {
    console.error("Failed to load shows", error);
    return [];
  }
};

// Force save to ensure persistence
const persist = (shows: Show[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shows));
    } catch (e) {
        console.error("Storage limit reached?", e);
        alert("Warning: Local storage is full. Some images or data might not save.");
    }
};

export const saveShow = (newShow: Show): void => {
  const shows = getShows();
  const updatedShows = [newShow, ...shows];
  persist(updatedShows);
};

export const updateShow = (updatedShow: Show): void => {
    const shows = getShows();
    const index = shows.findIndex(s => s.id === updatedShow.id);
    if (index !== -1) {
        shows[index] = updatedShow;
        persist(shows);
    }
}

export const toggleFavorite = (showId: string): void => {
    const shows = getShows();
    const showIndex = shows.findIndex(s => s.id === showId);
    if (showIndex > -1) {
        shows[showIndex].isFavorite = !shows[showIndex].isFavorite;
        persist(shows);
    }
}

export const deleteShow = (showId: string): void => {
  const shows = getShows();
  const updatedShows = shows.filter(s => s.id !== showId);
  persist(updatedShows);
};

export const addEpisodeToShow = (showId: string, episode: Episode): void => {
  const shows = getShows();
  const showIndex = shows.findIndex(s => s.id === showId);
  if (showIndex > -1) {
    shows[showIndex].episodes.push(episode);
    persist(shows);
  }
};

export const updateEpisode = (showId: string, updatedEpisode: Episode): void => {
    const shows = getShows();
    const showIndex = shows.findIndex(s => s.id === showId);
    if (showIndex > -1) {
        const epIndex = shows[showIndex].episodes.findIndex(e => e.id === updatedEpisode.id);
        if (epIndex > -1) {
            shows[showIndex].episodes[epIndex] = updatedEpisode;
            persist(shows);
        }
    }
}

export const getShowById = (showId: string): Show | undefined => {
  const shows = getShows();
  return shows.find(s => s.id === showId);
};

export const createNewSeason = (showId: string): void => {
    const shows = getShows();
    const showIndex = shows.findIndex(s => s.id === showId);
    if (showIndex > -1) {
        shows[showIndex].maxSeason = (shows[showIndex].maxSeason || 1) + 1;
        persist(shows);
    }
}

// --- Settings Management ---

export const getSettings = (): UserSettings => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (!data) return DEFAULT_SETTINGS;
        const parsed = JSON.parse(data);
        return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = (settings: UserSettings): void => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save settings", e);
    }
};
