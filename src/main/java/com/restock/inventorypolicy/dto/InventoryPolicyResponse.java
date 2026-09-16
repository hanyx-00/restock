package com.restock.inventorypolicy.dto;

import java.math.BigDecimal;

public record InventoryPolicyResponse(
		
		Long itemId,
		String itemCode,
		String itemName,
		int year,
		
		String abcGrade,
		BigDecimal serviceLevel,
		
		long annualDemand,
		BigDecimal averageDailyDemand,
		BigDecimal dailyDemandStandardDeviation,
		
		BigDecimal economicOrderQuantity,
		BigDecimal safetyStock,
		BigDecimal reorderPoint

) {
}