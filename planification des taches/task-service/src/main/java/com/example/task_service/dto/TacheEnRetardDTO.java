package com.example.task_service.dto;

public class TacheEnRetardDTO {
    private String titre;
    private Long agentId;
    private long heuresRetard;

    public TacheEnRetardDTO() {}

    public TacheEnRetardDTO(String titre, Long agentId, long heuresRetard) {
        this.titre = titre;
        this.agentId = agentId;
        this.heuresRetard = heuresRetard;
    }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public long getHeuresRetard() { return heuresRetard; }
    public void setHeuresRetard(long heuresRetard) { this.heuresRetard = heuresRetard; }
}
