package com.restock.scenario.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ScenarioCompareRequest(
		
		@NotNull(message = "품목 ID는 필수입니다.")
		Long itemId,
		
		@NotNull(message = "분석 연도는 필수입니다.")
		@Min(value = 2000, message = "분석 연도는 2000년 이상이어야 합니다.")
		Integer year,
		
		@NotNull(message = "기준 시나리오는 필수입니다.")
		@Valid
		ScenarioPolicyInput baseline,
		
		@NotNull(message = "비교 시나리오는 필수입니다.")
		@Valid
		ScenarioPolicyInput alternative

) {
}