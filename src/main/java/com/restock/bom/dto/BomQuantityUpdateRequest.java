package com.restock.bom.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BomQuantityUpdateRequest(
		
		@NotNull(message = "필요 수량은 필수입니다.")
		@DecimalMin(
				value = "0.0001",
				message = "필요 수량은 0보다 커야 합니다."
		)
		BigDecimal quantityPer

) {
}