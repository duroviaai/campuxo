package com.collegeportal.modules.admin.service;

import com.collegeportal.modules.admin.dto.response.AdminResponseDTO;
import com.collegeportal.modules.admin.dto.response.AdminStatsDTO;
import com.collegeportal.shared.enums.RoleType;

import java.util.List;

public interface AdminService {
    List<AdminResponseDTO> getPendingUsers(RoleType role);
    List<AdminResponseDTO> getApprovedUsers(RoleType role);
    List<AdminResponseDTO> getRejectedUsers();
    AdminResponseDTO approveUser(Long userId);
    void rejectUser(Long userId, String reason);
    void revokeUser(Long userId);
    void deleteUser(Long userId);
    void bulkApprove(List<Long> userIds);
    void bulkReject(List<Long> userIds, String reason);
    AdminStatsDTO getStats();
}
