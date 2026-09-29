package com.studyhub.serviceImpl;

import com.studyhub.dto.request.MaterialFilterRequest;
import com.studyhub.dto.request.MaterialRequest;
import com.studyhub.dto.response.MaterialResponse;
import com.studyhub.entity.Material;
import com.studyhub.entity.User;
import com.studyhub.exception.ForbiddenException;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.mapper.MaterialMapper;
import com.studyhub.repository.MaterialRepository;
import com.studyhub.repository.UserRepository;
import com.studyhub.service.FileStorageService;
import com.studyhub.service.MaterialService;
import com.studyhub.validator.FileValidator;
import com.studyhub.validator.YouTubeUrlValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@Transactional
public class MaterialServiceImpl implements MaterialService {

    // Constants
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_BLOCKED = "BLOCKED";
    private static final String TYPE_VIDEO = "VIDEO";

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private MaterialMapper materialMapper;

    @Autowired
    private FileValidator fileValidator;

    @Autowired
    private YouTubeUrlValidator youTubeUrlValidator;

    @Override
    public Material uploadMaterial(Material material, MultipartFile file, String youTubeUrl) {
        if (youTubeUrl != null && !youTubeUrl.isEmpty()) {
            youTubeUrlValidator.validate(youTubeUrl);
            material.setYouTubeUrl(youTubeUrl);
            material.setType(TYPE_VIDEO);
        } else if (file != null && !file.isEmpty()) {
            fileValidator.validateFile(file);
            // ✅ FIXED: Pass folder name as second parameter
            String fileUrl = fileStorageService.uploadFile(file, "materials");
            String publicId = fileStorageService.getPublicIdFromUrl(fileUrl);
            material.setFileUrl(fileUrl);
            material.setFilePublicId(publicId);
            material.setFileName(file.getOriginalFilename());
            material.setFileSize(file.getSize());
        }
        
        material.setStatus(STATUS_ACTIVE);
        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        
        return materialRepository.save(material);
    }

    @Override
    public MaterialResponse uploadMaterial(MaterialRequest request, MultipartFile file, String userEmail) {
        User user = getUserByEmail(userEmail);
        
        Material material = new Material();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(request.getSubject());
        material.setSubjectId(request.getSubjectId());
        material.setDepartment(user.getDepartment());
        material.setYear(request.getYear());
        material.setSemester(request.getSemester());
        material.setType(request.getType());
        material.setUploadedBy(user.getId());
        material.setUploadedByName(user.getFirstName() + " " + user.getLastName());
        material.setUploadedByEmail(user.getEmail());
        
        if (file != null && !file.isEmpty()) {
            fileValidator.validateFile(file);
            // ✅ FIXED: Pass folder name as second parameter
            String fileUrl = fileStorageService.uploadFile(file, "materials");
            String publicId = fileStorageService.getPublicIdFromUrl(fileUrl);
            material.setFileUrl(fileUrl);
            material.setFilePublicId(publicId);
            material.setFileName(file.getOriginalFilename());
            material.setFileSize(file.getSize());
        }
        
        material.setStatus(STATUS_ACTIVE);
        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        
        Material saved = materialRepository.save(material);
        return materialMapper.toResponse(saved);
    }

    @Override
    public MaterialResponse uploadYouTubeMaterial(MaterialRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        
        youTubeUrlValidator.validate(request.getYouTubeUrl());
        
        Material material = new Material();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(request.getSubject());
        material.setSubjectId(request.getSubjectId());
        material.setDepartment(user.getDepartment());
        material.setYear(request.getYear());
        material.setSemester(request.getSemester());
        material.setType(TYPE_VIDEO);
        material.setYouTubeUrl(request.getYouTubeUrl());
        material.setVideoTitle(request.getVideoTitle());
        material.setUploadedBy(user.getId());
        material.setUploadedByName(user.getFirstName() + " " + user.getLastName());
        material.setUploadedByEmail(user.getEmail());
        material.setStatus(STATUS_ACTIVE);
        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        
        Material saved = materialRepository.save(material);
        return materialMapper.toResponse(saved);
    }

    @Override
    public Page<Material> getMaterialsByDepartmentAndFilters(
            String department, String subject, Integer year, Integer semester, 
            String type, String search, Pageable pageable) {
        
        if (search != null && !search.isEmpty()) {
            return materialRepository.searchByDepartmentAndKeyword(department, search, pageable);
        }
        
        return materialRepository.findByDepartmentAndFilters(
            department, subject, year, semester, type, pageable);
    }

    @Override
    public Page<Material> getMaterialsByDepartment(String department, Pageable pageable) {
        return materialRepository.findByDepartment(department, pageable);
    }

    @Override
    public Page<Material> getMaterialsByUploaderAndDepartment(String userId, String department, Pageable pageable) {
        return materialRepository.findByUploadedByAndDepartment(userId, department, pageable);
    }

    @Override
    public Material getMaterialById(String id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));
    }

    @Override
    public MaterialResponse getMaterialByIdResponse(String id) {
        Material material = getMaterialById(id);
        return materialMapper.toResponse(material);
    }

    @Override
    public Material updateMaterial(String id, MaterialRequest request, String userId) {
        Material material = getMaterialById(id);
        
        if (!material.getUploadedBy().equals(userId)) {
            throw new ForbiddenException("You can only update your own materials");
        }
        
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(request.getSubject());
        material.setSubjectId(request.getSubjectId());
        material.setYear(request.getYear());
        material.setSemester(request.getSemester());
        material.setUpdatedAt(LocalDateTime.now());
        
        return materialRepository.save(material);
    }

    @Override
    public MaterialResponse updateMaterial(String id, MaterialRequest request, MultipartFile file, String userEmail) {
        User user = getUserByEmail(userEmail);
        Material material = getMaterialById(id);
        
        if (!material.getUploadedBy().equals(user.getId())) {
            throw new ForbiddenException("You can only update your own materials");
        }
        
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(request.getSubject());
        material.setSubjectId(request.getSubjectId());
        material.setYear(request.getYear());
        material.setSemester(request.getSemester());
        
        if (file != null && !file.isEmpty()) {
            if (material.getFilePublicId() != null) {
                fileStorageService.deleteFile(material.getFilePublicId());
            }
            // ✅ FIXED: Pass folder name as second parameter
            String fileUrl = fileStorageService.uploadFile(file, "materials");
            String publicId = fileStorageService.getPublicIdFromUrl(fileUrl);
            material.setFileUrl(fileUrl);
            material.setFilePublicId(publicId);
            material.setFileName(file.getOriginalFilename());
            material.setFileSize(file.getSize());
        }
        
        material.setUpdatedAt(LocalDateTime.now());
        Material updated = materialRepository.save(material);
        return materialMapper.toResponse(updated);
    }

    @Override
    public void deleteMaterial(String id, String userId) {
        Material material = getMaterialById(id);
        
        if (!material.getUploadedBy().equals(userId)) {
            throw new ForbiddenException("You can only delete your own materials");
        }
        
        if (material.getFilePublicId() != null) {
            fileStorageService.deleteFile(material.getFilePublicId());
        }
        
        materialRepository.delete(material);
    }

    @Override
    public Page<Material> searchMaterials(String query, String department, Integer year, Integer semester, Pageable pageable) {
        return materialRepository.searchByDepartmentAndFilters(query, department, year, semester, pageable);
    }

    @Override
    public Page<MaterialResponse> searchMaterials(String keyword, Pageable pageable) {
        Page<Material> materials = materialRepository.searchMaterials(keyword, STATUS_ACTIVE, pageable);
        return materials.map(materialMapper::toResponse);
    }

    @Override
    public ResponseEntity<?> downloadMaterial(String id) {
        Material material = getMaterialById(id);
        
        if (material.getFileUrl() == null) {
            throw new ResourceNotFoundException("No file available for download");
        }
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + material.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(material.getFileUrl());
    }

    @Override
    public Page<MaterialResponse> getAllMaterialsForAdmin(MaterialFilterRequest filter, Pageable pageable) {
        Page<Material> materials = materialRepository.findByFilters(
            filter.getDepartment(),
            filter.getYear(),
            filter.getSemester(),
            filter.getSubject(),
            filter.getType(),
            filter.getStatus(),
            pageable
        );
        return materials.map(materialMapper::toResponse);
    }

    @Override
    public void blockMaterial(String id, String adminNotes, String adminEmail) {
        Material material = getMaterialById(id);
        material.setStatus(STATUS_BLOCKED);
        material.setAdminNotes(adminNotes);
        material.setBlockedBy(adminEmail);
        material.setBlockedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        materialRepository.save(material);
    }

    @Override
    public void unblockMaterial(String id, String adminEmail) {
        Material material = getMaterialById(id);
        material.setStatus(STATUS_ACTIVE);
        material.setAdminNotes(null);
        material.setBlockedBy(null);
        material.setBlockedAt(null);
        material.setUpdatedAt(LocalDateTime.now());
        materialRepository.save(material);
    }

    @Override
    public long getTotalMaterialsCount() {
        return materialRepository.count();
    }

    @Override
    public long getActiveMaterialsCount() {
        return materialRepository.countByStatus(STATUS_ACTIVE);
    }

    @Override
    public long getBlockedMaterialsCount() {
        return materialRepository.countByStatus(STATUS_BLOCKED);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}