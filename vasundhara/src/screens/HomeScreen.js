import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, ScrollView, KeyboardAvoidingView,
  Platform, TextInput, SafeAreaView
} from 'react-native';
import { COLORS } from '../constants/theme';
import { Storage, USER_KEYS } from '../utils/storage';
import AIBrain from '../engine/AIBrain';
import { VoiceEngine } from '../engine/VoiceEngine';
import { ActionEngine } from '../engine/ActionEngine';
import { detectAPIProvider } from '../utils/apiDetector';

export default function HomeScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [profile, setProfile] = useState(null);
  const [greeting, setGreeting] = useState('');

  // Wave animations — 4 rings
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const wave4 = useRef(new Animated.Value(0)).current;
  const orbPulse = useRef(new Animated.Value(1)).current;
  const orbGlow = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    loadData();
    startWaves();
  }, []);

  const startWaves = () => {
    const makeWave = (anim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2800,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      makeWave(wave1, 0),
      makeWave(wave2, 600),
      makeWave(wave3, 1200),
      makeWave(wave4, 1800),
    ]).start();

    // Orb pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.06, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbGlow, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(orbGlow, { toValue: 0.3, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  };

  const loadData = async () => {
    const p = await Storage.get(USER_KEYS.profile);
    setProfile(p);
    setGreeting(getGreeting(p?.callMe || 'Boss'));
    const slots = await Storage.get(USER_KEYS.apiSlots);
    const name = p?.callMe || 'Boss';
    setTimeout(() => {
      if (!slots?.slot1?.key) {
        addMessage('vasundhara', `Haan ${name}! 🌸 Pehle Settings mein API key daalo, phir main poori tarah kaam karungi!`);
      } else {
        addMessage('vasundhara', `Haan ${name}! Kya scene hai aaj? Batao! 😊`);
      }
    }, 800);
  };

  const getGreeting = (name) => {
    const h = new Date().getHours();
    if (h < 12) return `Good morning ${name}! ☀️`;
    if (h < 17) return `Good afternoon ${name}! 👋`;
    if (h < 21) return `Good evening ${name}! 🌆`;
    return `Raat ko bhi jaag rahe ho? 🌙`;
  };

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text, time: new Date() }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async (text) => {
    const msg = text || inputText;
    if (!msg.trim()) return;
    setInputText('');
    addMessage('user', msg);
    setIsThinking(true);

    const intent = AIBrain.detectIntent(msg);
    const name = profile?.callMe || 'Boss';

    if (intent.action !== 'CHAT') {
      await handleAction(intent, msg, name);
    } else {
      const slots = await Storage.get(USER_KEYS.apiSlots);
      if (!slots?.slot1?.key) {
        addMessage('vasundhara', `${name}, pehle Settings mein API key daalo! ⚙️`);
      } else {
        const provider = detectAPIProvider(slots.slot1.key);
        const reply = await AIBrain.chat(msg, slots.slot1.key, provider?.provider || 'openai');
        addMessage('vasundhara', reply);
      }
    }
    setIsThinking(false);
  };

  const handleAction = async (intent, msg, name) => {
    switch (intent.action) {
      case 'CALL':
        addMessage('vasundhara', `${name}, call laga rahi hoon! 📞`);
        ActionEngine.makeCall('');
        break;
      case 'WHATSAPP':
        addMessage('vasundhara', `WhatsApp khol rahi hoon ${name}! 💬`);
        ActionEngine.openWhatsApp('');
        break;
      case 'SPOTIFY':
        const song = ActionEngine.extractQuery(msg, 'spotify');
        addMessage('vasundhara', `Spotify pe laga rahi hoon! 🎵`);
        ActionEngine.openSpotify(song);
        break;
      case 'YOUTUBE':
        const yt = ActionEngine.extractQuery(msg, 'youtube');
        addMessage('vasundhara', `YouTube search kar rahi hoon! 📺`);
        ActionEngine.openYouTube(yt);
        break;
      case 'MAPS':
        const place = ActionEngine.extractQuery(msg, 'maps');
        addMessage('vasundhara', `Maps pe navigate kar rahi hoon! 🗺️`);
        ActionEngine.openMaps(place);
        break;
      default:
        addMessage('vasundhara', `Ho jayega ${name}! 🌸`);
    }
  };

  const waveStyle = (anim, size) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.6, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.8] }) }],
  });

  const glowColor = orbGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.primary + '20', COLORS.accent + '40'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subGreeting}>Main hoon yahan 🌸</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowChat(!showChat)}>
            <Text style={styles.iconBtnText}>{showChat ? '🎙️' : '💬'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.iconBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ORB with Waves */}
      <View style={styles.orbSection}>
        <View style={styles.orbWrapper}>
          {/* 4 Wave Rings */}
          <Animated.View style={waveStyle(wave1, 340)} />
          <Animated.View style={waveStyle(wave2, 300)} />
          <Animated.View style={waveStyle(wave3, 260)} />
          <Animated.View style={waveStyle(wave4, 220)} />

          {/* Glow */}
          <Animated.View style={[styles.orbGlow, { backgroundColor: glowColor }]} />

          {/* Main Orb */}
          <Animated.View style={[styles.orb, { transform: [{ scale: orbPulse }] }]}>
            <Text style={styles.orbEmoji}>
              {isThinking ? '🤔' : isListening ? '👂' : '🌸'}
            </Text>
          </Animated.View>
        </View>

        <Text style={styles.assistantName}>वसुंधरा</Text>
        <Text style={styles.statusText}>
          {isThinking ? 'Soch rahi hoon...' : isListening ? 'Sun rahi hoon...' : 'Haan, bolo!'}
        </Text>
      </View>

      {/* Chat */}
      {showChat ? (
        <View style={styles.chatContainer}>
          <ScrollView ref={scrollRef} style={styles.messageList} showsVerticalScrollIndicator={false}>
            {messages.map((msg, i) => (
              <View key={i} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.vBubble]}>
                {msg.sender === 'vasundhara' && <Text style={styles.bubbleName}>🌸</Text>}
                <Text style={styles.bubbleText}>{msg.text}</Text>
              </View>
            ))}
            {isThinking && (
              <View style={styles.vBubble}>
                <Text style={styles.bubbleText}>...</Text>
              </View>
            )}
          </ScrollView>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Kuch bhi likho ya bolo..."
                placeholderTextColor={COLORS.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
                <Text style={styles.sendBtnText}>→</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      ) : (
        <View style={styles.quickActions}>
          <Text style={styles.qaTitle}>Quick Actions</Text>
          <View style={styles.qaGrid}>
            {[
              { icon: '📞', label: 'Call', action: () => handleSend('call karo') },
              { icon: '💬', label: 'WhatsApp', action: () => handleSend('whatsapp kholo') },
              { icon: '🎵', label: 'Spotify', action: () => handleSend('spotify kholo') },
              { icon: '📺', label: 'YouTube', action: () => handleSend('youtube kholo') },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.qaBtn} onPress={item.action}>
                <Text style={styles.qaIcon}>{item.icon}</Text>
                <Text style={styles.qaLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 },
  greeting: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  subGreeting: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  iconBtnText: { fontSize: 18 },
  orbSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbWrapper: { width: 340, height: 340, alignItems: 'center', justifyContent: 'center' },
  orbGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90 },
  orb: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: COLORS.card,
    borderWidth: 2.5, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 30,
    elevation: 20,
  },
  orbEmoji: { fontSize: 65 },
  assistantName: { fontSize: 30, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  statusText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 6 },
  chatContainer: { flex: 1.2, backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  messageList: { flex: 1, padding: 16 },
  bubble: { maxWidth: '80%', padding: 14, borderRadius: 18, marginBottom: 10 },
  userBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  vBubble: { backgroundColor: COLORS.card, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleName: { fontSize: 12, marginBottom: 4 },
  bubbleText: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.inputBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, color: COLORS.text, fontSize: 15 },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 20, width: 48, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  quickActions: { padding: 24, paddingTop: 0 },
  qaTitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 14, fontWeight: '600' },
  qaGrid: { flexDirection: 'row', gap: 10 },
  qaBtn: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  qaIcon: { fontSize: 26, marginBottom: 6 },
  qaLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
});
