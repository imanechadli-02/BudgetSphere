package com.budgetsphere.backend.service.impl;

import com.budgetsphere.backend.dto.StatsDto;
import com.budgetsphere.backend.dto.TransactionDto;
import com.budgetsphere.backend.dto.TransactionRequest;
import com.budgetsphere.backend.entity.Transaction;
import com.budgetsphere.backend.entity.TransactionType;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.TransactionMapper;
import com.budgetsphere.backend.repository.TransactionRepository;
import com.budgetsphere.backend.repository.UserRepository;
import com.budgetsphere.backend.exception.BusinessException;
import com.budgetsphere.backend.exception.ResourceNotFoundException;
import com.budgetsphere.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));
    }

    @Override
    public TransactionDto create(TransactionRequest request) {
        Transaction transaction = transactionMapper.toEntity(request, getCurrentUser());
        return transactionMapper.toDto(transactionRepository.save(transaction));
    }

    @Override
    public Page<TransactionDto> getAll(int page, int size, String sortBy, LocalDate from, LocalDate to) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Long userId = getCurrentUser().getId();
        if (from != null && to != null) {
            return transactionRepository.findByUserIdAndDateBetween(userId, from, to, pageable)
                    .map(transactionMapper::toDto);
        }
        return transactionRepository.findByUserId(userId, pageable).map(transactionMapper::toDto);
    }

    @Override
    public Page<TransactionDto> getByType(TransactionType type, int page, int size, String sortBy, LocalDate from, LocalDate to) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Long userId = getCurrentUser().getId();
        if (from != null && to != null) {
            return transactionRepository.findByUserIdAndTypeAndDateBetween(userId, type, from, to, pageable)
                    .map(transactionMapper::toDto);
        }
        return transactionRepository.findByUserIdAndType(userId, type, pageable).map(transactionMapper::toDto);
    }

    @Override
    public TransactionDto update(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
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
        transactionRepository.deleteById(id);
    }

    @Override
    public StatsDto getStats() {
        Long userId = getCurrentUser().getId();
        java.math.BigDecimal income = transactionRepository.sumByUserIdAndType(userId, TransactionType.INCOME);
        java.math.BigDecimal expense = transactionRepository.sumByUserIdAndType(userId, TransactionType.EXPENSE);
        long count = transactionRepository.countByUserId(userId);
        return StatsDto.builder()
                .totalIncome(income)
                .totalExpense(expense)
                .balance(income.subtract(expense))
                .transactionCount(count)
                .build();
    }
}
