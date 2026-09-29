package com.studyhub.controller;

import com.studyhub.dto.response.ApiResponse;
import com.studyhub.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/test")
public class TestUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> testUpload(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== TEST UPLOAD START ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            
            String url = fileStorageService.uploadFile(file, "test");
            
            System.out.println("Upload success: " + url);
            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", url, "/test/upload"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Upload failed: " + e.getMessage(), "/test/upload"));
        }
    }
}