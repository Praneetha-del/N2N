package com.studyhub.controller;

import com.studyhub.dto.request.AIChatRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.AISummaryResponse;
import com.studyhub.entity.ChatHistory;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.AIService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("isAuthenticated()")
public class AIController {
    
    @Autowired
    private AIService aiService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @PostMapping("/summarize/{materialId}")
    public ResponseEntity<ApiResponse> generateSummary(
            @PathVariable String materialId,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        AISummaryResponse summary = aiService.generateSummary(materialId, userId);
        return ResponseEntity.ok(ApiResponse.success("Summary generated", summary, "/ai/summarize/" + materialId));
    }
    
    @GetMapping("/summary/{materialId}")
    public ResponseEntity<ApiResponse> getSummary(
            @PathVariable String materialId,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        AISummaryResponse summary = aiService.getSummary(materialId, userId);
        return ResponseEntity.ok(ApiResponse.success("Summary retrieved", summary, "/ai/summary/" + materialId));
    }
    
    // ✅ FIXED: Streaming chat endpoint
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(
            @Valid @RequestBody AIChatRequest request,
            @RequestHeader("Authorization") String token) {
        System.out.println("📡 ========================================");
        System.out.println("📡 STREAMING REQUEST RECEIVED");
        System.out.println("📡 Message: " + request.getMessage());
        System.out.println("📡 ========================================");
        String userId = getUserIdFromToken(token);
        return aiService.chatStream(request.getMessage(), userId);
    }
    
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse> chat(
            @Valid @RequestBody AIChatRequest request,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        String response = aiService.chat(request.getMessage(), userId);
        return ResponseEntity.ok(ApiResponse.success("AI response", response, "/ai/chat"));
    }
    
    @GetMapping("/chat/histories")
    public ResponseEntity<ApiResponse> getChatHistories(@RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        List<ChatHistory> histories = aiService.getChatHistories(userId);
        return ResponseEntity.ok(ApiResponse.success("Chat histories retrieved", histories, "/ai/chat/histories"));
    }
    
    @GetMapping("/chat/history/{chatId}")
    public ResponseEntity<ApiResponse> getChatHistory(
            @PathVariable String chatId,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        ChatHistory history = aiService.getChatHistory(chatId, userId);
        return ResponseEntity.ok(ApiResponse.success("Chat history retrieved", history, "/ai/chat/history/" + chatId));
    }
    
    @DeleteMapping("/chat/history/{chatId}")
    public ResponseEntity<ApiResponse> deleteChatHistory(
            @PathVariable String chatId,
            @RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        aiService.deleteChatHistory(chatId, userId);
        return ResponseEntity.ok(ApiResponse.success("Chat history deleted", null, "/ai/chat/history/" + chatId));
    }
    
    @DeleteMapping("/chat/history")
    public ResponseEntity<ApiResponse> clearAllChatHistory(@RequestHeader("Authorization") String token) {
        String userId = getUserIdFromToken(token);
        aiService.clearAllChatHistory(userId);
        return ResponseEntity.ok(ApiResponse.success("All chat history cleared", null, "/ai/chat/history"));
    }
    
    private String getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        return email;
    }
}