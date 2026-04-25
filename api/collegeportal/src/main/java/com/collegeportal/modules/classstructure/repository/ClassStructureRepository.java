package com.collegeportal.modules.classstructure.repository;

import com.collegeportal.modules.classstructure.entity.ClassStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassStructureRepository extends JpaRepository<ClassStructure, Long> {

    @Query("""
        SELECT cs FROM ClassStructure cs
        WHERE cs.batch.id = :batchId
          AND cs.department.id = :deptId
          AND (:specId IS NULL AND cs.specialization IS NULL
               OR cs.specialization.id = :specId)
        ORDER BY cs.yearOfStudy, cs.semester
        """)
    List<ClassStructure> findByBatchDeptSpec(
        @Param("batchId") Long batchId,
        @Param("deptId")  Long deptId,
        @Param("specId")  Long specId);

    @Query("""
        SELECT cs FROM ClassStructure cs
        WHERE cs.batch.id = :batchId
          AND cs.department.id = :deptId
          AND cs.specialization IS NULL
        ORDER BY cs.yearOfStudy, cs.semester
        """)
    List<ClassStructure> findByBatchDeptNoSpec(
        @Param("batchId") Long batchId,
        @Param("deptId")  Long deptId);

    Optional<ClassStructure> findByBatchIdAndDepartmentIdAndSpecializationIdAndYearOfStudyAndSemester(
        Long batchId, Long departmentId, Long specializationId, Integer yearOfStudy, Integer semester);

    Optional<ClassStructure> findByBatchIdAndDepartmentIdAndSpecializationIsNullAndYearOfStudyAndSemester(
        Long batchId, Long departmentId, Integer yearOfStudy, Integer semester);
}
