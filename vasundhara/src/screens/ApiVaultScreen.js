import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, SafeAreaView, Alert
} from 'react-native';
import { COLORS } from '../constants/theme';
import { Storage, USER_KEYS } from '../utils/storage';
import { detectAPIProvider, SLOT_TYPES } from '../utils/apiDetector';

export default function ApiVaultScreen({ navigation }) {
  const [slots, setSlots] = useState({ slot1: {}, slot2: {}, slot3: {}, slot4: {}, slot5: {} });
  const [showKey, setShowKey] = useState({});

  useEffect(() => { loadSlots(); }, []);

  const loadSlots = async () => {
    const saved = await Storage.get(USER_KEYS.apiSlots);
    if (saved) setSlots(saved);
  };

  const handleKeyChange = async (slotKey, value) => {
    const detected = detectAPIProvider(value);
    const updated = {
      ...slots,
      [slotKey]: { key: value, ...detected }
    };
    setSlots(updated);
    await Storage.set(USER_KEYS.apiSlots, updated);
  };

  const clearSlot = async (slotKey) => {
    Alert.alert('Clear Slot', 'Key delete karein?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = { ...slots, [slotKey]: {} };
          setSlots(updated);
          await Storage.set(USER_KEYS.apiSlots, updated);
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔑 API Vault</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          🔒 Keys sirf tumhare device pe save hoti hain. Main automatically detect kar lungi kaunsi API hai!
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
        {Object.keys(SLOT_TYPES).map((slotKey, i) => {
          const slot = slots[slotKey] || {};
          const type = SLOT_TYPES[slotKey];
          const hasKey = !!slot.key;

          return (
            <View key={slotKey} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View style={styles.slotLeft}>
                  <Text style={styles.slotIcon}>{type.icon}</Text>
                  <View>
                    <Text style={styles.slotLabel}>{type.label}</Text>
                    {hasKey && slot.name && (
                      <View style={styles.detectedBadge}>
                        <Text style={styles.detectedText}>✓ {slot.name} detected</Text>
                      </View>
                    )}
                  </View>
                </View>
                {hasKey && (
                  <TouchableOpacity onPress={() => clearSlot(slotKey)}>
                    <Text style={styles.clearBtn}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder={type.hint}
                  placeholderTextColor={COLORS.textMuted}
                  value={showKey[slotKey] ? slot.key || '' : slot.key ? '••••••••••••••••' : ''}
                  onChangeText={(val) => handleKeyChange(slotKey, val)}
                  secureTextEntry={!showKey[slotKey]}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowKey(prev => ({ ...prev, [slotKey]: !prev[slotKey] }))}
                >
                  <Text style={styles.eyeText}>{showKey[slotKey] ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {!hasKey && (
                <Text style={styles.hintText}>
                  {i === 0 ? '⭐ Sabse important - AI brain' :
                   i === 4 ? '🔄 Backup: primary fail ho tab use hoga' :
                   ''}
                </Text>
              )}
            </View>
          );
        })}
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
  infoBox: { margin: 16, backgroundColor: COLORS.primary + '20', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.primary + '40' },
  infoText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  slotCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  slotLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slotIcon: { fontSize: 26 },
  slotLabel: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  detectedBadge: { backgroundColor: COLORS.success + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  detectedText: { color: COLORS.success, fontSize: 11, fontWeight: '600' },
  clearBtn: { color: COLORS.error, fontSize: 18, padding: 4 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 14, borderWidth: 1, borderColor: COLORS.border },
  eyeBtn: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  eyeText: { fontSize: 16 },
  hintText: { color: COLORS.textMuted, fontSize: 12, marginTop: 8 },
});
