package com.studyhub.material.service;

import com.studyhub.material.dto.request.MaterialFilterRequest;
import com.studyhub.material.dto.request.MaterialRequest;
import com.studyhub.material.dto.response.MaterialResponse;
import com.studyhub.material.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface MaterialService {

    MaterialResponse uploadMaterial(MaterialRequest request, MultipartFile file, String userId, String userEmail, String userName, String userDepartment);

    MaterialResponse uploadYouTubeMaterial(MaterialRequest request, String userId, String userEmail, String userName, String userDepartment);

    Page<Material> getMaterialsByDepartmentAndFilters(
        String department, String subject, Integer year, Integer semester,
        String type, String search, Pageable pageable);

    Page<Material> getMaterialsByDepartment(String department, Pageable pageable);

    Page<Material> getMaterialsByUploaderAndDepartment(String userId, String department, Pageable pageable);

    Material getMaterialById(String id);

    MaterialResponse getMaterialByIdResponse(String id);

    MaterialResponse updateMaterial(String id, MaterialRequest request, MultipartFile file, String userId, String userDepartment, boolean isAdmin);

    void deleteMaterial(String id, String userId, String userDepartment, boolean isAdmin);

    Page<Material> searchMaterials(String query, String department, Integer year, Integer semester, Pageable pageable);

    Page<MaterialResponse> searchMaterials(String keyword, Pageable pageable);

    ResponseEntity<?> downloadMaterial(String id);

    Page<MaterialResponse> getAllMaterialsForAdmin(MaterialFilterRequest filter, Pageable pageable);

    void blockMaterial(String id, String adminNotes, String adminId);

    void unblockMaterial(String id, String adminId);

    long getTotalMaterialsCount();

    long getActiveMaterialsCount();

    long getBlockedMaterialsCount();
}
