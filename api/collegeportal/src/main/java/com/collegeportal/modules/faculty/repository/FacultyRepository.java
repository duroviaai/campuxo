package com.collegeportal.modules.faculty.repository;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.faculty.entity.Faculty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    @EntityGraph(attributePaths = "user")
    Page<Faculty> findAll(Pageable pageable);

    Optional<Faculty> findByUser(User user);

    @EntityGraph(attributePaths = "user")
    @Query(value = "SELECT f FROM Faculty f JOIN f.user u WHERE " +
           "(COALESCE(:dept, '') = '' OR f.department = :dept) AND " +
           "(COALESCE(:search, '') = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.facultyId) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(f) FROM Faculty f JOIN f.user u WHERE " +
           "(COALESCE(:dept, '') = '' OR f.department = :dept) AND " +
           "(COALESCE(:search, '') = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.facultyId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Faculty> findWithFilters(
            @Param("dept")   String dept,
            @Param("search") String search,
            Pageable pageable);
}
