package com.medi.ai.medi_ai_care.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * NEW: Doctor-Patient relationship table.
 *
 * Populated automatically when a doctor APPROVES an appointment.
 * Used by:
 *   - Chat: to show only real patients/doctors in the contacts list
 *   - Prescriptions: to validate the doctor can prescribe for this patient
 *
 * DB table: doctor_patient_relations
 */
@Entity
@Table(
    name = "doctor_patient_relations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"doctor_id", "patient_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorPatientRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    /** When the relationship was first established (first appointment approval). */
    @Column(name = "established_at")
    private LocalDateTime establishedAt;

    @PrePersist
    public void prePersist() {
        this.establishedAt = LocalDateTime.now();
    }
}
