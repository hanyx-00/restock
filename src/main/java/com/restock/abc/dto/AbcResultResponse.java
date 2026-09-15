package com.restock.abc.dto;

import java.math.BigDecimal;

public record AbcResultResponse(
		int rank,
		Long itemId,
		String itemCode,
		String itemName,
		long totalDemand,
		BigDecimal unitPrice,
		BigDecimal usageValue,
		BigDecimal sharePercent,
		BigDecimal cumulativePercent,
		String grade
) {
}