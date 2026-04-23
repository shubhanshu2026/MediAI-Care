package com.medi.ai.medi_ai_care.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * UPDATED Prescription model.
 *
 * KEY FIX: Added patientId (Long) so the frontend can query by user ID.
 *           Kept patientEmail for backward compatibility.
 *           Added doctorId (Long) so doctor can fetch their issued prescriptions.
 *
 * DB column added:
 *   patient_id  BIGINT (FK → users.id)
 *   doctor_id   BIGINT (FK → users.id)
 */
@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── who wrote it ─────────────────────────────────────────────────────────
    private Long doctorId;          // FK → users.id  (required)
    private String doctorName;      // denormalised display name

    // ── who it is for ────────────────────────────────────────────────────────
    private Long patientId;         // FK → users.id  ← THE KEY FIX
    private String patientEmail;    // kept for backward compat

    // ── related appointment (optional) ───────────────────────────────────────
    private Long appointmentId;

    // ── clinical content ─────────────────────────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    /** JSON array string, e.g. '[{"name":"Amox","dosage":"500mg","instructions":"twice daily"}]' */
    @Column(columnDefinition = "TEXT")
    private String medicines;

    private LocalDateTime issuedDate;
}
