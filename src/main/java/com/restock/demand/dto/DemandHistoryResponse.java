package com.restock.demand.dto;

import com.restock.demand.DemandHistory;

import java.time.LocalDate;

public record DemandHistoryResponse(
		Long id,
		Long itemId,
		String itemCode,
		String itemName,
		LocalDate demandDate,
		Integer quantity
) {
	
	public static DemandHistoryResponse from(DemandHistory demandHistory) {
		return new DemandHistoryResponse(
				demandHistory.getId(),
				demandHistory.getItem().getId(),
				demandHistory.getItem().getItemCode(),
				demandHistory.getItem().getName(),
				demandHistory.getDemandDate(),
				demandHistory.getQuantity()
		);
	}
}