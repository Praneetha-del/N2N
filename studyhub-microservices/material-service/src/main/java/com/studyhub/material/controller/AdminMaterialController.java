package com.studyhub.material.controller;

import com.studyhub.common.dto.ApiResponse;
import com.studyhub.common.security.JwtTokenProvider;
import com.studyhub.material.dto.request.MaterialFilterRequest;
import com.studyhub.material.dto.response.MaterialResponse;
import com.studyhub.material.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/materials")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMaterialController {

    @Autowired
    private MaterialService materialService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String getAdminDepartment(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtTokenProvider.getDepartmentFromToken(token);
    }

    private String getAdminId(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllMaterials(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String token) {
        try {
            String department = getAdminDepartment(token);
            MaterialFilterRequest filter = new MaterialFilterRequest();
            filter.setDepartment(department);
            filter.setStatus(status);
            filter.setSearchKeyword(search);

            Pageable pageable = PageRequest.of(page, size);
            Page<MaterialResponse> materials = materialService.getAllMaterialsForAdmin(filter, pageable);
            return ResponseEntity.ok(ApiResponse.success("Materials retrieved for " + department, materials, "/api/admin/materials"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("No materials found", Page.empty(), "/api/admin/materials"));
        }
    }

    @PutMapping("/{materialId}/block")
    public ResponseEntity<ApiResponse> blockMaterial(
            @PathVariable String materialId,
            @RequestBody(required = false) Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            String adminId = getAdminId(token);
            String reason = request != null ? request.get("reason") : "Blocked by admin";
            materialService.blockMaterial(materialId, reason, adminId);
            return ResponseEntity.ok(ApiResponse.success("Material blocked", null, "/api/admin/materials/" + materialId + "/block"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/materials/" + materialId + "/block"));
        }
    }

    @PutMapping("/{materialId}/unblock")
    public ResponseEntity<ApiResponse> unblockMaterial(
            @PathVariable String materialId,
            @RequestHeader("Authorization") String token) {
        try {
            String adminId = getAdminId(token);
            materialService.unblockMaterial(materialId, adminId);
            return ResponseEntity.ok(ApiResponse.success("Material unblocked", null, "/api/admin/materials/" + materialId + "/unblock"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(e.getMessage(), "/api/admin/materials/" + materialId + "/unblock"));
        }
    }
}
