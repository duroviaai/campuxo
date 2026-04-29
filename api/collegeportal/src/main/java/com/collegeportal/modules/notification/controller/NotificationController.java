package com.collegeportal.modules.notification.controller;

import com.collegeportal.modules.notification.dto.response.NotificationResponseDTO;
import com.collegeportal.modules.notification.service.NotificationService;
import com.collegeportal.shared.dto.PageResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<PageResponseDTO<NotificationResponseDTO>> getMyNotifications(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PageResponseDTO.from(notificationService.getMyNotifications(pageable)));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponseDTO>> getMyUnread() {
        return ResponseEntity.ok(notificationService.getMyUnread());
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/read")
    public ResponseEntity<Void> deleteRead() {
        notificationService.deleteRead();
        return ResponseEntity.noContent().build();
    }
}
