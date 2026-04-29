package com.collegeportal.modules.notification.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponseDTO {

    private Long id;
    private String type;
    private String title;
    private String message;
    private String link;
    private boolean read;
    private Long referenceId;
    private String referenceType;
    private LocalDateTime createdAt;
    private String timeAgo;
}
