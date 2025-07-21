package com.example.task_service.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ParametrageCouleur {

     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String etat;

    private boolean cadre;

    private boolean conteneur;

    private String codeColor;

    public ParametrageCouleur() {}

    public ParametrageCouleur(String etat, boolean cadre, boolean conteneur, String codeColor) {
        this.etat = etat;
        this.cadre = cadre;
        this.conteneur = conteneur;
        this.codeColor = codeColor;
    }

    public Long getId() {
        return id;
    }

    public String getEtat() {
        return etat;
    }

    public void setEtat(String etat) {
        this.etat = etat;
    }

    public boolean isCadre() {
        return cadre;
    }

    public void setCadre(boolean cadre) {
        this.cadre = cadre;
    }

    public boolean isConteneur() {
        return conteneur;
    }

    public void setConteneur(boolean conteneur) {
        this.conteneur = conteneur;
    }

    public String getCodeColor() {
        return codeColor;
    }

    public void setCodeColor(String codeColor) {
        this.codeColor = codeColor;
    }
}