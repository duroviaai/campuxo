package com.collegeportal.modules.auth.repository;

import com.collegeportal.modules.auth.entity.Role;
import com.collegeportal.shared.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleType name);
}
