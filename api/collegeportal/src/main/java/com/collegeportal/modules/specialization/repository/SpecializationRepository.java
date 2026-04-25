package com.collegeportal.modules.specialization.repository;

import com.collegeportal.modules.specialization.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
    List<Specialization> findByDepartmentAndScheme(String department, String scheme);
    List<Specialization> findByDepartment(String department);
    boolean existsByNameAndDepartmentAndScheme(String name, String department, String scheme);

    // New FK-based queries
    List<Specialization> findByDepartmentRefId(Long departmentId);
    List<Specialization> findByDepartmentRefIdAndScheme(Long departmentId, String scheme);
}
