package com.collegeportal.modules.specialization.entity;

import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "specializations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"name", "department", "scheme"}))
public class Specialization extends BaseEntity {

    @Column(nullable = false)
    private String name;

    // Legacy string column — kept for backward compatibility
    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String scheme;

    // New FK — populated for all new records
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department departmentRef;
}
