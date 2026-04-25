package com.collegeportal.modules.department.entity;

import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "departments", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Department extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;
}
