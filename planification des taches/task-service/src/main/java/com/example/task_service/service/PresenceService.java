package com.example.task_service.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
@Service
public class PresenceService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, String> nomsEnAttente = new ConcurrentHashMap<>();
    private final Map<String, String> utilisateursConnectes = new ConcurrentHashMap<>();

    public PresenceService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void enregistrer(String sessionId, String username) {
        nomsEnAttente.put(sessionId, username);
    }
 public void confirmerAbonnement(String sessionId) {
        String username = nomsEnAttente.get(sessionId);
        if (username != null) {
            utilisateursConnectes.put(sessionId, username);
            envoyerListe();
        }
    }

    public void deconnecter(String sessionId) {
        nomsEnAttente.remove(sessionId);
        if (utilisateursConnectes.remove(sessionId) != null) {
            envoyerListe();
        }
    }

    private void envoyerListe() {
        List<String> noms = new ArrayList<>(utilisateursConnectes.values());
        try {
            messagingTemplate.convertAndSend("/topic/presence", noms);
        } catch (Exception e) {
            System.err.println("Erreur envoi presence WebSocket : " + e.getMessage());
        }
    }
}
