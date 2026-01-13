import { MediaItem } from "../types";

const STORAGE_KEY = 'otaku-log-data-v1';

export const getStoredItems = (): MediaItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load data", error);
    return [];
  }
};

export const saveItems = (items: MediaItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save data", error);
  }
};