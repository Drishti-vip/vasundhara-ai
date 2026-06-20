import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
  set: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error('Storage set error:', e); }
  },
  get: async (key) => {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) { return null; }
  },
  remove: async (key) => {
    try { await AsyncStorage.removeItem(key); } 
    catch (e) { console.error('Storage remove error:', e); }
  },
  clear: async () => {
    try { await AsyncStorage.clear(); } 
    catch (e) { console.error('Storage clear error:', e); }
  }
};

export const USER_KEYS = {
  profile: 'vasundhara_user_profile',
  apiSlots: 'vasundhara_api_slots',
  settings: 'vasundhara_settings',
  memory: 'vasundhara_memory',
  conversations: 'vasundhara_conversations',
};
