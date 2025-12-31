
export interface Episode {
  id: string;
  seasonNumber: number;
  order: number;
  title: string;
  premise: string;
  script: string;
  postCreditScene: string;
  imageUrl?: string; // Base64 image data
  imagePrompt?: string; // Specific prompt for image generation
  createdAt: number;
}

export interface Show {
  id: string;
  title: string;
  description: string;
  episodes: Episode[];
  maxSeason: number;
  theme: 'ladybug' | 'catnoir';
  isFavorite: boolean;
  createdAt: number;
}

export interface UserSettings {
  useAutoKey: boolean;
  customApiKey: string;
  scriptModel: string;
  imageModel: string;
  // UI Customization
  userName: string;
  darkMode: boolean;
  accentColor: 'red' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink';
}

export type ViewState = 
  | { type: 'HOME' }
  | { type: 'SHOWS' }
  | { type: 'FAVORITES' }
  | { type: 'DESIGN' } // New Design View
  | { type: 'SETTINGS' }
  | { type: 'UPGRADE' }
  | { type: 'CREATE_SHOW' }
  | { type: 'SHOW_DETAIL'; showId: string }
  | { type: 'CREATE_EPISODE'; showId: string; seasonNumber: number; nextOrder: number }
  | { type: 'VIEW_EPISODE'; showId: string; episodeId: string };
