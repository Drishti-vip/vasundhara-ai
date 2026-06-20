import { Linking } from 'react-native';

export const ActionEngine = {
  makeCall: (number) => {
    Linking.openURL(`tel:${number}`);
  },

  openWhatsApp: (number, message = '') => {
    const msg = encodeURIComponent(message);
    Linking.openURL(`whatsapp://send?phone=${number}&text=${msg}`);
  },

  openSpotify: (query = '') => {
    if (query) {
      Linking.openURL(`spotify:search:${encodeURIComponent(query)}`);
    } else {
      Linking.openURL('spotify://');
    }
  },

  openYouTube: (query = '') => {
    if (query) {
      Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
    } else {
      Linking.openURL('https://www.youtube.com');
    }
  },

  openMaps: (query = '') => {
    Linking.openURL(`maps://?q=${encodeURIComponent(query)}`);
  },

  openInstagram: () => {
    Linking.openURL('instagram://');
  },

  openBrowser: (query) => {
    Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
  },

  extractContact: (text) => {
    const words = text.split(' ');
    const nameIndex = words.findIndex(w => 
      ['ko', 'se', 'ka', 'ki'].includes(w.toLowerCase())
    );
    if (nameIndex > 0) return words[nameIndex - 1];
    return null;
  },

  extractQuery: (text, keyword) => {
    const idx = text.toLowerCase().indexOf(keyword);
    if (idx !== -1) return text.substring(idx + keyword.length).trim();
    return text;
  }
};
