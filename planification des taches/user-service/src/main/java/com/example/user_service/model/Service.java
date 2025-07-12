package com.example.user_service.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "services")
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_service", nullable = false, unique = true)
    private String nomService;

    @JsonManagedReference
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Compte> comptes;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNomService() {
            return nomService;
        }

        public void setNomService(String nomService) {
            this.nomService = nomService;
        }

        public List<com.example.user_service.model.Compte> getComptes() {
            return comptes;
        }

        public void setComptes(List<com.example.user_service.model.Compte> comptes) {
            this.comptes = comptes;
        }

}
