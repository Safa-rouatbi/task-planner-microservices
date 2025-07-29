package com.example.task_service.service;

import com.example.task_service.dto.StatistiquesDTO;
import com.example.task_service.dto.TacheDTO;
import com.example.task_service.dto.TacheEnRetardDTO;
import com.example.task_service.mapper.TacheMapper;
import com.example.task_service.model.ParametrageCouleur;
import com.example.task_service.model.Tache;
import com.example.task_service.repository.ParametrageColorRepository;
import com.example.task_service.repository.TacheRepo;

import jakarta.persistence.criteria.Predicate;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    public boolean estEnRetard(Tache tache) {
        LocalDateTime dateFin = tache.getDateDebut().plusHours(tache.getDureeEnHeures());
        return !"Terminée".equalsIgnoreCase(tache.getEtat()) && dateFin.isBefore(LocalDateTime.now());
    }

    private long heuresDeRetard(Tache tache, LocalDateTime maintenant) {
        LocalDateTime dateFin = tache.getDateDebut().plusHours(tache.getDureeEnHeures());
        return ChronoUnit.HOURS.between(dateFin, maintenant);
    }

    // Une tache compte dans la charge si elle deborde sur la periode
    private boolean recoupePeriode(Tache tache, LocalDateTime debut, LocalDateTime fin) {
        LocalDateTime dateFin = tache.getDateDebut().plusHours(tache.getDureeEnHeures());
        return !dateFin.isBefore(debut) && !tache.getDateDebut().isAfter(fin);
    }

    public TacheDTO toDTOWithColor(Tache tache) {
    TacheDTO dto = TacheMapper.toDTO(tache);

    boolean estEnRetard = estEnRetard(tache);

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

    public StatistiquesDTO getStatistiques() {
        List<Tache> taches = tacheRepository.findAll();
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime ilYA14Jours = maintenant.minusDays(14);

        // Tout le tableau de bord raisonne sur les taches actives
        List<Tache> actives = taches.stream()
            .filter(t -> !"Terminée".equalsIgnoreCase(t.getEtat()))
            .collect(Collectors.toList());

        Map<Long, Long> chargeParAgent = actives.stream()
            .filter(t -> t.getAgentId() != null)
            .filter(t -> recoupePeriode(t, ilYA14Jours, maintenant))
            .collect(Collectors.groupingBy(Tache::getAgentId, Collectors.summingLong(Tache::getDureeEnHeures)));

        Map<String, Long> parPriorite = actives.stream()
            .filter(t -> t.getPriorite() != null)
            .collect(Collectors.groupingBy(Tache::getPriorite, Collectors.counting()));

        Map<Long, Long> parService = actives.stream()
            .filter(t -> t.getServiceId() != null)
            .collect(Collectors.groupingBy(Tache::getServiceId, Collectors.counting()));

        long nombreEnRetard = actives.stream().filter(this::estEnRetard).count();

       
        List<TacheEnRetardDTO> tachesEnRetard = actives.stream()
            .filter(this::estEnRetard)
            .sorted((a, b) -> Long.compare(heuresDeRetard(b, maintenant), heuresDeRetard(a, maintenant)))
            .limit(10)
            .map(t -> new TacheEnRetardDTO(t.getTitre(), t.getAgentId(), heuresDeRetard(t, maintenant)))
            .collect(Collectors.toList());

        long nonAssignees = actives.stream().filter(t -> t.getAgentId() == null).count();
        long sansService = actives.stream().filter(t -> t.getServiceId() == null).count();

        StatistiquesDTO stats = new StatistiquesDTO();
        stats.setChargeParAgent(chargeParAgent);
        stats.setParPriorite(parPriorite);
        stats.setParService(parService);
        stats.setNombreEnRetard(nombreEnRetard);
        stats.setTachesEnRetard(tachesEnRetard);
        stats.setTachesNonAssignees(nonAssignees);
        stats.setTachesSansService(sansService);
        stats.setTotalActives(actives.size());
        stats.setTotalTaches(taches.size());
        return stats;
    }

}