package com.collegeportal.modules.classbatch.service;

import com.collegeportal.modules.classbatch.dto.request.ClassBatchRequestDTO;
import com.collegeportal.modules.classbatch.dto.response.ClassBatchResponseDTO;
import com.collegeportal.modules.classbatch.dto.response.ClassBatchFilterDTO;
import com.collegeportal.modules.course.dto.response.CourseResponseDTO;
import com.collegeportal.modules.student.dto.response.StudentResponseDTO;

import java.util.List;

public interface ClassBatchService {

    List<ClassBatchResponseDTO> getAllClasses();

    ClassBatchResponseDTO createClass(ClassBatchRequestDTO request);

    ClassBatchResponseDTO updateClass(Long id, ClassBatchRequestDTO request);

    void deleteClass(Long id);

    List<StudentResponseDTO> getStudentsByClass(Long classId);

    ClassBatchFilterDTO getFilters();

    List<ClassBatchResponseDTO> getClassesByYearAndSection(Integer year, String section);

    List<CourseResponseDTO> getCoursesByClass(Long classId);
}
