package com.studyhub.material.controller;

import com.studyhub.common.dto.ApiResponse;
import com.studyhub.common.security.JwtTokenProvider;
import com.studyhub.material.dto.request.MaterialRequest;
import com.studyhub.material.dto.response.MaterialResponse;
import com.studyhub.material.entity.Material;
import com.studyhub.material.service.MaterialService;
import io.jsonwebtoken.Claims;
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
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private Claims getClaims(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token == null || token.isEmpty()) {
            return null;
        }
        try {
            return jwtTokenProvider.getClaimsFromToken(token);
        } catch (Exception e) {
            return null;
        }
    }

    private String getUserId(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.get("userId", String.class) : null;
    }

    private String getUserDepartment(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.get("department", String.class) : null;
    }

    private String getUserEmail(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.getSubject() : null;
    }

    private String getUserName(String token) {
        Claims claims = getClaims(token);
        if (claims == null) return "Faculty";
        String name = claims.get("fullName", String.class);
        return name != null ? name : getUserEmail(token);
    }

    private boolean isAdmin(String token) {
        Claims claims = getClaims(token);
        if (claims == null) return false;
        String role = claims.get("role", String.class);
        return "ROLE_ADMIN".equals(role) || "ADMIN".equals(role);
    }

    @PostMapping(value = {"", "/upload"})
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> uploadMaterial(
            @ModelAttribute MaterialRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String userId = getUserId(token);
            String userEmail = getUserEmail(token);
            String userName = getUserName(token);
            String department = request.getDepartment() != null && !request.getDepartment().isEmpty()
                    ? request.getDepartment()
                    : getUserDepartment(token);
            if (department == null) department = "IT";

            MaterialResponse response;
            if (request.getYouTubeUrl() != null && !request.getYouTubeUrl().isEmpty()) {
                response = materialService.uploadYouTubeMaterial(request, userId, userEmail, userName, department);
            } else {
                response = materialService.uploadMaterial(request, file, userId, userEmail, userName, department);
            }

            return ResponseEntity.ok(ApiResponse.success("Material uploaded successfully", response, "/api/materials/upload"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/materials/upload"));
        }
    }

    @PostMapping("/youtube")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> uploadYouTubeMaterial(
            @Valid @RequestBody MaterialRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String userId = getUserId(token);
            String userEmail = getUserEmail(token);
            String userName = getUserName(token);
            String department = getUserDepartment(token);

            MaterialResponse response = materialService.uploadYouTubeMaterial(request, userId, userEmail, userName, department);
            return ResponseEntity.ok(ApiResponse.success("YouTube video added successfully", response, "/api/materials/youtube"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/materials/youtube"));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getMaterials(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            String dept = department;
            if (dept == null && token != null) {
                dept = getUserDepartment(token);
            }
            if (dept == null) {
                dept = "IT";
            }

            Page<Material> materials = materialService.getMaterialsByDepartmentAndFilters(
                    dept, subject, year, semester, type, search, pageable);
            return ResponseEntity.ok(ApiResponse.success("Materials retrieved", materials, "/api/materials"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Materials retrieved", Page.empty(), "/api/materials"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchMaterials(
            @RequestParam String query,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestHeader("Authorization") String token,
            @PageableDefault(size = 10) Pageable pageable) {
        try {
            String department = getUserDepartment(token);
            Page<Material> materials = materialService.searchMaterials(query, department, year, semester, pageable);
            return ResponseEntity.ok(ApiResponse.success("Search results", materials, "/api/materials/search"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/materials/search"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getMaterialById(@PathVariable String id) {
        try {
            MaterialResponse material = materialService.getMaterialByIdResponse(id);
            return ResponseEntity.ok(ApiResponse.success("Material retrieved", material, "/api/materials/" + id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage(), "/api/materials/" + id));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateMaterial(
            @PathVariable String id,
            @ModelAttribute MaterialRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestHeader("Authorization") String token) {
        try {
            String userId = getUserId(token);
            String department = getUserDepartment(token);
            boolean admin = isAdmin(token);

            MaterialResponse response = materialService.updateMaterial(id, request, file, userId, department, admin);
            return ResponseEntity.ok(ApiResponse.success("Material updated", response, "/api/materials/" + id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/materials/" + id));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteMaterial(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {
        try {
            String userId = getUserId(token);
            String department = getUserDepartment(token);
            boolean admin = isAdmin(token);

            materialService.deleteMaterial(id, userId, department, admin);
            return ResponseEntity.ok(ApiResponse.success("Material deleted", null, "/api/materials/" + id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/materials/" + id));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadMaterial(@PathVariable String id) {
        return materialService.downloadMaterial(id);
    }

    @GetMapping("/my-materials")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getMyMaterials(
            @RequestHeader("Authorization") String token,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        try {
            String userId = getUserId(token);
            String department = getUserDepartment(token);
            Page<Material> materials = materialService.getMaterialsByUploaderAndDepartment(userId, department, pageable);
            return ResponseEntity.ok(ApiResponse.success("Materials retrieved", materials, "/api/materials/my-materials"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "/api/materials/my-materials"));
        }
    }
}
