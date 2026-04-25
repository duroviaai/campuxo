package com.collegeportal.modules.faculty.entity;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.department.entity.Department;
import com.collegeportal.shared.entity.BaseEntity;
import com.collegeportal.shared.enums.FacultyRole;
import com.collegeportal.shared.enums.FacultyStatus;
import jakarta.persistence.*;
import lombok.*;

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

    /**
     * Kept as a plain string for backward-compat with existing data that stores
     * department as a name (e.g. "BCA").  New code should prefer the department FK.
     */
    private String department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department departmentEntity;

    private String phone;

    private String designation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private FacultyRole role = FacultyRole.faculty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
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
