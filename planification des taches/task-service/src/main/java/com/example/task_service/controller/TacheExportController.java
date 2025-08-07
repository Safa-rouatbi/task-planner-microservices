package com.example.task_service.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.task_service.dto.UserDTO;
import com.example.task_service.model.Tache;
import com.example.task_service.service.TacheService;
@RestController
@RequestMapping("/export")
public class TacheExportController {

    private final TacheService tacheService;
    private final RestTemplate restTemplate;

    public TacheExportController(TacheService tacheService, RestTemplate restTemplate) {
        this.tacheService = tacheService;
        this.restTemplate = restTemplate;
    }

@GetMapping(value = "/taches.xlsx", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
public ResponseEntity<ByteArrayResource> exporterTaches(
    @RequestHeader("Authorization") String authorizationHeader) {

    List<Tache> taches = tacheService.getAllTaches();
    String token = null;
    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
        token = authorizationHeader.substring(7);
    }

    UserDTO[] usersArray;
    try {
        HttpHeaders headers = new HttpHeaders();
        if (token != null) {
            headers.setBearerAuth(token);
        }
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<UserDTO[]> response = restTemplate.exchange(
            "http://localhost:8082/users/all",
            HttpMethod.GET,
            entity,
            UserDTO[].class
        );
        usersArray = response.getBody();
    } catch (Exception e) {
        System.err.println("Erreur appel user-service: " + e.getMessage());
        usersArray = new UserDTO[0];
    }

        Map<Long, String> userMap = new HashMap<>();
        for (UserDTO u : usersArray) {
            userMap.put(u.getId(), u.getNomComplet());
        }

        byte[] bytes = generateExcel(taches, userMap);
        ByteArrayResource resource = new ByteArrayResource(bytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=taches.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }

    private byte[] generateExcel(List<Tache> taches, Map<Long, String> userMap) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Tâches");

            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Titre", "Description", "Date de début", "Durée (h)", "Priorité", "Agent", "État", "Date de fin"};
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }

            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("dd/MM/yyyy HH:mm"));

            int rowNum = 1;
            for (Tache tache : taches) {
                Row row = sheet.createRow(rowNum++);
                LocalDateTime dateFin = tache.getDateDebut().plusHours(tache.getDureeEnHeures());

                row.createCell(0).setCellValue(tache.getId());
                row.createCell(1).setCellValue(tache.getTitre());
                row.createCell(2).setCellValue(tache.getDescription());

                Cell cellDateDebut = row.createCell(3);
                cellDateDebut.setCellValue(tache.getDateDebut());
                cellDateDebut.setCellStyle(dateStyle);

                row.createCell(4).setCellValue(tache.getDureeEnHeures());
                row.createCell(5).setCellValue(tache.getPriorite());

                String nomAgent = "Non assigné";
                if (tache.getAgentId() != null && userMap.containsKey(tache.getAgentId())) {
                    nomAgent = userMap.get(tache.getAgentId());
                }
                row.createCell(6).setCellValue(nomAgent);

                row.createCell(7).setCellValue(tache.getEtat());

                Cell cellDateFin = row.createCell(8);
                cellDateFin.setCellValue(dateFin);
                cellDateFin.setCellStyle(dateStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            sheet.setColumnWidth(3, 5000);
            sheet.setColumnWidth(8, 5000);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Erreur Excel", e);
        }
    }
}