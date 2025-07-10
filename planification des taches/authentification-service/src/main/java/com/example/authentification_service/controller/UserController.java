package com.example.authentification_service.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.authentification_service.dto.JwtResponseDTO;
import com.example.authentification_service.dto.UserDTO;
import com.example.authentification_service.security.JwtUtil;
import com.example.authentification_service.service.UserService;

@RestController
@RequestMapping("/auth")
public class UserController {

    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserService userService;
    public UserController(JwtUtil jwtUtil, BCryptPasswordEncoder passwordEncoder, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    @PostMapping("/login")
    public JwtResponseDTO login(@RequestBody UserDTO userDto) {
        UserDTO utilisateur = userService.findByEmail(userDto.getMail());

        if (utilisateur == null) {
            throw new RuntimeException("Utilisateur introuvable");
        }
        if (!utilisateur.isActif()) {
        throw new RuntimeException("Ce compte est désactivé. Veuillez contacter l'administrateur.");
    }

        if (passwordEncoder.matches(userDto.getMotdepasse(), utilisateur.getMotdepasse())) {
            String token = jwtUtil.generateToken(
            utilisateur.getNom(),
            utilisateur.getRole(),
            utilisateur.getId(),
            utilisateur.getPrenom(),
            utilisateur.getMail());
            return new JwtResponseDTO(token);
        } else {
            throw new RuntimeException("Mot de passe invalide");
        }
    }
}
