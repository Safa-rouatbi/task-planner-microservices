package com.example.task_service.dto;

import java.util.List;
import java.util.Map;

public class StatistiquesDTO {
    private Map<Long, Long> chargeParAgent;
    private Map<String, Long> parPriorite;
    private Map<Long, Long> parService;
    private long nombreEnRetard;
    private long totalTaches;
    private List<TacheEnRetardDTO> tachesEnRetard;

    public Map<Long, Long> getChargeParAgent() { return chargeParAgent; }
    public void setChargeParAgent(Map<Long, Long> chargeParAgent) { this.chargeParAgent = chargeParAgent; }

    public Map<String, Long> getParPriorite() { return parPriorite; }
    public void setParPriorite(Map<String, Long> parPriorite) { this.parPriorite = parPriorite; }

    public Map<Long, Long> getParService() { return parService; }
    public void setParService(Map<Long, Long> parService) { this.parService = parService; }

    public long getNombreEnRetard() { return nombreEnRetard; }
    public void setNombreEnRetard(long nombreEnRetard) { this.nombreEnRetard = nombreEnRetard; }

    public long getTotalTaches() { return totalTaches; }
    public void setTotalTaches(long totalTaches) { this.totalTaches = totalTaches; }

    public List<TacheEnRetardDTO> getTachesEnRetard() { return tachesEnRetard; }
    public void setTachesEnRetard(List<TacheEnRetardDTO> tachesEnRetard) { this.tachesEnRetard = tachesEnRetard; }

    private long totalActives;
    public long getTotalActives() { return totalActives; }
    public void setTotalActives(long totalActives) { this.totalActives = totalActives; }

    private long tachesNonAssignees;
    public long getTachesNonAssignees() { return tachesNonAssignees; }
    public void setTachesNonAssignees(long tachesNonAssignees) { this.tachesNonAssignees = tachesNonAssignees; }

    private long tachesSansService;
    public long getTachesSansService() { return tachesSansService; }
    public void setTachesSansService(long tachesSansService) { this.tachesSansService = tachesSansService; }
}
