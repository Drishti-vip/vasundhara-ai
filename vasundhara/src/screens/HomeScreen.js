import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, ScrollView, KeyboardAvoidingView,
  Platform, TextInput, SafeAreaView, Alert
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Storage, USER_KEYS } from '../utils/storage';
import AIBrain from '../engine/AIBrain';
import { ActionEngine } from '../engine/ActionEngine';
import { detectAPIProvider } from '../utils/apiDetector';

export default function HomeScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [profile, setProfile] = useState(null);
  const [apiSlots, setApiSlots] = useState(null);
  const [greeting, setGreeting] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const thinkAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    loadData();
    startIdleAnimation();
  }, []);

  const loadData = async () => {
    const p = await Storage.get(USER_KEYS.profile);
    const slots = await Storage.get(USER_KEYS.apiSlots);
    setProfile(p);
    setApiSlots(slots);
    setGreeting(getGreeting(p?.callMe || 'Boss'));

    if (!slots?.slot1?.key) {
      setTimeout(() => {
        addMessage('vasundhara', `Haan ${p?.callMe || 'Boss'}! 🌸 Pehle API key daalo Settings mein, phir main poori tarah kaam karungi!`);
      }, 1000);
    } else {
      setTimeout(() => {
        addMessage('vasundhara', `Haan ${p?.callMe || 'Boss'}! Kya scene hai aaj? Batao kuch kaam hai? 😊`);
      }, 1000);
    }
  };

  const getGreeting = (name) => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning ${name}! ☀️`;
    if (hour < 17) return `Good afternoon ${name}! 👋`;
    if (hour < 21) return `Good evening ${name}! 🌆`;
    return `Raat ko bhi jaag rahe ho ${name}? 🌙`;
  };

  const startIdleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  };

  const startThinkingAnimation = () => {
    Animated.loop(
      Animated.timing(thinkAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
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
    startThinkingAnimation();

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
    thinkAnim.stopAnimation();
  };

  const handleAction = async (intent, msg, name) => {
    switch (intent.action) {
      case 'CALL':
        const callContact = ActionEngine.extractContact(msg);
        addMessage('vasundhara', `${name}, ${callContact ? callContact : 'contact'} ko call laga rahi hoon! 📞`);
        if (callContact) ActionEngine.makeCall('');
        break;
      case 'WHATSAPP':
        addMessage('vasundhara', `WhatsApp khol rahi hoon ${name}! 💬`);
        ActionEngine.openWhatsApp('');
        break;
      case 'CAMERA':
        addMessage('vasundhara', `Camera ready hai ${name}! 📸`);
        break;
      case 'SPOTIFY':
        const songQuery = ActionEngine.extractQuery(msg, 'spotify');
        addMessage('vasundhara', `Spotify pe laga rahi hoon ${name}! 🎵`);
        ActionEngine.openSpotify(songQuery);
        break;
      case 'YOUTUBE':
        const ytQuery = ActionEngine.extractQuery(msg, 'youtube');
        addMessage('vasundhara', `YouTube search kar rahi hoon ${name}! 📺`);
        ActionEngine.openYouTube(ytQuery);
        break;
      case 'MAPS':
        const mapQuery = ActionEngine.extractQuery(msg, 'maps');
        addMessage('vasundhara', `Maps pe navigate kar rahi hoon! 🗺️`);
        ActionEngine.openMaps(mapQuery);
        break;
      default:
        addMessage('vasundhara', `Ho jayega ${name}! 🌸`);
    }
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.orbGlow, COLORS.accentGlow],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subGreeting}>Main hoon yahan 🌸</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowChat(!showChat)}
          >
            <Text style={styles.iconBtnText}>{showChat ? '🎙️' : '💬'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.iconBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.orbContainer}>
        <Animated.View style={[styles.orbGlow, { backgroundColor: glowColor, transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[styles.orb, { transform: [{ scale: pulseAnim }] }]}>
          {isThinking ? (
            <Text style={styles.orbEmoji}>🤔</Text>
          ) : isListening ? (
            <Text style={styles.orbEmoji}>👂</Text>
          ) : (
            <Text style={styles.orbEmoji}>🌸</Text>
          )}
        </Animated.View>
        <Text style={styles.assistantName}>वसधरा</Text>
        <Text style={styles.statusText}>
          {isThinking ? 'Soch rahi hoon...' : isListening ? 'Sun rahi hoon...' : 'Haan, bolo!'}
        </Text>
      </View>

      {showChat && (
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            showsVerticalScrollIndicator={false}
          >
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
                returnKeyType="send"
                onSubmitEditing={() => handleSend()}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
                <Text style={styles.sendBtnText}>→</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {!showChat && (
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
  orbContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110 },
  orb: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: COLORS.card,
    borderWidth: 2, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 30,
  },
  orbEmoji: { fontSize: 70 },
  assistantName: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginTop: 20 },
  statusText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 8 },
  chatContainer: { flex: 1.5, backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  messageList: { flex: 1, padding: 16 },
  bubble: { maxWidth: '80%', padding: 14, borderRadius: 18, marginBottom: 10 },
  userBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  vBubble: { backgroundColor: COLORS.card, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleName: { fontSize: 12, marginBottom: 4 },
  bubbleText: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.inputBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, color: COLORS.text, fontSize: 15, maxHeight: 100 },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 20, width: 48, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  quickActions: { padding: 24, paddingTop: 0 },
  qaTitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 16, fontWeight: '600' },
  qaGrid: { flexDirection: 'row', gap: 12 },
  qaBtn: { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  qaIcon: { fontSize: 24, marginBottom: 6 },
  qaLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
});
