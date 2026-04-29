package com.collegeportal.modules.push.entity;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "push_subscriptions",
    uniqueConstraints = @UniqueConstraint(columnNames = "endpoint"))
public class PushSubscription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 500)
    private String endpoint;

    @Column(nullable = false, length = 100)
    private String p256dh;

    @Column(nullable = false, length = 100)
    private String auth;
}
