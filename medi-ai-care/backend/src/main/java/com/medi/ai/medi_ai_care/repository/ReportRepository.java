package com.medi.ai.medi_ai_care.repository;

import com.medi.ai.medi_ai_care.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<MedicalReport, Long> {
    // This allows the Controller to filter reports by the logged-in user
    List<MedicalReport> findByPatientEmail(String email);
}