package com.example.user_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.user_service.dto.ServiceDTO;

@Service
public class ServiceService {
    private final com.example.user_service.repository.ServiceRepository serviceRepository;

    public ServiceService(com.example.user_service.repository.ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    public com.example.user_service.model.Service createService(ServiceDTO serviceDTO) {
        com.example.user_service.model.Service service = new com.example.user_service.model.Service();
        service.setNomService(serviceDTO.getNomService());
        return serviceRepository.save(service);
    }

    public List<com.example.user_service.model.Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public com.example.user_service.model.Service getServiceById(Long id) {
        return serviceRepository.findById(id).orElse(null);
    }

    public com.example.user_service.model.Service updateService(Long id, ServiceDTO serviceDTO) {
        com.example.user_service.model.Service service = serviceRepository.findById(id).orElse(null);
        if (service == null) return null;

        service.setNomService(serviceDTO.getNomService());
        return serviceRepository.save(service);
    }

    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
}