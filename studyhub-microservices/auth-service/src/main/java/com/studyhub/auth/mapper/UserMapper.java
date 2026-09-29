package com.studyhub.auth.mapper;

import com.studyhub.auth.dto.response.UserResponse;
import com.studyhub.auth.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setDepartment(user.getDepartment());
        response.setRollNumber(user.getRollNumber());
        response.setEmployeeId(user.getEmployeeId());
        response.setBranch(user.getBranch());
        response.setJoiningYear(user.getJoiningYear());
        response.setYear(user.getYear());
        response.setSemester(user.getSemester());
        response.setProfilePicture(user.getProfilePicture());
        response.setIsActive(user.getIsActive());
        response.setIsApproved(user.getIsApproved());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());

        return response;
    }
}
