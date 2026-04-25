package com.collegeportal.modules.batch.service;

import com.collegeportal.modules.batch.dto.request.BatchRequestDTO;
import com.collegeportal.modules.batch.dto.response.BatchResponseDTO;

import java.util.List;

public interface BatchService {
    List<BatchResponseDTO> getAll();
    BatchResponseDTO create(BatchRequestDTO request);
    void delete(Long id);
}
