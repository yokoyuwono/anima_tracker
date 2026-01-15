import { MediaItem } from "../types";

const API_URL = '/api/items';
const STORAGE_KEY = 'animanga_data_backup';

// Flag to track if we should use local storage (Offline/Fallback mode)
let isOffline = false;

// Helper to access local storage safely
const getLocalData = (): MediaItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn("LocalStorage access failed", e);
    return [];
  }
};

const saveLocalData = (items: MediaItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("LocalStorage save failed", e);
  }
};

export const getStoredItems = async (): Promise<MediaItem[]> => {
  // If we already detected offline mode, skip API
  if (isOffline) return getLocalData();

  try {
    const res = await fetch(API_URL);
    
    // Check for network errors (4xx/5xx)
    // 404 happens if running locally without Vercel Dev
    // 500 happens if MongoDB URI is missing
    if (!res.ok) {
      console.warn(`Backend unavailable (Status ${res.status}). Switching to LocalStorage fallback.`);
      isOffline = true;
      return getLocalData();
    }

    const data = await res.json();
    // Cache data locally for future offline usage
    saveLocalData(data);
    return data;
  } catch (error) {
    console.warn("Network error. Switching to LocalStorage fallback.", error);
    isOffline = true;
    return getLocalData();
  }
};

export const createItem = async (item: MediaItem) => {
  // Always update local cache first/fallback
  if (isOffline) {
    const items = getLocalData();
    saveLocalData([item, ...items]);
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('API Create Failed');
  } catch (error) {
    console.error("API Error, saving locally", error);
    isOffline = true;
    const items = getLocalData();
    saveLocalData([item, ...items]);
  }
};

export const updateItem = async (item: MediaItem) => {
  if (isOffline) {
    const items = getLocalData();
    const newItems = items.map(i => i.id === item.id ? item : i);
    saveLocalData(newItems);
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('API Update Failed');
  } catch (error) {
    console.error("API Error, saving locally", error);
    isOffline = true;
    const items = getLocalData();
    const newItems = items.map(i => i.id === item.id ? item : i);
    saveLocalData(newItems);
  }
};

export const deleteItem = async (id: string) => {
  if (isOffline) {
    const items = getLocalData();
    saveLocalData(items.filter(i => i.id !== id));
    return;
  }

  try {
    await fetch(`${API_URL}?id=${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error("API Error, saving locally", error);
    isOffline = true;
    const items = getLocalData();
    saveLocalData(items.filter(i => i.id !== id));
  }
};

export const saveItems = (items: MediaItem[]) => {
  // Legacy support or manual sync if needed
  saveLocalData(items);
};