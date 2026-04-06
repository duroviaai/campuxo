package com.collegeportal.modules.auth.repository;

import com.collegeportal.modules.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.approved = false")
    List<User> findPendingApprovalUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.approved = false")
    long countPendingApprovalUsers();

    @Query("SELECT u FROM User u WHERE u.registrationNumber = ?1")
    Optional<User> findByRegistrationNumber(String registrationNumber);

    @Query("SELECT u FROM User u WHERE u.facultyId = ?1")
    Optional<User> findByFacultyId(String facultyId);

    @Query("SELECT u FROM User u WHERE u.resetToken = ?1")
    Optional<User> findByResetToken(String resetToken);
}
