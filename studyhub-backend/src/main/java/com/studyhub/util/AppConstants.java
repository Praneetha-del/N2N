package com.studyhub.util;

public class AppConstants {
    
    public static final String ROLE_STUDENT = "ROLE_STUDENT";
    public static final String ROLE_TEACHER = "ROLE_TEACHER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    
    public static final String MATERIAL_STATUS_ACTIVE = "ACTIVE";
    public static final String MATERIAL_STATUS_BLOCKED = "BLOCKED";
    
    public static final String MATERIAL_TYPE_PDF = "PDF";
    public static final String MATERIAL_TYPE_PPT = "PPT";
    public static final String MATERIAL_TYPE_DOC = "DOC";
    public static final String MATERIAL_TYPE_VIDEO = "VIDEO";
    
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 50;
    
    public static final String DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
    
    private AppConstants() {
        // Private constructor to prevent instantiation
    }
}