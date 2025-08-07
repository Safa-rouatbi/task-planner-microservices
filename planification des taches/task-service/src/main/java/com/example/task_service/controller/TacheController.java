package com.example.task_service.controller;

import com.example.task_service.dto.CompteDTO;
import com.example.task_service.dto.StatistiquesDTO;
import com.example.task_service.dto.TacheDTO;
import com.example.task_service.mapper.TacheMapper;
import com.example.task_service.model.Tache;
import com.example.task_service.service.TacheService;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/taches")
public class TacheController {

    private final TacheService tacheService;
    private final RestTemplate restTemplate;

    public TacheController(TacheService tacheService, RestTemplate restTemplate) {
        this.tacheService = tacheService;
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public ResponseEntity<List<TacheDTO>> getTaches(@RequestAttribute("role") String role, @RequestAttribute("userId") Long userId) {
        List<Tache> taches = tacheService.getAllTaches();
        List<TacheDTO> dtoList = new ArrayList<>();
        for (Tache t : taches) {
            dtoList.add(tacheService.toDTOWithColor(t));
        }
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/mes-taches")
    public ResponseEntity<List<TacheDTO>> getMesTaches(@RequestAttribute("userId") Long userId) {
        // recuperer les taches de l'agent connecte
        List<Tache> taches = tacheService.getTachesByAgentId(userId);
        List<TacheDTO> dtoList = new ArrayList<>();
        for (Tache t : taches) {
            dtoList.add(tacheService.toDTOWithColor(t));
        }
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/filtre")
    public ResponseEntity<List<TacheDTO>> getTachesFiltres(@RequestParam(required = false) Long agentId,
                                                           @RequestParam(required = false) String priorite,
                                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
                                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
                                                           @RequestParam(required = false) Long serviceId,
                                                           @RequestAttribute("role") String role,
                                                           @RequestAttribute("userId") Long userId) {

        // si c'est pas un admin je verifie que l'utilisateur est dans le service
        if (serviceId != null && !role.equals("ADMIN")) {
            try {
                String url = "http://localhost:8080/api/users/by-service/" + serviceId;
                ResponseEntity<List<CompteDTO>> response = restTemplate.exchange(url, HttpMethod.GET, null, new ParameterizedTypeReference<List<CompteDTO>>() {});
                List<CompteDTO> agents = response.getBody();

                boolean userInService = false;
                if (agents != null) {
                    for (CompteDTO a : agents) {
                        if (a.getId().equals(userId)) {
                            userInService = true;
                            break;
                        }
                    }
                }

                if (userInService == false) {
                    System.out.println("Accès refusé : utilisateur " + userId + " pas dans le service " + serviceId);
                    return ResponseEntity.status(403).body(null);
                }
            } catch (Exception e) {
                System.err.println("Erreur appel user-service : " + e.getMessage());
                return ResponseEntity.status(500).body(null);
            }
        }

        List<Tache> taches = tacheService.rechercherTaches(agentId, priorite, start, end, serviceId);
        List<TacheDTO> dtoList = new ArrayList<>();
        for (Tache t : taches) {
            dtoList.add(tacheService.toDTOWithColor(t));
        }
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping
    public ResponseEntity<TacheDTO> create(@RequestBody TacheDTO tacheDTO, @RequestAttribute("role") String role, @RequestAttribute("userId") Long userId) {
        // un agent ne peut creer une tache que pour lui meme
        if (!role.equals("ADMIN")) {
            tacheDTO.setAgentId(userId);
        }
        Tache tache = TacheMapper.toEntity(tacheDTO);
        Tache saved = tacheService.createTache(tache);
        return ResponseEntity.ok(tacheService.toDTOWithColor(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody TacheDTO tacheDTO, @RequestAttribute("role") String role, @RequestAttribute("userId") Long userId) {
        Optional<Tache> optionalTache = tacheService.getTacheById(id);
        if (!optionalTache.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Tache tache = optionalTache.get();

        if (!role.equals("ADMIN") && !tache.getAgentId().equals(userId)) {
            return ResponseEntity.status(403).body("Accès refusé");
        }

        Tache toUpdate = TacheMapper.toEntity(tacheDTO);
        toUpdate.setId(id);
        toUpdate.setAgentId(tache.getAgentId());

        try {
            Tache updated = tacheService.updateTache(toUpdate);
            return ResponseEntity.ok(tacheService.toDTOWithColor(updated));
        } catch (ObjectOptimisticLockingFailureException e) {
            // quelqu'un d'autre a deja modifie cette tache entre temps
            return ResponseEntity.status(409).body("Cette tâche a été modifiée par quelqu'un d'autre, veuillez rafraîchir.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @RequestAttribute("role") String role, @RequestAttribute("userId") Long userId) {
        Optional<Tache> optionalTache = tacheService.getTacheById(id);
        if (!optionalTache.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Tache tache = optionalTache.get();

        if (!role.equals("ADMIN") && !tache.getAgentId().equals(userId)) {
            return ResponseEntity.status(403).body("Accès refusé");
        }
        tacheService.deleteTache(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<StatistiquesDTO> getStatistiques(@RequestAttribute("role") String role) {
        // seulement l'admin peut voir les stats
        if (!role.equals("ADMIN")) {
            return ResponseEntity.status(403).body(null);
        }
        StatistiquesDTO stats = tacheService.getStatistiques();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/par-service")
    public ResponseEntity<List<TacheDTO>> getTachesParService(@RequestParam Long serviceId, @RequestAttribute("role") String role, @RequestAttribute("userId") Long userId) {
        List<Tache> taches = tacheService.getTachesByServiceId(serviceId);
        List<TacheDTO> dtoList = new ArrayList<>();
        for (Tache t : taches) {
            dtoList.add(tacheService.toDTOWithColor(t));
        }
        return ResponseEntity.ok(dtoList);
    }

}
