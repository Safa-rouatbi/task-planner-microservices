package com.example.task_service.repository;

import com.example.task_service.model.ParametrageCouleur;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParametrageColorRepository extends JpaRepository<ParametrageCouleur, Long> {
    @Query("SELECT p FROM ParametrageCouleur p WHERE UPPER(TRIM(p.etat)) = UPPER(TRIM(:etat))")
    Optional<ParametrageCouleur> findByEtatIgnoreCase(@Param("etat") String etat);

}
