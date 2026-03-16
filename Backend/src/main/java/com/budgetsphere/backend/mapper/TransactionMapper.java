package com.budgetsphere.backend.mapper;

import com.budgetsphere.backend.dto.TransactionDto;
import com.budgetsphere.backend.dto.TransactionRequest;
import com.budgetsphere.backend.entity.Transaction;
import com.budgetsphere.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionDto toDto(Transaction transaction) {
        return TransactionDto.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .date(transaction.getDate())
                .description(transaction.getDescription())
                .recurring(transaction.isRecurring())
                .category(transaction.getCategory())
                .userId(transaction.getUser().getId())
                .build();
    }

    public Transaction toEntity(TransactionRequest request, User user) {
        return Transaction.builder()
                .amount(request.getAmount())
                .type(request.getType())
                .date(request.getDate())
                .description(request.getDescription())
                .recurring(request.isRecurring())
                .category(request.getCategory())
                .user(user)
                .build();
    }
}
