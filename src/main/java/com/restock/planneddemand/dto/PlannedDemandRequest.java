package com.restock.planneddemand.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record PlannedDemandRequest(
		
		@NotNull(message = "품목 ID는 필수입니다.")
		Long itemId,
		
		@NotNull(message = "필요일은 필수입니다.")
		LocalDate requiredDate,
		
		@NotNull(message = "계획 수량은 필수입니다.")
		@Positive(message = "계획 수량은 0보다 커야 합니다.")
		Integer quantity

) {
}