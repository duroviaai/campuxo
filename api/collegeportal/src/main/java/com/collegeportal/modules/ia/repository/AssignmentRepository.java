package com.collegeportal.modules.ia.repository;

import com.collegeportal.modules.ia.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByClassStructureIdAndCourseId(Long classStructureId, Long courseId);
    Optional<Assignment> findByStudentIdAndCourseIdAndClassStructureId(Long studentId, Long courseId, Long classStructureId);
}
