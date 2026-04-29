package com.collegeportal.modules.email;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    @Override
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetToken) {
        String body = """
                Hi %s,
                Click the link below to reset your password (expires in 1 hour):
                %s/reset-password?token=%s
                If you did not request this, ignore this email."""
                .formatted(fullName, frontendUrl, resetToken);
        send(toEmail, "Reset your CollegePortal password", body);
    }

    @Async
    @Override
    public void sendAccountApprovedEmail(String toEmail, String fullName) {
        String body = "Hi %s, your account has been approved. You can now log in at %s/login"
                .formatted(fullName, frontendUrl);
        send(toEmail, "Your CollegePortal account has been approved", body);
    }

    @Async
    @Override
    public void sendAccountRejectedEmail(String toEmail, String fullName, String reason) {
        String body = "Hi %s, your registration was not approved. Reason: %s"
                .formatted(fullName, reason);
        send(toEmail, "CollegePortal registration update", body);
    }

    @Async
    @Override
    public void sendNotificationEmail(String toEmail, String subject, String message) {
        send(toEmail, subject, message);
    }

    private void send(String to, String subject, String body) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(from);
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(body);
        mailSender.send(mail);
    }
}
