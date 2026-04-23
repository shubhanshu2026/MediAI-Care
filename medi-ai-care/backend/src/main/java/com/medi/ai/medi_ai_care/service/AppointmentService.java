package com.medi.ai.medi_ai_care.service;

import com.medi.ai.medi_ai_care.dto.AppointmentRequest;
import com.medi.ai.medi_ai_care.model.Appointment;
import com.medi.ai.medi_ai_care.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // FIX: Status was "UPCOMING" but the rest of the app uses "PENDING" as the initial status.
    //      AppointmentController.bookAppointment() (the actual endpoint) correctly sets "PENDING".
    //      This service method is kept for any future use but aligned to use "PENDING" as well.
    public Appointment createAppointment(AppointmentRequest req) {
        Appointment appointment = Appointment.builder()
                .doctorId(req.getDoctorId())
                .doctorName(req.getDoctorName())
                .doctorSpecialization(req.getDoctorSpecialization())
                .patientId(req.getPatientId())
                .patientName(req.getPatientName())
                .patientEmail(req.getPatientEmail())
                .patientPhone(req.getPatientPhone())
                .appointmentDate(LocalDate.parse(req.getAppointmentDate()))
                .timeSlot(req.getTimeSlot())
                .amount(req.getAmount())
                .paymentMethod(req.getPaymentMethod())
                .paymentStatus("DUE_AT_COUNTER")
                .status("PENDING") // FIX: was "UPCOMING", standardized to "PENDING"
                .build();

        return appointmentRepository.save(appointment);
    }
}