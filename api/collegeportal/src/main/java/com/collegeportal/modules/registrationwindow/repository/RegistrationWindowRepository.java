package com.collegeportal.modules.registrationwindow.repository;

import com.collegeportal.modules.registrationwindow.entity.RegistrationWindow;
import com.collegeportal.shared.enums.RoleType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RegistrationWindowRepository extends JpaRepository<RegistrationWindow, Long> {

    @EntityGraph(attributePaths = "batch")
    List<RegistrationWindow> findByRoleAndActiveTrue(RoleType role);

    @EntityGraph(attributePaths = "batch")
    List<RegistrationWindow> findByBatchIdAndRoleAndActiveTrue(Long batchId, RoleType role);

    Optional<RegistrationWindow> findByBatchIdAndRoleAndAllowedYearOfStudy(Long batchId, RoleType role, Integer year);

    @EntityGraph(attributePaths = "batch")
    @Query("SELECT w FROM RegistrationWindow w ORDER BY w.openDate DESC")
    List<RegistrationWindow> findAllByOrderByOpenDateDesc();
}
