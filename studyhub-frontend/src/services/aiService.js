import api from './api';

const aiService = {
  // ✅ Send chat message with streaming support
  sendChatMessageStream: async (message, onChunk, onError, onComplete) => {
    try {
      const response = await fetch(`${api.defaults.baseURL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process SSE format
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              if (onComplete) onComplete();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                if (onChunk) onChunk(parsed.content);
              }
            } catch (e) {
              // If not JSON, treat as plain text
              if (onChunk) onChunk(data);
            }
          }
        }
      }
      
      if (onComplete) onComplete();
      return true;
    } catch (error) {
      console.error('❌ Stream error:', error);
      if (onError) onError(error);
      throw error;
    }
  },

  // ✅ Regular chat (fallback)
  sendChatMessage: async (message) => {
    try {
      const response = await api.post('/ai/chat', { message });
      return response.data;
    } catch (error) {
      console.error('❌ sendChatMessage error:', error);
      throw error;
    }
  },

  // Generate summary for material
  generateSummary: async (materialId) => {
    try {
      const response = await api.post(`/ai/summarize/${materialId}`);
      return response.data;
    } catch (error) {
      console.error('❌ generateSummary error:', error);
      throw error;
    }
  },

  // Get existing summary
  getSummary: async (materialId) => {
    try {
      const response = await api.get(`/ai/summary/${materialId}`);
      return response.data;
    } catch (error) {
      console.error('❌ getSummary error:', error);
      throw error;
    }
  },

  // Get chat history
  getChatHistories: async () => {
    try {
      const response = await api.get('/ai/chat/histories');
      return response.data;
    } catch (error) {
      console.error('❌ getChatHistories error:', error);
      throw error;
    }
  },

  // Get single chat history
  getChatHistory: async (id) => {
    try {
      const response = await api.get(`/ai/chat/history/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ getChatHistory error:', error);
      throw error;
    }
  },

  // Delete chat history
  deleteChatHistory: async (id) => {
    try {
      const response = await api.delete(`/ai/chat/history/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteChatHistory error:', error);
      throw error;
    }
  }
};

export default aiService;