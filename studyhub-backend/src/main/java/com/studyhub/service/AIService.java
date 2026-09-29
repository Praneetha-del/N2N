package com.studyhub.service;

import com.studyhub.dto.response.AISummaryResponse;
import com.studyhub.entity.ChatHistory;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

public interface AIService {
    
    AISummaryResponse generateSummary(String materialId, String userId);
    AISummaryResponse getSummary(String materialId, String userId);
    
    // Non-streaming chat
    String chat(String message, String userId);
    
    // ✅ NEW: Streaming chat
    Flux<String> chatStream(String message, String userId);
    
    // ✅ NEW: Save user message without waiting for AI response
    void saveUserMessage(String userId, String message);
    
    String chatWithContext(String message, String userId, Map<String, Object> context);
    
    // Chat History Methods
    List<ChatHistory> getChatHistories(String userId);
    ChatHistory getChatHistory(String chatId, String userId);
    void deleteChatHistory(String chatId, String userId);
    void clearAllChatHistory(String userId);
}