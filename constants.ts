import { MediaStatus, MediaType } from "./types";

export const STATUS_COLORS = {
  [MediaStatus.CURRENT]: 'bg-green-500 text-white',
  [MediaStatus.COMPLETED]: 'bg-blue-500 text-white',
  [MediaStatus.PLANNING]: 'bg-yellow-500 text-white',
  [MediaStatus.DROPPED]: 'bg-red-500 text-white',
};

export const TYPE_COLORS = {
  [MediaType.ANIME]: 'bg-purple-600 text-white',
  [MediaType.MANGA]: 'bg-orange-500 text-white',
};

export const MOCK_COVER_IMAGE = "https://picsum.photos/300/450";

export const DEFAULT_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports"
];