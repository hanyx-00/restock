package com.restock.item.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ItemRequest(
		
		@NotBlank(message = "품목 코드는 필수입니다.")
		String itemCode,
		
		@NotBlank(message = "품목명은 필수입니다.")
		String name,
		
		@NotNull(message = "단가는 필수입니다.")
		@DecimalMin(value = "0.0", message = "단가는 0 이상이어야 합니다.")
		BigDecimal unitPrice,
		
		@NotNull(message = "리드타임은 필수입니다.")
		@PositiveOrZero(message = "리드타임은 0 이상이어야 합니다.")
		Integer leadTimeDays,
		
		@NotNull(message = "현재 재고량은 필수입니다.")
		@PositiveOrZero(message = "현재 재고량은 0 이상이어야 합니다.")
		Integer onHandQuantity

) {
}