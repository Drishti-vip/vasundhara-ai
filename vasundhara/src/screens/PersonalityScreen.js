import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, TextInput
} from 'react-native';
import { COLORS } from '../constants/theme';
import { Storage, USER_KEYS } from '../utils/storage';

export default function PersonalityScreen({ navigation }) {
  const [settings, setSettings] = useState({});

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const s = await Storage.get(USER_KEYS.settings);
    setSettings(s || {});
  };

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await Storage.set(USER_KEYS.settings, updated);
  };

  const LANGUAGES = ['Hinglish', 'Hindi', 'English'];
  const VOICES = [
    { key: 'natural', label: '🎙 Natural Hindi', desc: 'Smooth aur clear' },
    { key: 'warm', label: '💕 Warm Female', desc: 'Caring aur soft' },
    { key: 'energetic', label: '⚡ Energetic', desc: 'Fun aur lively' },
    { key: 'custom', label: '🎤 Custom Clone', desc: 'Apni awaaz upload karo' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎭 Personality</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗣️ Language</Text>
          <View style={styles.row}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang}
                style={[styles.chip, settings.language === lang.toLowerCase() && styles.chipSelected]}
                onPress={() => updateSetting('language', lang.toLowerCase())}
              >
                <Text style={[styles.chipText, settings.language === lang.toLowerCase() && styles.chipTextSelected]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎙️ Voice Style</Text>
          {VOICES.map(v => (
            <TouchableOpacity
              key={v.key}
              style={[styles.voiceBtn, settings.voiceStyle === v.key && styles.voiceBtnSelected]}
              onPress={() => updateSetting('voiceStyle', v.key)}
            >
              <View>
                <Text style={styles.voiceLabel}>{v.label}</Text>
                <Text style={styles.voiceDesc}>{v.desc}</Text>
              </View>
              {settings.voiceStyle === v.key && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Speed & Pitch</Text>
          <Text style={styles.sliderLabel}>Speed: Normal</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: '50%' }]} />
            <View style={styles.sliderThumb} />
          </View>
          <Text style={styles.sliderLabel}>Pitch: Normal</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: '50%' }]} />
            <View style={styles.sliderThumb} />
          </View>
        </View>

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
  section: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 14 },
  chipTextSelected: { color: COLORS.text, fontWeight: '600' },
  voiceBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8, backgroundColor: COLORS.card },
  voiceBtnSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '20' },
  voiceLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  voiceDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  check: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  sliderLabel: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8, marginTop: 8 },
  sliderTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, position: 'relative' },
  sliderFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  sliderThumb: { position: 'absolute', right: '50%', top: -7, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.text, borderWidth: 2, borderColor: COLORS.primary },
});
