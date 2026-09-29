package com.studyhub.controller;

import com.studyhub.dto.request.MaterialFilterRequest;
import com.studyhub.dto.request.MaterialRequest;
import com.studyhub.dto.response.ApiResponse;
import com.studyhub.dto.response.MaterialResponse;
import com.studyhub.entity.Material;
import com.studyhub.entity.User;
import com.studyhub.repository.UserRepository;
import com.studyhub.security.JwtTokenProvider;
import com.studyhub.service.MaterialService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String getUserDepartment(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getDepartment();
    }

    private String getUserId(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> uploadMaterial(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("subject") String subject,
            @RequestParam("subjectId") String subjectId,
            @RequestParam("year") Integer year,
            @RequestParam("semester") Integer semester,
            @RequestParam("type") String type,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "youTubeUrl", required = false) String youTubeUrl,
            @RequestHeader("Authorization") String token) {

        try {
            String userId = getUserId(token);
            String userDepartment = getUserDepartment(token);

            Material material = new Material();
            material.setTitle(title);
            material.setDescription(description);
            material.setSubject(subject);
            material.setSubjectId(subjectId);
            material.setDepartment(userDepartment);
            material.setYear(year);
            material.setSemester(semester);
            material.setType(type);
            material.setUploadedBy(userId);
            material.setYouTubeUrl(youTubeUrl);
            material.setStatus("ACTIVE");

            Material saved = materialService.uploadMaterial(material, file, youTubeUrl);
            return ResponseEntity.ok(ApiResponse.success("Material uploaded successfully", saved, "/api/materials"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/materials"));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllMaterials(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable,
            @RequestHeader(value = "Authorization", required = false) String token) {

        String userDepartment = null;
        if (token != null && !token.isEmpty()) {
            try {
                userDepartment = getUserDepartment(token);
            } catch (Exception e) {
                userDepartment = null;
            }
        }

        if (userDepartment != null) {
            Page<Material> materials = materialService.getMaterialsByDepartmentAndFilters(
                    userDepartment, subject, year, semester, type, search, pageable);
            return ResponseEntity.ok(ApiResponse.success("Materials retrieved for " + userDepartment, 
                    materials.getContent(), "/api/materials"));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Please login to view materials", 
                    List.of(), "/api/materials"));
        }
    }
// Add this method to MaterialController.java

@GetMapping("/stats")
public ResponseEntity<ApiResponse> getMaterialStats(@RequestHeader("Authorization") String token) {
    try {
        String userDepartment = getUserDepartment(token);
        long total = materialService.getTotalMaterialsCount();
        long active = materialService.getActiveMaterialsCount();
        long blocked = materialService.getBlockedMaterialsCount();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("active", active);
        stats.put("blocked", blocked);
        stats.put("department", userDepartment);
        
        return ResponseEntity.ok(ApiResponse.success("Material stats retrieved", stats, "/api/materials/stats"));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/materials/stats"));
    }
}
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse> getMaterialsByDepartment(
            @PathVariable String department,
            @PageableDefault(size = 20) Pageable pageable,
            @RequestHeader("Authorization") String token) {

        String userDepartment = getUserDepartment(token);
        
        if (!userDepartment.equalsIgnoreCase(department)) {
            return ResponseEntity.status(403).body(ApiResponse.error(
                    "You can only view materials for your department: " + userDepartment, 
                    "/api/materials/department/" + department));
        }

        Page<Material> materials = materialService.getMaterialsByDepartment(department, pageable);
        return ResponseEntity.ok(ApiResponse.success("Materials retrieved for " + department, 
                materials.getContent(), "/api/materials/department/" + department));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getMaterialById(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {

        String userDepartment = getUserDepartment(token);
        Material material = materialService.getMaterialById(id);

        if (!material.getDepartment().equalsIgnoreCase(userDepartment)) {
            return ResponseEntity.status(403).body(ApiResponse.error(
                    "You don't have access to this material. This material belongs to " + 
                    material.getDepartment() + " department.", 
                    "/api/materials/" + id));
        }

        return ResponseEntity.ok(ApiResponse.success("Material retrieved", material, "/api/materials/" + id));
    }

    @GetMapping("/my-materials")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getMyMaterials(
            @RequestHeader("Authorization") String token,
            @PageableDefault(size = 20) Pageable pageable) {

        String userId = getUserId(token);
        String userDepartment = getUserDepartment(token);

        Page<Material> materials = materialService.getMaterialsByUploaderAndDepartment(
                userId, userDepartment, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Your materials retrieved", 
                materials.getContent(), "/api/materials/my-materials"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateMaterial(
            @PathVariable String id,
            @Valid @RequestBody MaterialRequest request,
            @RequestHeader("Authorization") String token) {

        String userId = getUserId(token);
        String userDepartment = getUserDepartment(token);

        Material existing = materialService.getMaterialById(id);

        if (!existing.getDepartment().equalsIgnoreCase(userDepartment)) {
            return ResponseEntity.status(403).body(ApiResponse.error(
                    "You cannot edit materials from " + existing.getDepartment() + " department",
                    "/api/materials/" + id));
        }

        Material updated = materialService.updateMaterial(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Material updated", updated, "/api/materials/" + id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteMaterial(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {

        String userId = getUserId(token);
        String userDepartment = getUserDepartment(token);

        Material material = materialService.getMaterialById(id);

        if (!material.getDepartment().equalsIgnoreCase(userDepartment)) {
            return ResponseEntity.status(403).body(ApiResponse.error(
                    "You cannot delete materials from " + material.getDepartment() + " department",
                    "/api/materials/" + id));
        }

        materialService.deleteMaterial(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Material deleted successfully", null, "/api/materials/" + id));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchMaterials(
            @RequestParam String query,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @PageableDefault(size = 20) Pageable pageable,
            @RequestHeader("Authorization") String token) {

        String userDepartment = getUserDepartment(token);
        
        Page<Material> materials = materialService.searchMaterials(
                query, userDepartment, year, semester, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Search results", 
                materials.getContent(), "/api/materials/search"));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> downloadMaterial(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {

        String userDepartment = getUserDepartment(token);
        Material material = materialService.getMaterialById(id);

        if (!material.getDepartment().equalsIgnoreCase(userDepartment)) {
            return ResponseEntity.status(403).body(ApiResponse.error(
                    "You cannot download materials from " + material.getDepartment() + " department",
                    "/api/materials/" + id + "/download"));
        }

        return materialService.downloadMaterial(id);
    }
}