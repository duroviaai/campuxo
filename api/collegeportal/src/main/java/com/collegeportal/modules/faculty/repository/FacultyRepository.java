package com.collegeportal.modules.faculty.repository;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.faculty.entity.Faculty;
import com.collegeportal.shared.enums.FacultyRole;
import com.collegeportal.shared.enums.FacultyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import com.collegeportal.shared.enums.FacultyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    @EntityGraph(attributePaths = {"user", "user.roles"})
    Page<Faculty> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "departmentEntity"})
    @Query("SELECT f FROM Faculty f WHERE f.id = :id")
    Optional<Faculty> findByIdWithDept(@Param("id") Long id);

    Optional<Faculty> findByUser(User user);

    @EntityGraph(attributePaths = {"user", "user.roles"})
    Optional<Faculty> findWithRolesByUser(User user);

    /** Find the current HOD for a department (at most one due to DB partial unique index). */
    Optional<Faculty> findByDepartmentAndRole(String department, FacultyRole role);

    /** All faculty in a department, optionally filtered by status. */
    List<Faculty> findByDepartmentAndStatus(String department, FacultyStatus status);

    List<Faculty> findByDepartment(String department);

    @EntityGraph(attributePaths = {"user", "user.roles"})
    @Query(value = "SELECT f FROM Faculty f JOIN f.user u WHERE " +
           "(COALESCE(:dept, '') = '' OR f.department = :dept) AND " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(COALESCE(:search, '') = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.facultyId) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(f) FROM Faculty f JOIN f.user u WHERE " +
           "(COALESCE(:dept, '') = '' OR f.department = :dept) AND " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(COALESCE(:search, '') = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.facultyId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Faculty> findWithFilters(
            @Param("dept")   String dept,
            @Param("search") String search,
            @Param("status") FacultyStatus status,
            Pageable pageable);

    /** Backward-compat overload — no status filter. */
    default Page<Faculty> findWithFilters(String dept, String search, Pageable pageable) {
        return findWithFilters(dept, search, null, pageable);
    }
}
