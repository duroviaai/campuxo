package com.collegeportal.modules.auth.repository;

import com.collegeportal.modules.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.approved = false AND u.rejected = false")
    List<User> findPendingApprovalUsers();

    @Query("SELECT u FROM User u JOIN FETCH u.roles r WHERE u.approved = false AND u.rejected = false AND r.name = :role")
    List<User> findPendingApprovalUsersByRole(@Param("role") com.collegeportal.shared.enums.RoleType role);

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.approved = true")
    List<User> findApprovedUsers();

    @Query("SELECT u FROM User u JOIN FETCH u.roles r WHERE u.approved = true AND r.name = :role")
    List<User> findApprovedUsersByRole(@Param("role") com.collegeportal.shared.enums.RoleType role);

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.rejected = true AND u.approved = false")
    List<User> findRejectedUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.approved = false")
    long countPendingApprovalUsers();

    @Query("SELECT u FROM User u WHERE u.registrationNumber = ?1")
    Optional<User> findByRegistrationNumber(String registrationNumber);

    @Query("SELECT u FROM User u WHERE u.facultyId = ?1")
    Optional<User> findByFacultyId(String facultyId);

    @Query("SELECT u FROM User u WHERE u.resetToken = ?1")
    Optional<User> findByResetToken(String resetToken);

    @Query("SELECT u FROM User u WHERE u.refreshToken = ?1")
    Optional<User> findByRefreshToken(String refreshToken);
}
