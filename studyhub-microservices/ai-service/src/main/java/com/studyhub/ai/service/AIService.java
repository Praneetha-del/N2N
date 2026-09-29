package com.studyhub.ai.service;

import com.studyhub.ai.dto.response.AISummaryResponse;
import com.studyhub.ai.entity.ChatHistory;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

public interface AIService {

    AISummaryResponse generateSummary(String materialId, String userId);

    AISummaryResponse getSummary(String materialId, String userId);

    String chat(String message, String userId);

    Flux<String> chatStream(String message, String userId);

    void saveUserMessage(String userId, String message);

    String chatWithContext(String message, String userId, Map<String, Object> context);

    List<ChatHistory> getChatHistories(String userId);

    ChatHistory getChatHistory(String chatId, String userId);

    void deleteChatHistory(String chatId, String userId);

    void clearAllChatHistory(String userId);
}
