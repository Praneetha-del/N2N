import React, { createContext, useContext, useState, useEffect } from 'react';
import aiService from '../services/aiService';

const ChatContext = createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await aiService.getChatHistory();
      if (response.data) {
        setMessages(response.data.messages || []);
        setSessionId(response.data.sessionId);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async (content) => {
    const userMessage = { role: 'USER', content };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await aiService.sendChatMessage(content);
      const aiMessage = { role: 'AI', content: response.data };
      setMessages(prev => [...prev, aiMessage]);
      return aiMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await aiService.clearChatHistory();
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  };

  const value = {
    messages,
    loading,
    sessionId,
    sendMessage,
    clearHistory,
    loadChatHistory,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};