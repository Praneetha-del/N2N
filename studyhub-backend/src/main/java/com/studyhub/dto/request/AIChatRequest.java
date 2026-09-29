package com.studyhub.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AIChatRequest {
    
    @NotBlank(message = "Message is required")
    private String message;

    public AIChatRequest() {}

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}