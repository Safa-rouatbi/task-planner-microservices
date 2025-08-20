package com.example.task_service.config;

import com.example.task_service.security.JwtUtil;
import com.example.task_service.service.PresenceService;

import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final PresenceService presenceService;

    public WebSocketAuthInterceptor(JwtUtil jwtUtil, @Lazy PresenceService presenceService) {
        this.jwtUtil = jwtUtil;
        this.presenceService = presenceService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Token manquant");
            }

            String token = authHeader.substring(7);
            String username;
            try {
                username = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                throw new IllegalArgumentException("Token invalide");
            }

            presenceService.enregistrer(accessor.getSessionId(), username);
        }

        return message;
    }
}
