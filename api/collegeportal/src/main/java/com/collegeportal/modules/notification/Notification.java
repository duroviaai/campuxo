package com.collegeportal.modules.notification;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.shared.entity.BaseEntity;
import com.collegeportal.shared.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notif_user_read", columnList = "user_id, read"),
        @Index(name = "idx_notif_user_created", columnList = "user_id, createdAt")
    }
)
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = true)
    private String link;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = true)
    private Long referenceId;

    @Column(nullable = true, length = 50)
    private String referenceType;
}
