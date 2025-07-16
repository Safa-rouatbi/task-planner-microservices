package com.example.user_service.dto;

import com.example.user_service.model.Compte;

public class CompteDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String mail;
    private String motdepasse;
    private String role;
    private Boolean actif;
     private Long serviceId;
    private String nomService;

    public CompteDTO() {
}

    public CompteDTO(Compte compte) {
        this.id = compte.getId();
        this.nom = compte.getNom();
        this.prenom = compte.getPrenom();
        this.mail = compte.getMail();
        this.role = compte.getRole();
        this.actif = compte.isActif();
        this.serviceId = compte.getService() != null ? compte.getService().getId() : null;
        this.nomService = compte.getService() != null ? compte.getService().getNomService() : null;
    }

    public Long getId() {
    return id;
}
public void setId(Long id) { this.id = id; }

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
    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getNomService() {
        return nomService;
    }
    public void setNomService(String nomService) {
        this.nomService = nomService;
    }

    public Boolean getActif() {
        return actif;
    }
    public void setActif(Boolean actif) {
        this.actif = actif;
    }

}
