package com.budgetsphere.backend.dto;

import com.budgetsphere.backend.entity.NeedPriority;
import com.budgetsphere.backend.entity.NeedStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NeedRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotNull(message = "Estimated price is required")
    @Positive(message = "Estimated price must be positive")
    private BigDecimal estimatedPrice;

    @NotNull(message = "Status is required")
    private NeedStatus status;

    @NotNull(message = "Priority is required")
    private NeedPriority priority;
}
