package com.example.task_service.mapper;

import com.example.task_service.dto.TacheDTO;
import com.example.task_service.model.Tache;

public class TacheMapper {

    public static Tache toEntity(TacheDTO dto) {
        Tache t = new Tache();
        t.setId(dto.getId());
        t.setTitre(dto.getTitre());
        t.setDescription(dto.getDescription());
        t.setDateDebut(dto.getDateDebut());
        t.setDureeEnHeures(dto.getDureeEnHeures());
        t.setPriorite(dto.getPriorite());
        t.setAgentId(dto.getAgentId());
        t.setServiceId(dto.getServiceId());
        t.setEtat(dto.getEtat());
        return t;
    }

    public static TacheDTO toDTO(Tache t) {
        TacheDTO dto = new TacheDTO();
        dto.setId(t.getId());
        dto.setTitre(t.getTitre());
        dto.setDescription(t.getDescription());
        dto.setDateDebut(t.getDateDebut());
        dto.setDureeEnHeures(t.getDureeEnHeures());
        dto.setPriorite(t.getPriorite());
        dto.setAgentId(t.getAgentId());
        dto.setServiceId(t.getServiceId());
        dto.setEtat(t.getEtat());

        dto.setCodeColor(null);
        dto.setCadre(false);
        dto.setConteneur(false);

        return dto;
    }
}
