package com.collegeportal.modules.facultyassignment.repository;

import com.collegeportal.modules.facultyassignment.entity.FacultyCourseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacultyCourseAssignmentRepository extends JpaRepository<FacultyCourseAssignment, Long> {

    List<FacultyCourseAssignment> findByFacultyId(Long facultyId);

    boolean existsByFacultyIdAndCourseIdAndClassBatchId(Long facultyId, Long courseId, Long classBatchId);
}
