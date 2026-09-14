package com.restock.item.dto;

import com.restock.item.Item;

import java.math.BigDecimal;

public record ItemResponse(
		Long id,
		String itemCode,
		String name,
		BigDecimal unitPrice,
		Integer leadTimeDays,
		Integer onHandQuantity
) {
	
	public static ItemResponse from(Item item) {
		return new ItemResponse(
				item.getId(),
				item.getItemCode(),
				item.getName(),
				item.getUnitPrice(),
				item.getLeadTimeDays(),
				item.getOnHandQuantity()
		);
	}
}