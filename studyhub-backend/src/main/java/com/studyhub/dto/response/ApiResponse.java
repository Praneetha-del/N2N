package com.studyhub.dto.response;

import java.time.LocalDateTime;

public class ApiResponse {
    
    private boolean success;
    private String message;
    private Object data;
    private LocalDateTime timestamp;
    private String path;

    public ApiResponse() {}

    public ApiResponse(boolean success, String message, Object data, LocalDateTime timestamp, String path) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp;
        this.path = path;
    }

    public static ApiResponse success(String message, Object data, String path) {
        return new ApiResponse(true, message, data, LocalDateTime.now(), path);
    }

    public static ApiResponse error(String message, String path) {
        return new ApiResponse(false, message, null, LocalDateTime.now(), path);
    }

    public static class Builder {
        private ApiResponse response = new ApiResponse();

        public Builder success(boolean success) {
            response.success = success;
            return this;
        }

        public Builder message(String message) {
            response.message = message;
            return this;
        }

        public Builder data(Object data) {
            response.data = data;
            return this;
        }

        public Builder timestamp(LocalDateTime timestamp) {
            response.timestamp = timestamp;
            return this;
        }

        public Builder path(String path) {
            response.path = path;
            return this;
        }

        public ApiResponse build() {
            return response;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}