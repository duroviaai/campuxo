package com.collegeportal.modules.department.repository;

import com.collegeportal.modules.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByName(String name);
    java.util.Optional<Department> findByName(String name);
}
