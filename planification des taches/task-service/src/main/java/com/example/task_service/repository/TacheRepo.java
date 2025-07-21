package com.example.task_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.task_service.model.Tache;

public interface TacheRepo extends JpaRepository<Tache, Long>, JpaSpecificationExecutor<Tache> {
    List<Tache> findByAgentId(Long agentId);
    List<Tache> findByServiceId(Long serviceId);
}