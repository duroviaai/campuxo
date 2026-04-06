package com.collegeportal.modules.auth.service;

import com.collegeportal.modules.auth.dto.response.AuthResponseDTO;
import com.collegeportal.modules.auth.entity.User;

import java.util.List;

public interface UserManagementService {
    
    List<User> getPendingApprovalUsers();
    
    AuthResponseDTO approveUser(Long userId);
    
    AuthResponseDTO rejectUser(Long userId);
    
    List<User> getAllUsers();
}