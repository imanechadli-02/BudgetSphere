package com.budgetsphere.backend.service.impl;

import com.budgetsphere.backend.dto.StatsDto;
import com.budgetsphere.backend.dto.TransactionDto;
import com.budgetsphere.backend.dto.TransactionRequest;
import com.budgetsphere.backend.entity.Transaction;
import com.budgetsphere.backend.entity.TransactionType;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.TransactionMapper;
import com.budgetsphere.backend.repository.TransactionRepository;
import com.budgetsphere.backend.exception.ResourceNotFoundException;
import com.budgetsphere.backend.service.TransactionService;
import com.budgetsphere.backend.service.UserContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final UserContextService userContextService;

    @Override
    public TransactionDto create(TransactionRequest request) {
        Transaction transaction = transactionMapper.toEntity(request, userContextService.getCurrentUser());
        return transactionMapper.toDto(transactionRepository.save(transaction));
    }

    @Override
    public Page<TransactionDto> getAll(int page, int size, String sortBy, LocalDate from, LocalDate to) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Long userId = userContextService.getCurrentUser().getId();
        if (from != null && to != null) {
            return transactionRepository.findByUserIdAndDateBetween(userId, from, to, pageable)
                    .map(transactionMapper::toDto);
        }
        return transactionRepository.findByUserId(userId, pageable).map(transactionMapper::toDto);
    }

    @Override
    public Page<TransactionDto> getByType(TransactionType type, int page, int size, String sortBy, LocalDate from, LocalDate to) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Long userId = userContextService.getCurrentUser().getId();
        if (from != null && to != null) {
            return transactionRepository.findByUserIdAndTypeAndDateBetween(userId, type, from, to, pageable)
                    .map(transactionMapper::toDto);
        }
        return transactionRepository.findByUserIdAndType(userId, type, pageable).map(transactionMapper::toDto);
    }

    @Override
    public TransactionDto update(Long id, TransactionRequest request) {
        User user = userContextService.getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        userContextService.checkOwnership(transaction.getUser(), user);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());
        transaction.setRecurring(request.isRecurring());
        transaction.setCategory(request.getCategory());
        return transactionMapper.toDto(transactionRepository.save(transaction));
    }

    @Override
    public void delete(Long id) {
        User user = userContextService.getCurrentUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        userContextService.checkOwnership(transaction.getUser(), user);
        transactionRepository.deleteById(id);
    }

    @Override
    public StatsDto getStats() {
        Long userId = userContextService.getCurrentUser().getId();
        BigDecimal income = transactionRepository.sumByUserIdAndType(userId, TransactionType.INCOME);
        BigDecimal expense = transactionRepository.sumByUserIdAndType(userId, TransactionType.EXPENSE);
        if (income == null) income = BigDecimal.ZERO;
        if (expense == null) expense = BigDecimal.ZERO;
        long count = transactionRepository.countByUserId(userId);
        return StatsDto.builder()
                .totalIncome(income)
                .totalExpense(expense)
                .balance(income.subtract(expense))
                .transactionCount(count)
                .build();
    }
}
