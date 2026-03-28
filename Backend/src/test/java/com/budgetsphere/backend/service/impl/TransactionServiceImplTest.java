package com.budgetsphere.backend.service.impl;

import com.budgetsphere.backend.dto.StatsDto;
import com.budgetsphere.backend.dto.TransactionDto;
import com.budgetsphere.backend.dto.TransactionRequest;
import com.budgetsphere.backend.entity.*;
import com.budgetsphere.backend.mapper.TransactionMapper;
import com.budgetsphere.backend.repository.TransactionRepository;
import com.budgetsphere.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private TransactionMapper transactionMapper;

    @InjectMocks private TransactionServiceImpl transactionService;

    private User user;
    private Transaction transaction;
    private TransactionDto transactionDto;
    private TransactionRequest request;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@test.com").build();

        request = TransactionRequest.builder()
                .amount(new BigDecimal("100.00"))
                .type(TransactionType.INCOME)
                .date(LocalDate.now())
                .description("Salaire")
                .recurring(false)
                .category(TransactionCategory.SALARY)
                .build();

        transaction = Transaction.builder()
                .id(1L)
                .amount(new BigDecimal("100.00"))
                .type(TransactionType.INCOME)
                .date(LocalDate.now())
                .description("Salaire")
                .recurring(false)
                .category(TransactionCategory.SALARY)
                .user(user)
                .build();

        transactionDto = TransactionDto.builder()
                .id(1L)
                .amount(new BigDecimal("100.00"))
                .type(TransactionType.INCOME)
                .date(LocalDate.now())
                .description("Salaire")
                .recurring(false)
                .category(TransactionCategory.SALARY)
                .userId(1L)
                .build();

        mockSecurityContext();
    }

    private void mockSecurityContext() {
        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        lenient().when(ctx.getAuthentication()).thenReturn(auth);
        lenient().when(auth.getName()).thenReturn("test@test.com");
        SecurityContextHolder.setContext(ctx);
        lenient().when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_shouldReturnTransactionDto() {
        when(transactionMapper.toEntity(request, user)).thenReturn(transaction);
        when(transactionRepository.save(transaction)).thenReturn(transaction);
        when(transactionMapper.toDto(transaction)).thenReturn(transactionDto);

        TransactionDto result = transactionService.create(request);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo("100.00");
        assertThat(result.getType()).isEqualTo(TransactionType.INCOME);
        verify(transactionRepository).save(transaction);
    }

    // ── getAll ────────────────────────────────────────────────────────────────

    @Test
    void getAll_withoutDateFilter_shouldReturnPage() {
        Page<Transaction> page = new PageImpl<>(List.of(transaction));
        when(transactionRepository.findByUserId(eq(1L), any(Pageable.class))).thenReturn(page);
        when(transactionMapper.toDto(transaction)).thenReturn(transactionDto);

        Page<TransactionDto> result = transactionService.getAll(0, 10, "date", null, null);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);
    }

    @Test
    void getAll_withDateFilter_shouldCallDateBetween() {
        LocalDate from = LocalDate.now().minusDays(7);
        LocalDate to = LocalDate.now();
        Page<Transaction> page = new PageImpl<>(List.of(transaction));
        when(transactionRepository.findByUserIdAndDateBetween(eq(1L), eq(from), eq(to), any(Pageable.class)))
                .thenReturn(page);
        when(transactionMapper.toDto(transaction)).thenReturn(transactionDto);

        Page<TransactionDto> result = transactionService.getAll(0, 10, "date", from, to);

        assertThat(result.getContent()).hasSize(1);
        verify(transactionRepository).findByUserIdAndDateBetween(eq(1L), eq(from), eq(to), any(Pageable.class));
    }

    // ── getByType ─────────────────────────────────────────────────────────────

    @Test
    void getByType_withoutDateFilter_shouldFilterByType() {
        Page<Transaction> page = new PageImpl<>(List.of(transaction));
        when(transactionRepository.findByUserIdAndType(eq(1L), eq(TransactionType.INCOME), any(Pageable.class)))
                .thenReturn(page);
        when(transactionMapper.toDto(transaction)).thenReturn(transactionDto);

        Page<TransactionDto> result = transactionService.getByType(TransactionType.INCOME, 0, 10, "date", null, null);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getType()).isEqualTo(TransactionType.INCOME);
    }

    @Test
    void getByType_withDateFilter_shouldCallTypeAndDateBetween() {
        LocalDate from = LocalDate.now().minusDays(30);
        LocalDate to = LocalDate.now();
        Page<Transaction> page = new PageImpl<>(List.of(transaction));
        when(transactionRepository.findByUserIdAndTypeAndDateBetween(eq(1L), eq(TransactionType.INCOME), eq(from), eq(to), any(Pageable.class)))
                .thenReturn(page);
        when(transactionMapper.toDto(transaction)).thenReturn(transactionDto);

        Page<TransactionDto> result = transactionService.getByType(TransactionType.INCOME, 0, 10, "date", from, to);

        assertThat(result.getContent()).hasSize(1);
        verify(transactionRepository).findByUserIdAndTypeAndDateBetween(eq(1L), eq(TransactionType.INCOME), eq(from), eq(to), any(Pageable.class));
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Test
    void update_shouldUpdateAndReturnDto() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
        when(transactionRepository.save(transaction)).thenReturn(transaction);
        when(transactionMapper.toDto(transaction)).thenReturn(transactionDto);

        TransactionDto result = transactionService.update(1L, request);

        assertThat(result).isNotNull();
        verify(transactionRepository).save(transaction);
    }

    @Test
    void update_withUnknownId_shouldThrowException() {
        when(transactionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.update(99L, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Transaction not found");
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    void delete_shouldCallDeleteById() {
        transactionService.delete(1L);
        verify(transactionRepository).deleteById(1L);
    }

    // ── getStats ──────────────────────────────────────────────────────────────

    @Test
    void getStats_shouldReturnCorrectStats() {
        when(transactionRepository.sumByUserIdAndType(1L, TransactionType.INCOME)).thenReturn(new BigDecimal("500.00"));
        when(transactionRepository.sumByUserIdAndType(1L, TransactionType.EXPENSE)).thenReturn(new BigDecimal("200.00"));
        when(transactionRepository.countByUserId(1L)).thenReturn(5L);

        StatsDto stats = transactionService.getStats();

        assertThat(stats.getTotalIncome()).isEqualByComparingTo("500.00");
        assertThat(stats.getTotalExpense()).isEqualByComparingTo("200.00");
        assertThat(stats.getBalance()).isEqualByComparingTo("300.00");
        assertThat(stats.getTransactionCount()).isEqualTo(5L);
    }
}
