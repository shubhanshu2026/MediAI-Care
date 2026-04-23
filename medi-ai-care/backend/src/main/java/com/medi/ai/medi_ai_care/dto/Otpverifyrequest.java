package com.medi.ai.medi_ai_care.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Otpverifyrequest {
    private String email;
    private String otp;
}