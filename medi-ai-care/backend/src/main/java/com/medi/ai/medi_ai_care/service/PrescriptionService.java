package com.medi.ai.medi_ai_care.service;

import com.medi.ai.medi_ai_care.model.Prescription;
import com.medi.ai.medi_ai_care.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    /** Save (or update) a prescription and stamp the issued date. */
    public Prescription savePrescription(Prescription prescription) {
        prescription.setIssuedDate(LocalDateTime.now());
        return prescriptionRepository.save(prescription);
    }

    // ── Patient access (both lookup strategies) ───────────────────────────────

    /** Preferred: look up by numeric patientId stored in JWT. */
    public List<Prescription> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    /** Fallback: look up by email (legacy endpoint). */
    public List<Prescription> getPrescriptionsByPatientEmail(String email) {
        return prescriptionRepository.findByPatientEmail(email);
    }

    // ── Doctor access ─────────────────────────────────────────────────────────

    public List<Prescription> getPrescriptionsByDoctor(Long doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }

    // ── Appointment lookup ────────────────────────────────────────────────────

    public Prescription getByAppointmentId(Long appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId);
    }
}
