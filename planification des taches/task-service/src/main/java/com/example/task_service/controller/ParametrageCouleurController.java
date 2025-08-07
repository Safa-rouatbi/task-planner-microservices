package com.example.task_service.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.task_service.model.ParametrageCouleur;
import com.example.task_service.repository.ParametrageColorRepository;

@RestController
@RequestMapping("/parametrage-couleurs")
public class ParametrageCouleurController {

    private final ParametrageColorRepository paramColorRepo;

    public ParametrageCouleurController(ParametrageColorRepository paramColorRepo) {
        this.paramColorRepo = paramColorRepo;
    }

    @GetMapping
    public ResponseEntity<List<ParametrageCouleur>> getAll() {
        return ResponseEntity.ok(paramColorRepo.findAll());
    }

    @GetMapping("/{etat}")
    public ResponseEntity<ParametrageCouleur> getByEtat(@PathVariable String etat) {
        Optional<ParametrageCouleur> param = paramColorRepo.findByEtatIgnoreCase(etat);
        if (!param.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(param.get());
    }

    @PostMapping
    public ResponseEntity<ParametrageCouleur> create(@RequestBody ParametrageCouleur param) {

        if (paramColorRepo.findByEtatIgnoreCase(param.getEtat()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        ParametrageCouleur saved = paramColorRepo.save(param);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParametrageCouleur> update(@PathVariable Long id, @RequestBody ParametrageCouleur param) {
        Optional<ParametrageCouleur> optionalExisting = paramColorRepo.findById(id);
        if (!optionalExisting.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        ParametrageCouleur existing = optionalExisting.get();
        existing.setEtat(param.getEtat());
        existing.setCodeColor(param.getCodeColor());
        existing.setCadre(param.isCadre());
        existing.setConteneur(param.isConteneur());

        ParametrageCouleur updated = paramColorRepo.save(existing);
        return ResponseEntity.ok(updated);
    }
}
