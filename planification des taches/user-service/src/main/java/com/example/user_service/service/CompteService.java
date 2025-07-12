package com.example.user_service.service;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.example.user_service.model.Service;

import com.example.user_service.dto.CompteDTO;
import com.example.user_service.model.Compte;
import com.example.user_service.repository.CompteRepo;
import com.example.user_service.repository.ServiceRepository;

@org.springframework.stereotype.Service
public class CompteService {
    private final CompteRepo compteRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ServiceRepository serviceRepository;
    public CompteService(CompteRepo compteRepo, BCryptPasswordEncoder passwordEncoder, ServiceRepository serviceRepository) {
        this.compteRepo = compteRepo;
        this.passwordEncoder = passwordEncoder;
        this.serviceRepository = serviceRepository;
    }

public Compte addCompte(CompteDTO dto) {
    System.out.println("Reçu pour ajout : " + dto.getNom() + " " + dto.getMail() + " - serviceId=" + dto.getServiceId() + " - actif=" + dto.getActif());

    if (dto.getMotdepasse() == null || dto.getMotdepasse().isBlank()) {
        throw new IllegalArgumentException("Mot de passe obligatoire");
    }

    Compte compte = new Compte();
    compte.setNom(dto.getNom());
    compte.setPrenom(dto.getPrenom());
    compte.setMail(dto.getMail());
    compte.setMotdepasse(passwordEncoder.encode(dto.getMotdepasse()));
    compte.setRole(dto.getRole());
    compte.setActif(dto.getActif() != null ? dto.getActif() : true);

    if (dto.getServiceId() != null) {
        Service service = serviceRepository.findById(dto.getServiceId()).orElse(null);
        if (service != null) {
            compte.setService(service);
        }
    }

    return compteRepo.save(compte);
}

    public List<Compte> getUsers() {
        return compteRepo.findAll();
    }

    public Compte getUserById(Long id) {
        return compteRepo.findById(id).orElse(null);
    }

    public Compte update(Long id, Compte compteDetails) {
        Compte compte = compteRepo.findById(id).orElse(null);
        if (compte == null) return null;

        compte.setNom(compteDetails.getNom());
        compte.setPrenom(compteDetails.getPrenom());
        compte.setMail(compteDetails.getMail());

        if (compteDetails.getMotdepasse() != null && !compteDetails.getMotdepasse().isBlank()) {
            compte.setMotdepasse(passwordEncoder.encode(compteDetails.getMotdepasse()));
        }
        if (compteDetails.getService() != null) {
            Service service = serviceRepository.findById(compteDetails.getService().getId()).orElse(null);
            if (service != null) {
                compte.setService(service);
            } else {
                compte.setService(null);
            }
        } else {
            compte.setService(null);
        }

        return compteRepo.save(compte);
    }

    public void deleteUser(Long id) {
        compteRepo.deleteById(id);
    }

    public Compte findByMail(String mail) {
        return compteRepo.findByMail(mail).orElse(null);
    }
    public boolean setActifStatus(Long id, boolean status) {
    Compte compte = compteRepo.findById(id).orElse(null);
    if (compte == null) return false;

    compte.setActif(status);
    compteRepo.save(compte);
    return true;
}

public List<Compte> getUsersByServiceId(Long serviceId) {
    return compteRepo.findByService_Id(serviceId);
}

}

