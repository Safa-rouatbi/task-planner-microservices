package com.example.task_service.service;

import com.example.task_service.dto.TacheDTO;
import com.example.task_service.mapper.TacheMapper;
import com.example.task_service.model.ParametrageCouleur;
import com.example.task_service.model.Tache;
import com.example.task_service.repository.ParametrageColorRepository;
import com.example.task_service.repository.TacheRepo;

import jakarta.persistence.criteria.Predicate;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TacheService {

    private final TacheRepo tacheRepository;
    private final ParametrageColorRepository paramColorRepo;

    public TacheService(TacheRepo tacheRepository, ParametrageColorRepository paramColorRepo) {
        this.tacheRepository = tacheRepository;
        this.paramColorRepo = paramColorRepo;
    }

    public Tache createTache(Tache tache) {
        if (tache.getEtat() == null || tache.getEtat().isEmpty()) {
            tache.setEtat("A faire");
    }
        return tacheRepository.save(tache);
    }

    public List<Tache> getAllTaches() {
        return tacheRepository.findAll();
    }

    public List<Tache> getTachesByAgentId(Long agentId) {
        return tacheRepository.findByAgentId(agentId);
    }

    public Optional<Tache> getTacheById(Long id) {
        return tacheRepository.findById(id);
    }

    public void deleteTache(Long id) {
        tacheRepository.deleteById(id);
    }

    public Tache updateTache(Tache tache) {
        return tacheRepository.save(tache);
    }
    public List<Tache> rechercherTaches(Long agentId, String priorite, LocalDateTime start, LocalDateTime end, Long serviceId) {
    return tacheRepository.findAll((root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();

        if (agentId != null) {
            predicates.add(cb.equal(root.get("agentId"), agentId));
        }

        if (serviceId != null) {
            predicates.add(cb.equal(root.get("serviceId"), serviceId));
        }

        if (priorite != null && !priorite.trim().isEmpty()) {
            predicates.add(
                cb.equal(
                    cb.upper(root.get("priorite")),
                    cb.upper(cb.literal(priorite.trim()))
                )
            );
        }

        if (start != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("dateDebut"), start));
        }
        if (end != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("dateDebut"), end));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    });
}

    public TacheDTO toDTOWithColor(Tache tache) {
    TacheDTO dto = TacheMapper.toDTO(tache);

    LocalDateTime now = LocalDateTime.now();
    LocalDateTime dateFin = tache.getDateDebut().plusHours(tache.getDureeEnHeures());
    boolean estEnRetard = !"Terminée".equalsIgnoreCase(tache.getEtat()) && dateFin.isBefore(now);

    String etatPourCouleur = estEnRetard ? "En retard" : tache.getEtat();
    ParametrageCouleur param = paramColorRepo.findByEtatIgnoreCase(etatPourCouleur).orElse(null);

    if (param != null) {
        dto.setCodeColor(param.getCodeColor());
        dto.setConteneur(param.isConteneur());
    } else {
        dto.setCodeColor("#CCCCCC");
        dto.setConteneur(false);
    }

    if ("HAUTE".equalsIgnoreCase(tache.getPriorite())) {
        ParametrageCouleur paramCadre = paramColorRepo.findByEtatIgnoreCase("prioritaire").orElse(null);
        if (paramCadre != null) {
            dto.setCadre(true);
        } else {
            dto.setCadre(false);
        }
    } else {
        dto.setCadre(false);
    }
    dto.setEtat(tache.getEtat());

    return dto;
}
    public List<Tache> getTachesByServiceId(Long serviceId) {

        return tacheRepository.findByServiceId(serviceId);
    }

}