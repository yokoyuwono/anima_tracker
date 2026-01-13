export enum MediaType {
  ANIME = 'Anime',
  MANGA = 'Manga'
}

export enum MediaStatus {
  CURRENT = 'Sedang Jalan',
  COMPLETED = 'Selesai',
  PLANNING = 'Rencana',
  DROPPED = 'Dibatalkan' // Dropped
}

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  currentProgress: number; // Episode or Chapter
  totalProgress?: number; // Total Episodes or Chapters (optional)
  rating: number; // 0-10
  imageUrl?: string;
  genres?: string[];
  description?: string;
  link?: string; // URL for reading/watching
  updatedAt: number;
}

export interface AIEnrichmentResponse {
  genres: string[];
  description: string;
  totalEpisodesOrChapters: number;
}

export interface AIRecommendation {
  title: string;
  type: MediaType;
  reason: string;
  genres: string[];
}