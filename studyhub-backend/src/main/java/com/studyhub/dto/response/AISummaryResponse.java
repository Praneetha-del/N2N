package com.studyhub.dto.response;

import java.util.List;

public class AISummaryResponse {
    
    private String materialId;
    private String materialTitle;
    private String summary;
    private List<String> keyPoints;
    private List<String> importantConcepts;
    private String generatedAt;

    public AISummaryResponse() {}

    public static class Builder {
        private AISummaryResponse response = new AISummaryResponse();

        public Builder materialId(String materialId) {
            response.materialId = materialId;
            return this;
        }

        public Builder materialTitle(String materialTitle) {
            response.materialTitle = materialTitle;
            return this;
        }

        public Builder summary(String summary) {
            response.summary = summary;
            return this;
        }

        public Builder keyPoints(List<String> keyPoints) {
            response.keyPoints = keyPoints;
            return this;
        }

        public Builder importantConcepts(List<String> importantConcepts) {
            response.importantConcepts = importantConcepts;
            return this;
        }

        public Builder generatedAt(String generatedAt) {
            response.generatedAt = generatedAt;
            return this;
        }

        public AISummaryResponse build() {
            return response;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    // Getters and Setters
    public String getMaterialId() {
        return materialId;
    }

    public void setMaterialId(String materialId) {
        this.materialId = materialId;
    }

    public String getMaterialTitle() {
        return materialTitle;
    }

    public void setMaterialTitle(String materialTitle) {
        this.materialTitle = materialTitle;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getKeyPoints() {
        return keyPoints;
    }

    public void setKeyPoints(List<String> keyPoints) {
        this.keyPoints = keyPoints;
    }

    public List<String> getImportantConcepts() {
        return importantConcepts;
    }

    public void setImportantConcepts(List<String> importantConcepts) {
        this.importantConcepts = importantConcepts;
    }

    public String getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(String generatedAt) {
        this.generatedAt = generatedAt;
    }
}