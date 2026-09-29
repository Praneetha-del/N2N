import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const FloatingChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // ✅ Add welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'ai',
          content: `Hello! 👋 I'm your AI study assistant. I can help you with:\n\n• Understanding concepts\n• Solving problems\n• Exam preparation\n• Study tips\n\nWhat would you like to learn about?`
        }
      ]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!user) {
      toast.error('Please login to use the chatbot');
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreamingMessage('');
    setIsStreaming(true);

    try {
      // ✅ Use streaming for long responses
      const response = await aiService.sendChatMessageStream(
        input.trim(),
        (chunk) => {
          // Process each chunk
          setStreamingMessage(prev => prev + chunk);
        },
        (error) => {
          console.error('Stream error:', error);
          toast.error('Error receiving response');
          setIsStreaming(false);
          setLoading(false);
        },
        () => {
          // Done streaming
          setIsStreaming(false);
          setLoading(false);
          
          // Add the complete message to chat
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              content: streamingMessage || 'Response received'
            }
          ]);
          setStreamingMessage('');
        }
      );

      // If streaming didn't work, fallback to regular request
      if (!response) {
        const result = await aiService.sendChatMessage(input.trim());
        if (result.success) {
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              content: result.data?.response || result.data?.message || 'No response'
            }
          ]);
        }
        setLoading(false);
        setIsStreaming(false);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // ✅ Format message with markdown
  const formatMessage = (content) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle size={24} />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : 'auto'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 ${
              isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96 h-[600px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <span className="font-semibold">AI Study Assistant</span>
                <span className="text-xs opacity-80">Powered by Groq AI</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMinimize}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 h-[460px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {formatMessage(msg.content)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Streaming message */}
                  {isStreaming && streamingMessage && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200">
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {formatMessage(streamingMessage)}
                          <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {loading && !isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask a question about your studies..."
                      rows={2}
                      className="flex-1 resize-none p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setInput('What is Data Structure?')}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      What is Data Structure?
                    </button>
                    <button
                      onClick={() => setInput('Explain OOP concepts')}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      Explain OOP concepts
                    </button>
                    <button
                      onClick={() => setInput('Tips for exams')}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      Tips for exams
                    </button>
                    <button
                      onClick={() => setInput('Define recursion')}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      Define recursion
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;