import { Storage, USER_KEYS } from '../utils/storage';
import { getSystemPrompt } from '../constants/personality';

const detectAndCall = async (apiKey, messages, systemPrompt) => {
  const k = apiKey.trim();

  // OpenAI & Compatible (GPT, Together, Perplexity, etc)
  if (k.startsWith('sk-') && !k.startsWith('sk-ant-')) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${k}` },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 300 })
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content;
  }

  // Anthropic Claude
  if (k.startsWith('sk-ant-')) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': k, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 300, system: systemPrompt, messages })
    });
    const d = await res.json();
    return d.content?.[0]?.text;
  }

  // Groq (llama, mixtral, gemma)
  if (k.startsWith('gsk_')) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${k}` },
      body: JSON.stringify({ model: 'llama3-70b-8192', messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 300 })
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content;
  }

  // Google Gemini
  if (k.startsWith('AIza')) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${k}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + '\n' + messages[messages.length-1].content }] }] })
    });
    const d = await res.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  // Mistral
  if (k.length === 32 && !k.match(/^[0-9a-f]+$/i)) {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${k}` },
      body: JSON.stringify({ model: 'mistral-large-latest', messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 300 })
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content;
  }

  // Cohere
  if (k.startsWith('co-')) {
    const res = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${k}` },
      body: JSON.stringify({ message: messages[messages.length-1].content, preamble: systemPrompt, max_tokens: 300 })
    });
    const d = await res.json();
    return d.text;
  }

  // Together AI
  if (k.startsWith('tog-') || k.length === 64) {
    const res = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${k}` },
      body: JSON.stringify({ model: 'meta-llama/Llama-3-70b-chat-hf', messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 300 })
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content;
  }

  // OpenRouter (supports 100+ models)
  if (k.startsWith('sk-or-')) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${k}` },
      body: JSON.stringify({ model: 'auto', messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 300 })
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content;
  }

  return 'API key pehchaan nahi aayi. Sahi key daalo!';
};

export class AIBrain {
  constructor() {
    this.conversationHistory = [];
    this.userProfile = null;
    this.settings = null;
  }

  async init() {
    this.userProfile = await Storage.get(USER_KEYS.profile);
    this.settings = await Storage.get(USER_KEYS.settings);
    const saved = await Storage.get(USER_KEYS.conversations);
    if (saved) this.conversationHistory = saved.slice(-20);
  }

  async chat(userMessage, apiKey) {
    await this.init();
    const name = this.userProfile?.callMe || this.userProfile?.displayName?.split(' ')[0] || 'Boss';
    const assistantName = this.settings?.assistantName || 'Vasundhara';
    const mode = this.settings?.personalityMode || 'friend';
    const systemPrompt = getSystemPrompt(assistantName, name, mode);

    this.conversationHistory.push({ role: 'user', content: userMessage });

    try {
      const reply = await detectAndCall(apiKey, this.conversationHistory.slice(-10), systemPrompt);
      const finalReply = reply || 'Kuch samajh nahi aaya, dobara bolo!';
      this.conversationHistory.push({ role: 'assistant', content: finalReply });
      await Storage.set(USER_KEYS.conversations, this.conversationHistory);
      return finalReply;
    } catch (e) {
      return 'Arre, network issue lag raha hai. Thodi der baad try karo!';
    }
  }

  detectIntent(text) {
    const t = text.toLowerCase();
    if (t.includes('call') || t.includes('phone')) return { action: 'CALL', text };
    if (t.includes('whatsapp') || t.includes('message') || t.includes('msg')) return { action: 'WHATSAPP', text };
    if (t.includes('photo') || t.includes('selfie') || t.includes('camera')) return { action: 'CAMERA', text };
    if (t.includes('spotify') || t.includes('music') || t.includes('gaana')) return { action: 'SPOTIFY', text };
    if (t.includes('youtube') || t.includes('video')) return { action: 'YOUTUBE', text };
    if (t.includes('maps') || t.includes('navigate')) return { action: 'MAPS', text };
    return { action: 'CHAT', text };
  }
}

export default new AIBrain();
