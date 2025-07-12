package com.example.user_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="comptes")
public class Compte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String prenom;
    private String mail;
    private String motdepasse;
    private String role;

    private boolean actif = true;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private Service service;

    public Long getId() {
    return id;
}

public void setId(Long id) {
    this.id = id;
}

public String getNom() {
    return nom;
}

public void setNom(String nom) {
    this.nom = nom;
}

public String getPrenom() {
    return prenom;
}

public void setPrenom(String prenom) {
    this.prenom = prenom;
}

public String getMail() {
    return mail;
}

public void setMail(String mail) {
    this.mail = mail;
}
public String getMotdepasse() {
    return motdepasse;
}

public void setMotdepasse(String motdepasse) {
    this.motdepasse = motdepasse;
}
public String getRole() {
    return role;
}

public void setRole(String role) {
    this.role = role;
}
public boolean isActif() {
    return actif;
}

public void setActif(boolean actif) {
    this.actif = actif;
}
public com.example.user_service.model.Service getService() {
        return service;
    }

    public void setService(com.example.user_service.model.Service service) {
        this.service = service;
    }

    public Long getServiceId() {
    return this.service != null ? this.service.getId() : null;
}

}
