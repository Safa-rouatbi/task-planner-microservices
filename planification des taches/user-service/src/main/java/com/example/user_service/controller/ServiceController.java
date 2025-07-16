package com.example.user_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.user_service.dto.ServiceDTO;

@RestController
@RequestMapping("/users/services")
public class ServiceController {
    private final com.example.user_service.service.ServiceService serviceService;

    public ServiceController(com.example.user_service.service.ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @PostMapping("/add")
    public ResponseEntity<com.example.user_service.model.Service> createService(@RequestBody ServiceDTO serviceDTO) {
        com.example.user_service.model.Service createdService = serviceService.createService(serviceDTO);
        return ResponseEntity.ok(createdService);
    }

    @GetMapping("/all")
    public ResponseEntity<List<com.example.user_service.model.Service>> getAllServices() {
        List<com.example.user_service.model.Service> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.example.user_service.model.Service> getServiceById(@PathVariable Long id) {
        com.example.user_service.model.Service service = serviceService.getServiceById(id);
        if (service == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(service);
    }

    @PutMapping("/{id}")
    public ResponseEntity<com.example.user_service.model.Service> updateService(@PathVariable Long id, @RequestBody ServiceDTO serviceDTO) {
        com.example.user_service.model.Service updatedService = serviceService.updateService(id, serviceDTO);
        if (updatedService == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedService);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
