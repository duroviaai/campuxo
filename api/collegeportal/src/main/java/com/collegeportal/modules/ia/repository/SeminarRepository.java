package com.collegeportal.modules.ia.repository;

import com.collegeportal.modules.ia.entity.Seminar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeminarRepository extends JpaRepository<Seminar, Long> {
    List<Seminar> findByClassStructureIdAndCourseId(Long classStructureId, Long courseId);
    Optional<Seminar> findByStudentIdAndCourseIdAndClassStructureId(Long studentId, Long courseId, Long classStructureId);
}
