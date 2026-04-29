package com.collegeportal.modules.notification.service;

import com.collegeportal.modules.notification.dto.response.NotificationResponseDTO;
import com.collegeportal.shared.enums.NotificationType;
import com.collegeportal.shared.enums.RoleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    void send(Long recipientUserId, NotificationType type, String title,
              String message, String link, Long referenceId, String referenceType);

    void sendToRole(RoleType role, NotificationType type, String title,
                    String message, String link);

    void sendToAll(NotificationType type, String title, String message, String link);

    Page<NotificationResponseDTO> getMyNotifications(Pageable pageable);

    List<NotificationResponseDTO> getMyUnread();

    long getUnreadCount();

    void markRead(Long notificationId);

    void markAllRead();

    void deleteRead();
}
