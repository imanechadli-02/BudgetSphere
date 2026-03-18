package com.budgetsphere.backend.dto;

import com.budgetsphere.backend.entity.NeedPriority;
import com.budgetsphere.backend.entity.NeedStatus;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NeedDto {
    private Long id;
    private String title;
    private BigDecimal estimatedPrice;
    private NeedStatus status;
    private NeedPriority priority;
    private Long userId;
}
