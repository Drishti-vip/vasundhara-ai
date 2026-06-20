export const detectAPIProvider = (key) => {
  if (!key || key.trim() === '') return null;
  
  const k = key.trim();
  
  if (k.startsWith('sk-ant-')) return { provider: 'anthropic', name: 'Claude', model: 'claude-sonnet-4-6' };
  if (k.startsWith('sk-') && !k.startsWith('sk-ant-')) return { provider: 'openai', name: 'GPT-4o', model: 'gpt-4o' };
  if (k.startsWith('AIza')) return { provider: 'google', name: 'Gemini', model: 'gemini-pro' };
  if (k.length === 32 && k.match(/^[a-f0-9]+$/i)) return { provider: 'elevenlabs', name: 'ElevenLabs', model: 'voice' };
  if (k.startsWith('gsk_')) return { provider: 'groq', name: 'Groq', model: 'llama3-70b' };
  
  return { provider: 'custom', name: 'Custom API', model: 'unknown' };
};

export const SLOT_TYPES = {
  slot1: { label: 'AI Brain', hint: 'OpenAI / Claude / Gemini key', icon: '🧠' },
  slot2: { label: 'Voice Output', hint: 'ElevenLabs key', icon: '🎙️' },
  slot3: { label: 'Voice Input', hint: 'Whisper / Deepgram key', icon: '👂' },
  slot4: { label: 'Memory DB', hint: 'Pinecone key (optional)', icon: '💾' },
  slot5: { label: 'Backup AI', hint: 'Emergency fallback AI key', icon: '🔄' },
};
