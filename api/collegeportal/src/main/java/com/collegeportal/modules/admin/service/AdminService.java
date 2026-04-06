package com.collegeportal.modules.admin.service;

import com.collegeportal.modules.admin.dto.response.AdminResponseDTO;
import com.collegeportal.modules.admin.dto.response.AdminStatsDTO;

import java.util.List;

public interface AdminService {
    List<AdminResponseDTO> getPendingUsers();
    AdminResponseDTO approveUser(Long userId);
    AdminResponseDTO rejectUser(Long userId);
    AdminStatsDTO getStats();
}
