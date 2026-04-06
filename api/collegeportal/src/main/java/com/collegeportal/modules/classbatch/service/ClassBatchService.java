package com.collegeportal.modules.classbatch.service;

import com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;

import java.util.List;

public interface ClassBatchService {

    List<ClassBatchResponseDTO> getAllClasses();

    List<StudentResponseDTO> getStudentsByClass(Long classId);
}
