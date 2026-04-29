package com.collegeportal.modules.auth.controller;

import com.collegeportal.modules.auth.dto.request.CompleteProfileRequestDTO;
import com.collegeportal.modules.auth.dto.request.GoogleRegisterRequestDTO;
import com.collegeportal.modules.auth.dto.request.LoginRequestDTO;
import com.collegeportal.modules.auth.dto.request.RefreshTokenRequestDTO;
import com.collegeportal.modules.auth.dto.request.RegisterRequestDTO;
import com.collegeportal.modules.auth.dto.request.ForgotPasswordRequestDTO;
import com.collegeportal.modules.auth.dto.request.ResetPasswordRequestDTO;
import com.collegeportal.modules.auth.dto.request.GoogleAuthRequestDTO;
import com.collegeportal.modules.auth.dto.response.AuthResponseDTO;
import com.collegeportal.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        log.info("Registration request received for email: {}", request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponseDTO> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponseDTO> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken()));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDTO> googleAuth(@Valid @RequestBody GoogleAuthRequestDTO request) {
        return ResponseEntity.ok(authService.googleAuth(request));
    }

    @PostMapping("/google/register")
    public ResponseEntity<AuthResponseDTO> googleRegister(@Valid @RequestBody GoogleRegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.googleRegister(request.getAccessToken(), request.toRegisterRequest()));
    }

    @PutMapping("/complete-profile")
    public ResponseEntity<AuthResponseDTO> completeProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CompleteProfileRequestDTO request) {
        return ResponseEntity.ok(authService.completeProfile(userDetails.getUsername(), request));
    }
}
