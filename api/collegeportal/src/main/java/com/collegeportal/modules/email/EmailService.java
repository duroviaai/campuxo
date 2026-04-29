package com.collegeportal.modules.email;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String fullName, String resetToken);
    void sendAccountApprovedEmail(String toEmail, String fullName);
    void sendAccountRejectedEmail(String toEmail, String fullName, String reason);
    void sendNotificationEmail(String toEmail, String subject, String message);
}
