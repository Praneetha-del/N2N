package com.studyhub.serviceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studyhub.dto.response.AISummaryResponse;
import com.studyhub.entity.AISummary;
import com.studyhub.entity.ChatHistory;
import com.studyhub.entity.Material;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.AISummaryRepository;
import com.studyhub.repository.ChatHistoryRepository;
import com.studyhub.repository.MaterialRepository;
import com.studyhub.service.AIService;
import com.studyhub.service.GroqChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AIServiceImpl implements AIService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private AISummaryRepository summaryRepository;

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Value("${GROQ_API_KEY:}")
    private String groqApiKey;

    @Value("${GROQ_MODEL:openai/gpt-oss-120b}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public AIServiceImpl() {
        this.webClient = WebClient.builder()
                .baseUrl(GROQ_API_URL)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Override
    public AISummaryResponse generateSummary(String materialId, String userId) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material", "id", materialId));

        Optional<AISummary> existingSummary = summaryRepository.findByMaterialIdAndUserId(materialId, userId);
        if (existingSummary.isPresent()) {
            return convertToResponse(existingSummary.get(), material);
        }

        String prompt = String.format(
            "Please provide a comprehensive summary of the following study material:\n\n" +
            "Title: %s\n" +
            "Subject: %s\n" +
            "Description: %s\n\n" +
            "Please provide summary, key points, and important concepts.",
            material.getTitle(),
            material.getSubject(),
            material.getDescription() != null ? material.getDescription() : "No description available"
        );

        String responseText = chatInternal(prompt, userId);
        System.out.println("✅ AI response received");

        List<String> keyPoints = Arrays.asList("Key point 1", "Key point 2", "Key point 3");
        List<String> concepts = Arrays.asList("Concept 1", "Concept 2", "Concept 3");

        AISummary summary = new AISummary();
        summary.setMaterialId(materialId);
        summary.setUserId(userId);
        summary.setSummary(responseText);
        summary.setKeyPoints(keyPoints);
        summary.setImportantConcepts(concepts);
        summary.setCreatedAt(LocalDateTime.now());
        summary.setUpdatedAt(LocalDateTime.now());

        summaryRepository.save(summary);

        return convertToResponse(summary, material);
    }

    @Override
    public AISummaryResponse getSummary(String materialId, String userId) {
        AISummary summary = summaryRepository.findByMaterialIdAndUserId(materialId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Summary not found"));

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material", "id", materialId));

        return convertToResponse(summary, material);
    }

    @Override
    public String chat(String message, String userId) {
        System.out.println("💬 Chat request from user: " + userId);
        
        ChatHistory chatHistory = new ChatHistory(userId);
        
        ChatHistory.ChatMessage userMsg = new ChatHistory.ChatMessage(
            "USER", message, LocalDateTime.now()
        );
        chatHistory.getMessages().add(userMsg);
        
        String response = chatInternal(message, userId);
        
        ChatHistory.ChatMessage aiMsg = new ChatHistory.ChatMessage(
            "AI", response, LocalDateTime.now()
        );
        chatHistory.getMessages().add(aiMsg);
        
        chatHistory.setTitle(generateTitle(message));
        chatHistory.setUpdatedAt(LocalDateTime.now());
        chatHistoryRepository.save(chatHistory);
        
        return response;
    }

    // ✅ FIXED: Streaming with proper error handling
    @Override
    public Flux<String> chatStream(String message, String userId) {
        System.out.println("📡 Streaming started for user: " + userId);

        return Flux.create(sink -> {
            try {
                // 1. Create conversation
                ChatHistory chatHistory = new ChatHistory(userId);
                
                // 2. Save user message
                ChatHistory.ChatMessage userMsg = new ChatHistory.ChatMessage(
                    "USER", message, LocalDateTime.now()
                );
                chatHistory.getMessages().add(userMsg);
                chatHistory.setTitle(generateTitle(message));
                chatHistory.setCreatedAt(LocalDateTime.now());
                chatHistory.setUpdatedAt(LocalDateTime.now());
                
                // 3. Save user message
                ChatHistory savedHistory = chatHistoryRepository.save(chatHistory);
                final String conversationId = savedHistory.getId();
                System.out.println("✅ User message saved with ID: " + conversationId);

                // 4. Check if API key is configured
                if (groqApiKey == null || groqApiKey.isEmpty()) {
                    String response = "⚠️ Please configure GROQ_API_KEY in .env file.";
                    saveAIMessageToConversation(conversationId, response);
                    sink.next("{\"content\": \"" + response + "\"}");
                    sink.complete();
                    return;
                }

                // 5. Build Groq request
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", model);
                requestBody.put("messages", new Object[]{
                    Map.of("role", "user", "content", message)
                });
                requestBody.put("temperature", 0.7);
                requestBody.put("max_tokens", 1000);
                requestBody.put("stream", true);

                System.out.println("📤 Sending request to Groq...");

                // 6. Make streaming request
                webClient.post()
                    .header("Authorization", "Bearer " + groqApiKey)
                    .bodyValue(requestBody)
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .retrieve()
                    .bodyToFlux(String.class)
                    .subscribe(
                        chunk -> {
                            try {
                                if (chunk.startsWith("data: ")) {
                                    String jsonData = chunk.substring(6);
                                    if ("[DONE]".equals(jsonData)) {
                                        return;
                                    }
                                    JsonNode node = objectMapper.readTree(jsonData);
                                    JsonNode choices = node.path("choices");
                                    if (choices.isArray() && choices.size() > 0) {
                                        JsonNode delta = choices.get(0).path("delta");
                                        String content = delta.path("content").asText();
                                        if (!content.isEmpty()) {
                                            String jsonResponse = "{\"content\": \"" + escapeJson(content) + "\"}";
                                            sink.next(jsonResponse);
                                        }
                                    }
                                }
                            } catch (Exception e) {
                                System.err.println("❌ Error parsing chunk: " + e.getMessage());
                            }
                        },
                        error -> {
                            System.err.println("❌ Streaming error: " + error.getMessage());
                            String errorMsg = "❌ Error: " + error.getMessage();
                            try {
                                saveAIMessageToConversation(conversationId, errorMsg);
                            } catch (Exception e) {
                                System.err.println("❌ Failed to save error: " + e.getMessage());
                            }
                            sink.error(new RuntimeException(errorMsg));
                        },
                        () -> {
                            System.out.println("✅ Streaming completed");
                            // Don't save AI message here - it's saved in the frontend fallback
                            sink.complete();
                        }
                    );
            } catch (Exception e) {
                System.err.println("❌ Fatal error in chatStream: " + e.getMessage());
                sink.error(e);
            }
        });
    }

    // Helper to save AI message (with duplicate check)
    private void saveAIMessageToConversation(String conversationId, String response) {
        try {
            Optional<ChatHistory> opt = chatHistoryRepository.findById(conversationId);
            if (opt.isPresent()) {
                ChatHistory history = opt.get();
                
                // Check if AI message already exists
                boolean hasAIResponse = history.getMessages().stream()
                    .anyMatch(msg -> "AI".equals(msg.getRole()));
                
                if (hasAIResponse) {
                    System.out.println("⏭️ AI response already exists, skipping duplicate");
                    return;
                }
                
                ChatHistory.ChatMessage aiMsg = new ChatHistory.ChatMessage(
                    "AI", response, LocalDateTime.now()
                );
                history.getMessages().add(aiMsg);
                history.setUpdatedAt(LocalDateTime.now());
                chatHistoryRepository.save(history);
                System.out.println("✅ AI response saved to conversation: " + conversationId);
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to save AI response: " + e.getMessage());
        }
    }

    @Override
    public void saveUserMessage(String userId, String message) {
        ChatHistory chatHistory = chatHistoryRepository
            .findFirstByUserIdOrderByUpdatedAtDesc(userId)
            .orElse(new ChatHistory(userId));
        
        ChatHistory.ChatMessage userMsg = new ChatHistory.ChatMessage(
            "USER", message, LocalDateTime.now()
        );
        chatHistory.getMessages().add(userMsg);
        
        if (chatHistory.getTitle() == null || chatHistory.getTitle().isEmpty()) {
            chatHistory.setTitle(chatHistory.generateTitle());
        }
        
        chatHistory.setUpdatedAt(LocalDateTime.now());
        chatHistoryRepository.save(chatHistory);
    }

    @Override
    public String chatWithContext(String message, String userId, Map<String, Object> context) {
        return chat(message, userId);
    }

    @Override
    public List<ChatHistory> getChatHistories(String userId) {
        return chatHistoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    @Override
    public ChatHistory getChatHistory(String chatId, String userId) {
        return chatHistoryRepository.findByIdAndUserId(chatId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat history not found"));
    }

    @Override
    public void deleteChatHistory(String chatId, String userId) {
        chatHistoryRepository.deleteByIdAndUserId(chatId, userId);
    }

    @Override
    public void clearAllChatHistory(String userId) {
        chatHistoryRepository.deleteByUserId(userId);
    }

    private String chatInternal(String message, String userId) {
        System.out.println("🔍 Chat request received");
        System.out.println("📦 Model: " + model);

        try {
            if (groqApiKey != null && !groqApiKey.isEmpty()) {
                return callGroqApi(message);
            }
            return "AI service is not configured properly.";
        } catch (Exception e) {
            System.err.println("❌ AI API error: " + e.getMessage());
            return "❌ Error calling AI API: " + e.getMessage();
        }
    }

    private String callGroqApi(String prompt) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", new Object[]{
                Map.of("role", "user", "content", prompt)
            });
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 1000);

            return webClient.post()
                .header("Authorization", "Bearer " + groqApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        JsonNode choices = root.path("choices");
                        if (choices.isArray() && choices.size() > 0) {
                            return choices.get(0).path("message").path("content").asText();
                        }
                        return "No response from AI.";
                    } catch (Exception e) {
                        return "Error parsing response: " + e.getMessage();
                    }
                })
                .block();
        } catch (Exception e) {
            System.err.println("❌ Groq API error: " + e.getMessage());
            return "Error calling Groq API: " + e.getMessage();
        }
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }

    private String generateTitle(String message) {
        if (message.length() > 50) {
            return message.substring(0, 47) + "...";
        }
        return message;
    }

    private AISummaryResponse convertToResponse(AISummary summary, Material material) {
        return AISummaryResponse.builder()
                .materialId(summary.getMaterialId())
                .materialTitle(material.getTitle())
                .summary(summary.getSummary())
                .keyPoints(summary.getKeyPoints())
                .importantConcepts(summary.getImportantConcepts())
                .generatedAt(summary.getCreatedAt().toString())
                .build();
    }
}