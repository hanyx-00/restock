package com.restock.bom.dto;

import com.restock.bom.BomComponent;

import java.math.BigDecimal;

public record BomResponse(
		Long id,
		
		Long parentItemId,
		String parentItemCode,
		String parentItemName,
		
		Long componentItemId,
		String componentItemCode,
		String componentItemName,
		
		BigDecimal quantityPer
) {
	
	public static BomResponse from(BomComponent bom) {
		return new BomResponse(
				bom.getId(),
				
				bom.getParentItem().getId(),
				bom.getParentItem().getItemCode(),
				bom.getParentItem().getName(),
				
				bom.getComponentItem().getId(),
				bom.getComponentItem().getItemCode(),
				bom.getComponentItem().getName(),
				
				bom.getQuantityPer()
		);
	}
}