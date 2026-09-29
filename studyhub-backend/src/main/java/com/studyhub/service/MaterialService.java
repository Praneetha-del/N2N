package com.studyhub.service;

import com.studyhub.dto.request.MaterialFilterRequest;
import com.studyhub.dto.request.MaterialRequest;
import com.studyhub.dto.response.MaterialResponse;
import com.studyhub.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface MaterialService {
    
    Material uploadMaterial(Material material, MultipartFile file, String youTubeUrl);
    
    MaterialResponse uploadMaterial(MaterialRequest request, MultipartFile file, String userEmail);
    
    MaterialResponse uploadYouTubeMaterial(MaterialRequest request, String userEmail);
    
    Page<Material> getMaterialsByDepartmentAndFilters(
        String department, String subject, Integer year, Integer semester, 
        String type, String search, Pageable pageable);
    
    Page<Material> getMaterialsByDepartment(String department, Pageable pageable);
    
    Page<Material> getMaterialsByUploaderAndDepartment(String userId, String department, Pageable pageable);
    
    Material getMaterialById(String id);
    
    MaterialResponse getMaterialByIdResponse(String id);
    
    Material updateMaterial(String id, MaterialRequest request, String userId);
    
    MaterialResponse updateMaterial(String id, MaterialRequest request, MultipartFile file, String userEmail);
    
    void deleteMaterial(String id, String userId);
    
    Page<Material> searchMaterials(String query, String department, Integer year, Integer semester, Pageable pageable);
    
    Page<MaterialResponse> searchMaterials(String keyword, Pageable pageable);
    
    ResponseEntity<?> downloadMaterial(String id);
    
    Page<MaterialResponse> getAllMaterialsForAdmin(MaterialFilterRequest filter, Pageable pageable);
    
    void blockMaterial(String id, String adminNotes, String adminEmail);
    
    void unblockMaterial(String id, String adminEmail);
    
    long getTotalMaterialsCount();
    
    long getActiveMaterialsCount();
    
    long getBlockedMaterialsCount();
}