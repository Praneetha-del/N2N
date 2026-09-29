package com.studyhub.material.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.studyhub.material.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.Map;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Autowired(required = false)
    private Cloudinary cloudinary;

    @Override
    @SuppressWarnings("unchecked")
    public String uploadFile(MultipartFile file, String folder) {
        if (cloudinary == null) {
            return "https://res.cloudinary.com/demo/image/upload/sample.pdf";
        }
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto"
            );

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public String uploadProfilePicture(byte[] imageBytes, String fileName) {
        if (cloudinary == null) {
            return "https://res.cloudinary.com/demo/image/upload/sample.jpg";
        }
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", "profiles",
                "resource_type", "image"
            );

            ByteArrayInputStream inputStream = new ByteArrayInputStream(imageBytes);
            Map<String, Object> uploadResult = cloudinary.uploader().upload(inputStream, uploadParams);
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload profile picture: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPublicIdFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        try {
            String[] parts = url.split("/");
            String fileName = parts[parts.length - 1];
            String publicId = fileName.substring(0, fileName.lastIndexOf('.'));
            String folder = parts[parts.length - 2];
            return folder + "/" + publicId;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public void deleteFile(String publicId) {
        if (cloudinary == null) return;
        try {
            if (publicId != null && !publicId.isEmpty()) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            System.out.println("Failed to delete file: " + e.getMessage());
        }
    }
}
