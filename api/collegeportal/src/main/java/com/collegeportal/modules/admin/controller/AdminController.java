package com.collegeportal.modules.admin.controller;

import com.collegeportal.modules.admin.dto.request.BulkUserRequestDTO;
import com.collegeportal.modules.admin.dto.request.RejectUserRequestDTO;
import com.collegeportal.modules.admin.dto.response.AdminResponseDTO;
import com.collegeportal.modules.admin.dto.response.AdminStatsDTO;
import com.collegeportal.modules.admin.service.AdminService;
import com.collegeportal.shared.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/departments-summary")
    public ResponseEntity<Map<String, Long>> getDepartmentsSummary() {
        return ResponseEntity.ok(adminService.getDepartmentPendingCounts());
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<AdminResponseDTO>> getPendingUsers(
            @RequestParam(required = false) RoleType role,
            @RequestParam(required = false) String department) {
        List<AdminResponseDTO> users = adminService.getPendingUsers(role);
        if (department != null && !department.isBlank()) {
            users = users.stream().filter(u -> department.equals(u.getDepartment())).toList();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/approved-users")
    public ResponseEntity<List<AdminResponseDTO>> getApprovedUsers(
            @RequestParam(required = false) RoleType role,
            @RequestParam(required = false) String department) {
        List<AdminResponseDTO> users = adminService.getApprovedUsers(role);
        if (department != null && !department.isBlank()) {
            users = users.stream().filter(u -> department.equals(u.getDepartment())).toList();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/rejected-users")
    public ResponseEntity<List<AdminResponseDTO>> getRejectedUsers(
            @RequestParam(required = false) String department) {
        List<AdminResponseDTO> users = adminService.getRejectedUsers();
        if (department != null && !department.isBlank()) {
            users = users.stream().filter(u -> department.equals(u.getDepartment())).toList();
        }
        return ResponseEntity.ok(users);
    }

    @PutMapping("/approve/{userId}")
    public ResponseEntity<AdminResponseDTO> approveUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.approveUser(userId));
    }

    @DeleteMapping("/reject/{userId}")
    public ResponseEntity<Void> rejectUser(
            @PathVariable Long userId,
            @RequestBody(required = false) RejectUserRequestDTO body) {
        adminService.rejectUser(userId, body != null ? body.getReason() : null);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/revoke/{userId}")
    public ResponseEntity<Void> revokeUser(@PathVariable Long userId) {
        adminService.revokeUser(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/bulk-approve")
    public ResponseEntity<Void> bulkApprove(@RequestBody BulkUserRequestDTO body) {
        adminService.bulkApprove(body.getUserIds());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bulk-reject")
    public ResponseEntity<Void> bulkReject(@RequestBody BulkUserRequestDTO body) {
        adminService.bulkReject(body.getUserIds(), body.getReason());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{userId}/assign-hod")
    public ResponseEntity<Void> assignHod(@PathVariable Long userId) {
        adminService.assignHodRole(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{userId}/remove-hod")
    public ResponseEntity<Void> removeHod(@PathVariable Long userId) {
        adminService.removeHodRole(userId);
        return ResponseEntity.noContent().build();
    }
}
