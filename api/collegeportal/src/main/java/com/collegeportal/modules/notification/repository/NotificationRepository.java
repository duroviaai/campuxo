package com.collegeportal.modules.notification.repository;

import com.collegeportal.modules.notification.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    long countByRecipientIdAndReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.id = :userId AND n.read = false")
    void markAllReadByRecipientId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :userId AND n.read = true")
    void deleteByRecipientIdAndReadTrue(@Param("userId") Long userId);
}
