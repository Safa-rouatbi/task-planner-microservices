package com.example.authentification_service.service;
import org.springframework.stereotype.Service;

import com.example.authentification_service.dto.UserDTO;

@Service
public class UserService {
    private final UserClient userClient;

    public UserService(UserClient userClient) {
        this.userClient = userClient;
    }

    public UserDTO findByEmail(String email) {
        return userClient.getUserByEmail(email);
    }
}

