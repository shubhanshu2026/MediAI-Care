package com.medi.ai.medi_ai_care.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String specialization;
    private String hospital;
    private Double fee;

    // FIX: Link Doctor record to the User account by email.
    //      When a doctor registers, their User and Doctor records share the same email.
    //      This lets us look up the Doctor.id from the logged-in user's email,
    //      so the JWT can return the correct doctorId for appointment queries.
    @Column(unique = true)
    private String email;
}