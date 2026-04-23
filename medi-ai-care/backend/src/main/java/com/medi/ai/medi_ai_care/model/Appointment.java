package com.medi.ai.medi_ai_care.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * FIX: Added patientId (Long) so the chat system can derive numeric user IDs
 *      from appointments without a separate lookup.
 *      Added patientName for display purposes.
 */
@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Doctor info ────────────────────────────────────────────────────────
    private Long   doctorId;
    private String doctorName;
    private String doctorSpecialization;

    // ── Patient info ───────────────────────────────────────────────────────
    /** FIX: Numeric patient ID (FK → users.id). Required for chat + prescription linking. */
    private Long   patientId;       // ← KEY NEW FIELD
    private String patientName;     // ← optional display name
    private String patientEmail;
    private String patientPhone;

    // ── Schedule ───────────────────────────────────────────────────────────
    private LocalDate appointmentDate;
    private String    timeSlot;

    // ── Payment ────────────────────────────────────────────────────────────
    private Double amount;
    private String paymentMethod;
    private String paymentStatus;

    /**
     * Status lifecycle:
     *   PENDING  → (doctor approves) → APPROVED  → (visit done) → COMPLETED
     *   PENDING  → (doctor rejects)  → REJECTED
     */
    private String status;
}
