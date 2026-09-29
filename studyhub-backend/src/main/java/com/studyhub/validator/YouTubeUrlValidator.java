package com.studyhub.validator;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class YouTubeUrlValidator {
    
    private static final Pattern YOUTUBE_URL_PATTERN = 
            Pattern.compile("^(https?://)?(www\\.)?(youtube\\.com|youtu\\.be)/.+$", Pattern.CASE_INSENSITIVE);
    
    public boolean isValid(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }
        return YOUTUBE_URL_PATTERN.matcher(url).matches();
    }
    
    public void validate(String url) {
        if (!isValid(url)) {
            throw new IllegalArgumentException("Invalid YouTube URL format");
        }
    }
}