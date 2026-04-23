package com.medi.ai.medi_ai_care.repository;

import com.medi.ai.medi_ai_care.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    // ── patient queries ───────────────────────────────────────────────────────
    List<Prescription> findByPatientEmail(String email);
    List<Prescription> findByPatientId(Long patientId);      // ← KEY FIX: by numeric ID

    // ── doctor queries ────────────────────────────────────────────────────────
    List<Prescription> findByDoctorId(Long doctorId);

    // ── appointment lookup ────────────────────────────────────────────────────
    Prescription findByAppointmentId(Long appointmentId);
}
