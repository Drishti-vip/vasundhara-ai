import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, SafeAreaView, TextInput
} from 'react-native';
import { COLORS } from '../constants/theme';
import { Storage, USER_KEYS } from '../utils/storage';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assistantName, setAssistantName] = useState('Vasundhara');
  const [callMe, setCallMe] = useState('Boss');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const s = await Storage.get(USER_KEYS.settings);
    const p = await Storage.get(USER_KEYS.profile);
    setSettings(s || {});
    setProfile(p || {});
    setAssistantName(s?.assistantName || 'Vasundhara');
    setCallMe(p?.callMe || 'Boss');
  };

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await Storage.set(USER_KEYS.settings, updated);
  };

  const saveNames = async () => {
    await Storage.set(USER_KEYS.settings, { ...settings, assistantName });
    await Storage.set(USER_KEYS.profile, { ...profile, callMe });
  };

  const CALL_OPTIONS = ['Boss', 'Yaar', 'Bhai', 'Jaan', 'King'];
  const MODES = [
    { key: 'friend', label: '😎 Dost', desc: 'Casual & fun' },
    { key: 'professional', label: '👔 Professional', desc: 'Smart & formal' },
    { key: 'motivator', label: '💪 Motivator', desc: 'Energy & push' },
    { key: 'adult', label: '🔞 No Filter', desc: 'PIN protected' },
  ];

  if (!settings) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌸 Identity</Text>
          <Text style={styles.label}>Assistant ka naam</Text>
          <TextInput
            style={styles.input}
            value={assistantName}
            onChangeText={setAssistantName}
            onBlur={saveNames}
            placeholder="Vasundhara"
            placeholderTextColor={COLORS.textMuted}
          />
          <Text style={styles.label}>Mujhe bulao</Text>
          <View style={styles.optionRow}>
            {CALL_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, callMe === opt && styles.chipSelected]}
                onPress={() => { setCallMe(opt); saveNames(); }}
              >
                <Text style={[styles.chipText, callMe === opt && styles.chipTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            value={CALL_OPTIONS.includes(callMe) ? '' : callMe}
            onChangeText={setCallMe}
            onBlur={saveNames}
            placeholder="Ya custom likho..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Personality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎭 Personality</Text>
          {MODES.map(mode => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.modeBtn, settings.personalityMode === mode.key && styles.modeBtnSelected]}
              onPress={() => updateSetting('personalityMode', mode.key)}
            >
              <View>
                <Text style={styles.modeLabel}>{mode.label}</Text>
                <Text style={styles.modeDesc}>{mode.desc}</Text>
              </View>
              {settings.personalityMode === mode.key && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Features</Text>
          {[
            { key: 'proactiveChat', label: 'Khud baat kare', desc: 'Vasundhara khud message kare', icon: '💬' },
            { key: 'autoCall', label: 'Auto Call Receive', desc: 'Call khud uthaye', icon: '📞', warn: true },
            { key: 'nightGuardian', label: 'Night Guardian', desc: 'Raat mein sirf family', icon: '🌙' },
            { key: 'spamBlock', label: 'Spam Block', desc: 'Unknown calls filter kare', icon: '🛡️' },
            { key: 'voiceCamera', label: 'Voice Camera', desc: '"Photo khich" bolne par', icon: '📸' },
            { key: 'autoReply', label: 'Auto Reply', desc: 'Messages ka reply kare', icon: '↩️' },
          ].map(item => (
            <View key={item.key} style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <Text style={styles.toggleDesc}>{item.desc}</Text>
                  {item.warn && <Text style={styles.toggleWarn}>⚠️ Battery use hogi</Text>}
                </View>
              </View>
              <Switch
                value={settings[item.key] || false}
                onValueChange={(val) => updateSetting(item.key, val)}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.text}
              />
            </View>
          ))}
        </View>

        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔋 Performance</Text>
          {[
            { key: 'batterySaver', label: '🔋 Battery Saver', desc: 'Sirf app khula ho tab' },
            { key: 'normal', label: '⚡ Normal', desc: 'Thoda background' },
            { key: 'fullPower', label: '🚀 Full Power', desc: 'Hamesha active ⚠️ Battery fast' },
          ].map(mode => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.modeBtn, settings.powerMode === mode.key && styles.modeBtnSelected]}
              onPress={() => updateSetting('powerMode', mode.key)}
            >
              <View>
                <Text style={styles.modeLabel}>{mode.label}</Text>
                <Text style={styles.modeDesc}>{mode.desc}</Text>
              </View>
              {settings.powerMode === mode.key && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Advanced</Text>
          {[
            { label: '🔑 API Keys (5 Slots)', screen: 'ApiVault' },
            { label: '📝 History', screen: 'History' },
          ].map(item => (
            <TouchableOpacity
              key={item.screen}
              style={styles.navBtn}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.navBtnText}>{item.label}</Text>
              <Text style={styles.navArrow}>→</Text>
            </TouchableOpacity>
          ))}
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
  section: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8, marginTop: 8 },
  input: { backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 14 },
  chipTextSelected: { color: COLORS.text, fontWeight: '600' },
  modeBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8, backgroundColor: COLORS.card },
  modeBtnSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '20' },
  modeLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  modeDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  check: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  toggleIcon: { fontSize: 22 },
  toggleLabel: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  toggleDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  toggleWarn: { color: COLORS.warning, fontSize: 11, marginTop: 2 },
  navBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  navBtnText: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  navArrow: { color: COLORS.primary, fontSize: 18 },
});
