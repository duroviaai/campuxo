package com.collegeportal.modules.auth.controller;

import com.collegeportal.modules.auth.dto.response.AuthResponseDTO;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingApprovalUsers() {
        return ResponseEntity.ok(userManagementService.getPendingApprovalUsers());
    }

    @PostMapping("/{userId}/approve")
    public ResponseEntity<AuthResponseDTO> approveUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userManagementService.approveUser(userId));
    }

    @DeleteMapping("/{userId}/reject")
    public ResponseEntity<AuthResponseDTO> rejectUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userManagementService.rejectUser(userId));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }
}