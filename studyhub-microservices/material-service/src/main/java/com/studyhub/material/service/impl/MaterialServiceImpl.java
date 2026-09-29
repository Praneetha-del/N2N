package com.studyhub.material.service.impl;

import com.studyhub.common.exception.ForbiddenException;
import com.studyhub.common.exception.ResourceNotFoundException;
import com.studyhub.material.dto.request.MaterialFilterRequest;
import com.studyhub.material.dto.request.MaterialRequest;
import com.studyhub.material.dto.response.MaterialResponse;
import com.studyhub.material.entity.Material;
import com.studyhub.material.mapper.MaterialMapper;
import com.studyhub.material.repository.MaterialRepository;
import com.studyhub.material.service.FileStorageService;
import com.studyhub.material.service.MaterialService;
import com.studyhub.material.validator.FileValidator;
import com.studyhub.material.validator.YouTubeUrlValidator;
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

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_BLOCKED = "BLOCKED";
    private static final String TYPE_VIDEO = "VIDEO";

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private MaterialMapper materialMapper;

    @Autowired
    private FileValidator fileValidator;

    @Autowired
    private YouTubeUrlValidator youTubeUrlValidator;

    @Override
    public MaterialResponse uploadMaterial(MaterialRequest request, MultipartFile file, String userId, String userEmail, String userName, String userDepartment) {
        Material material = new Material();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(request.getSubject());
        material.setSubjectId(request.getSubjectId());
        material.setSubjectName(request.getSubjectName() != null ? request.getSubjectName() : request.getSubject());
        material.setDepartment(request.getDepartment() != null ? request.getDepartment() : userDepartment);
        material.setDepartmentName(request.getDepartmentName() != null ? request.getDepartmentName() : material.getDepartment());
        material.setDepartmentId(request.getDepartmentId());
        material.setJoiningYear(request.getJoiningYear());
        material.setYear(request.getYear());
        material.setAcademicYear(request.getAcademicYear() != null ? request.getAcademicYear() : (request.getYear() != null ? request.getYear().toString() : null));
        material.setSemester(request.getSemester());
        material.setType(request.getType());
        material.setUploadedBy(userId);
        material.setUploadedByName(userName);
        material.setUploadedByEmail(userEmail);

        if (file != null && !file.isEmpty()) {
            fileValidator.validateFile(file);
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
    public MaterialResponse uploadYouTubeMaterial(MaterialRequest request, String userId, String userEmail, String userName, String userDepartment) {
        if (request.getYouTubeUrl() != null && !request.getYouTubeUrl().isEmpty()) {
            youTubeUrlValidator.validate(request.getYouTubeUrl());
        }

        Material material = new Material();
        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setSubject(request.getSubject());
        material.setSubjectId(request.getSubjectId());
        material.setSubjectName(request.getSubjectName() != null ? request.getSubjectName() : request.getSubject());
        material.setDepartment(request.getDepartment() != null ? request.getDepartment() : userDepartment);
        material.setDepartmentName(request.getDepartmentName() != null ? request.getDepartmentName() : material.getDepartment());
        material.setDepartmentId(request.getDepartmentId());
        material.setJoiningYear(request.getJoiningYear());
        material.setYear(request.getYear());
        material.setAcademicYear(request.getAcademicYear() != null ? request.getAcademicYear() : (request.getYear() != null ? request.getYear().toString() : null));
        material.setSemester(request.getSemester());
        material.setType(TYPE_VIDEO);
        material.setYouTubeUrl(request.getYouTubeUrl());
        material.setVideoTitle(request.getVideoTitle());
        material.setUploadedBy(userId);
        material.setUploadedByName(userName);
        material.setUploadedByEmail(userEmail);
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

        if (search != null && !search.trim().isEmpty()) {
            return materialRepository.searchByDepartmentAndKeyword(department, search.trim(), pageable);
        }

        if (subject != null && !subject.isEmpty() && year != null && semester != null && type != null && !type.isEmpty()) {
            return materialRepository.findByDepartmentAndFilters(department, subject, year, semester, type, pageable);
        }

        return materialRepository.findByDepartment(department, pageable);
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
                .orElseThrow(() -> new ResourceNotFoundException("Material", "id", id));
    }

    @Override
    public MaterialResponse getMaterialByIdResponse(String id) {
        Material material = getMaterialById(id);
        material.setViewCount(material.getViewCount() + 1);
        materialRepository.save(material);
        return materialMapper.toResponse(material);
    }

    @Override
    public MaterialResponse updateMaterial(String id, MaterialRequest request, MultipartFile file, String userId, String userDepartment, boolean isAdmin) {
        Material material = getMaterialById(id);

        if (!isAdmin && !material.getUploadedBy().equals(userId)) {
            throw new ForbiddenException("You can only update materials that you uploaded");
        }

        if (request.getTitle() != null) material.setTitle(request.getTitle());
        if (request.getDescription() != null) material.setDescription(request.getDescription());
        if (request.getSubject() != null) material.setSubject(request.getSubject());
        if (request.getSubjectId() != null) material.setSubjectId(request.getSubjectId());
        if (request.getYear() != null) material.setYear(request.getYear());
        if (request.getSemester() != null) material.setSemester(request.getSemester());
        if (request.getType() != null) material.setType(request.getType());

        if (file != null && !file.isEmpty()) {
            fileValidator.validateFile(file);
            if (material.getFilePublicId() != null) {
                fileStorageService.deleteFile(material.getFilePublicId());
            }
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
    public void deleteMaterial(String id, String userId, String userDepartment, boolean isAdmin) {
        Material material = getMaterialById(id);

        if (!isAdmin && !material.getUploadedBy().equals(userId)) {
            throw new ForbiddenException("You can only delete materials that you uploaded");
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
        return materialRepository.searchMaterials(keyword, STATUS_ACTIVE, pageable)
                .map(materialMapper::toResponse);
    }

    @Override
    public ResponseEntity<?> downloadMaterial(String id) {
        Material material = getMaterialById(id);
        material.setDownloadCount(material.getDownloadCount() + 1);
        materialRepository.save(material);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + material.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(material.getFileUrl());
    }

    @Override
    public Page<MaterialResponse> getAllMaterialsForAdmin(MaterialFilterRequest filter, Pageable pageable) {
        if (filter.getDepartment() != null && !filter.getDepartment().isEmpty()) {
            return materialRepository.findByDepartment(filter.getDepartment(), pageable)
                    .map(materialMapper::toResponse);
        }
        return materialRepository.findAll(pageable)
                .map(materialMapper::toResponse);
    }

    @Override
    public void blockMaterial(String id, String adminNotes, String adminId) {
        Material material = getMaterialById(id);
        material.setStatus(STATUS_BLOCKED);
        material.setAdminNotes(adminNotes);
        material.setBlockedBy(adminId);
        material.setBlockedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        materialRepository.save(material);
    }

    @Override
    public void unblockMaterial(String id, String adminId) {
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
}
