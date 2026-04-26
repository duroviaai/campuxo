package com.collegeportal.modules.faculty.entity;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.shared.entity.BaseEntity;
import com.collegeportal.shared.enums.FacultyRole;
import com.collegeportal.shared.enums.FacultyStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "faculty")
public class Faculty extends BaseEntity {

    @Column(nullable = false)
    private String firstName;

    private String lastName;

    private String department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department departmentEntity;

    private String phone;

    private String designation;

    private String qualification;

    /** Years of experience */
    private Integer experience;

    /** Comma-separated subject names the faculty handles */
    @Column(length = 1000)
    private String subjects;

    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10, columnDefinition = "varchar(10) default 'faculty'")
    @Builder.Default
    private FacultyRole role = FacultyRole.faculty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10, columnDefinition = "varchar(10) default 'active'")
    @Builder.Default
    private FacultyStatus status = FacultyStatus.active;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    // ── helpers ──────────────────────────────────────────────────────────────

    public boolean isHod() {
        return FacultyRole.hod == this.role;
    }

    public boolean isActive() {
        return FacultyStatus.active == this.status;
    }
}
