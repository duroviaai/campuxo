package com.collegeportal.modules.registrationwindow.service;

import com.collegeportal.modules.registrationwindow.dto.request.RegistrationWindowRequestDTO;
import com.collegeportal.modules.registrationwindow.dto.response.RegistrationWindowResponseDTO;

import java.util.List;

public interface RegistrationWindowService {

    List<RegistrationWindowResponseDTO> getAll();

    List<RegistrationWindowResponseDTO> getActiveForRole(String role);

    RegistrationWindowResponseDTO create(RegistrationWindowRequestDTO request);

    RegistrationWindowResponseDTO update(Long id, RegistrationWindowRequestDTO request);

    void delete(Long id);

    void toggleActive(Long id);

    boolean isRegistrationOpen(Long batchId, String role, Integer yearOfStudy);
}
