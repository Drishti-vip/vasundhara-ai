import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform,
  Animated, Easing
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Storage, USER_KEYS } from '../utils/storage';

export default function AuthScreen({ navigation }) {
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);
  const [callMe, setCallMe] = useState('Boss');
  const pulse = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
    } else {
      const profile = {
        displayName: name || 'Boss',
        callMe: callMe || 'Boss',
        email: '',
        photo: null,
        createdAt: new Date().toISOString(),
      };
      await Storage.set(USER_KEYS.profile, profile);
      await Storage.set(USER_KEYS.settings, {
        assistantName: 'Vasundhara',
        personalityMode: 'friend',
        language: 'hinglish',
        proactiveChat: true,
        backgroundMode: false,
        autoCall: false,
        nightGuardian: true,
        nightStart: '23:00',
        nightEnd: '08:00',
      });
      navigation.replace('Home');
    }
  };

  const CALL_OPTIONS = ['Boss', 'Yaar', 'Bhai', 'Jaan', 'King', 'Custom'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Animated.View style={[styles.orb, { transform: [{ scale: pulse }] }]}>
          <Text style={styles.orbEmoji}>🌸</Text>
        </Animated.View>

        <Text style={styles.title}>वसुंधरा</Text>
        <Text style={styles.subtitle}>Tumhari personal AI assistant</Text>

        {step === 1 ? (
          <View style={styles.form}>
            <Text style={styles.label}>Tumhara naam kya hai?</Text>
            <TextInput
              style={styles.input}
              placeholder="Apna naam likho..."
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <Text style={styles.hint}>Ya skip karo — main Boss bulaaungi 😊</Text>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Main tumhe kaise bulaoon?</Text>
            <View style={styles.optionsGrid}>
              {CALL_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionBtn, callMe === opt && styles.optionSelected]}
                  onPress={() => setCallMe(opt)}
                >
                  <Text style={[styles.optionText, callMe === opt && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {callMe === 'Custom' && (
              <TextInput
                style={styles.input}
                placeholder="Apna naam likho..."
                placeholderTextColor={COLORS.textMuted}
                onChangeText={setCallMe}
                autoFocus
              />
            )}
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={handleContinue}>
          <Text style={styles.btnText}>
            {step === 1 ? 'Aage Chalo →' : 'Vasundhara se Milo 🌸'}
          </Text>
        </TouchableOpacity>

        {step === 1 && (
          <TouchableOpacity onPress={() => { setName(''); handleContinue(); }}>
            <Text style={styles.skip}>Skip karo</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  orb: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.orbGlow,
    borderWidth: 2, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 20,
  },
  orbEmoji: { fontSize: 50 },
  title: { fontSize: 36, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 48 },
  form: { width: '100%', marginBottom: 24 },
  label: { fontSize: 18, color: COLORS.text, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: {
    backgroundColor: COLORS.inputBg, borderRadius: 16,
    padding: 16, color: COLORS.text, fontSize: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  hint: { color: COLORS.textMuted, textAlign: 'center', marginTop: 12, fontSize: 13 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  optionBtn: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 24, borderWidth: 1,
    borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { color: COLORS.textSecondary, fontSize: 15 },
  optionTextSelected: { color: COLORS.text, fontWeight: '600' },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 20,
    paddingVertical: 18, paddingHorizontal: 48,
    width: '100%', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12,
  },
  btnText: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  skip: { color: COLORS.textMuted, marginTop: 16, fontSize: 14 },
});
