package com.studyhub.dto.response;

public class AdminStatsResponse {
    
    private long totalUsers;
    private long totalStudents;
    private long totalTeachers;
    private long totalAdmins;
    private long pendingTeachers;
    private long totalMaterials;
    private long activeMaterials;
    private long blockedMaterials;
    private long totalDownloads;
    private long totalViews;
    
    // Default constructor
    public AdminStatsResponse() {
    }
    
    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }
    
    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }
    
    public long getTotalStudents() {
        return totalStudents;
    }
    
    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }
    
    public long getTotalTeachers() {
        return totalTeachers;
    }
    
    public void setTotalTeachers(long totalTeachers) {
        this.totalTeachers = totalTeachers;
    }
    
    public long getTotalAdmins() {
        return totalAdmins;
    }
    
    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }
    
    public long getPendingTeachers() {
        return pendingTeachers;
    }
    
    public void setPendingTeachers(long pendingTeachers) {
        this.pendingTeachers = pendingTeachers;
    }
    
    public long getTotalMaterials() {
        return totalMaterials;
    }
    
    public void setTotalMaterials(long totalMaterials) {
        this.totalMaterials = totalMaterials;
    }
    
    public long getActiveMaterials() {
        return activeMaterials;
    }
    
    public void setActiveMaterials(long activeMaterials) {
        this.activeMaterials = activeMaterials;
    }
    
    public long getBlockedMaterials() {
        return blockedMaterials;
    }
    
    public void setBlockedMaterials(long blockedMaterials) {
        this.blockedMaterials = blockedMaterials;
    }
    
    public long getTotalDownloads() {
        return totalDownloads;
    }
    
    public void setTotalDownloads(long totalDownloads) {
        this.totalDownloads = totalDownloads;
    }
    
    public long getTotalViews() {
        return totalViews;
    }
    
    public void setTotalViews(long totalViews) {
        this.totalViews = totalViews;
    }
}