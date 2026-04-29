package com.collegeportal.modules.push.service;

import com.collegeportal.modules.auth.entity.User;
import com.collegeportal.modules.push.dto.PushSubscriptionDTO;
import com.collegeportal.modules.push.entity.PushSubscription;
import com.collegeportal.modules.push.repository.PushSubscriptionRepository;
import com.collegeportal.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebPushService {

    private final PushSubscriptionRepository subscriptionRepository;
    private final SecurityUtils securityUtils;

    @Value("${vapid.public-key}")
    private String vapidPublicKey;

    @Value("${vapid.private-key}")
    private String vapidPrivateKey;

    @Value("${vapid.subject:mailto:admin@campuxo.com}")
    private String vapidSubject;

    @Transactional
    public void subscribe(PushSubscriptionDTO dto) {
        User user = securityUtils.getCurrentUser();
        subscriptionRepository.findByEndpoint(dto.getEndpoint()).ifPresentOrElse(
            existing -> {
                existing.setP256dh(dto.getP256dh());
                existing.setAuth(dto.getAuth());
                subscriptionRepository.save(existing);
            },
            () -> {
                PushSubscription sub = new PushSubscription();
                sub.setUser(user);
                sub.setEndpoint(dto.getEndpoint());
                sub.setP256dh(dto.getP256dh());
                sub.setAuth(dto.getAuth());
                subscriptionRepository.save(sub);
            }
        );
    }

    @Transactional
    public void unsubscribe(String endpoint) {
        subscriptionRepository.deleteByEndpoint(endpoint);
    }

    public void sendToUser(Long userId, String title, String body, String link) {
        List<PushSubscription> subs = subscriptionRepository.findByUserId(userId);
        if (subs.isEmpty()) return;
        String payload = buildPayload(title, body, link);
        subs.forEach(sub -> sendToSubscription(sub, payload));
    }

    private void sendToSubscription(PushSubscription sub, String payload) {
        try {
            PushService pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            Notification notification = new Notification(
                sub.getEndpoint(),
                sub.getP256dh(),
                sub.getAuth(),
                payload.getBytes()
            );
            pushService.send(notification);
        } catch (Exception e) {
            log.warn("Failed to send push to endpoint {}: {}", sub.getEndpoint(), e.getMessage());
            // Remove stale subscriptions (410 Gone)
            if (e.getMessage() != null && e.getMessage().contains("410")) {
                subscriptionRepository.deleteByEndpoint(sub.getEndpoint());
            }
        }
    }

    private String buildPayload(String title, String body, String link) {
        String safeLink = link != null ? link : "/notifications";
        return String.format(
            "{\"title\":\"%s\",\"body\":\"%s\",\"link\":\"%s\",\"icon\":\"/campuxo_logo.png\"}",
            escape(title), escape(body), safeLink
        );
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }

    public String getPublicKey() {
        return vapidPublicKey;
    }
}
