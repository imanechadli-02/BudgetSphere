package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.TransactionDto;
import com.budgetsphere.backend.dto.TransactionRequest;
import com.budgetsphere.backend.entity.Transaction;
import com.budgetsphere.backend.entity.TransactionType;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.TransactionMapper;
import com.budgetsphere.backend.repository.TransactionRepository;
import com.budgetsphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public TransactionDto create(TransactionRequest request) {
        User user = getCurrentUser();
        Transaction transaction = transactionMapper.toEntity(request, user);
        return transactionMapper.toDto(transactionRepository.save(transaction));
    }

    public List<TransactionDto> getAll() {
        return transactionRepository.findByUserId(getCurrentUser().getId())
                .stream().map(transactionMapper::toDto).toList();
    }

    public List<TransactionDto> getByType(TransactionType type) {
        return transactionRepository.findByUserIdAndType(getCurrentUser().getId(), type)
                .stream().map(transactionMapper::toDto).toList();
    }

    public TransactionDto update(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());
        transaction.setRecurring(request.isRecurring());
        transaction.setCategory(request.getCategory());
        return transactionMapper.toDto(transactionRepository.save(transaction));
    }

    public void delete(Long id) {
        transactionRepository.deleteById(id);
    }
}
