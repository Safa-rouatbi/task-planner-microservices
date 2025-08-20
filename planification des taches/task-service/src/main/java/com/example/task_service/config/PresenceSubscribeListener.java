package com.example.task_service.config;

import com.example.task_service.service.PresenceService;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

// Des qu'un client s'abonne vraiment on peut l'ajouter
// a la liste des connectes et diffuser
@Component
public class PresenceSubscribeListener {

    private final PresenceService presenceService;

    public PresenceSubscribeListener(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    @EventListener
    public void onSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        if ("/topic/presence".equals(accessor.getDestination())) {
            presenceService.confirmerAbonnement(accessor.getSessionId());
        }
    }
}
