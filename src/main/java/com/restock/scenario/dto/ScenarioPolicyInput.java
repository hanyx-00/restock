package com.restock.scenario.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ScenarioPolicyInput(
		
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