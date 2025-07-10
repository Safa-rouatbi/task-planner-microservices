package com.example.authentification_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class CorsConfig {

        @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
