package com.collegeportal.modules.faculty.repository;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.faculty.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByUser(User user);
}
