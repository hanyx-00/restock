package com.restock.mrp.dto;

import java.time.LocalDate;
import java.util.List;

public record MrpResponse(
		
		Long plannedDemandId,
		
		Long parentItemId,
		String parentItemCode,
		String parentItemName,
		
		LocalDate requiredDate,
		Integer plannedQuantity,
		
		List<MrpItemResult> materials

) {
}