package com.example.task_service.config;

import com.example.task_service.service.PresenceService;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

// Quand un client ferme sa connexion webSocket
// on le retire de la liste des utilisateurs connectes.
@Component
public class PresenceDisconnectListener {

    private final PresenceService presenceService;

    public PresenceDisconnectListener(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        presenceService.deconnecter(accessor.getSessionId());
    }
}
