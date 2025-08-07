package com.example.task_service.dto;

import java.time.LocalDateTime;

public class TacheDTO {
    private Long id;
    private String titre;
    private String description;
    private LocalDateTime dateDebut;
    private int dureeEnHeures;
    private String priorite;
    private Long agentId;
    private Long serviceId;
    private String etat;
    private int version;

    private String codeColor;
    private boolean cadre;
    private boolean conteneur;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public int getDureeEnHeures() { return dureeEnHeures; }
    public void setDureeEnHeures(int dureeEnHeures) { this.dureeEnHeures = dureeEnHeures; }

    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) { this.priorite = priorite; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getEtat() { return etat;}
    public void setEtat(String etat) { this.etat = etat;}

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public String getCodeColor() { return codeColor; }
    public void setCodeColor(String codeColor) { this.codeColor = codeColor; }

    public boolean isCadre() { return cadre; }
    public void setCadre(boolean cadre) { this.cadre = cadre; }

    public boolean isConteneur() { return conteneur; }
    public void setConteneur(boolean conteneur) { this.conteneur = conteneur; }
}
