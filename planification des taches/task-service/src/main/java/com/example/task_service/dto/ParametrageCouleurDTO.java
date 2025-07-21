package com.example.task_service.dto;

public class ParametrageCouleurDTO {
    private Long id;
    private String etat;
    private boolean cadre;
    private boolean conteneur;
    private String codeColor;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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