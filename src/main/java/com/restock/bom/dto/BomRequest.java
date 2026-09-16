package com.restock.bom.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BomRequest(
		
		@NotNull(message = "상위 품목 ID는 필수입니다.")
		Long parentItemId,
		
		@NotNull(message = "부품 품목 ID는 필수입니다.")
		Long componentItemId,
		
		@NotNull(message = "필요 수량은 필수입니다.")
		@DecimalMin(
				value = "0.0001",
				message = "필요 수량은 0보다 커야 합니다."
		)
		BigDecimal quantityPer

) {
}