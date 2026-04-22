package com.collegeportal.modules.admin.service;

import com.collegeportal.modules.admin.dto.response.AdminResponseDTO;
import com.collegeportal.modules.admin.dto.response.AdminStatsDTO;
import com.collegeportal.shared.enums.RoleType;

import java.util.List;

public interface AdminService {
    List<AdminResponseDTO> getPendingUsers(RoleType role);
    List<AdminResponseDTO> getApprovedUsers(RoleType role);
    AdminResponseDTO approveUser(Long userId);
    void rejectUser(Long userId);
    void revokeUser(Long userId);
    AdminStatsDTO getStats();
}
