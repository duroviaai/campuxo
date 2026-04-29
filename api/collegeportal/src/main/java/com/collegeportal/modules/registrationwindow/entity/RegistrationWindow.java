package com.collegeportal.modules.registrationwindow.entity;

import com.collegeportal.modules.batch.entity.Batch;
import com.collegeportal.shared.entity.BaseEntity;
import com.collegeportal.shared.enums.RoleType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "registration_windows",
        uniqueConstraints = @UniqueConstraint(columnNames = {"batch_id", "role", "allowed_year_of_study"}))
public class RegistrationWindow extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = true)
    private Batch batch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoleType role;

    @Column(name = "open_date", nullable = false)
    private LocalDate openDate;

    @Column(name = "close_date", nullable = false)
    private LocalDate closeDate;

    @Column(name = "allowed_year_of_study", nullable = true)
    private Integer allowedYearOfStudy;

    @Column(nullable = false)
    private boolean active = true;
}
