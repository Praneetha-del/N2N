import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, MessageSquare, Trash2, History, 
  X, Clock, Plus, ChevronRight, Calendar, Loader2, BookOpen, Lightbulb
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ChatMessage from '../../components/ai/ChatMessage';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [chatHistories, setChatHistories] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadChatHistories();
    startNewConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const loadChatHistories = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/ai/chat/histories');
      if (response.data && response.data.data) {
        setChatHistories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load chat histories:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewConversation = () => {
    setCurrentChatId(null);
    setMessages([
      {
        role: 'AI',
        content: 'Hello! I am your StudyHub AI academic assistant. Ask me anything about your syllabus, concepts, study notes, or exam preparation.'
      }
    ]);
    setShowHistoryPanel(false);
  };

  const loadConversation = async (chatId) => {
    if (chatId === currentChatId) {
      setShowHistoryPanel(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/ai/chat/history/${chatId}`);
      if (response.data && response.data.data) {
        const history = response.data.data;
        setMessages(history.messages || []);
        setCurrentChatId(chatId);
        setShowHistoryPanel(false);
      }
    } catch (error) {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      try {
        await api.delete(`/ai/chat/history/${chatId}`);
        setChatHistories(prev => prev.filter(h => h.id !== chatId));
        if (currentChatId === chatId) {
          startNewConversation();
        }
        toast.success('Conversation deleted');
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    if (loading || isStreaming) {
      toast.error('Please wait for the current response to finish');
      return;
    }

    const userMessage = trimmedInput;
    setInput('');
    setIsStreaming(true);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        setIsStreaming(false);
        setLoading(false);
        return;
      }

      setMessages(prev => [...prev, { role: 'USER', content: userMessage }]);
      setMessages(prev => [...prev, { role: 'AI', content: '', isStreaming: true }]);

      const response = await api.post('/ai/chat', { message: userMessage });

      if (response.data && response.data.success) {
        const aiResponse = response.data.data;

        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (newMessages[lastIndex] && newMessages[lastIndex].role === 'AI') {
            newMessages[lastIndex].content = aiResponse || 'No response received.';
            newMessages[lastIndex].isStreaming = false;
          }
          return newMessages;
        });

        await loadChatHistories();
      } else {
        toast.error(response.data?.message || 'Failed to get response');
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (newMessages[lastIndex] && newMessages[lastIndex].role === 'AI') {
            newMessages[lastIndex].content = 'Sorry, I am having trouble responding right now. Please try again.';
            newMessages[lastIndex].isStreaming = false;
          }
          return newMessages;
        });
      }

    } catch (error) {
      console.error('AI Error:', error);
      toast.error(error.response?.data?.message || 'Failed to get response. Please try again.');
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex] && newMessages[lastIndex].role === 'AI') {
          newMessages[lastIndex].content = 'Sorry, I am having trouble responding right now. Please try again.';
          newMessages[lastIndex].isStreaming = false;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    if (isStreaming || loading) return;
    setInput(suggestion);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const groupConversationsByDate = (conversations) => {
    const groups = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    conversations.forEach(conv => {
      const date = new Date(conv.updatedAt);
      let key;
      if (date >= today) key = 'Today';
      else if (date >= yesterday) key = 'Yesterday';
      else if (date >= weekAgo) key = 'This Week';
      else key = 'Older';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(conv);
    });

    return groups;
  };

  const groupedHistories = groupConversationsByDate(chatHistories);
  const dateGroups = ['Today', 'Yesterday', 'This Week', 'Older'];

  const suggestions = [
    'Explain Binary Search Tree with example',
    'What are SOLID design principles?',
    'Summarize Key DBMS Normalization rules',
    'Tips for writing clean code and exams'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#163A70]">AI Academic Assistant</h1>
            <p className="text-xs text-slate-500">Ask questions, clarify topics, and summarize academic materials</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewConversation}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
          >
            <Plus size={15} />
            New Chat
          </button>
          <button
            onClick={() => {
              setShowHistoryPanel(!showHistoryPanel);
              if (!showHistoryPanel) loadChatHistories();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              showHistoryPanel 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <History size={15} />
            History
            {chatHistories.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${showHistoryPanel ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {chatHistories.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex h-[620px]">
        {/* Chat History Drawer */}
        <AnimatePresence>
          {showHistoryPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-slate-200 bg-slate-50 flex-shrink-0 flex flex-col"
            >
              <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <History size={14} className="text-blue-600" /> Past Sessions
                </span>
                <button
                  onClick={() => setShowHistoryPanel(false)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {loadingHistory ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 size={20} className="text-blue-600 animate-spin" />
                  </div>
                ) : chatHistories.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">No saved chats</p>
                  </div>
                ) : (
                  dateGroups.map(group => {
                    const convs = groupedHistories[group] || [];
                    if (convs.length === 0) return null;
                    return (
                      <div key={group}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                          {group}
                        </p>
                        <div className="space-y-1">
                          {convs.map(conv => (
                            <div
                              key={conv.id}
                              onClick={() => loadConversation(conv.id)}
                              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                                currentChatId === conv.id
                                  ? 'bg-blue-100/80 text-blue-900 font-semibold'
                                  : 'hover:bg-slate-200/60 text-slate-700'
                              }`}
                            >
                              <span className="truncate flex-1 pr-2">{conv.title || 'Conversation'}</span>
                              <button
                                onClick={(e) => deleteConversation(conv.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-0.5"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isUser={message.role === 'USER'}
              />
            ))}
            {loading && !isStreaming && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl w-fit shadow-sm">
                <Loader2 size={14} className="text-blue-600 animate-spin" />
                <span>Generating academic response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions & Input Tray */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200/90 space-y-3">
            {messages.length <= 2 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                  <Lightbulb size={12} className="text-amber-500" /> Suggestions:
                </span>
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleSuggestionClick(sug)}
                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full text-slate-600 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent focus-within:bg-white transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a concept, formula, algorithm, or syllabus topic..."
                className="w-full text-sm bg-transparent border-0 outline-none resize-none px-2 py-1 text-slate-900 placeholder:text-slate-400"
                rows={1}
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || isStreaming}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>StudyHub AI Tutor</span>
              <span>Press <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Enter</kbd> to submit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;