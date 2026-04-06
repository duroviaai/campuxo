package com.collegeportal.modules.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "College Portal API is running",
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/auth")
    public ResponseEntity<Map<String, String>> authHealth() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Authentication service is ready",
            "endpoints", "/api/v1/auth/register, /api/v1/auth/login"
        ));
    }
}