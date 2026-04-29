package com.collegeportal.modules.notification.service.impl;

import com.collegeportal.exception.custom.ForbiddenException;
import com.collegeportal.exception.custom.ResourceNotFoundException;
import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.auth.repository.UserRepository;
import com.collegeportal.modules.notification.Notification;
import com.collegeportal.modules.notification.dto.response.NotificationResponseDTO;
import com.collegeportal.modules.notification.repository.NotificationRepository;
import com.collegeportal.modules.notification.service.NotificationService;
import com.collegeportal.modules.push.service.WebPushService;
import com.collegeportal.shared.enums.NotificationType;
import com.collegeportal.shared.enums.RoleType;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final WebPushService webPushService;

    @Override
    @Transactional
    public void send(Long recipientUserId, NotificationType type, String title,
                     String message, String link, Long referenceId, String referenceType) {
        User recipient = userRepository.findById(recipientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recipientUserId));

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);

        notificationRepository.save(notification);

        try { webPushService.sendToUser(recipientUserId, title, message, link); } catch (Exception ignored) {}
    }

    @Override
    @Transactional
    public void sendToRole(RoleType role, NotificationType type, String title,
                           String message, String link) {
        userRepository.findApprovedUsersByRole(role)
                .forEach(u -> send(u.getId(), type, title, message, link, null, null));
    }

    @Override
    @Transactional
    public void sendToAll(NotificationType type, String title, String message, String link) {
        userRepository.findApprovedUsers()
                .forEach(u -> send(u.getId(), type, title, message, link, null, null));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getMyNotifications(Pageable pageable) {
        Long userId = securityUtils.getCurrentUser().getId();
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getMyUnread() {
        Long userId = securityUtils.getCurrentUser().getId();
        return notificationRepository
                .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .limit(20)
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        Long userId = securityUtils.getCurrentUser().getId();
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Override
    @Transactional
    public void markRead(Long notificationId) {
        Long userId = securityUtils.getCurrentUser().getId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (!notification.getRecipient().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllRead() {
        Long userId = securityUtils.getCurrentUser().getId();
        notificationRepository.markAllReadByRecipientId(userId);
    }

    @Override
    @Transactional
    public void deleteRead() {
        Long userId = securityUtils.getCurrentUser().getId();
        notificationRepository.deleteByRecipientIdAndReadTrue(userId);
    }

    private NotificationResponseDTO toDTO(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .type(n.getType().name())
                .title(n.getTitle())
                .message(n.getMessage())
                .link(n.getLink())
                .read(n.isRead())
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .createdAt(n.getCreatedAt())
                .timeAgo(timeAgo(n.getCreatedAt()))
                .build();
    }

    private String timeAgo(LocalDateTime createdAt) {
        if (createdAt == null) return "";
        long seconds = ChronoUnit.SECONDS.between(createdAt, LocalDateTime.now());
        if (seconds < 60)    return "just now";
        if (seconds < 3600)  return (seconds / 60) + " min ago";
        if (seconds < 86400) return (seconds / 3600) + " hr ago";
        long days = seconds / 86400;
        if (days < 7)        return days + " days ago";
        return createdAt.format(DateTimeFormatter.ofPattern("MMM d"));
    }
}
