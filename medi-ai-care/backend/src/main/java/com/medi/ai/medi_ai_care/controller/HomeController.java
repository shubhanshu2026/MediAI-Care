package com.medi.ai.medi_ai_care.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String welcome() {
        return "Welcome to MediAI Care API! The backend is officially running.";
    }
}