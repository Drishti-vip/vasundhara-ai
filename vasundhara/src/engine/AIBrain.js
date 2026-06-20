import { Storage, USER_KEYS } from '../utils/storage';
import { getSystemPrompt } from '../constants/personality';

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

  async chat(userMessage, apiKey, provider = 'openai') {
    await this.init();
    const name = this.userProfile?.displayName?.split(' ')[0] || 'Boss';
    const assistantName = this.settings?.assistantName || 'Vasundhara';
    const mode = this.settings?.personalityMode || 'friend';
    const systemPrompt = getSystemPrompt(assistantName, name, mode);

    this.conversationHistory.push({ role: 'user', content: userMessage });

    try {
      let reply = '';
      if (provider === 'openai') {
        reply = await this._callOpenAI(apiKey, systemPrompt);
      } else if (provider === 'anthropic') {
        reply = await this._callClaude(apiKey, systemPrompt);
      }
      
      this.conversationHistory.push({ role: 'assistant', content: reply });
      await Storage.set(USER_KEYS.conversations, this.conversationHistory);
      return reply;
    } catch (e) {
      return `Arre, kuch problem ho gayi. Thodi der baad try karo!`;
    }
  }

  async _callOpenAI(apiKey, systemPrompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...this.conversationHistory.slice(-10)
        ],
        max_tokens: 200,
        temperature: 0.9,
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Kuch samajh nahi aaya, dobara bolo!';
  }

  async _callClaude(apiKey, systemPrompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: systemPrompt,
        messages: this.conversationHistory.slice(-10)
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text || 'Kuch samajh nahi aaya!';
  }

  detectIntent(text) {
    const t = text.toLowerCase();
    if (t.includes('call') || t.includes('phone')) return { action: 'CALL', text };
    if (t.includes('whatsapp') || t.includes('message') || t.includes('msg')) return { action: 'WHATSAPP', text };
    if (t.includes('photo') || t.includes('selfie') || t.includes('camera')) return { action: 'CAMERA', text };
    if (t.includes('spotify') || t.includes('music') || t.includes('gaana')) return { action: 'SPOTIFY', text };
    if (t.includes('youtube') || t.includes('video')) return { action: 'YOUTUBE', text };
    if (t.includes('maps') || t.includes('navigate') || t.includes('directions')) return { action: 'MAPS', text };
    if (t.includes('reminder') || t.includes('yaad') || t.includes('alarm')) return { action: 'REMINDER', text };
    return { action: 'CHAT', text };
  }
}

export default new AIBrain();
