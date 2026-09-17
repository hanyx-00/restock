package com.restock.planneddemand.dto;

import com.restock.planneddemand.PlannedDemand;

import java.time.LocalDate;

public record PlannedDemandResponse(
		Long id,
		Long itemId,
		String itemCode,
		String itemName,
		LocalDate requiredDate,
		Integer quantity
) {
	
	public static PlannedDemandResponse from(
			PlannedDemand plannedDemand
	) {
		return new PlannedDemandResponse(
				plannedDemand.getId(),
				plannedDemand.getItem().getId(),
				plannedDemand.getItem().getItemCode(),
				plannedDemand.getItem().getName(),
				plannedDemand.getRequiredDate(),
				plannedDemand.getQuantity()
		);
	}
}