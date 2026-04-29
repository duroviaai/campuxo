package com.collegeportal.modules.push.controller;

import com.collegeportal.modules.push.dto.PushSubscriptionDTO;
import com.collegeportal.modules.push.service.WebPushService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/push")
@RequiredArgsConstructor
public class PushController {

    private final WebPushService webPushService;

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", webPushService.getPublicKey()));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(@RequestBody PushSubscriptionDTO dto) {
        webPushService.subscribe(dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(@RequestBody Map<String, String> body) {
        webPushService.unsubscribe(body.get("endpoint"));
        return ResponseEntity.noContent().build();
    }
}
