// Add this at the very top
import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '../constants/constants';

let notesCache = [];
let isInitialized = false;
let lastSave = Date.now();
let saveTimeout = null;

// Initialize Database with in-memory cache and auto-recovery
export const initDB = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_NOTES);
    notesCache = data ? JSON.parse(data) : [];
    
    if (!Array.isArray(notesCache)) {
      console.warn('Corrupt storage detected. Resetting notes.');
      notesCache = [];
      await AsyncStorage.setItem(STORAGE_KEYS.USER_NOTES, JSON.stringify([]));
    }
    
    isInitialized = true;
    console.log(`Database initialized with ${notesCache.length} notes`);
  } catch (error) {
    console.error('Database initialization failed:', error);
    notesCache = [];
    isInitialized = false;
  }
};

// Debounced save function with forced max delay
const debouncedSave = () => {
  clearTimeout(saveTimeout);
  const now = Date.now();
  
  saveTimeout = setTimeout(async () => {
    if (now - lastSave >= 5000) { // Force save every 5s max
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_NOTES, JSON.stringify(notesCache));
        lastSave = Date.now();
      } catch (error) {
        console.error('Debounced save failed:', error);
      }
    }
  }, 500);
};

// CRUD Operations
export const addNote = (title, content, tag = 'personal') => {
  if (!isInitialized) throw new Error('Database not initialized');

  const newNote = {
    id: uuidv4(),
    title: title.trim() || 'Untitled',
    content,
    tag,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: false,
  };

  notesCache.unshift(newNote);
  debouncedSave();
  return newNote;
};

export const getNoteById = (id) => {
  if (!isInitialized) throw new Error('Database not initialized');
  return notesCache.find(note => note.id === id) || null;
};

export const getAllNotes = () => {
  if (!isInitialized) throw new Error('Database not initialized');
  return [...notesCache];
};

export const deleteNote = (id) => {
  if (!isInitialized) throw new Error('Database not initialized');
  const initialLength = notesCache.length;
  notesCache = notesCache.filter(note => note.id !== id);
  if (notesCache.length !== initialLength) {
    debouncedSave();
    return true;
  }
  return false;
};

export const updateNote = (id, updates) => {
  if (!isInitialized) throw new Error('Database not initialized');

  const index = notesCache.findIndex(note => note.id === id);
  if (index === -1) return null;

  const updatedNote = {
    ...notesCache[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  notesCache[index] = updatedNote;
  debouncedSave();
  return updatedNote;
};

// Utility functions
export const createNewNote = () => {
  return addNote('Untitled', '', 'personal');
};

export const togglePinNote = (id) => {
  const note = getNoteById(id);
  if (!note) return null;
  return updateNote(id, { isPinned: !note.isPinned });
};

export const searchNotes = (query) => {
  if (!isInitialized) throw new Error('Database not initialized');
  const searchTerm = query.toLowerCase().replace(/[^\w\s]/gi, '');
  
  return notesCache.filter(note =>
    note.title.toLowerCase().includes(searchTerm) ||
    note.content.toLowerCase().includes(searchTerm)
  );
};

export const clearAllNotes = async () => {
  if (!isInitialized) throw new Error('Database not initialized');
  notesCache = [];
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NOTES, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error('Failed to clear notes:', error);
    return false;
  }
};

export const forceSyncStorage = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NOTES, JSON.stringify(notesCache));
    return true;
  } catch (error) {
    console.error('Force sync failed:', error);
    return false;
  }
};
