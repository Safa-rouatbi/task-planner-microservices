package com.example.user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.user_service.model.Service;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}