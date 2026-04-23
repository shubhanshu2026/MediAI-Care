package com.medi.ai.medi_ai_care.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    // Thread-safe in-memory store: email → OtpEntry
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static class OtpEntry {
        String otp;
        LocalDateTime expiresAt;

        OtpEntry(String otp, int expiryMinutes) {
            this.otp = otp;
            this.expiresAt = LocalDateTime.now().plusMinutes(expiryMinutes);
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    /**
     * Generates a 6-digit OTP, stores it, and emails it to the user.
     */
    public void generateAndSendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(email.toLowerCase(), new OtpEntry(otp, otpExpiryMinutes));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Medi-AI Care — Your Login OTP");
        message.setText(
            "Hello,\n\n" +
            "Your One-Time Password (OTP) for Medi-AI Care login is:\n\n" +
            "  " + otp + "\n\n" +
            "This OTP is valid for " + otpExpiryMinutes + " minutes.\n" +
            "Do not share this code with anyone.\n\n" +
            "— Medi-AI Care Team"
        );

        mailSender.send(message);
    }

    /**
     * Returns true if the OTP matches and has not expired.
     * Removes the entry after successful verification (one-time use).
     */
    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email.toLowerCase());
        if (entry == null || entry.isExpired()) {
            otpStore.remove(email.toLowerCase());
            return false;
        }
        if (entry.otp.equals(otp)) {
            otpStore.remove(email.toLowerCase()); // one-time use
            return true;
        }
        return false;
    }
}