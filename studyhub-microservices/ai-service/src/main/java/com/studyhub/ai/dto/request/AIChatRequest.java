package com.studyhub.ai.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AIChatRequest {

    @NotBlank(message = "Message is required")
    private String message;

    public AIChatRequest() {}

    public AIChatRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
