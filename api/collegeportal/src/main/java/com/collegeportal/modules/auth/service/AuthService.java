package com.collegeportal.modules.auth.service;

import com.collegeportal.modules.auth.dto.request.LoginRequestDTO;
import com.collegeportal.modules.auth.dto.request.RegisterRequestDTO;
import com.collegeportal.modules.auth.dto.request.ForgotPasswordRequestDTO;
import com.collegeportal.modules.auth.dto.request.ResetPasswordRequestDTO;
import com.collegeportal.modules.auth.dto.response.AuthResponseDTO;

public interface AuthService {

    AuthResponseDTO register(RegisterRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);
    
    AuthResponseDTO forgotPassword(ForgotPasswordRequestDTO request);
    
    AuthResponseDTO resetPassword(ResetPasswordRequestDTO request);
}
