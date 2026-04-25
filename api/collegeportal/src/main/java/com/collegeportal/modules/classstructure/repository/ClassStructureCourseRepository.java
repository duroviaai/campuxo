package com.collegeportal.modules.classstructure.repository;

import com.collegeportal.modules.classstructure.entity.ClassStructureCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassStructureCourseRepository extends JpaRepository<ClassStructureCourse, Long> {

    List<ClassStructureCourse> findByClassStructureId(Long classStructureId);

    Optional<ClassStructureCourse> findByClassStructureIdAndCourseId(Long classStructureId, Long courseId);

    boolean existsByClassStructureIdAndCourseId(Long classStructureId, Long courseId);

    @Query("SELECT COUNT(DISTINCT csc.classStructure.id) FROM ClassStructureCourse csc WHERE csc.course.id = :courseId")
    long countUsagesByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM ClassStructureCourse csc WHERE csc.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);
}
