package com.medi.ai.medi_ai_care.repository;

import com.medi.ai.medi_ai_care.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientEmail(String email);

    /** FIX: Also query by numeric patientId for chat / prescription lookups. */
    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);
}
