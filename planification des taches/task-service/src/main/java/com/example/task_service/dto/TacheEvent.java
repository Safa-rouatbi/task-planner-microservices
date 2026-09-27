package com.example.task_service.dto;

// Message envoye sur /topic/taches quand une tache est creee, modifiee ou supprimee.
// Pour une suppression, tache reste vide et on renvoie juste l'id.
public class TacheEvent {
    private String type;
    private TacheDTO tache;
    private Long tacheId;

    public TacheEvent(String type, TacheDTO tache) {
        this.type = type;
        this.tache = tache;
    }

    public TacheEvent(String type, Long tacheId) {
        this.type = type;
        this.tacheId = tacheId;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public TacheDTO getTache() { return tache; }
    public void setTache(TacheDTO tache) { this.tache = tache; }

    public Long getTacheId() { return tacheId; }
    public void setTacheId(Long tacheId) { this.tacheId = tacheId; }
}
