package com.budgetsphere.backend.controller;

import com.budgetsphere.backend.dto.NeedDto;
import com.budgetsphere.backend.dto.NeedRequest;
import com.budgetsphere.backend.entity.NeedPriority;
import com.budgetsphere.backend.entity.NeedStatus;
import com.budgetsphere.backend.service.NeedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/needs")
@RequiredArgsConstructor
public class NeedController {

    private final NeedService needService;

    @PostMapping
    public ResponseEntity<NeedDto> create(@Valid @RequestBody NeedRequest request) {
        return ResponseEntity.ok(needService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<NeedDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(needService.getAll(page, size));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<NeedDto>> getByStatus(
            @PathVariable NeedStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(needService.getByStatus(status, page, size));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<Page<NeedDto>> getByPriority(
            @PathVariable NeedPriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(needService.getByPriority(priority, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NeedDto> update(@PathVariable Long id, @Valid @RequestBody NeedRequest request) {
        return ResponseEntity.ok(needService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<NeedDto> updateStatus(@PathVariable Long id, @RequestParam NeedStatus status) {
        return ResponseEntity.ok(needService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        needService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
