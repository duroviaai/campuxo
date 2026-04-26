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

    @Query("SELECT COUNT(csc) > 0 FROM ClassStructureCourse csc WHERE csc.course.id = :courseId AND csc.classStructure.department.id = :deptId")
    boolean existsByCourseIdAndDepartmentId(@Param("courseId") Long courseId, @Param("deptId") Long deptId);

    @Query("SELECT DISTINCT csc.course.id FROM ClassStructureCourse csc WHERE csc.classStructure.department.id = :deptId")
    List<Long> findCourseIdsByDepartmentId(@Param("deptId") Long deptId);

    @Query("SELECT COUNT(DISTINCT csc.classStructure.id) FROM ClassStructureCourse csc WHERE csc.course.id = :courseId")
    long countUsagesByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM ClassStructureCourse csc WHERE csc.course.id = :courseId")
    void deleteByCourseId(@Param("courseId") Long courseId);

    @Modifying
    @Query("DELETE FROM ClassStructureCourse csc WHERE csc.classStructure.id IN :ids")
    void deleteByClassStructureIdIn(@Param("ids") List<Long> ids);
}
