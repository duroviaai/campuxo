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

    @Query(value = "SELECT f.* FROM faculty f JOIN users u ON u.id = f.user_id WHERE " +
           "(:dept IS NULL OR f.department = :dept) AND " +
           "(:search IS NULL OR u.full_name ILIKE '%' || CAST(:search AS text) || '%' " +
           "OR u.email ILIKE '%' || CAST(:search AS text) || '%')",
           countQuery = "SELECT COUNT(*) FROM faculty f JOIN users u ON u.id = f.user_id WHERE " +
           "(:dept IS NULL OR f.department = :dept) AND " +
           "(:search IS NULL OR u.full_name ILIKE '%' || CAST(:search AS text) || '%' " +
           "OR u.email ILIKE '%' || CAST(:search AS text) || '%')",
           nativeQuery = true)
    Page<Faculty> findWithFilters(
            @Param("dept")   String dept,
            @Param("search") String search,
            Pageable pageable);
}
