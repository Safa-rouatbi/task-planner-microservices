package com.example.user_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.user_service.model.Compte;
import com.example.user_service.repository.CompteRepo;

@Component
public class InitialisationAdmin implements CommandLineRunner {

    private final CompteRepo compteRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    public InitialisationAdmin(CompteRepo compteRepo, BCryptPasswordEncoder passwordEncoder) {
        this.compteRepo = compteRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (compteRepo.existsByRole("ADMIN")) {
            return;
        }

        Compte admin = new Compte();
        admin.setNom("Admin");
        admin.setPrenom("Demo");
        admin.setMail(adminEmail);
        admin.setMotdepasse(passwordEncoder.encode(adminPassword));
        admin.setRole("ADMIN");
        admin.setActif(true);
        compteRepo.save(admin);

        System.out.println("Compte admin cree automatiquement : " + adminEmail);
    }
}
