package com.example.user_service.controller;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.user_service.dto.CompteDTO;
import com.example.user_service.model.Compte;
import com.example.user_service.service.CompteService;

@RestController
@RequestMapping("/users")
public class CompteController {
    private final CompteService compteService;
    CompteController(CompteService compteService){
        this.compteService=compteService;
    }

    @PostMapping("/add")
public ResponseEntity<String> creerAgent(@RequestBody CompteDTO dto, @RequestAttribute(value = "role", required = false) String role) {
    if (!"ADMIN".equals(role)) {
        return ResponseEntity.status(403).body("Accès refusé");
    }
    compteService.addCompte(dto);
    return ResponseEntity.ok("Agent créé avec succès");
}

    @GetMapping("/all")
public ResponseEntity<List<CompteDTO>> getAll() {
    List<Compte> comptes = compteService.getUsers();
    List<CompteDTO> dtos = new ArrayList<>();
    for (Compte c : comptes) {
        dtos.add(new CompteDTO(c));
    }
    return ResponseEntity.ok(dtos);
}

    @GetMapping("/{id}")
    public ResponseEntity<Compte> getCompteById(@PathVariable Long id) {
        Compte compte = compteService.getUserById(id);
        if (compte == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(compte);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompte(@PathVariable Long id, @RequestBody Compte compteDetails, @RequestAttribute(value = "role", required = false) String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Accès refusé");
        }
        Compte updatedCompte = compteService.update(id, compteDetails);
        if (updatedCompte == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedCompte);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCompte(@PathVariable Long id, @RequestAttribute(value = "role", required = false) String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Accès refusé");
        }
        compteService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/find/{mail}")
    public ResponseEntity<Compte> getByEmail(@PathVariable String mail) {
    Compte compte = compteService.findByMail(mail);
    if (compte == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(compte);
}
@PutMapping("/desactiver/{id}")
public ResponseEntity<String> desactiverCompte(@PathVariable Long id, @RequestAttribute(value = "role", required = false) String role) {
    if (!"ADMIN".equals(role)) {
        return ResponseEntity.status(403).body("Accès refusé");
    }
    boolean result = compteService.setActifStatus(id, false);
    if (result) return ResponseEntity.ok("Compte désactivé.");
    else return ResponseEntity.notFound().build();
}

@PutMapping("/activer/{id}")
public ResponseEntity<String> activerCompte(@PathVariable Long id, @RequestAttribute(value = "role", required = false) String role) {
    if (!"ADMIN".equals(role)) {
        return ResponseEntity.status(403).body("Accès refusé");
    }
    boolean result = compteService.setActifStatus(id, true);
    if (result) return ResponseEntity.ok("Compte activé.");
    else return ResponseEntity.notFound().build();
}

@GetMapping("/by-service/{serviceId}")
public ResponseEntity<List<CompteDTO>> getUsersByService(@PathVariable Long serviceId) {
    List<Compte> comptes = compteService.getUsersByServiceId(serviceId);
    List<CompteDTO> dtos = new ArrayList<>();
    for (Compte c : comptes) {
        dtos.add(new CompteDTO(c));
    }
    return ResponseEntity.ok(dtos);
}

}

