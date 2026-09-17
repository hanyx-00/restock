package com.restock.mrp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MrpItemResult(
		
		Long componentItemId,
		String componentItemCode,
		String componentItemName,
		
		BigDecimal quantityPer,
		
		BigDecimal grossRequirement,
		Integer onHandQuantity,
		BigDecimal netRequirement,
		
		BigDecimal plannedOrderReceipt,
		
		Integer leadTimeDays,
		LocalDate requiredDate,
		LocalDate plannedOrderReleaseDate

) {
}