package com.studyhub.service;

import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GroqChatService {

    private final OpenAiChatModel groqClient;

    public GroqChatService(@Value("${GROQ_API_KEY:}") String apiKey,
                           @Value("${GROQ_MODEL:openai/gpt-oss-120b}") String model) {
        
        System.out.println("📦 Initializing Groq with model: " + model);
        
        OpenAiApi openAiApi = new OpenAiApi("https://api.groq.com/openai", apiKey);
        
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(model)
                .temperature(0.7)
                .maxTokens(1000)
                .build();

        this.groqClient = new OpenAiChatModel(openAiApi, options);
        System.out.println("✅ Groq Chat Service initialized");
    }

    public String chat(String message) {
        try {
            Prompt prompt = new Prompt(message);
            ChatResponse response = groqClient.call(prompt);
            AssistantMessage assistantMessage = response.getResult().getOutput();
            return assistantMessage.getText();
            
        } catch (Exception e) {
            System.err.println("❌ Groq API error: " + e.getMessage());
            return "Error calling Groq API: " + e.getMessage();
        }
    }

    public String chatWithSystemPrompt(String systemPrompt, String userMessage) {
        try {
            String fullPrompt = systemPrompt + "\n\nUser: " + userMessage;
            return chat(fullPrompt);
        } catch (Exception e) {
            System.err.println("❌ Groq API error: " + e.getMessage());
            return "Error calling Groq API: " + e.getMessage();
        }
    }
}