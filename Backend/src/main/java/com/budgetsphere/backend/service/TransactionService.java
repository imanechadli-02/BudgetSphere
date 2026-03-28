package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.StatsDto;
import com.budgetsphere.backend.dto.TransactionDto;
import com.budgetsphere.backend.dto.TransactionRequest;
import com.budgetsphere.backend.entity.TransactionType;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface TransactionService {
    TransactionDto create(TransactionRequest request);
    Page<TransactionDto> getAll(int page, int size, String sortBy, LocalDate from, LocalDate to);
    Page<TransactionDto> getByType(TransactionType type, int page, int size, String sortBy, LocalDate from, LocalDate to);
    TransactionDto update(Long id, TransactionRequest request);
    void delete(Long id);
    StatsDto getStats();
}
