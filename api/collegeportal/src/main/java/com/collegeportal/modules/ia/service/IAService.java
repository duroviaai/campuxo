package com.collegeportal.modules.ia.service;

import com.collegeportal.modules.ia.dto.request.IASaveRequestDTO;
import com.collegeportal.modules.ia.dto.response.StudentIAResponseDTO;

import java.util.List;

public interface IAService {
    List<StudentIAResponseDTO> getMarks(Long classStructureId, Long courseId);
    void saveMarks(IASaveRequestDTO request);
}
