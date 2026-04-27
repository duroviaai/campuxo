package com.collegeportal.modules.ia.service;

import com.collegeportal.modules.ia.dto.request.IASaveRequestDTO;
import com.collegeportal.modules.ia.dto.response.StudentIAResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentFinalMarksResponseDTO;

import java.util.List;

public interface IAService {
    List<StudentIAResponseDTO> getMarks(Long classStructureId, Long courseId);
    void saveMarks(IASaveRequestDTO request);
    List<StudentFinalMarksResponseDTO> calculateAndGetFinalMarks(Long classStructureId, Long courseId);
    void calculateFinalMarksForAllStudents(Long classStructureId, Long courseId);
}
