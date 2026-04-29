package com.collegeportal.modules.ia.service;

import com.collegeportal.modules.ia.dto.response.StudentAssignmentResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentFinalMarksResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentIAResponseDTO;
import com.collegeportal.modules.ia.dto.response.StudentSeminarResponseDTO;

import java.util.List;

public interface StudentIAService {

    Long getMyClassStructureId();

    Long getMyClassStructureIdByCourse(Long courseId);

    StudentIAResponseDTO getMyIAMarks(Long courseId, Long classStructureId);

    StudentAssignmentResponseDTO getMyAssignment(Long courseId, Long classStructureId);

    StudentSeminarResponseDTO getMySeminar(Long courseId, Long classStructureId);

    StudentFinalMarksResponseDTO getMyFinalMarks(Long courseId, Long classStructureId);
}
