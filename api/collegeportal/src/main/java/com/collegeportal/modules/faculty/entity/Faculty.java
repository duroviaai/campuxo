package com.collegeportal.modules.faculty.entity;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.shared.entity.BaseEntity;
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

    private String department;

    private String phone;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;
}
