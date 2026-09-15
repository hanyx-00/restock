package com.restock.demand.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public record DemandHistoryRequest(
		
		@NotNull(message = "품목 ID는 필수입니다.")
		Long itemId,
		
		@NotNull(message = "수요 날짜는 필수입니다.")
		LocalDate demandDate,
		
		@NotNull(message = "수요량은 필수입니다.")
		@PositiveOrZero(message = "수요량은 0 이상이어야 합니다.")
		Integer quantity

) {
}