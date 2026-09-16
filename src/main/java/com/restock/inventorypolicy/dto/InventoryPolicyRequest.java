package com.restock.inventorypolicy.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InventoryPolicyRequest(
		
		@NotNull(message = "품목 ID는 필수입니다.")
		Long itemId,
		
		@NotNull(message = "분석 연도는 필수입니다.")
		@Min(value = 2000, message = "분석 연도는 2000년 이상이어야 합니다.")
		Integer year,
		
		@NotNull(message = "주문비용은 필수입니다.")
		@DecimalMin(
				value = "0.01",
				message = "주문비용은 0보다 커야 합니다."
		)
		BigDecimal orderingCost,
		
		@NotNull(message = "연간 단위당 보관비용은 필수입니다.")
		@DecimalMin(
				value = "0.01",
				message = "보관비용은 0보다 커야 합니다."
		)
		BigDecimal annualHoldingCostPerUnit

) {
}