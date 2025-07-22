package com.example.task_service.dto;

public class UserDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String mail;
    private String role;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getNomComplet() {
        return (prenom != null ? prenom : "") + " " + (nom != null ? nom : "");
    }

    public String getMail() { return mail; }
    public void setMail(String mail) { this.mail = mail; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
