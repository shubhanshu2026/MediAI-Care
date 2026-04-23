package com.medi.ai.medi_ai_care.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                // This generates getEmail() and getPassword() automatically
@NoArgsConstructor   // Required for Jackson to create the object from JSON
@AllArgsConstructor  // Useful for testing
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}