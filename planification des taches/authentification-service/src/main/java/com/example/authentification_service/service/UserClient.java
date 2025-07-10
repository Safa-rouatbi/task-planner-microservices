package com.example.authentification_service.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.authentification_service.dto.UserDTO;

@Service
public class UserClient {
    private final RestTemplate restTemplate;

    public UserClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public UserDTO getUserByEmail(String email) {
        String url = "http://localhost:8082/users/find/" + email;
        return restTemplate.getForObject(url, UserDTO.class);
    }
}

