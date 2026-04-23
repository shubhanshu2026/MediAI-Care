package com.medi.ai.medi_ai_care.dto;

import lombok.Data;

/**
 * FIX: Added doctorSpecialization, patientId, patientName, paymentMethod
 *      so the booking flow can persist all required data in one call.
 */
@Data
public class AppointmentRequest {

    // ── Doctor ─────────────────────────────────────────────────────────────
    private Long   doctorId;
    private String doctorName;
    private String doctorSpecialization;   // ← ADDED (was missing, caused NPE in controller)

    // ── Patient ────────────────────────────────────────────────────────────
    private Long   patientId;              // ← ADDED (needed for chat + prescription linking)
    private String patientName;            // ← ADDED (optional display name)
    private String patientEmail;
    private String patientPhone;

    // ── Schedule ───────────────────────────────────────────────────────────
    private String appointmentDate;        // "yyyy-MM-dd" string from frontend
    private String timeSlot;

    // ── Payment ────────────────────────────────────────────────────────────
    private Double amount;
    private String paymentMethod;          // ← ADDED (PAY_AT_COUNTER / PAID_ONLINE)
}
