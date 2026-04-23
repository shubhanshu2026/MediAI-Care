package com.medi.ai.medi_ai_care.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {

    private String token;
    private Long   id;         // users.id  — used for patient queries
    private Long   doctorId;   // FIX: doctors.id — used for doctor appointment queries.
                               //      Previously missing: doctor dashboard used users.id
                               //      to query appointments, but appointments store doctors.id,
                               //      so the query always returned 0 results.
    private String fullName;
    private String email;
    private String role;
}