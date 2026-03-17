package com.budgetsphere.backend.service;

import com.budgetsphere.backend.dto.FixedExpenseDto;
import com.budgetsphere.backend.dto.FixedExpenseRequest;
import com.budgetsphere.backend.entity.FixedExpense;
import com.budgetsphere.backend.entity.User;
import com.budgetsphere.backend.mapper.FixedExpenseMapper;
import com.budgetsphere.backend.repository.FixedExpenseRepository;
import com.budgetsphere.backend.repository.UserRepository;
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
public class FixedExpenseService {

    private final FixedExpenseRepository fixedExpenseRepository;
    private final UserRepository userRepository;
    private final FixedExpenseMapper fixedExpenseMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public FixedExpenseDto create(FixedExpenseRequest request) {
        FixedExpense expense = fixedExpenseMapper.toEntity(request, getCurrentUser());
        return fixedExpenseMapper.toDto(fixedExpenseRepository.save(expense));
    }

    public Page<FixedExpenseDto> getAll(int page, int size, String sortBy, LocalDate from, LocalDate to) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Long userId = getCurrentUser().getId();
        if (from != null && to != null) {
            return fixedExpenseRepository.findByUserIdAndStartDateBetween(userId, from, to, pageable)
                    .map(fixedExpenseMapper::toDto);
        }
        return fixedExpenseRepository.findByUserId(userId, pageable).map(fixedExpenseMapper::toDto);
    }

    public FixedExpenseDto update(Long id, FixedExpenseRequest request) {
        FixedExpense expense = fixedExpenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fixed expense not found"));
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setFrequency(request.getFrequency());
        expense.setStartDate(request.getStartDate());
        expense.setEndDate(request.getEndDate());
        expense.setCategory(request.getCategory());
        return fixedExpenseMapper.toDto(fixedExpenseRepository.save(expense));
    }

    public void delete(Long id) {
        fixedExpenseRepository.deleteById(id);
    }
}
