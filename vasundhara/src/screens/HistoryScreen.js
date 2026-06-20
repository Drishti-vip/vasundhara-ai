import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Alert
} from 'react-native';
import { COLORS } from '../constants/theme';
import { Storage, USER_KEYS } from '../utils/storage';

export default function HistoryScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const data = await Storage.get(USER_KEYS.conversations);
    if (data) setConversations(data.reverse());
  };

  const clearHistory = () => {
    Alert.alert('History Clear', 'Sab conversations delete karein?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive',
        onPress: async () => {
          await Storage.remove(USER_KEYS.conversations);
          setConversations([]);
        }
      }
    ]);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📝 History</Text>
        <TouchableOpacity onPress={clearHistory}>
          <Text style={styles.clearAll}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
        {conversations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌸</Text>
            <Text style={styles.emptyText}>Abhi koi conversation nahi hai</Text>
            <Text style={styles.emptySubText}>Vasundhara se baat karo!</Text>
          </View>
        ) : (
          conversations.map((msg, i) => (
            <View key={i} style={[
              styles.bubble,
              msg.role === 'user' ? styles.userBubble : styles.vBubble
            ]}>
              <Text style={styles.bubbleSender}>
                {msg.role === 'user' ? '👤 Tum' : '🌸 Vasundhara'}
              </Text>
              <Text style={styles.bubbleText}>{msg.content}</Text>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  back: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  clearAll: { color: COLORS.error, fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { color: COLORS.text, fontSize: 18, fontWeight: '600' },
  emptySubText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 8 },
  bubble: { padding: 14, borderRadius: 16, marginBottom: 10 },
  userBubble: { backgroundColor: COLORS.primary + '30', borderWidth: 1, borderColor: COLORS.primary + '50' },
  vBubble: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  bubbleSender: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', marginBottom: 6 },
  bubbleText: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
});
